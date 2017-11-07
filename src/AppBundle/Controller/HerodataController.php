<?php

namespace AppBundle\Controller;

use Fizzik\HotstatusPipeline;
use Fizzik\Utility\AssocArray;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Asset;
use Fizzik\Database\MySqlDatabase;
use Fizzik\Database\RedisDatabase;
use Fizzik\Credentials;
use Fizzik\HotstatusCache;
use Symfony\Component\HttpFoundation\Request;

/*
 * In charge of fetching hero data from database and returning it as requested
 */
class HerodataController extends Controller {
    const QUERY_IGNORE_AFTER_CACHE = "ignoreAfterCache";
    const QUERY_ISSET = "isSet";
    const QUERY_RAWVALUE = "rawValue";
    const QUERY_SQLVALUE = "sqlValue";
    const QUERY_SQLCOLUMN = "sqlColumn";
    const QUERY_TYPE = "mappingType";
    const QUERY_TYPE_RANGE = "range"; //Should look up a range of values from a filter map
    const QUERY_TYPE_RAW = "raw"; //Equality to Raw value should be used for the query

    const WINDELTA_MAX_DAYS = 30; //Windeltas are only calculated for time ranges of 30 days or less

    /**
     * Returns the relevant hero data for a hero necessary to build a hero page
     *
     * @Route("/herodata/pagedata/hero", options={"expose"=true}, name="herodata_pagedata_hero")
     */
    public function getPageDataHeroAction(Request $request) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataHeroAction";
        $_VERSION = 0;

        /*
         * Process Query Parameters
         */
        $query = self::hero_initQueries();
        $queryCacheSqlValues = [];
        $querySqlValues = [];

        //Collect WhereOr strings from all query parameters for cache key
        foreach ($query as $qkey => &$qobj) {
            if ($request->query->has($qkey)) {
                $qobj[self::QUERY_ISSET] = true;
                $qobj[self::QUERY_RAWVALUE] = $request->query->get($qkey);
                $qobj[self::QUERY_SQLVALUE] = self::buildQuery_WhereOr_String($qkey, $qobj[self::QUERY_SQLCOLUMN], $qobj[self::QUERY_RAWVALUE], $qobj[self::QUERY_TYPE]);
                $queryCacheSqlValues[] = $query[$qkey][self::QUERY_SQLVALUE];
            }
        }

