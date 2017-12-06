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
    const QUERY_USE_FOR_SECONDARY = "useForSecondary";
    const QUERY_ISSET = "isSet";
    const QUERY_RAWVALUE = "rawValue";
    const QUERY_SQLVALUE = "sqlValue";
    const QUERY_SQLCOLUMN = "sqlColumn";
    const QUERY_TYPE = "mappingType";
    const QUERY_TYPE_RANGE = "range"; //Should look up a range of values from a filter map
    const QUERY_TYPE_RAW = "raw"; //Equality to Raw value should be used for the query

    const WINDELTA_MAX_DAYS = 30; //Windeltas are only calculated for time ranges of 30 days or less
    const TALENT_WINRATE_MIN_PLAYED = 100; //How many times a talent must have been played before allowing winrate calculation
    const TALENT_WINRATE_MIN_OFFSET = 5.0; //How much to subtract from the min win rate for a talent to determine percentOnRange calculations, used to better normalize ranges.
    const TALENT_BUILD_MIN_TALENT_COUNT = 7; //How many talents the build must have in order to be valid for display
    const TALENT_BUILD_MIN_POPULARITY = 0.5; //Minimum amount of popularity % required for build to be valid for display
    const TALENT_BUILD_WINRATE_MIN_PLAYED = 100; //How many times a talent build have been played before allowing display
    const TALENT_BUILD_WINRATE_MIN_OFFSET = 2.5; //How much to subtract from the min winrate for a talent build to determine percentOnRange calculations, used to normalize ranges.
    const TALENT_BUILD_POPULARITY_MIN_OFFSET = .1; //How much to subtract from the min popularity for a talent build to determine percentOnRange calcs, used to normalize range
    const MATCHUP_PLAYRATE_MIN = 50; //How many matches should have been played with/against hero before winrate is calculated

    /**
     * Returns the relevant hero data for a hero necessary to build a hero page
     *
     * @Route("/herodata/pagedata/hero", options={"expose"=true}, condition="request.isXmlHttpRequest()", name="herodata_pagedata_hero")
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
        $querySecondarySqlValues = [];

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

        //Collect WhereOr strings for query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if ($qobj[self::QUERY_USE_FOR_SECONDARY] && $qobj[self::QUERY_ISSET]) {
                $querySecondarySqlValues[] = $query[$qkey][self::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCacheSql = self::buildQuery_WhereAnd_String($queryCacheSqlValues, false);
        $querySql = self::buildQuery_WhereAnd_String($querySqlValues, false);
        $querySecondarySql = self::buildQuery_WhereAnd_String($querySecondarySqlValues, true);

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = self::hero_InitPageData();
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = $_ID . ":" . $queryHero .((strlen($queryCacheSql) > 0) ? (":" . md5($queryCacheSql)) : (""));

        //Get credentials
        $creds = Credentials::getCredentialsForUser(Credentials::USER_HOTSTATUSWEB);

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
            $pagedata = json_decode($cacheval, true);

            $validResponse = TRUE;
        }
        else {
            //Try to get Mysql value
            $db = new MysqlDatabase();

            $connected_mysql = HotstatusPipeline::hotstatus_mysql_connect($db, $creds);

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
                    FROM herodata_heroes WHERE `name` = \"$queryHero\" LIMIT 1");

                $db->prepare("GetHeroStats",
                    "SELECT `range_match_length`, `range_hero_level`, `played`, `won`, `time_played`, `stats_kills`, `stats_assists`, `stats_deaths`,
                    `stats_siege_damage`, `stats_hero_damage`, `stats_structure_damage`, `stats_healing`, `stats_damage_taken`, `stats_merc_camps`, `stats_exp_contrib`,
                    `stats_best_killstreak`, `stats_time_spent_dead`, `medals`, `talents`, `builds`, `matchup_friends`, `matchup_foes` 
                    FROM heroes_matches_recent_granular WHERE $querySql");

                $db->prepare("GetHeroAbilities",
                    "SELECT `name`, `desc_simple`, `image`, `type` FROM herodata_abilities WHERE `hero` = \"$queryHero\"");

                /*$db->prepare("Get3Medals",
                    "SELECT * FROM `herodata_awards` WHERE `id` = ? OR `id` = ? OR `id` = ?");
                $db->bind("Get3Medals", "sss", $r_medal_1, $r_medal_2, $r_medal_3);*/

                $db->prepare("GetHeroTalents",
                    "SELECT `name`, `name_internal`, `desc_simple`, `image`, `tier_row`, `tier_column` FROM herodata_talents WHERE `hero` = \"$queryHero\" ORDER BY `tier_row` ASC, `tier_column` ASC");

                $db->prepare("GetHeroBuildTalents",
                    "SELECT `talents` FROM `heroes_builds` WHERE `hero` = \"$queryHero\" AND `build` = ?");
                $db->bind("GetHeroBuildTalents", "s", $r_build);

                /*
                 * Collect Herodata
                 */
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
                $range_match_length = [];
                foreach (HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_MATCH_LENGTH] as $rkey => $robj) {
                    $range_match_length[$rkey] = [
                        "played" => 0,
                        "won" => 0
                    ];
                }

                $range_hero_level = [];
                foreach (HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO_LEVEL] as $rkey => $robj) {
                    $range_hero_level[$rkey] = [
                        "played" => 0,
                        "won" => 0
                    ];
                }

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

                /*
                 * Collect Stats
                 */
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
                $colorclass = "hl-number-winrate-red";
                if ($c_winrate >= 50.0) $colorclass = "hl-number-winrate-green";
                $stats['winrate'] = '<span class="' . $colorclass . '">' . sprintf("%03.1f %%", $c_winrate) . '</span>';
                $stats['winrate_raw'] = $c_winrate;

                //Average Kills (+ Per Minute)
                $c_avg_kills = 0;
                $c_pmin_kills = 0;
                $c_avg_kills_raw = 0;
                $c_pmin_kills_raw = 0;
                if ($a_played > 0) {
                    $c_avg_kills_raw = $a_kills / ($a_played * 1.00);
                    $c_avg_kills = round($c_avg_kills_raw, 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_kills_raw = $c_avg_kills_raw / ($c_avg_minutesPlayed * 1.00);
                    $c_pmin_kills = round($c_pmin_kills_raw, 2);
                }
                $stats['kills'] = [
                    "average" => self::formatNumber($c_avg_kills, 2),
                    "per_minute" => self::formatNumber($c_pmin_kills, 2)
                ];

                //Average Assists (+ Per Minute)
                $c_avg_assists = 0;
                $c_pmin_assists = 0;
                $c_avg_assists_raw = 0;
                $c_pmin_assists_raw = 0;
                if ($a_played > 0) {
                    $c_avg_assists_raw = $a_assists / ($a_played * 1.00);
                    $c_avg_assists = round($c_avg_assists_raw, 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_assists_raw = $c_avg_assists_raw / ($c_avg_minutesPlayed * 1.00);
                    $c_pmin_assists = round($c_pmin_assists_raw, 2);
                }
                $stats['assists'] = [
                    "average" => self::formatNumber($c_avg_assists, 2),
                    "per_minute" => self::formatNumber($c_pmin_assists, 2)
                ];

                //Average Deaths (+ Per Minute)
                $c_avg_deaths = 0;
                $c_pmin_deaths = 0;
                $c_avg_deaths_raw = 0;
                $c_pmin_deaths_raw = 0;
                if ($a_played > 0) {
                    $c_avg_deaths_raw = $a_deaths / ($a_played * 1.00);
                    $c_avg_deaths = round($c_avg_deaths_raw, 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_deaths_raw = $c_avg_deaths_raw / ($c_avg_minutesPlayed * 1.00);
                    $c_pmin_deaths = round($c_pmin_deaths_raw, 2);
                }
                $stats['deaths'] = [
                    "average" => self::formatNumber($c_avg_deaths, 2),
                    "per_minute" => self::formatNumber($c_pmin_deaths, 2)
                ];

                //Average KDA
                $c_avg_kda = $c_avg_kills_raw + $c_avg_assists_raw;
                if ($c_avg_deaths_raw > 0) {
                    $c_avg_kda = round(($c_avg_kda / ($c_avg_deaths_raw * 1.00)), 2);
                }
                $stats['kda'] = [
                    "average" => self::formatNumber($c_avg_kda, 2)
                ];

                //Average Siege Damage (+ Per Minute)
                $c_avg_siege_damage = 0;
                $c_pmin_siege_damage = 0;
                $c_avg_siege_damage_raw = 0;
                $c_pmin_siege_damage_raw = 0;
                if ($a_played > 0) {
                    $c_avg_siege_damage_raw = $a_siege_damage / ($a_played * 1.00);
                    $c_avg_siege_damage = round($c_avg_siege_damage_raw, 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_siege_damage_raw = $c_avg_siege_damage_raw / ($c_avg_minutesPlayed * 1.00);
                    $c_pmin_siege_damage = round($c_pmin_siege_damage_raw, 2);
                }
                $stats['siege_damage'] = [
                    "average" => self::formatNumber($c_avg_siege_damage),
                    "per_minute" => self::formatNumber($c_pmin_siege_damage)
                ];

                //Average Hero Damage (+ Per Minute)
                $c_avg_hero_damage = 0;
                $c_pmin_hero_damage = 0;
                $c_avg_hero_damage_raw = 0;
                $c_pmin_hero_damage_raw = 0;
                if ($a_played > 0) {
                    $c_avg_hero_damage_raw = $a_hero_damage / ($a_played * 1.00);
                    $c_avg_hero_damage = round($c_avg_hero_damage_raw, 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_hero_damage_raw = $c_avg_hero_damage_raw / ($c_avg_minutesPlayed * 1.00);
                    $c_pmin_hero_damage = round($c_pmin_hero_damage_raw, 2);
                }
                $stats['hero_damage'] = [
                    "average" => self::formatNumber($c_avg_hero_damage),
                    "per_minute" => self::formatNumber($c_pmin_hero_damage)
                ];

                //Average Structure Damage (+ Per Minute)
                $c_avg_structure_damage = 0;
                $c_pmin_structure_damage = 0;
                $c_avg_structure_damage_raw = 0;
                $c_pmin_structure_damage_raw = 0;
                if ($a_played > 0) {
                    $c_avg_structure_damage_raw = $a_structure_damage / ($a_played * 1.00);
                    $c_avg_structure_damage = round($c_avg_structure_damage_raw, 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_structure_damage_raw = $c_avg_structure_damage_raw / ($c_avg_minutesPlayed * 1.00);
                    $c_pmin_structure_damage = round($c_pmin_structure_damage_raw, 2);
                }
                $stats['structure_damage'] = [
                    "average" => self::formatNumber($c_avg_structure_damage),
                    "per_minute" => self::formatNumber($c_pmin_structure_damage)
                ];

                //Average Healing (+ Per Minute)
                $c_avg_healing = 0;
                $c_pmin_healing = 0;
                $c_avg_healing_raw = 0;
                $c_pmin_healing_raw = 0;
                if ($a_played > 0) {
                    $c_avg_healing_raw = $a_healing / ($a_played * 1.00);
                    $c_avg_healing = round($c_avg_healing_raw, 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_healing_raw = $c_avg_healing_raw / ($c_avg_minutesPlayed * 1.00);
                    $c_pmin_healing = round($c_pmin_healing_raw, 2);
                }
                $stats['healing'] = [
                    "average" => self::formatNumber($c_avg_healing),
                    "per_minute" => self::formatNumber($c_pmin_healing)
                ];

                //Average Damage Taken (+ Per Minute)
                $c_avg_damage_taken = 0;
                $c_pmin_damage_taken = 0;
                $c_avg_damage_taken_raw = 0;
                $c_pmin_damage_taken_raw = 0;
                if ($a_played > 0) {
                    $c_avg_damage_taken_raw = $a_damage_taken / ($a_played * 1.00);
                    $c_avg_damage_taken = round($c_avg_damage_taken_raw, 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_damage_taken_raw = $c_avg_damage_taken_raw / ($c_avg_minutesPlayed * 1.00);
                    $c_pmin_damage_taken = round($c_pmin_damage_taken_raw, 2);
                }
                $stats['damage_taken'] = [
                    "average" => self::formatNumber($c_avg_damage_taken),
                    "per_minute" => self::formatNumber($c_pmin_damage_taken)
                ];

                //Average Merc Camps (+ Per Minute)
                $c_avg_merc_camps = 0;
                $c_pmin_merc_camps = 0;
                $c_avg_merc_camps_raw = 0;
                $c_pmin_merc_camps_raw = 0;
                if ($a_played > 0) {
                    $c_avg_merc_camps_raw = $a_merc_camps / ($a_played * 1.00);
                    $c_avg_merc_camps = round($c_avg_merc_camps_raw, 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_merc_camps_raw = $c_avg_merc_camps_raw / ($c_avg_minutesPlayed * 1.00);
                    $c_pmin_merc_camps = round($c_pmin_merc_camps_raw, 2);
                }
                $stats['merc_camps'] = [
                    "average" => self::formatNumber($c_avg_merc_camps, 2),
                    "per_minute" => self::formatNumber($c_pmin_merc_camps, 2)
                ];

                //Average Exp Contrib (+ Per Minute)
                $c_avg_exp_contrib = 0;
                $c_pmin_exp_contrib = 0;
                $c_avg_exp_contrib_raw = 0;
                $c_pmin_exp_contrib_raw = 0;
                if ($a_played > 0) {
                    $c_avg_exp_contrib_raw = $a_exp_contrib / ($a_played * 1.00);
                    $c_avg_exp_contrib = round($c_avg_exp_contrib_raw, 2);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_exp_contrib_raw = $c_avg_exp_contrib_raw / ($c_avg_minutesPlayed * 1.00);
                    $c_pmin_exp_contrib = round($c_pmin_exp_contrib_raw, 2);
                }
                $stats['exp_contrib'] = [
                    "average" => self::formatNumber($c_avg_exp_contrib),
                    "per_minute" => self::formatNumber($c_pmin_exp_contrib)
                ];

                //Best Killstreak
                $stats['best_killstreak'] = self::formatNumber($a_best_killstreak);

                //Average Time Spent Dead (in Minutes)
                $c_avg_time_spent_dead = 0;
                $c_avg_time_spent_dead_raw = 0;
                if ($a_played > 0) {
                    $c_avg_time_spent_dead_raw = ($a_time_spent_dead / ($a_played * 1.00)) / 60.0;
                    $c_avg_time_spent_dead = round($c_avg_time_spent_dead_raw, 1);
                }
                $stats['time_spent_dead'] = [
                    "average" => self::formatNumber($c_avg_time_spent_dead, 1)
                ];

                //Set pagedata stats
                $pagedata['stats'] = $stats;

                /*
                 * Get Total Hero StatMatrix stats, and calculate StatMatrix values for hero
                 */
                $totalStats = self::hero_requestTotalStatMatrix($db, $connected_mysql, $redis, $connected_redis, $querySecondarySql);

                //Init matrix
                $statMatrix = [];

                //Healer
                $c_matrix_healer = 0;
                $normal = $totalStats['healing']['max'] - $totalStats['healing']['min'];
                if ($normal > 0) {
                    $c_matrix_healer = max(0,($c_pmin_healing_raw - $totalStats['healing']['min']) / ($normal * 1.0));
                }
                $statMatrix['Healer'] = $c_matrix_healer;

                //Safety
                $c_matrix_safety = 0;
                $normal = $totalStats['deaths']['max'] - $totalStats['deaths']['min'];
                if ($normal > 0) {
                    $c_matrix_safety = min(1.0, max(0,(1.0 - (max(0,($c_pmin_deaths_raw - $totalStats['deaths']['min']) / ($normal * 1.0))))));
                }
                $statMatrix['Safety'] = $c_matrix_safety;

                //Demolition
                $c_matrix_demolition = 0;
                $normal = $totalStats['structure_damage']['max'] - $totalStats['structure_damage']['min'];
                if ($normal > 0) {
                    $c_matrix_demolition = max(0,($c_pmin_structure_damage_raw - $totalStats['structure_damage']['min']) / ($normal * 1.0));
                }
                $statMatrix['Demolition'] = $c_matrix_demolition;

                //Damage
                $c_matrix_damage = 0;
                $normal = $totalStats['hero_damage']['max'] - $totalStats['hero_damage']['min'];
                if ($normal > 0) {
                    $c_matrix_damage = max(0,($c_pmin_hero_damage_raw - $totalStats['hero_damage']['min']) / ($normal * 1.0));
                }
                $statMatrix['Damage'] = $c_matrix_damage;

                //Tank
                $c_matrix_tank = 0;
                $normal = $totalStats['damage_taken']['max'] - $totalStats['damage_taken']['min'];
                if ($normal > 0) {
                    $c_matrix_tank = max(0,($c_pmin_damage_taken_raw - $totalStats['damage_taken']['min']) / ($normal * 1.0));
                }
                $statMatrix['Tank'] = $c_matrix_tank;

                //Waveclear
                $c_matrix_waveclear = 0;
                $normal = $totalStats['siege_damage']['max'] - $totalStats['siege_damage']['min'];
                if ($normal > 0) {
                    $c_matrix_waveclear = max(0,($c_pmin_siege_damage_raw - $totalStats['siege_damage']['min']) / ($normal * 1.0));
                }
                $statMatrix['Waveclear'] = $c_matrix_waveclear;

                //Exp Soak
                $c_matrix_expsoak = 0;
                $normal = $totalStats['exp_contrib']['max'] - $totalStats['exp_contrib']['min'];
                if ($normal > 0) {
                    $c_matrix_expsoak = max(0,($c_pmin_exp_contrib_raw - $totalStats['exp_contrib']['min']) / ($normal * 1.0));
                }
                $statMatrix['Exp Contrib'] = $c_matrix_expsoak;

                //Merc Camps
                $c_matrix_merccamps = 0;
                $normal = $totalStats['merc_camps']['max'] - $totalStats['merc_camps']['min'];
                if ($normal > 0) {
                    $c_matrix_merccamps = max(0,($c_pmin_merc_camps_raw - $totalStats['merc_camps']['min']) / ($normal * 1.0));
                }
                $statMatrix['Merc Camps'] = $c_matrix_merccamps;

                //Set Statmatrix
                $pagedata['statMatrix'] = $statMatrix;

                /*
                 * Collect Abilities
                 */
                $abilities = [];

                $heroAbilitiesResult = $db->execute("GetHeroAbilities");
                while ($heroAbilitiesRow = $db->fetchArray($heroAbilitiesResult)) {
                    $row = $heroAbilitiesRow;

                    if (!key_exists($row['type'], $abilities)) {
                        $abilities[$row['type']] = [];
                    }

                    $abilities[$row['type']][] = [
                        "name" => $row['name'],
                        "desc_simple" => $row['desc_simple'], ENT_QUOTES,
                        "image" => $imgbasepath . $row['image'] . ".png"
                    ];
                }
                $db->freeResult($heroAbilitiesResult);

                //Set pagedata abilities
                $pagedata['abilities'] = $abilities;

                /*
                 * Collect Talents
                 */
                $talents = [
                    "minRow" => PHP_INT_MAX,
                    "maxRow" => PHP_INT_MIN
                ];

                $heroTalentsResult = $db->execute("GetHeroTalents");
                while ($heroTalentsRow = $db->fetchArray($heroTalentsResult)) {
                    $row = $heroTalentsRow;

                    //Set string keys for row/col
                    $trowkey = $row['tier_row'] . '';
                    $tcolkey = $row['tier_column'] . '';

                    //Calculate min/max rows
                    $talents['minRow'] = min($row['tier_row'], $talents['minRow']);
                    $talents['maxRow'] = max($row['tier_row'], $talents['maxRow']);

                    //Calculate min/max cols
                    if (!key_exists($trowkey, $talents)) {
                        $talents[$trowkey] = [
                            "tier" => HotstatusPipeline::$heropage_talent_tiers[$trowkey],
                            "minCol" => PHP_INT_MAX,
                            "maxCol" => PHP_INT_MIN,
                            "totalPicked" => 0
                        ];
                    }

                    $talents[$trowkey]['minCol'] = min($row['tier_column'], $talents[$trowkey]['minCol']);
                    $talents[$trowkey]['maxCol'] = max($row['tier_column'], $talents[$trowkey]['maxCol']);

                    //Set row/col talent
                    $talents[$trowkey][$tcolkey] = [
                        "name" => $row['name'],
                        "name_internal" => $row['name_internal'],
                        "desc_simple" => $row['desc_simple'],
                        "image" => $imgbasepath . $row['image'] . ".png"
                    ];
                }
                $db->freeResult($heroTalentsResult);

                //Calculate total picked as well as winrates for Talents
                for ($r = $talents['minRow']; $r <= $talents['maxRow']; $r++) {
                    $rowTotalPicked = 0;
                    $rowMinWinrate = PHP_INT_MAX;
                    $rowMaxWinrate = PHP_INT_MIN;

                    for ($c = $talents[$r.'']['minCol']; $c <= $talents[$r.'']['maxCol']; $c++) {
                        $talent = &$talents[$r.''][$c.''];

                        //Pickrate / Winrate
                        $picked = 0;
                        $won = 0;
                        $winrate = 0;

                        //Special winrate display value, to display nothing rather than 0 for winrates that don't have high enough pickrate
                        $talent['winrate_display'] = '';

                        if (key_exists($talent['name_internal'], $a_talents)) {
                            $talentStats = $a_talents[$talent['name_internal']];

                            $rowTotalPicked += $talentStats['played'];
                            $picked += $talentStats['played'];
                            $won += $talentStats['won'];

                            //Make sure pickrate >= min pickrate in order to display valuable winrate
                            if ($picked >= self::TALENT_WINRATE_MIN_PLAYED) {
                                $winrate = round(($won / ($picked * 1.00)) * 100.0, 1);

                                $colorclass = "hsl-number-winrate-red";
                                if ($winrate >= 50.0) $colorclass = "hsl-number-winrate-green";

                                $talent['winrate_display'] = '<span class="' . $colorclass . '">' . sprintf("%03.1f %%", $winrate) . '</span>';
                            }
                        }

                        //Min/Max
                        $rowMinWinrate = min($winrate, $rowMinWinrate);
                        $rowMaxWinrate = max($winrate, $rowMaxWinrate);

                        $talent['pickrate'] = $picked;
                        $talent['winrate'] = $winrate;
                    }

                    //Total talent picks for Row
                    $talents[$r.'']['totalPicked'] = $rowTotalPicked;
                    $talents[$r.'']['minWinrate'] = max(0, $rowMinWinrate - self::TALENT_WINRATE_MIN_OFFSET);
                    $talents[$r.'']['maxWinrate'] = $rowMaxWinrate;
                }

                //Calculate popularity for Talents, as well as winratePercent
                for ($r = $talents['minRow']; $r <= $talents['maxRow']; $r++) {
                    $rowTotalPicked = $talents[$r.'']['totalPicked'];
                    $rowMinWinrate = $talents[$r.'']['minWinrate'];
                    $rowMaxWinrate = $talents[$r.'']['maxWinrate'];

                    for ($c = $talents[$r.'']['minCol']; $c <= $talents[$r.'']['maxCol']; $c++) {
                        $talent = &$talents[$r.''][$c.''];

                        //Winrate Percent On Range
                        $percentOnRange = 0;
                        if ($rowMaxWinrate - $rowMinWinrate > 0) {
                            $percentOnRange = ((($talent['winrate'] - $rowMinWinrate) * 1.00) / (($rowMaxWinrate - $rowMinWinrate) * 1.00)) * 100.0;
                        }

                        $talent['winrate_percentOnRange'] = $percentOnRange;

                        //Popularity
                        $popularity = 0;
                        if (key_exists($talent['name_internal'], $a_talents)) {
                            $talentStats = $a_talents[$talent['name_internal']];

                            $picked = $talentStats['played'];

                            if ($rowTotalPicked > 0) {
                                $popularity = round((($picked * 1.00) / (($rowTotalPicked) * 1.00)) * 100.0, 1);
                            }
                        }
                        $talent['popularity'] = $popularity;
                    }
                }

                $pagedata['talents'] = $talents;


                /*
                 * Collect Talent Builds
                 */
                $builds = [];

                $bMinWinrate = PHP_INT_MAX;
                $bMaxWinrate = PHP_INT_MIN;

                $bMinPopularity = PHP_INT_MAX;
                $bMaxPopularity = PHP_INT_MIN;

                //Filter builds for only those with atleast min games played, collect build talents, and and calculate winrates/popularity/etc
                foreach ($a_builds as $bkey => $bstats) {
                    $bplayed = $bstats['played'];
                    $bwon = $bstats['won'];

                    if ($bplayed >= self::TALENT_BUILD_WINRATE_MIN_PLAYED) {
                        //Collect talents
                        $r_build = $bkey;

                        $buildTalentsResult = $db->execute("GetHeroBuildTalents");
                        $buildTalentsResultRows = $db->countResultRows($buildTalentsResult);
                        if ($buildTalentsResultRows > 0) {
                            $row = $db->fetchArray($buildTalentsResult);

                            //Decode talents into array
                            $btalents = json_decode($row['talents'], true);

                            //Make sure valid amount of talents to display
                            if (count($btalents) >= self::TALENT_BUILD_MIN_TALENT_COUNT) {
                                $bpopularity = round((($bplayed * 1.00) / (($a_played) * 1.00)) * 100.0, 1);

                                if ($bpopularity >= self::TALENT_BUILD_MIN_POPULARITY) {
                                    $build = [];

                                    //Set talents
                                    $build['talents'] = $btalents;

                                    //Set pickrate
                                    $build['pickrate'] = $bplayed;

                                    //Set winrate and winrate display
                                    $bwinrate = round(($bwon / ($bplayed * 1.00)) * 100.0, 1);

                                    $colorclass = "hsl-number-winrate-red";
                                    if ($bwinrate >= 50.0) $colorclass = "hsl-number-winrate-green";

                                    $build['winrate_display'] = '<span class="' . $colorclass . '">' . sprintf("%03.1f %%", $bwinrate) . '</span>';
                                    $build['winrate'] = $bwinrate;

                                    //Set popularity
                                    $build['popularity'] = $bpopularity;

                                    //Min/Max
                                    $bMinWinrate = min($bwinrate, $bMinWinrate);
                                    $bMaxWinrate = max($bwinrate, $bMaxWinrate);
                                    $bMinPopularity = min($bpopularity, $bMinPopularity);
                                    $bMaxPopularity = max($bpopularity, $bMaxPopularity);

                                    $builds[$bkey] = $build;
                                }
                            }
                        }
                        $db->freeResult($buildTalentsResult);
                    }
                }

                //Normalize minWinrate/minPopularity
                $bMinWinrate = max(0, $bMinWinrate - self::TALENT_BUILD_WINRATE_MIN_OFFSET);
                $bMinPopularity = max(0, $bMinPopularity - self::TALENT_BUILD_POPULARITY_MIN_OFFSET);

                //Calculate winrate/popularity percent on range for valid builds
                foreach ($builds as $bkey => &$bobj) {
                    //Winrate Percent On Range
                    $percentOnRange = 0;
                    if ($bMaxWinrate - $bMinWinrate > 0) {
                        $percentOnRange = ((($bobj['winrate'] - $bMinWinrate) * 1.00) / (($bMaxWinrate - $bMinWinrate) * 1.00)) * 100.0;
                    }

                    $bobj['winrate_percentOnRange'] = $percentOnRange;

                    //Popularity Percent On Range
                    $percentOnRange = 0;
                    if ($bMaxPopularity - $bMinPopularity > 0) {
                        $percentOnRange = ((($bobj['popularity'] - $bMinPopularity) * 1.00) / (($bMaxPopularity - $bMinPopularity) * 1.00)) * 100.0;
                    }

                    $bobj['popularity_percentOnRange'] = $percentOnRange;
                }

                $pagedata['builds'] = $builds;

                /*
                 * Collect medals
                 */
                //Delete MVP
                if (key_exists("MVP", $a_medals)) {
                    unset($a_medals['MVP']);
                }

                //Delete map specific medals
                foreach (HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_MAPSPECIFIC] as $medalid) {
                    if (key_exists($medalid, $a_medals)) {
                        unset($a_medals[$medalid]);
                    }
                }

                //Delete invalid medals
                foreach (HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_OUTDATED] as $medalid) {
                    if (key_exists($medalid, $a_medals)) {
                        unset($a_medals[$medalid]);
                    }
                }

                //Remap any necessary medal ids
                foreach (HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_REMAPPING] as $mold => $mnew) {
                    if (key_exists($mold, $a_medals)) {
                        $a_medals[$mnew] = $a_medals[$mold];
                        unset($a_medals[$mold]);
                    }
                }

                //Get total medal counts
                $totalMedals = 0;
                foreach ($a_medals as $mkey => $medal) {
                    $totalMedals += $medal['count'];
                }

                //Set medal rate of occurence
                $sortedMedals = [];
                if ($totalMedals > 0) {
                    foreach ($a_medals as $mkey => $medal) {
                        $sortedMedals[] = [
                            "key" => $mkey,
                            "value" => $medal['count'] / $totalMedals,
                            "name" => "UNKNOWN",
                            "desc_simple" => "NONE",
                            "image_blue" => "NONE",
                            "image_red" => "NONE"
                        ];
                    }
                }
                usort($sortedMedals, function($a, $b) {
                    $aval = $a['value'];
                    $bval = $b['value'];

                    //Sort by key's value in descending order
                    if ($aval < $bval) {
                        return 1;
                    }
                    else if ($bval < $aval) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });

                $smcount = count($sortedMedals);

                //Fetch the top 3 medals
                /*$r_medal_1 = "~";
                $r_medal_2 = "~";
                $r_medal_3 = "~";

                if ($smcount > 0) {
                    $r_medal_1 = $sortedMedals[0]['key'];
                    if ($smcount > 1) {
                        $r_medal_2 = $sortedMedals[1]['key'];
                        if ($smcount > 2) {
                            $r_medal_3 = $sortedMedals[2]['key'];
                        }
                    }
                }*/

                for ($i = 0; $i < $smcount; $i++) {
                    $medal = &$sortedMedals[$i];

                    if (key_exists($medal['key'], HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_DATA])) {
                        $medalobj = HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_DATA][$medal['key']];

                        $medal['name'] = $medalobj['name'];
                        $medal['desc_simple'] = $medalobj['desc_simple'];
                        $medal['image_blue'] = $imgbasepath . $medalobj['image'] . "_blue.png";
                        $medal['image_red'] = $imgbasepath . $medalobj['image'] . "_red.png";
                    }
                }

                //Splice sortedMedals to top 3
                $sortedMedalsSlice = array_splice($sortedMedals, 0, 3);

                //Set medals
                $pagedata['medals'] = $sortedMedalsSlice;

                /*
                 * Matchups
                 */
                $matchups = [];
                //Foes
                $matchup_foes = [];
                foreach ($a_matchup_foes as $mhero => $mstats) {
                    $played = $mstats['played'];

                    if ($played >= self::MATCHUP_PLAYRATE_MIN) {
                        $m = [];
                        $filter = HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO][$mhero];

                        //Name Sort
                        $m['name_sort'] = $filter['name_sort'];

                        //Roles
                        $m['role_blizzard'] = $filter['role_blizzard'];
                        $m['role_specific'] = $filter['role_specific'];

                        //Image
                        $m['image'] = $imgbasepath . $filter['image_hero'] . ".png";

                        //Played
                        $m['played'] = $played;

                        //Winrate and winrate display
                        $winrate = 0;
                        if ($played > 0) {
                            $winrate = round(($mstats['won'] / ($played * 1.00)) * 100.0, 1);
                        }
                        $m['winrate'] = $winrate;

                        $colorclass = "hl-number-winrate-red";
                        if ($winrate >= 50.0) $colorclass = "hl-number-winrate-green";
                        $winrate_display = '<span class="' . $colorclass . '">' . sprintf("%03.1f %%", $winrate) . '</span>';
                        $m['winrate_display'] = $winrate_display;

                        //Set hero matchup
                        $matchup_foes[$mhero] = $m;
                    }
                }
                $matchups['foes'] = $matchup_foes;
                $matchups['foes_count'] = count($matchup_foes);

                //Friends
                $matchup_friends = [];
                foreach ($a_matchup_friends as $mhero => $mstats) {
                    $played = $mstats['played'];

                    if ($played >= self::MATCHUP_PLAYRATE_MIN) {
                        $m = [];
                        $filter = HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO][$mhero];

                        //Name Sort
                        $m['name_sort'] = $filter['name_sort'];

                        //Roles
                        $m['role_blizzard'] = $filter['role_blizzard'];
                        $m['role_specific'] = $filter['role_specific'];

                        //Image
                        $m['image'] = $imgbasepath . $filter['image_hero'] . ".png";

                        //Played
                        $m['played'] = $played;

                        //Winrate and winrate display
                        $winrate = 0;
                        if ($played > 0) {
                            $winrate = round(($mstats['won'] / ($played * 1.00)) * 100.0, 1);
                        }
                        $m['winrate'] = $winrate;

                        $colorclass = "hl-number-winrate-red";
                        if ($winrate >= 50.0) $colorclass = "hl-number-winrate-green";
                        $winrate_display = '<span class="' . $colorclass . '">' . sprintf("%03.1f %%", $winrate) . '</span>';
                        $m['winrate_display'] = $winrate_display;

                        //Set hero matchup
                        $matchup_friends[$mhero] = $m;
                    }
                }
                $matchups['friends'] = $matchup_friends;
                $matchups['friends_count'] = count($matchup_friends);

                //Set matchups
                $pagedata['matchups'] = $matchups;


                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($pagedata);
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::getCacheDefaultExpirationTimeInSecondsForToday());
            }
        }

        $redis->close();

        $responsedata['data'] = $pagedata;

        $response = $this->json($responsedata);
        $response->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $response->setExpires(HotstatusCache::getHTTPCacheDefaultExpirationDateForToday());
        }

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
        $CACHE_ID = $_ID . ((strlen($queryCacheSql) > 0) ? (":" . md5($queryCacheSql)) : (""));

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

            $connected_mysql = HotstatusPipeline::hotstatus_mysql_connect($db, $creds);

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
                $filter = HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO];
                foreach ($filter as $heroname => $row) {
                    $r_hero = $heroname;

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
                    $hero['name'] = $heroname;
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
                        $percentOnRange = 0;
                        if ($maxWinrate - $minWinrate > 0) {
                            $percentOnRange = ((($hero['dt_winrate'] - $minWinrate) * 1.00) / (($maxWinrate - $minWinrate) * 1.00)) * 100.0;
                        }
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

                $db->close();

                $validResponse = TRUE;
            }

            $datatable['data'] = $data;

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($datatable);
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
     * Given a mysql (and optional redis connection), returns an internal response for the given querySql in order to generate average min/max stats, which
     * can then be used to generate a statMatrix for a hero.
     */
    private static function hero_requestTotalStatMatrix($mysql, $connected_mysql, $redis = NULL, $connected_redis = FALSE, $querySql) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataHeroRequestTotalStatMatrix";
        $_VERSION = 0;

        //Main vars
        $pagedata = [];

        //Determine Cache Id
        $CACHE_ID = $_ID . ((strlen($querySql) > 0) ? (":" . md5($querySql)) : (""));

        $cacheval = NULL;
        if ($connected_redis !== FALSE) {
            $cacheval = HotstatusCache::readCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION);
        }

        if ($connected_redis !== FALSE && $cacheval !== NULL) {
            //Use cached value
            $pagedata = json_decode($cacheval, true);
        }
        else if ($connected_mysql) {
            /** @var MySqlDatabase $db */
            $db = $mysql;

            //Prepare Statement
            $db->prepare("GetTargetHeroStats",
                "SELECT `played`, `won`, `time_played`, `stats_kills`, `stats_assists`, `stats_deaths`,
                `stats_siege_damage`, `stats_hero_damage`, `stats_structure_damage`, `stats_healing`, `stats_damage_taken`, `stats_merc_camps`, `stats_exp_contrib`,
                `stats_best_killstreak`, `stats_time_spent_dead` FROM heroes_matches_recent_granular WHERE `hero` = ? $querySql");
            $db->bind("GetTargetHeroStats", "s", $r_hero);

            //Loop through all heroes to collect individual average stats
            $herostats = [];
            foreach (HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO] as $heroname => $heroobj) {
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

                /*
                 * Collect Stats
                 */
                $r_hero = $heroname;
                $heroStatsResult = $db->execute("GetTargetHeroStats");
                while ($heroStatsRow = $db->fetchArray($heroStatsResult)) {
                    $row = $heroStatsRow;

                    /*
                     * Aggregate
                     */
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

                //Average Kills (+ Per Minute)
                $c_avg_kills = 0;
                $c_pmin_kills = 0;
                if ($a_played > 0) {
                    $c_avg_kills = $a_kills / ($a_played * 1.00);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_kills = $c_avg_kills / ($c_avg_minutesPlayed * 1.00);
                }
                $stats['kills'] = $c_pmin_kills;

                //Average Assists (+ Per Minute)
                $c_avg_assists = 0;
                $c_pmin_assists = 0;
                if ($a_played > 0) {
                    $c_avg_assists = $a_assists / ($a_played * 1.00);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_assists = $c_avg_assists / ($c_avg_minutesPlayed * 1.00);
                }
                $stats['assists'] = $c_pmin_assists;

                //Average Deaths (+ Per Minute)
                $c_avg_deaths = 0;
                $c_pmin_deaths = 0;
                if ($a_played > 0) {
                    $c_avg_deaths = $a_deaths / ($a_played * 1.00);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_deaths = $c_avg_deaths / ($c_avg_minutesPlayed * 1.00);
                }
                $stats['deaths'] = $c_pmin_deaths;

                //Average Siege Damage (+ Per Minute)
                $c_avg_siege_damage = 0;
                $c_pmin_siege_damage = 0;
                if ($a_played > 0) {
                    $c_avg_siege_damage = $a_siege_damage / ($a_played * 1.00);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_siege_damage = $c_avg_siege_damage / ($c_avg_minutesPlayed * 1.00);
                }
                $stats['siege_damage'] = $c_pmin_siege_damage;

                //Average Hero Damage (+ Per Minute)
                $c_avg_hero_damage = 0;
                $c_pmin_hero_damage = 0;
                if ($a_played > 0) {
                    $c_avg_hero_damage = $a_hero_damage / ($a_played * 1.00);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_hero_damage = $c_avg_hero_damage / ($c_avg_minutesPlayed * 1.00);
                }
                $stats['hero_damage'] = $c_pmin_hero_damage;

                //Average Structure Damage (+ Per Minute)
                $c_avg_structure_damage = 0;
                $c_pmin_structure_damage = 0;
                if ($a_played > 0) {
                    $c_avg_structure_damage = $a_structure_damage / ($a_played * 1.00);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_structure_damage = $c_avg_structure_damage / ($c_avg_minutesPlayed * 1.00);
                }
                $stats['structure_damage'] = $c_pmin_structure_damage;

                //Average Healing (+ Per Minute)
                $c_avg_healing = 0;
                $c_pmin_healing = 0;
                if ($a_played > 0) {
                    $c_avg_healing = $a_healing / ($a_played * 1.00);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_healing = $c_avg_healing / ($c_avg_minutesPlayed * 1.00);
                }
                $stats['healing'] = $c_pmin_healing;

                //Average Damage Taken (+ Per Minute)
                $c_avg_damage_taken = 0;
                $c_pmin_damage_taken = 0;
                if ($a_played > 0) {
                    $c_avg_damage_taken = $a_damage_taken / ($a_played * 1.00);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_damage_taken = $c_avg_damage_taken / ($c_avg_minutesPlayed * 1.00);
                }
                $stats['damage_taken'] = $c_pmin_damage_taken;

                //Average Merc Camps (+ Per Minute)
                $c_avg_merc_camps = 0;
                $c_pmin_merc_camps = 0;
                if ($a_played > 0) {
                    $c_avg_merc_camps = $a_merc_camps / ($a_played * 1.00);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_merc_camps = $c_avg_merc_camps / ($c_avg_minutesPlayed * 1.00);
                }
                $stats['merc_camps'] = $c_pmin_merc_camps;

                //Average Exp Contrib (+ Per Minute)
                $c_avg_exp_contrib = 0;
                $c_pmin_exp_contrib = 0;
                if ($a_played > 0) {
                    $c_avg_exp_contrib = $a_exp_contrib / ($a_played * 1.00);
                }
                if ($c_avg_minutesPlayed > 0) {
                    $c_pmin_exp_contrib = $c_avg_exp_contrib / ($c_avg_minutesPlayed * 1.00);
                }
                $stats['exp_contrib'] = $c_pmin_exp_contrib;

                //Average Time Spent Dead (in Minutes)
                $c_avg_time_spent_dead = 0;
                if ($a_played > 0) {
                    $c_avg_time_spent_dead = ($a_time_spent_dead / ($a_played * 1.00)) / 60.0;
                }
                $stats['time_spent_dead'] = $c_avg_time_spent_dead;

                //Set pagedata stats
                $herostats[$heroname] = $stats;
            }

            //Init total average stats object
            $totalstats = [
                "kills" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
                "assists" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
                "deaths" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
                /*"special_tankiness" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                    "calc" => function(&$stats) {
                        if ($stats['deaths'] > 0) {
                            return $stats['damage_taken'] / $stats['deaths'];
                        }
                        else {
                            return $stats['damage_taken'];
                        }
                    }
                ],*/
                "siege_damage" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
                "hero_damage" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
                "structure_damage" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
                "healing" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
                "damage_taken" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
                "merc_camps" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
                "exp_contrib" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
                "time_spent_dead" => [
                    "min" => PHP_INT_MAX,
                    "avg" => 0,
                    "max" => PHP_INT_MIN,
                    "count" => 0,
                ],
            ];

            //Loop through hero average stats to collect a single object of min, avg, max
            foreach ($herostats as $heroname => $stats) {
                //Loop through total average stats object and collect herostat
                foreach ($totalstats as $tskey => &$tstat) {
                    if (key_exists($tskey, $stats)) {
                        //Standard Stat
                        $stat = $stats[$tskey];

                        $val = 0;
                        if (is_array($stat)) {
                            if (key_exists('per_minute', $stat)) {
                                $val = $stat['per_minute'];
                            }
                            else {
                                $val = $stat['average'];
                            }
                        }
                        elseif (is_numeric($stat)) {
                            $val = $stat;
                        }
                    }
                    else {
                        //Special composite stat
                        $val = $tstat['calc']($stats);
                    }

                    //Only track if valid
                    if ($val > 0) {
                        $tstat['avg'] += $val;
                        $tstat['min'] = min($tstat['min'], $val);
                        $tstat['max'] = max($tstat['max'], $val);
                        $tstat['count'] += 1;
                    }
                }
            }

            //Loop through total average stats to calculate true average
            foreach ($totalstats as $tskey => &$tstat) {
                if ($tstat['count'] > 0) {
                    $tstat['avg'] = $tstat['avg'] / ($tstat['count'] * 1.00);
                }
            }

            $pagedata = $totalstats;

            //Store mysql value in cache
            if ($connected_redis) {
                $encoded = json_encode($pagedata);
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::getCacheDefaultExpirationTimeInSecondsForToday());
            }
        }

        return $pagedata;
    }

    /*
     * Initializes the queries object for the hero pagedata
     */
    private static function hero_initQueries() {
        HotstatusPipeline::filter_generate_date();

        $q = [
            HotstatusPipeline::FILTER_KEY_HERO => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_USE_FOR_SECONDARY => false,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "hero",
                self::QUERY_TYPE => self::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_GAMETYPE => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_USE_FOR_SECONDARY => true,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "gameType",
                self::QUERY_TYPE => self::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_MAP => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_USE_FOR_SECONDARY => true,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "map",
                self::QUERY_TYPE => self::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_RANK => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_USE_FOR_SECONDARY => true,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "mmr_average",
                self::QUERY_TYPE => self::QUERY_TYPE_RANGE
            ],
            HotstatusPipeline::FILTER_KEY_DATE => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_USE_FOR_SECONDARY => true,
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

    private static function formatNumber($n, $decimalPlaces = 0) {
        return number_format($n, $decimalPlaces, '.', ',');
    }
}