        $queryHero = $query[HotstatusPipeline::FILTER_KEY_HERO][self::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[self::QUERY_IGNORE_AFTER_CACHE] && $qobj[self::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][self::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCacheSql = self::buildQuery_WhereAnd_String($queryCacheSqlValues, false);
        $querySql = self::buildQuery_WhereAnd_String($querySqlValues, false);

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = self::hero_InitPageData();
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = $_ID . "_" . $queryHero .((strlen($queryCacheSql) > 0) ? ("_" . md5($queryCacheSql)) : (""));

        //Get credentials
        $creds = Credentials::getCredentialsForUser(Credentials::USER_HOTSTATUSWEB);

        //Get redis cache
        $redis = new RedisDatabase();
        $connected_redis = $redis->connect($creds[Credentials::KEY_REDIS_URI], HotstatusCache::CACHE_DEFAULT_DATABASE_INDEX);

        //Try to get cached value
        $cacheval = NULL;
        if ($connected_redis !== FALSE) {
            //$cacheval = HotstatusCache::readCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION); TODO
        }

        if ($connected_redis !== FALSE && $cacheval !== NULL) {
            //Use cached value
            //$pagedata = json_decode($cacheval, true); TODO

            $validResponse = TRUE;
        }
        else {
            //Try to get Mysql value
            $db = new MysqlDatabase();

            $connected_mysql = $db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);

            if ($connected_mysql !== FALSE) {
                $db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

                //Get image path from packages
                /** @var Asset\Packages $pkgs */
                $pkgs = $this->get("assets.packages");
                $pkg = $pkgs->getPackage("images");
                $imgbasepath = $pkg->getUrl('');

                //Prepare Statements
                $db->prepare("GetHeroData",
                    "SELECT `difficulty`, `role_blizzard`, `role_specific`, `universe`, `title`, `desc_tagline`, `desc_bio`, `rarity`, `image_hero` 
                    FROM herodata_heroes WHERE `name` = '$queryHero'");

                $db->prepare("GetHeroStats",
                    "SELECT `range_match_length`, `range_hero_level`, `played`, `won`, `time_played`, `stats_kills`, `stats_assists`, `stats_deaths`,
                    `stats_siege_damage`, `stats_hero_damage`, `stats_structure_damage`, `stats_healing`, `stats_damage_taken`, `stats_merc_camps`, `stats_exp_contrib`,
                    `stats_best_killstreak`, `stats_time_spent_dead`, `medals`, `talents`, `builds`, `matchup_friends`, `matchup_foes` 
                    FROM heroes_matches_recent_granular WHERE $querySql");


                //Collect herodata
                $heroDataResult = $db->execute("GetHeroData");
                while ($heroDataRow = $db->fetchArray($heroDataResult)) {
                    $row = $heroDataRow;

                    $pagedata['herodata'] = [
                        "name" => $queryHero,
                        "difficulty" => $row['difficulty'],
                        "role_blizzard" => $row['role_blizzard'],
                        "role_specific" => $row['role_specific'],
                        "universe" => $row['universe'],
                        "title" => $row['title'],
                        "desc_tagline" => $row['desc_tagline'],
                        "desc_bio" => $row['desc_bio'],
                        "rarity" => $row['rarity'],
                        "image_hero" => $imgbasepath . $row['image_hero'] . ".png"
                    ];
                }
                $db->freeResult($heroDataResult);

                //Initialize range granularity objects
                $range_match_length = [
                    "0-10" => [
                        "played" => 0,
                        "won" => 0
                    ],
                    "11-15" => [
                        "played" => 0,
                        "won" => 0
                    ],
                    "16-20" => [
                        "played" => 0,
                        "won" => 0
                    ],
                    "21-25" => [
                        "played" => 0,
                        "won" => 0
                    ],
                    "26-30" => [
                        "played" => 0,
                        "won" => 0
                    ],
                    "31+" => [
                        "played" => 0,
                        "won" => 0
                    ],
                ];
                $range_hero_level = [
                    "1-5" => [
                        "played" => 0,
                        "won" => 0
                    ],
                    "6-10" => [
                        "played" => 0,
                        "won" => 0
                    ],
                    "11-15" => [
                        "played" => 0,
                        "won" => 0
                    ],
                    "16+" => [
                        "played" => 0,
                        "won" => 0
                    ],
                ];

                //Initialize aggregators
                $a_played = 0;
                $a_won = 0;
                $a_time_played = 0;
                $a_kills = 0;
                $a_assists = 0;
                $a_deaths = 0;
                $a_siege_damage = 0;
                $a_hero_damage = 0;
                $a_structure_damage = 0;
                $a_healing = 0;
                $a_damage_taken = 0;
                $a_merc_camps = 0;
                $a_exp_contrib = 0;
                $a_best_killstreak = 0;
                $a_time_spent_dead = 0;
                $a_medals = [];
                $a_talents = [];
                $a_builds = [];
                $a_matchup_friends = [];
                $a_matchup_foes = [];

                //Collect stats
                $heroStatsResult = $db->execute("GetHeroStats");
                while ($heroStatsRow = $db->fetchArray($heroStatsResult)) {
                    $row = $heroStatsRow;

                    /*
                     * Aggregate
                     */
                    $ref_matchlength = &$range_match_length[$row['range_match_length']];
                    $ref_matchlength['played'] += $row['played'];
                    $ref_matchlength['won'] += $row['won'];

                    $ref_herolevel = &$range_hero_level[$row['range_hero_level']];
                    $ref_herolevel['played'] += $row['played'];
                    $ref_herolevel['won'] += $row['won'];

                    $a_played += $row['played'];
                    $a_won += $row['won'];
                    $a_time_played += $row['time_played'];
                    $a_kills += $row['stats_kills'];
                    $a_assists += $row['stats_assists'];
                    $a_deaths += $row['stats_deaths'];
                    $a_siege_damage += $row['stats_siege_damage'];
                    $a_hero_damage += $row['stats_hero_damage'];
                    $a_structure_damage += $row['stats_structure_damage'];
                    $a_healing += $row['stats_healing'];
                    $a_damage_taken += $row['stats_damage_taken'];
                    $a_merc_camps += $row['stats_merc_camps'];
                    $a_exp_contrib += $row['stats_exp_contrib'];
                    $a_best_killstreak = max($a_best_killstreak, $row['stats_best_killstreak']);
                    $a_time_spent_dead += $row['stats_time_spent_dead'];

                    $row_medals = json_decode($row['medals'], true);
                    AssocArray::aggregate($a_medals, $row_medals, $null = null, AssocArray::AGGREGATE_SUM);

                    $row_talents = json_decode($row['talents'], true);
                    AssocArray::aggregate($a_talents, $row_talents, $null = null, AssocArray::AGGREGATE_SUM);

                    $row_builds = json_decode($row['builds'], true);
                    AssocArray::aggregate($a_builds, $row_builds, $null = null, AssocArray::AGGREGATE_SUM);

                    $row_matchup_friends = json_decode($row['matchup_friends'], true);
                    AssocArray::aggregate($a_matchup_friends, $row_matchup_friends, $null = null, AssocArray::AGGREGATE_SUM);

                    $row_matchup_foes = json_decode($row['matchup_foes'], true);
                    AssocArray::aggregate($a_matchup_foes, $row_matchup_foes, $null = null, AssocArray::AGGREGATE_SUM);
                }
                $db->freeResult($heroStatsResult);

                /*
                 * Calculate
                 */
                $stats = [];

                //--Helpers
                //Average Time Played in Minutes
                $c_avg_minutesPlayed = 0;
                if ($a_played > 0) {
                    $c_avg_minutesPlayed = ($a_time_played / 60.0) / ($a_played * 1.00);
                }

                //Match Length Winrate
                $winrates_matchlength = [];
                foreach ($range_match_length as $key => $obj) {
                    $rc_winrate = 0;
                    if ($obj['played'] > 0) {
                        $rc_winrate = round(($obj['won'] / ($obj['played'] * 1.00)) * 100.0, 1);
                    }
                    $winrates_matchlength[$key] = $rc_winrate;
                }
                $stats['range_match_length'] = $winrates_matchlength;

                //Hero Level Winrate
                $winrates_herolevel = [];
                foreach ($range_hero_level as $key => $obj) {
                    $rc_winrate = 0;
                    if ($obj['played'] > 0) {
                        $rc_winrate = round(($obj['won'] / ($obj['played'] * 1.00)) * 100.0, 1);
                    }
                    $winrates_herolevel[$key] = $rc_winrate;
                }
                $stats['range_hero_level'] = $winrates_herolevel;

                //Winrate
                $c_winrate = 0;
                if ($a_played > 0) {
                    $c_winrate = round(($a_won / ($a_played * 1.00)) * 100.0, 1);
                }
                $stats['winrate'] = $c_winrate;

                //Average Kills (+ Per Minute)
                $c_avg_kills = 0;
                $c_pmin_kills = 0;
                if ($a_played > 0) {
                    $c_avg_kills = round(($a_kills / ($a_played * 1.00)), 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_kills = round(($c_avg_kills / ($c_avg_minutesPlayed * 1.00)), 2);
                }
                $stats['kills'] = [
                    "average" => $c_avg_kills,
                    "per_minute" => $c_pmin_kills
                ];

                //Average Assists (+ Per Minute)
                $c_avg_assists = 0;
                $c_pmin_assists = 0;
                if ($a_played > 0) {
                    $c_avg_assists = round(($a_assists / ($a_played * 1.00)), 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_assists = round(($c_avg_assists / ($c_avg_minutesPlayed * 1.00)), 2);
                }
                $stats['assists'] = [
                    "average" => $c_avg_assists,
                    "per_minute" => $c_pmin_assists
                ];

                //Average Deaths (+ Per Minute)
                $c_avg_deaths = 0;
                $c_pmin_deaths = 0;
                if ($a_played > 0) {
                    $c_avg_deaths = round(($a_deaths / ($a_played * 1.00)), 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_deaths = round(($c_avg_deaths / ($c_avg_minutesPlayed * 1.00)), 2);
                }
                $stats['deaths'] = [
                    "average" => $c_avg_deaths,
                    "per_minute" => $c_pmin_deaths
                ];

                //Average KDA
                $c_avg_kda = $c_avg_kills + $c_avg_assists;
                if ($c_avg_deaths > 0) {
                    $c_avg_kda = round(($c_avg_kda / ($c_avg_deaths * 1.00)), 2);
                }
                $stats['kda'] = [
                    "average" => $c_avg_kda
                ];

                //Average Siege Damage (+ Per Minute)
                $c_avg_siege_damage = 0;
                $c_pmin_siege_damage = 0;
                if ($a_played > 0) {
                    $c_avg_siege_damage = round(($a_siege_damage / ($a_played * 1.00)), 0);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_siege_damage = round(($c_avg_siege_damage / ($c_avg_minutesPlayed * 1.00)), 0);
                }
                $stats['siege_damage'] = [
                    "average" => $c_avg_siege_damage,
                    "per_minute" => $c_pmin_siege_damage
                ];

                //Average Hero Damage (+ Per Minute)
                $c_avg_hero_damage = 0;
                $c_pmin_hero_damage = 0;
                if ($a_played > 0) {
                    $c_avg_hero_damage = round(($a_hero_damage / ($a_played * 1.00)), 0);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_hero_damage = round(($c_avg_hero_damage / ($c_avg_minutesPlayed * 1.00)), 0);
                }
                $stats['hero_damage'] = [
                    "average" => $c_avg_hero_damage,
                    "per_minute" => $c_pmin_hero_damage
                ];

                //Average Structure Damage (+ Per Minute)
                $c_avg_structure_damage = 0;
                $c_pmin_structure_damage = 0;
                if ($a_played > 0) {
                    $c_avg_structure_damage = round(($a_structure_damage / ($a_played * 1.00)), 0);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_structure_damage = round(($c_avg_structure_damage / ($c_avg_minutesPlayed * 1.00)), 0);
                }
                $stats['structure_damage'] = [
                    "average" => $c_avg_structure_damage,
                    "per_minute" => $c_pmin_structure_damage
                ];

                //Average Healing (+ Per Minute)
                $c_avg_healing = 0;
                $c_pmin_healing = 0;
                if ($a_played > 0) {
                    $c_avg_healing = round(($a_healing / ($a_played * 1.00)), 0);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_healing = round(($c_avg_healing / ($c_avg_minutesPlayed * 1.00)), 0);
                }
                $stats['healing'] = [
                    "average" => $c_avg_healing,
                    "per_minute" => $c_pmin_healing
                ];

                //Average Damage Taken (+ Per Minute)
                $c_avg_damage_taken = 0;
                $c_pmin_damage_taken = 0;
                if ($a_played > 0) {
                    $c_avg_damage_taken = round(($a_damage_taken / ($a_played * 1.00)), 0);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_damage_taken = round(($c_avg_damage_taken / ($c_avg_minutesPlayed * 1.00)), 0);
                }
                $stats['damage_taken'] = [
                    "average" => $c_avg_damage_taken,
                    "per_minute" => $c_pmin_damage_taken
                ];

                //Average Merc Camps (+ Per Minute)
                $c_avg_merc_camps = 0;
                $c_pmin_merc_camps = 0;
                if ($a_played > 0) {
                    $c_avg_merc_camps = round(($a_merc_camps / ($a_played * 1.00)), 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_merc_camps = round(($c_avg_merc_camps / ($c_avg_minutesPlayed * 1.00)), 2);
                }
                $stats['merc_camps'] = [
                    "average" => $c_avg_merc_camps,
                    "per_minute" => $c_pmin_merc_camps
                ];

                //Average Exp Contrib (+ Per Minute)
                $c_avg_exp_contrib = 0;
                $c_pmin_exp_contrib = 0;
                if ($a_played > 0) {
                    $c_avg_exp_contrib = round(($a_exp_contrib / ($a_played * 1.00)), 0);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_exp_contrib = round(($c_avg_exp_contrib / ($c_avg_minutesPlayed * 1.00)), 0);
                }
                $stats['exp_contrib'] = [
                    "average" => $c_avg_exp_contrib,
                    "per_minute" => $c_pmin_exp_contrib
                ];

                //Best Killstreak
                $stats['best_killstreak'] = $a_best_killstreak;

                //Average Time Spent Dead (in Minutes)
                $c_avg_time_spent_dead = 0;
                if ($a_played > 0) {
                    $c_avg_time_spent_dead = round(($a_time_spent_dead / ($a_played * 1.00) / 60.0), 1);
                }
                $stats['time_spent_dead'] = [
                    "average" => $c_avg_assists
                ];

                //TODO - look up json and fill out JSON structures for medals, talents, builds, etc

                //Set pagedata stats
                $pagedata['stats'] = $stats;

                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            //$encoded = json_encode($pagedata); TODO

            //Store mysql value in cache TODO
            /*if ($validResponse && $connected_redis) {
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::getCacheDefaultExpirationTimeInSecondsForToday());
            }*/
        }

        $redis->close();

        $responsedata['data'] = $pagedata;

        $response = $this->json($responsedata);

        //$response->setPublic();

        //Determine expire date on valid response TODO
        /*if ($validResponse) {
            $jsonResponse->setExpires(HotstatusCache::getHTTPCacheDefaultExpirationDateForToday());
        }*/

        return $response;
    }

    /**
     * Returns the the relevant data to populate a DataTable heroes-statslist with any necessary formatting (IE: images wrapped in image tags)
     *
     * @Route("/herodata/datatable/heroes/statslist", options={"expose"=true}, condition="request.isXmlHttpRequest()", name="herodata_datatable_heroes_statslist")
     */
    public function getDataTableHeroesStatsListAction(Request $request) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_DATATABLE;
        $_ID = "getDataTableHeroesStatsListAction";
        $_VERSION = 0;

        /*
         * Process Query Parameters
         */
        $query = self::heroesStatsList_initQueries();
        $queryCacheSqlValues = [];
        $querySqlValues = [];

        //Collect WhereOr strings from all query parameters for cache key
        foreach ($query as $qkey => &$qobj) {
            if ($request->query->has($qkey)) {
                $qobj[self::QUERY_ISSET] = true;
                $qobj[self::QUERY_RAWVALUE] = $request->query->get($qkey);
                $qobj[self::QUERY_SQLVALUE] = self::buildQuery_WhereOr_String($qkey, $qobj[self::QUERY_SQLCOLUMN], $qobj[self::QUERY_RAWVALUE], $qobj[self::QUERY_TYPE]);
                $queryCacheSqlValues[] = $query[$qkey][self::QUERY_SQLVALUE];
            }
        }

        $queryDateKey = $query[HotstatusPipeline::FILTER_KEY_DATE][self::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[self::QUERY_IGNORE_AFTER_CACHE] && $qobj[self::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][self::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCacheSql = self::buildQuery_WhereAnd_String($queryCacheSqlValues);
        $querySql = self::buildQuery_WhereAnd_String($querySqlValues);

        //Determine cache id from query parameters
        $CACHE_ID = $_ID . ((strlen($queryCacheSql) > 0) ? ("_" . md5($queryCacheSql)) : (""));

        /*
         * Begin building response
         */
        //Get credentials
        $creds = Credentials::getCredentialsForUser(Credentials::USER_HOTSTATUSWEB);

        //Set up main vars
        $datatable = [];
        $validResponse = FALSE;

        //Get redis cache
        $redis = new RedisDatabase();
        $connected_redis = $redis->connect($creds[Credentials::KEY_REDIS_URI], HotstatusCache::CACHE_DEFAULT_DATABASE_INDEX);

        //Try to get cached value
        $cacheval = NULL;
        if ($connected_redis !== FALSE) {
            $cacheval = HotstatusCache::readCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION);
        }

        if ($connected_redis !== FALSE && $cacheval !== NULL) {
            //Use cached value
            $datatable = json_decode($cacheval, true);

            $validResponse = TRUE;
        }
        else {
            //Try to get Mysql value
            $db = new MysqlDatabase();

            $connected_mysql = $db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);

            $data = [];
            if ($connected_mysql !== FALSE) {
                //Use mysql value

                $db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

                //Get image path from packages
                /** @var Asset\Packages $pkgs */
                $pkgs = $this->get("assets.packages");
                $pkg = $pkgs->getPackage("images");
                $imgbasepath = $pkg->getUrl('');

                //Determine time range
                date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);
                $dateobj = HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_DATE][$queryDateKey];
                $offset_date = $dateobj['offset_date'];
                $offset_amount = $dateobj['offset_amount'];
                $datetime = new \DateTime($offset_date);
                $recent_range = HotstatusPipeline::getMinMaxRangeForLastISODaysInclusive($offset_amount, $datetime->format(HotstatusPipeline::FORMAT_DATETIME));
                $old_range = HotstatusPipeline::getMinMaxRangeForLastISODaysInclusive($offset_amount, $datetime->format(HotstatusPipeline::FORMAT_DATETIME), $offset_amount);

                //Prepare statements
                $db->prepare("SelectHeroes", "SELECT name, name_sort, role_blizzard, role_specific, image_hero FROM herodata_heroes");

                $db->prepare("CountHeroesMatches",
                    "SELECT COALESCE(SUM(`played`), 0) AS `played`, COALESCE(SUM(`won`), 0) AS `won` FROM `heroes_matches_recent_granular` WHERE `hero` = ? ".$querySql." AND `date_end` >= ? AND `date_end` <= ?");
                $db->bind("CountHeroesMatches", "sss", $r_hero, $date_range_start, $date_range_end);

                $db->prepare("CountHeroesBans",
                    "SELECT COALESCE(SUM(`banned`), 0) AS `banned` FROM `heroes_bans_recent_granular` WHERE `hero` = ? ".$querySql." AND `date_end` >= ? AND `date_end` <= ?");
                $db->bind("CountHeroesBans", "sss", $r_hero, $date_range_start, $date_range_end);

                /*$db->prepare("EstimateMatchCountForGranularity",
                    "SELECT ROUND(COALESCE(SUM(`played`), 0) / 10, 0) AS 'match_count' FROM `heroes_matches_recent_granular` WHERE `gameType` = ? ".$querySql." AND `date_end` >= ? AND `date_end` <= ?");
                $db->bind("EstimateMatchCountForGranularity", "sss", $r_gameType, $date_range_start, $date_range_end);*/

                //Iterate through heroes to collect data
                $herodata = [];
                $maxWinrate = 0.0;
                $minWinrate = 100.0;
                $totalPlayed = 0;
                $totalBanned = 0;
                $result = $db->execute("SelectHeroes");
                while ($row = $db->fetchArray($result)) {
                    $r_hero = $row['name'];

                    /*
                     * Collect hero data
                     */
                    $dt_playrate = 0;
                    $dt_banrate = 0;
                    $dt_winrate = 0.0;
                    $dt_windelta = 0.0;

                    $old_playrate = 0;
                    $old_won = 0;
                    $old_winrate = 0.0;

                    $won = 0;

                    /*
                     * Calculate match statistics for hero
                     */
                    //Recent Time Range
                    $date_range_start = $recent_range['date_start'];
                    $date_range_end = $recent_range['date_end'];

                    $statsResult = $db->execute("CountHeroesMatches");
                    $statsrow = $db->fetchArray($statsResult);

                    $dt_playrate += $statsrow['played'];
                    $won += $statsrow['won'];

                    $db->freeResult($statsResult);

                    //Old Time Range (Only if offset is WINDELTA_MAX_DAYS or less, otherwise don't calculate windelta)
                    if ($offset_amount <= self::WINDELTA_MAX_DAYS) {
                        $date_range_start = $old_range['date_start'];
                        $date_range_end = $old_range['date_end'];

                        $statsResult = $db->execute("CountHeroesMatches");
                        $statsrow = $db->fetchArray($statsResult);

                        $old_playrate += $statsrow['played'];
                        $old_won += $statsrow['won'];

                        $db->freeResult($statsResult);
                    }

                    /*
                     * Calculate ban statistics for hero
                     */
                    //Recent Time Range
                    $date_range_start = $recent_range['date_start'];
                    $date_range_end = $recent_range['date_end'];

                    $statsResult = $db->execute("CountHeroesBans");
                    $statsrow = $db->fetchArray($statsResult);

                    $dt_banrate += $statsrow['banned'];

                    $db->freeResult($statsResult);

                    //Winrate
                    if ($dt_playrate > 0) {
                        $dt_winrate = round(($won / ($dt_playrate * 1.00)) * 100.0, 1);
                    }

                    //Old Winrate
                    if ($old_playrate > 0) {
                        $old_winrate = round(($old_won / ($old_playrate * 1.00)) * 100.0, 1);
                    }

                    //Win Delta (Only if offset is WINDELTA_MAX_DAYS or less, otherwise don't calculate windelta)
                    if ($offset_amount <= self::WINDELTA_MAX_DAYS) {
                        $dt_windelta = $dt_winrate - $old_winrate;
                    }

                    //Max, mins, and totals
                    if ($maxWinrate < $dt_winrate && $dt_playrate > 0) $maxWinrate = $dt_winrate;
                    if ($minWinrate > $dt_winrate && $dt_playrate > 0) $minWinrate = $dt_winrate;
                    $totalPlayed += $dt_playrate;
                    $totalBanned += $dt_banrate;

                    /*
                     * Construct hero object
                     */
                    $hero = [];
                    $hero['name'] = $row['name'];
                    $hero['name_sort'] = $row['name_sort'];
                    $hero['role_blizzard'] = $row['role_blizzard'];
                    $hero['role_specific'] = $row['role_specific'];
                    $hero['image_hero'] =  $row['image_hero'];
                    $hero['dt_playrate'] = $dt_playrate;
                    $hero['dt_banrate'] = $dt_banrate;
                    $hero['dt_winrate'] = $dt_winrate;
                    $hero['dt_windelta'] = $dt_windelta;

                    $herodata[] = $hero;
                }

                //Calculate popularities
                $matchesPlayed = $totalPlayed / 10; //Estimate matches played for granularity
                $maxPopularity = PHP_INT_MIN;
                $minPopularity = PHP_INT_MAX;
                foreach ($herodata as &$rhero) {
                    if ($matchesPlayed > 0) {
                        $dt_popularity = round(((($rhero['dt_playrate'] + $rhero['dt_banrate']) * 1.00) / (($matchesPlayed) * 1.00)) * 100.0, 1);
                    }
                    else {
                        $dt_popularity = 0;
                    }

                    //Max, mins
                    if ($maxPopularity < $dt_popularity) $maxPopularity = $dt_popularity;
                    if ($minPopularity > $dt_popularity) $minPopularity = $dt_popularity;

                    $rhero['dt_popularity'] = $dt_popularity;
                }

                //Iterate through heroes to create dtrows from previously collected data
                foreach ($herodata as $hero) {
                    $dtrow = [];

                    //Hero Portrait
                    $dtrow[] = '<img src="' . $imgbasepath . $hero['image_hero'] . '.png" class="rounded-circle hsl-portrait">';

                    //Hero proper name
                    $dtrow[] = '<a class="hsl-link" href="'. $this->generateUrl("hero", ["heroProperName" => $hero['name']]) .'">' . $hero['name'] . '</a>';

                    //Hero name sort helper
                    $dtrow[] = $hero['name_sort'];

                    //Hero Blizzard role
                    $dtrow[] = $hero['role_blizzard'];

                    //Hero Specific role
                    $dtrow[] = $hero['role_specific'];

                    //Playrate
                    $dtrow[] = $hero['dt_playrate'];

                    //Banrate
                    if ($hero['dt_banrate'] > 0) {
                        $dtrow[] = $hero['dt_banrate'];
                    }
                    else {
                        $dtrow[] = '';
                    }

                    //Popularity
                    $percentOnRange = 0;
                    if ($maxPopularity - $minPopularity > 0) {
                        $percentOnRange = ((($hero['dt_popularity'] - $minPopularity) * 1.00) / (($maxPopularity - $minPopularity) * 1.00)) * 100.0;
                    }
                    $dtrow[] = '<span class="hsl-number-popularity">' . sprintf("%03.1f %%", $hero['dt_popularity'])
                        . '</span><div class="hsl-percentbar hsl-percentbar-popularity" style="width:'.$percentOnRange.'%;"></div>';

                    //Winrate
                    if ($hero['dt_playrate'] > 0) {
                        $colorclass = "hsl-number-winrate-red";
                        if ($hero['dt_winrate'] >= 50.0) $colorclass = "hsl-number-winrate-green";
                        $percentOnRange = ((($hero['dt_winrate'] - $minWinrate) * 1.00) / (($maxWinrate - $minWinrate) * 1.00)) * 100.0;
                        $dtrow[] = '<span class="' . $colorclass . '">' . sprintf("%03.1f %%", $hero['dt_winrate'])
                            . '</span><div class="hsl-percentbar hsl-percentbar-winrate" style="width:' . $percentOnRange . '%;"></div>';
                    }
                    else {
                        $dtrow[] = '';
                    }

                    //Win Delta (This is the % change in winrate from this last granularity and the older next recent granularity)
                    if ($hero['dt_windelta'] > 0 || $hero['dt_windelta'] < 0) {
                        $colorclass = "hsl-number-delta-red";
                        if ($hero['dt_windelta'] >= 0) $colorclass = "hsl-number-delta-green";
                        $dtrow[] = '<span class="' . $colorclass . '">' . sprintf("%+-03.1f %%", $hero['dt_windelta']) . '</span>';
                    }
                    else {
                        $dtrow[] = '';
                    }

                    $data[] = $dtrow;
                }


                $db->freeResult($result);
                $db->close();

                $validResponse = TRUE;
            }

            $datatable['data'] = $data;

            $encoded = json_encode($datatable);

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::getCacheDefaultExpirationTimeInSecondsForToday());
            }
        }

        $redis->close();

        /*
         * Build response
         */
        $jsonResponse = $this->json($datatable);
        $jsonResponse->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $jsonResponse->setExpires(HotstatusCache::getHTTPCacheDefaultExpirationDateForToday());
        }

        return $jsonResponse;
    }

    /*
     * Initializes the queries object for the hero pagedata
     */
    private static function hero_initQueries() {
        HotstatusPipeline::filter_generate_date();

        $q = [
            HotstatusPipeline::FILTER_KEY_HERO => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "hero",
                self::QUERY_TYPE => self::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_GAMETYPE => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "gameType",
                self::QUERY_TYPE => self::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_MAP => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "map",
                self::QUERY_TYPE => self::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_RANK => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "mmr_average",
                self::QUERY_TYPE => self::QUERY_TYPE_RANGE
            ],
            HotstatusPipeline::FILTER_KEY_DATE => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "date_end",
                self::QUERY_TYPE => self::QUERY_TYPE_RANGE
            ],
        ];

        return $q;
    }

    /*
     * Initializes the queries object for the heroesStatsList
     */
    private static function heroesStatsList_initQueries() {
        HotstatusPipeline::filter_generate_date();

        $q = [
            HotstatusPipeline::FILTER_KEY_GAMETYPE => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "gameType",
                self::QUERY_TYPE => self::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_MAP => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "map",
                self::QUERY_TYPE => self::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_RANK => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "mmr_average",
                self::QUERY_TYPE => self::QUERY_TYPE_RANGE
            ],
            HotstatusPipeline::FILTER_KEY_DATE => [
                self::QUERY_IGNORE_AFTER_CACHE => true,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "date_end",
                self::QUERY_TYPE => self::QUERY_TYPE_RANGE
            ],
        ];

        return $q;
    }

    //TODO
    /*
     * Initializes the page data object for the hero pagedata
     */
    private static function hero_InitPageData() {
        $d = [
            "herodata" => [
                "difficulty" => "",
                "role_blizzard" => "",
                "role_specific" => "",
                "universe" => "",
                "title" => "",
                "desc_tagline" => "",
                "desc_bio" => "",
                "rarity" => "",
                "image_hero" => ""
            ],
        ];

        return $d;
    }

    /*
     * Given an array of query string fragments of type 'WhereOr', will construct a query string fragment joining them
     * with AND keywords, while prepending a single AND keyword. Will return an empty string if supplied an empty array.
     *
     * EX:
     *
     * 0 fragments : ''
     * 1 fragment  : ' AND frag1'
     * 3 fragments : ' AND frag1 AND frag2 AND frag3'
     */
    private static function buildQuery_WhereAnd_String($whereors, $prependAnd = TRUE) {
        $ret = "";

        $i = 0;
        $count = count($whereors);
        if ($prependAnd && $count > 0) $ret = " AND ";
        foreach ($whereors as $or) {
            $ret .= $or;

            if ($i < $count - 1) {
                $ret .= " AND ";
            }

            $i++;
        }

        return $ret;
    }

    /*
     * Given a comma separated string of values for a given field, will construct a query string fragment,
     * taking into account mapping type and filter key, non-numeric values are surrounded by quotes EX:
     *
     * Map Type 'Raw'   : '(`field` = val1 OR `field` = val2 OR `field` = "val3")'
     * Map Type 'Range' : '((`field` >= valmin1 AND `field` <= valmax1) OR (`field` >= valmin2 AND `field` <= valmax2) OR (`field` >= "valmin3" AND `field` <= "valmax3"))'
     */
    private static function buildQuery_WhereOr_String($key, $field, $str, $mappingType = self::QUERY_TYPE_RAW) {
        $decode = htmlspecialchars_decode($str);

        $values = explode(",", $str);

        $ret = "(";

        $i = 0;
        $count = count($values);
        foreach ($values as $value) {
            if ($mappingType === self::QUERY_TYPE_RAW) {
                $val = $value;
                if (!is_numeric($value)) {
                    $val = '"' . $value . '"';
                }

                $ret .= "`$field` = $val";
            }
            else if ($mappingType === self::QUERY_TYPE_RANGE) {
                $obj = HotstatusPipeline::$filter[$key][$value];
                $min = $obj["min"];
                $max = $obj["max"];

                if (!is_numeric($min)) {
                    $min = '"' . $min . '"';
                }
                if (!is_numeric($max)) {
                    $max = '"' . $max . '"';
                }

                if ($count > 1) $ret .= "(";

                $ret .= "`$field` >= $min AND `$field` <= $max";

                if ($count > 1) $ret .= ")";
            }

            if ($i < $count - 1) {
                $ret .= " OR ";
            }

            $i++;
        }

        $ret .= ")";

        return $ret;
    }
}
