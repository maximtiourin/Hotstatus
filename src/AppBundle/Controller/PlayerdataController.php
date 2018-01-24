<?php

namespace AppBundle\Controller;

use Fizzik\GetPageDataRankingsAction;
use Fizzik\HotstatusPipeline;
use Fizzik\HotstatusResponse;
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
 * In charge of fetching player data from database and returning it as requested
 */
class PlayerdataController extends Controller {
    const COUNT_DEFAULT_MATCHES = 10; //How many matches to initially load for a player page (getPageDataPlayerRecentMatches should have this baked into route default)

    const TALENT_WINRATE_MIN_PLAYED = 1; //How many times a talent must have been played before allowing winrate calculation
    const TALENT_WINRATE_MIN_OFFSET = 5.0; //How much to subtract from the min win rate for a talent to determine percentOnRange calculations, used to better normalize ranges.
    const TALENT_BUILD_MIN_TALENT_COUNT = 7; //How many talents the build must have in order to be valid for display
    const TALENT_BUILD_MIN_POPULARITY = 0.5; //Minimum amount of popularity % required for build to be valid for display
    const TALENT_BUILD_WINRATE_MIN_PLAYED = 2; //How many times a talent build have been played before allowing display
    const TALENT_BUILD_WINRATE_MIN_OFFSET = 2.5; //How much to subtract from the min winrate for a talent build to determine percentOnRange calculations, used to normalize ranges.
    const TALENT_BUILD_POPULARITY_MIN_OFFSET = .1; //How much to subtract from the min popularity for a talent build to determine percentOnRange calcs, used to normalize range

    /**
     * Returns the relevant player data for a player necessary to build a player page
     *
     * @Route("/playerdata/pagedata/{region}/{player}", requirements={"region": "\d+", "player": "\d+"}, options={"expose"=true}, condition="request.isXmlHttpRequest()", name="playerdata_pagedata_player")
     */
    public function getPageDataPlayerAction(Request $request, $region, $player) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataPlayerAction";
        $_VERSION = 1;

        /*
         * Process Query Parameters
         */
        $query = self::player_initDefaultQueries();
        $queryCacheValues = [];
        $querySqlValues = [];

        //Collect WhereOr strings from all query parameters for cache key
        foreach ($query as $qkey => &$qobj) {
            if ($request->query->has($qkey)) {
                $qobj[HotstatusResponse::QUERY_ISSET] = true;
                $qobj[HotstatusResponse::QUERY_RAWVALUE] = $request->query->get($qkey);
                $qobj[HotstatusResponse::QUERY_SQLVALUE] = HotstatusResponse::buildQuery_WhereOr_String($qkey, $qobj[HotstatusResponse::QUERY_SQLCOLUMN], $qobj[HotstatusResponse::QUERY_RAWVALUE], $qobj[HotstatusResponse::QUERY_TYPE]);
                $queryCacheValues[] = $query[$qkey][HotstatusResponse::QUERY_RAWVALUE];
            }
        }

        $querySeason = $query[HotstatusPipeline::FILTER_KEY_SEASON][HotstatusResponse::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[HotstatusResponse::QUERY_IGNORE_AFTER_CACHE] && $qobj[HotstatusResponse::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][HotstatusResponse::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCache = HotstatusResponse::buildCacheKey($queryCacheValues);
        $querySql = HotstatusResponse::buildQuery_WhereAnd_String($querySqlValues, TRUE);

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = "$_ID:$region:$player".((strlen($queryCache) > 0) ? (":" . md5($queryCache)) : (""));

        //Get credentials
        $creds = Credentials::getCredentialsForUser(Credentials::USER_HOTSTATUSWEB);

        //Get redis cache
        $redis = new RedisDatabase();
        $connected_redis = $redis->connect($creds[Credentials::KEY_REDIS_URI], HotstatusCache::CACHE_PLAYERSEARCH_DATABASE_INDEX);

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
                /*$pkgs = $this->get("assets.packages");
                $pkg = $pkgs->getPackage("images");
                $imgbasepath = $pkg->getUrl('');*/

                //Get season date range
                date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);
                $seasonobj = HotstatusPipeline::$SEASONS[$querySeason];
                $date_start = $seasonobj['start'];
                $date_end = $seasonobj['end'];

                //Prepare Statements
                $t_players_mmr = HotstatusPipeline::$table_pointers['players_mmr'];

                $db->prepare("GetMMRForPlayer",
                    "SELECT `rating`, `gameType` FROM `$t_players_mmr` WHERE `id` = ? AND `region` = ? AND `season` = ? $querySql");
                $db->bind("GetMMRForPlayer", "iis", $r_player_id, $r_region, $r_season);

                $r_player_id = $player;
                $r_region = $region;
                $r_season = $querySeason;

                /*
                 * Collect playerdata
                 */

                /*
                 * MMR
                 */
                $mmrs = [];

                $MMRResult = $db->execute("GetMMRForPlayer");
                $MMRResultRows = $db->countResultRows($MMRResult);
                if ($MMRResultRows > 0) {
                    while ($row = $db->fetchArray($MMRResult)) {
                        $mmr = [];

                        $mmr['gameType'] = strval($row['gameType']);
                        $mmr['gameType_image'] = HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_GAMETYPE][$mmr['gameType']]['name_sort'];

                        $rating = $row['rating'];
                        $rating = ($rating !== "?") ? (intval($rating)) : (0);

                        $mmr['rating'] = $rating;
                        $mmr['rank'] = HotstatusPipeline::getRankNameForPlayerRating($rating, $querySeason);
                        $mmr['tier'] = HotstatusPipeline::getRankTierForPlayerRating($rating, $querySeason);

                        $mmrs[] = $mmr;
                    }
                }

                $db->freeResult($MMRResult);

                //Sort mmr
                if (count($mmrs) > 0) {
                    usort($mmrs, function ($a, $b) {
                        $mmrSortValue = function ($gameType) {
                            if ($gameType === "Hero League") {
                                return 1;
                            }
                            else if ($gameType === "Team League") {
                                return 2;
                            }
                            else if ($gameType === "Unranked Draft") {
                                return 3;
                            }
                            else if ($gameType === "Quick Match") {
                                return 4;
                            }
                            else {
                                return 5;
                            }
                        };

                        $aval = $mmrSortValue($a['gameType']);
                        $bval = $mmrSortValue($b['gameType']);

                        return $aval - $bval;
                    });
                }

                $pagedata['mmr'] = $mmrs;


                /*
                 * Set playerloader data
                 */
                $limits = [];

                $limits['matches'] = self::COUNT_DEFAULT_MATCHES;

                $pagedata['limits'] = $limits;

                //Last Updated
                $pagedata['last_updated'] = time();


                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($pagedata);
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::CACHE_PLAYER_UPDATE_LONG_TTL);
            }
        }

        $redis->close();

        $responsedata['data'] = $pagedata;

        $response = $this->json($responsedata);
        $response->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $response->setMaxAge(HotstatusCache::CACHE_PLAYER_UPDATE_LONG_TTL);
        }

        return $response;
    }

    /**
     * Returns top heroes (and top maps) for player, as well as MVP percent and matches played
     *
     * @Route("/playerdata/pagedata/{region}/{player}/topheroes", requirements={"region": "\d+", "player": "\d+"}, options={"expose"=true}, condition="request.isXmlHttpRequest()", name="playerdata_pagedata_player_topheroes")
     */
    public function getPageDataPlayerTopHeroesAction(Request $request, $region, $player) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataPlayerTopHeroesAction";
        $_VERSION = 1;

        /*
         * Process Query Parameters
         */
        $query = self::topHeroes_initQueries();
        $queryCacheValues = [];
        $querySqlValues = [];

        //Collect WhereOr strings from all query parameters for cache key
        foreach ($query as $qkey => &$qobj) {
            if ($request->query->has($qkey)) {
                $qobj[HotstatusResponse::QUERY_ISSET] = true;
                $qobj[HotstatusResponse::QUERY_RAWVALUE] = $request->query->get($qkey);
                $qobj[HotstatusResponse::QUERY_SQLVALUE] = HotstatusResponse::buildQuery_WhereOr_String($qkey, $qobj[HotstatusResponse::QUERY_SQLCOLUMN], $qobj[HotstatusResponse::QUERY_RAWVALUE], $qobj[HotstatusResponse::QUERY_TYPE]);
                $queryCacheValues[] = $query[$qkey][HotstatusResponse::QUERY_RAWVALUE];
            }
        }

        $querySeason = $query[HotstatusPipeline::FILTER_KEY_SEASON][HotstatusResponse::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[HotstatusResponse::QUERY_IGNORE_AFTER_CACHE] && $qobj[HotstatusResponse::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][HotstatusResponse::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCache = HotstatusResponse::buildCacheKey($queryCacheValues);
        $querySql = HotstatusResponse::buildQuery_WhereAnd_String($querySqlValues, true);

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = "$_ID:$region:$player".((strlen($queryCache) > 0) ? (":" . md5($queryCache)) : (""));

        //Get credentials
        $creds = Credentials::getCredentialsForUser(Credentials::USER_HOTSTATUSWEB);

        //Get redis cache
        $redis = new RedisDatabase();
        $connected_redis = $redis->connect($creds[Credentials::KEY_REDIS_URI], HotstatusCache::CACHE_PLAYERSEARCH_DATABASE_INDEX);

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

                //Get season date range
                date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);
                $seasonobj = HotstatusPipeline::$SEASONS[$querySeason];
                $date_start = $seasonobj['start'];
                $date_end = $seasonobj['end'];

                //Prepare Statements
                $t_players_matches_recent_granular = HotstatusPipeline::$table_pointers['players_matches_recent_granular'];

                $db->prepare("GetTopHeroes",
                    "SELECT `map`, `hero`, `played`, `won`, `stats_kills`, `stats_assists`, `stats_deaths`, `medals` FROM `$t_players_matches_recent_granular` 
                    WHERE `id` = ? AND `region` = ? AND `date_end` >= ? AND `date_end` <= ? $querySql");
                $db->bind("GetTopHeroes", "iiss", $r_player_id, $r_region, $r_date_start, $r_date_end);

                $r_player_id = $player;
                $r_region = $region;
                $r_date_start = $date_start;
                $r_date_end = $date_end;

                /*
                 * Get Heroes/Maps Stats
                 */
                $heroes = [];
                $maps = [];
                $a_mvp_medals = 0;
                $topHeroesResult = $db->execute("GetTopHeroes");
                while ($row = $db->fetchArray($topHeroesResult)) {
                    $heroname = $row['hero'];
                    $mapname = $row['map'];

                    //Hero Exists
                    if (!key_exists($heroname, $heroes)) {
                        $heroes[$heroname] = [
                            "name" => $heroname,
                            "image_hero" => HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO][$heroname]['image_hero'],
                            "played" => 0,
                            "won" => 0,
                            "kills" => 0,
                            "assists" => 0,
                            "deaths" => 0,
                            "kills_avg" => 0,
                            "assists_avg" => 0,
                            "deaths_avg" => 0,
                            "kda_avg" => 0,
                            "winrate" => 0,
                            "winrate_raw" => 0,
                        ];
                    }

                    //Map Exists
                    if (!key_exists($mapname, $maps)) {
                        $maps[$mapname] = [
                            "name" => $mapname,
                            "image" => HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_MAP][$mapname]['name_sort'],
                            "played" => 0,
                            "won" => 0,
                            "winrate" => 0,
                            "winrate_raw" => 0,
                        ];
                    }

                    //Hero
                    $hero = &$heroes[$heroname];

                    $a_played = &$hero['played'];
                    $a_won = &$hero['won'];
                    $a_kills = &$hero['kills'];
                    $a_assists = &$hero['assists'];
                    $a_deaths = &$hero['deaths'];

                    $a_played += $row['played'];
                    $a_won += $row['won'];
                    $a_kills += $row['stats_kills'];
                    $a_assists += $row['stats_assists'];
                    $a_deaths += $row['stats_deaths'];

                    //Map
                    $map = &$maps[$mapname];

                    $a_m_played = &$map['played'];
                    $a_m_won = &$map['won'];

                    $a_m_played += $row['played'];
                    $a_m_won += $row['won'];

                    //MVP Medals
                    $row_medals = json_decode($row['medals'], true);
                    if (key_exists('MVP', $row_medals)) {
                        $a_mvp_medals += $row_medals['MVP']['count'];
                    }
                }

                $db->freeResult($topHeroesResult);

                /*
                 * Get Top Heroes
                 */
                $a_matches_played = 0;
                $a_matches_won = 0;
                $topheroes = [];
                foreach ($heroes as $heroname => &$hero) {
                    $a_played = &$hero['played'];
                    $a_won = &$hero['won'];
                    $a_kills = &$hero['kills'];
                    $a_assists = &$hero['assists'];
                    $a_deaths = &$hero['deaths'];

                    //Matches played
                    $a_matches_played += $a_played;
                    $a_matches_won += $a_won;

                    //Winrate
                    $c_winrate = 0;
                    if ($a_played > 0) {
                        $c_winrate = round(($a_won / ($a_played * 1.00)) * 100.0, 1);
                    }
                    $hero['winrate'] = sprintf("%03.1f", $c_winrate);
                    $hero['winrate_raw'] = $c_winrate;

                    //Kills
                    $c_avg_kills = 0;
                    $c_avg_kills_raw = 0;
                    if ($a_played > 0) {
                        $c_avg_kills_raw = $a_kills / ($a_played * 1.00);
                        $c_avg_kills = round($c_avg_kills_raw, 1);
                    }
                    $hero['kills_avg'] = HotstatusResponse::formatNumber($c_avg_kills, 1);

                    //Assists
                    $c_avg_assists = 0;
                    $c_avg_assists_raw = 0;
                    if ($a_played > 0) {
                        $c_avg_assists_raw = $a_assists / ($a_played * 1.00);
                        $c_avg_assists = round($c_avg_assists_raw, 1);
                    }
                    $hero['assists_avg'] = HotstatusResponse::formatNumber($c_avg_assists, 1);

                    //Deaths
                    $c_avg_deaths = 0;
                    $c_avg_deaths_raw = 0;
                    if ($a_played > 0) {
                        $c_avg_deaths_raw = $a_deaths / ($a_played * 1.00);
                        $c_avg_deaths = round($c_avg_deaths_raw, 1);
                    }
                    $hero['deaths_avg'] = HotstatusResponse::formatNumber($c_avg_deaths, 1);
                    
                    //KDA
                    $c_avg_kda = $c_avg_kills_raw + $c_avg_assists_raw;
                    if ($c_avg_deaths_raw > 0) {
                        $c_avg_kda_raw = ($c_avg_kda / ($c_avg_deaths_raw * 1.00));
                        $c_avg_kda = round($c_avg_kda_raw, 2);
                        $hero['kda_avg'] = HotstatusResponse::formatNumber($c_avg_kda, 2);
                    }
                    else {
                        $hero['kda_avg'] = "Perfect";
                        $c_avg_kda_raw = 999999999;
                    }
                    $hero['kda_raw'] = $c_avg_kda_raw;

                    $topheroes[] = $hero;
                }

                //Sort Hero Objects in descending order
                usort($topheroes, function($a, $b) {
                    return (($b['played'] * 1000) + ($b['winrate_raw'])) - (($a['played'] * 1000) + ($a['winrate_raw'])); //Descending Order (First - Played, Second - Winrate Raw)
                });

                $pagedata['heroes'] = $topheroes;

                /*
                 * Get Top Maps
                 */
                $topmaps = [];
                foreach ($maps as $mapname => &$map) {
                    $a_m_played = &$map['played'];
                    $a_m_won = &$map['won'];

                    //Winrate
                    $c_m_winrate = 0;
                    if ($a_m_played > 0) {
                        $c_m_winrate = round(($a_m_won / ($a_m_played * 1.00)) * 100.0, 1);
                    }
                    $map['winrate'] = sprintf("%03.1f", $c_m_winrate);
                    $map['winrate_raw'] = $c_m_winrate;

                    $topmaps[] = $map;
                }

                //Sort Map Objects in descending order
                usort($topmaps, function($a, $b) {
                    return (($b['played']) + ($b['winrate_raw']) * 10000) - (($a['played']) + ($a['winrate_raw']) * 10000); //Descending Order (First - Winrate Raw, Second - Played)
                });

                $pagedata['maps'] = $topmaps;

                //Special Data
                $pagedata['matches_played'] = $a_matches_played;

                $c_matches_winrate = 0;
                if ($a_matches_played > 0) {
                    $c_matches_winrate = round(($a_matches_won / ($a_matches_played * 1.00)) * 100.0, 1);
                }
                $pagedata['matches_winrate'] = sprintf("%03.1f", $c_matches_winrate);
                $pagedata['matches_winrate_raw'] = $c_matches_winrate;


                $pagedata['mvp_medals'] = $a_mvp_medals;

                $c_mvp_percentage = 0;
                if ($a_matches_played > 0) {
                    $c_mvp_percentage = round(($a_mvp_medals / ($a_matches_played * 1.00)) * 100.0, 1);
                }

                $pagedata['mvp_medals_percentage'] = $c_mvp_percentage;

                //Last Updated
                $pagedata['last_updated'] = time();

                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($pagedata);
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::CACHE_PLAYER_UPDATE_TTL);
            }
        }

        $redis->close();

        $responsedata['data'] = $pagedata;

        $response = $this->json($responsedata);
        $response->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $response->setMaxAge(HotstatusCache::CACHE_PLAYER_UPDATE_TTL);
        }

        return $response;
    }

    /**
     * Returns recent parties for player, as well as party statistics
     *
     * @Route("/playerdata/pagedata/{region}/{player}/parties", requirements={"region": "\d+", "player": "\d+"}, options={"expose"=true}, condition="request.isXmlHttpRequest()", name="playerdata_pagedata_player_parties")
     */
    public function getPageDataPlayerPartiesAction(Request $request, $region, $player) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataPlayerPartiesAction";
        $_VERSION = 1;

        /*
         * Process Query Parameters
         */
        $query = self::parties_initQueries();
        $queryCacheValues = [];
        $querySqlValues = [];

        //Collect WhereOr strings from all query parameters for cache key
        foreach ($query as $qkey => &$qobj) {
            if ($request->query->has($qkey)) {
                $qobj[HotstatusResponse::QUERY_ISSET] = true;
                $qobj[HotstatusResponse::QUERY_RAWVALUE] = $request->query->get($qkey);
                $qobj[HotstatusResponse::QUERY_SQLVALUE] = HotstatusResponse::buildQuery_WhereOr_String($qkey, $qobj[HotstatusResponse::QUERY_SQLCOLUMN], $qobj[HotstatusResponse::QUERY_RAWVALUE], $qobj[HotstatusResponse::QUERY_TYPE]);
                $queryCacheValues[] = $query[$qkey][HotstatusResponse::QUERY_RAWVALUE];
            }
        }

        $querySeason = $query[HotstatusPipeline::FILTER_KEY_SEASON][HotstatusResponse::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[HotstatusResponse::QUERY_IGNORE_AFTER_CACHE] && $qobj[HotstatusResponse::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][HotstatusResponse::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCache = HotstatusResponse::buildCacheKey($queryCacheValues);
        $querySql = HotstatusResponse::buildQuery_WhereAnd_String($querySqlValues, true);

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = "$_ID:$region:$player".((strlen($queryCache) > 0) ? (":" . md5($queryCache)) : (""));

        //Get credentials
        $creds = Credentials::getCredentialsForUser(Credentials::USER_HOTSTATUSWEB);

        //Get redis cache
        $redis = new RedisDatabase();
        $connected_redis = $redis->connect($creds[Credentials::KEY_REDIS_URI], HotstatusCache::CACHE_PLAYERSEARCH_DATABASE_INDEX);

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

                //Get season date range
                date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);
                $seasonobj = HotstatusPipeline::$SEASONS[$querySeason];
                $date_start = $seasonobj['start'];
                $date_end = $seasonobj['end'];

                //Prepare Statements
                $t_players_matches_recent_granular = HotstatusPipeline::$table_pointers['players_matches_recent_granular'];
                $t_players_parties = HotstatusPipeline::$table_pointers['players_parties'];
                $t_players = HotstatusPipeline::$table_pointers['players'];

                $db->prepare("GetParties",
                    "SELECT `parties` FROM `$t_players_matches_recent_granular` 
                    WHERE `id` = ? AND `region` = ? AND `date_end` >= ? AND `date_end` <= ? $querySql");
                $db->bind("GetParties", "iiss", $r_player_id, $r_region, $r_date_start, $r_date_end);

                $db->prepare("GetPartyPlayers",
                    "SELECT `players` FROM `$t_players_parties` WHERE `id` = ? AND `region` = ? AND `party` = ? LIMIT 1");
                $db->bind("GetPartyPlayers", "iis", $r_player_id, $r_region, $r_party);

                $db->prepare("GetPlayerNameFromId",
                    "SELECT `name` FROM `$t_players` WHERE `id` = ? AND `region` = ? LIMIT 1");
                $db->bind("GetPlayerNameFromId", "ii", $r_other_player_id, $r_region);

                $r_player_id = $player;
                $r_region = $region;
                $r_date_start = $date_start;
                $r_date_end = $date_end;

                /*
                 * Aggregate Parties
                 */
                $a_parties = [];
                $partiesResult = $db->execute("GetParties");
                while ($row = $db->fetchArray($partiesResult)) {
                    //Parties
                    $row_parties = json_decode($row['parties'], true);
                    AssocArray::aggregate($a_parties, $row_parties, $null = null, AssocArray::AGGREGATE_SUM);
                }

                $db->freeResult($partiesResult);

                /*
                 * Party Statistics
                 */
                $parties = [];
                foreach ($a_parties as $partykey => $party) {
                    //Get party players and map their ids to names
                    $r_party = $partykey;

                    $party_played = $party['played'];
                    $party_won = $party['won'];

                    //Winrate
                    $party_winrate = 0;
                    if ($party_played > 0) {
                        $party_winrate = round(($party_won / ($party_played * 1.00)) * 100.0, 1);
                    }

                    $partyobj = [
                        "played" => $party_played,
                        "won" => $party_won,
                        "winrate" => sprintf("%03.1f", $party_winrate),
                        "winrate_raw" => $party_winrate,
                    ];

                    $partyplayersresult = $db->execute("GetPartyPlayers");
                    $partyplayersresultrows = $db->countResultRows($partyplayersresult);
                    if ($partyplayersresultrows > 0) {
                        $row = $db->fetchArray($partyplayersresult);

                        $playersobj = [];

                        $players = json_decode($row['players']);

                        foreach ($players as $partyplayer) {
                            $playerobj = [
                                "id" => $partyplayer,
                            ];

                            $r_other_player_id = $partyplayer;

                            $otherplayerresult = $db->execute("GetPlayerNameFromId");
                            $otherplayerresultrows = $db->countResultRows($otherplayerresult);
                            if ($otherplayerresultrows > 0) {
                                $otherrow = $db->fetchArray($otherplayerresult);

                                $playerobj["name"] = $otherrow['name'];
                            }
                            else {
                                $playerobj["name"] = "Unknown";
                            }

                            $db->freeResult($otherplayerresult);

                            $playersobj[] = $playerobj;
                        }

                        $partyobj["players"] = $playersobj;

                        $parties[] = $partyobj;
                    }

                    $db->freeResult($partyplayersresult);
                }

                //Sort Parties in descending order
                usort($parties, function($a, $b) {
                    return (($b['played'] * 1000) + ($b['winrate_raw'])) - (($a['played'] * 1000) + ($a['winrate_raw'])); //Descending Order (First - Played, Second - Winrate Raw)
                });

                $pagedata['parties'] = $parties;

                //Last Updated
                $pagedata['last_updated'] = time();

                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($pagedata);
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::CACHE_PLAYER_UPDATE_TTL); //UPDATE_TTL on redis
            }
        }

        $redis->close();

        $responsedata['data'] = $pagedata;

        $response = $this->json($responsedata);
        $response->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $response->setMaxAge(HotstatusCache::CACHE_PLAYER_UPDATE_LONG_TTL); //UPDATE_LONG_TTL on player's local cache
        }

        return $response;
    }

    /**
     * Returns recent matches for player based on offset and match limit
     *
     * @Route("/playerdata/pagedata/{region}/{player}/{offset}/{limit}/recentmatches", defaults={"offset" = 0, "limit" = 10}, requirements={"region": "\d+", "player": "\d+", "offset": "\d+", "limit": "\d+"}, options={"expose"=true}, condition="request.isXmlHttpRequest()", name="playerdata_pagedata_player_recentmatches")
     */
    public function getPageDataPlayerRecentMatchesAction(Request $request, $region, $player, $offset, $limit) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataPlayerRecentMatchesAction";
        $_VERSION = 1;

        /*
         * Process Query Parameters
         */
        $query = self::recentMatches_initQueries();
        $queryCacheValues = [];
        $querySqlValues = [];

        //Collect WhereOr strings from all query parameters for cache key
        foreach ($query as $qkey => &$qobj) {
            if ($request->query->has($qkey)) {
                $qobj[HotstatusResponse::QUERY_ISSET] = true;
                $qobj[HotstatusResponse::QUERY_RAWVALUE] = $request->query->get($qkey);
                $qobj[HotstatusResponse::QUERY_SQLVALUE] = HotstatusResponse::buildQuery_WhereOr_String($qkey, $qobj[HotstatusResponse::QUERY_SQLCOLUMN], $qobj[HotstatusResponse::QUERY_RAWVALUE], $qobj[HotstatusResponse::QUERY_TYPE]);
                $queryCacheValues[] = $query[$qkey][HotstatusResponse::QUERY_RAWVALUE];
            }
        }

        $querySeason = $query[HotstatusPipeline::FILTER_KEY_SEASON][HotstatusResponse::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[HotstatusResponse::QUERY_IGNORE_AFTER_CACHE] && $qobj[HotstatusResponse::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][HotstatusResponse::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCache = HotstatusResponse::buildCacheKey($queryCacheValues);
        $querySql = HotstatusResponse::buildQuery_WhereAnd_String($querySqlValues, true);

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = "$_ID:$region:$player".((strlen($queryCache) > 0) ? (":" . md5($queryCache)) : ("")).":$limit:$offset";

        //Get credentials
        $creds = Credentials::getCredentialsForUser(Credentials::USER_HOTSTATUSWEB);

        //Get redis cache
        $redis = new RedisDatabase();
        $connected_redis = $redis->connect($creds[Credentials::KEY_REDIS_URI], HotstatusCache::CACHE_PLAYERSEARCH_DATABASE_INDEX);

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

                //Get season date range
                date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);
                $seasonobj = HotstatusPipeline::$SEASONS[$querySeason];
                $date_start = $seasonobj['start'];
                $date_end = $seasonobj['end'];

                //Prepare Statements
                $t_players_matches = HotstatusPipeline::$table_pointers['players_matches'];

                $db->prepare("GetRecentMatches",
                    "SELECT m.`id`, m.`type`, m.`map`, m.`date`, m.`match_length`, m.`region`, m.`winner`, m.`players` 
                    FROM `$t_players_matches` `pm` INNER JOIN `matches` `m` ON pm.`match_id` = m.`id` 
                    WHERE pm.`id` = ? AND pm.`region` = ? AND pm.`date` >= ? AND pm.`date` <= ? $querySql ORDER BY pm.`date` DESC LIMIT $limit OFFSET $offset");
                $db->bind("GetRecentMatches", "iiss", $r_player_id, $r_region, $r_date_start, $r_date_end);

                $db->prepare("GetTalentsForHero",
                    "SELECT `name`, `name_internal`, `desc_simple`, `image` FROM `herodata_talents` WHERE `hero` = ?");
                $db->bind("GetTalentsForHero", "s", $r_hero);

                $r_player_id = $player;
                $r_region = $region;
                $r_date_start = $date_start;
                $r_date_end = $date_end;

                /*
                 * Functions
                 */
                $processMedal = function($medals) {
                    //Convert regular arr to assoc for filtering
                    $mp_medals = [];
                    foreach ($medals as $mval) {
                        $mp_medals[$mval] = TRUE;
                    }

                    //Delete invalid medals
                    foreach (HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_OUTDATED] as $medalid) {
                        if (key_exists($medalid, $mp_medals)) {
                            unset($mp_medals[$medalid]);
                        }
                    }

                    //Remap any necessary medal ids
                    foreach (HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_REMAPPING] as $mold => $mnew) {
                        if (key_exists($mold, $mp_medals)) {
                            $mp_medals[$mnew] = $mp_medals[$mold];
                            unset($mp_medals[$mold]);
                        }
                    }

                    //Convert assoc back to regular arr
                    $mp_medals_arr = [];
                    foreach ($mp_medals AS $mkey => $mval) {
                        $mp_medals_arr[] = $mkey;
                    }

                    $mp_medal = [
                        "exists" => FALSE,
                    ];

                    if (count($mp_medals_arr) > 0) {
                        $medalid = $mp_medals_arr[0];

                        if (key_exists($medalid, HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_DATA])) {
                            $medalobj = HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_DATA][$medalid];
                            $mp_medal['exists'] = TRUE;
                            $mp_medal['name'] = $medalobj['name'];
                            $mp_medal['desc_simple'] = $medalobj['desc_simple'];
                            $mp_medal['image'] = $medalobj['image'];
                        }
                    }

                    return $mp_medal;
                };

                /*
                 * Collect recent matches data
                 */

                $pagedata['offsets'] = [];
                $pagedata['limits'] = [];

                /*
                 * Matches
                 */
                $matches = [];
                $matchesResult = $db->execute("GetRecentMatches");
                while ($row = $db->fetchArray($matchesResult)) {
                    $match = [];

                    $arr_players = json_decode($row['players'], true);

                    //In-depth stats disabled for recentmatches fetch
                    /*$arr_team_level = json_decode($row['team_level'], true);
                    $arr_bans = json_decode($row['bans'], true);
                    $arr_mmr = json_decode($row['mmr'], true);*/

                    $match['id'] = $row['id'];
                    $match['gameType'] = $row['type'];
                    $match['map'] = $row['map'];
                    $match['map_image'] = 'ui/map_match_leftpane_' . HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_MAP][$match['map']]['name_sort'];
                    $match['date'] = (new \DateTime($row['date']))->getTimestamp();
                    $match['match_length'] = $row['match_length'];
                    $match['region'] = $row['region'];
                    $match['winner'] = $row['winner'];

                    //In-depth stats disabled for recentmatches fetch
                    //$match['quality'] = $arr_mmr['quality'];

                    //Teams
                    $match['teams'] = [];
                    for ($t = 0; $t <= 1; $t++) {
                        $team = [];

                        //In-depth stats disabled for recentmatches fetch
                        /*$team['color'] = ($t == 0) ? ("blue") : ("red");

                        //Team level
                        $team['level'] = $arr_team_level[$t];

                        //Bans
                        $team['bans'] = [];
                        $bans = $arr_bans[$t];
                        for ($b = 0; $b < count($bans); $b++) {
                            $ban = HotstatusPipeline::filter_getHeroNameFromHeroAttribute($bans[$b]);

                            if ($ban !== HotstatusPipeline::UNKNOWN) {
                                $team['bans'][] = $ban;
                            }
                        }

                        //MMR
                        $m_mmr = $arr_mmr["$t"];
                        $mmr = [];

                        $mmr['old'] = $m_mmr['old'];
                        $mmr['new'] = $m_mmr['new'];

                        $team['mmr'] = $mmr;*/

                        //Players
                        $players = [];

                        foreach ($arr_players as $mplayer) {
                            if ($mplayer['team'] == $t) {
                                $p = [];

                                //Set relevant player info
                                $p['id'] = $mplayer['id'];
                                $p['image_hero'] = HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO][$mplayer['hero']]['image_hero'];
                                $p['name'] = $mplayer['name'];
                                $p['hero'] = $mplayer['hero'];
                                $p['silenced'] = ($mplayer['silenced'] === 0) ? (false) : (true);

                                //Get party info
                                $party = 0;
                                if (count($mplayer['party']) > 0) {
                                    $party = $mplayer['party'][0]['party_id'];
                                }
                                $p['party'] = $party;

                                //In-depth stats disabled for recentmatches fetch
                                /*//Stats
                                $mstats = $mplayer['stats'];
                                $p['stats'] = [
                                    "kills" => $mstats['kills'],
                                    "deaths" => $mstats['deaths'],
                                    "assists" => $mstats['assists'],
                                    "healing" => $mstats['healing'],
                                    "merc_camps" => $mstats['merc_camps'],
                                    "exp_contrib" => $mstats['exp_contrib'],
                                    "hero_damage" => $mstats['hero_damage'],
                                    "siege_damage" => $mstats['siege_damage'],
                                ];

                                //Additional
                                $p['silenced'] = $mplayer['silenced'];
                                $p['hero_level'] = $mplayer['hero_level'];
                                $p['mmr_rating'] = $mplayer['mmr']['old']['rating'];

                                //Medal
                                $p['medal'] = $processMedal($mstats['medals'], $imgbasepath);

                                //Talents
                                $r_hero = $p['hero'];

                                $talentMap = [];
                                foreach ($mplayer['talents'] as $t_name_internal) {
                                    $talentMap[$t_name_internal] = [];
                                }

                                $talentArr = [];

                                $talentsResult = $db->execute("GetTalentsForHero");
                                while ($trow = $db->fetchArray($talentsResult)) {
                                    if (key_exists($trow['name_internal'], $talentMap)) {
                                        $talentArr[] = [
                                            "name" => $trow['name'],
                                            "desc_simple" => $trow['desc_simple'],
                                            "image" => $imgbasepath . $trow['image'] . '.png',
                                        ];
                                    }
                                }
                                $db->freeResult($talentsResult);

                                $p['talents'] = $talentArr;*/

                                $players[] = $p;

                                //Check if main player and set additional data
                                if ($mplayer['id'] == $player) {
                                    $mainplayer = [];

                                    //This is the main player, set additional data
                                    $mainplayer['id'] = $p['id'];
                                    $mainplayer['won'] = $match['winner'] == $t;
                                    $mainplayer['hero'] = $p['hero'];
                                    $mainplayer['image_hero'] = $p['image_hero'];
                                    $mainplayer['silenced'] = $p['silenced'];

                                    //Stats
                                    $mstats = $mplayer['stats'];
                                    $mp_kills = $mstats['kills'];
                                    $mp_deaths = $mstats['deaths'];
                                    $mp_assists = $mstats['assists'];

                                    $mp_kda = $mp_kills + $mp_assists;
                                    if ($mp_deaths > 0) {
                                        $mp_kda = round(($mp_kda / ($mp_deaths * 1.00)), 2);
                                        $mp_kda_raw = $mp_kda;
                                        $mp_kda = HotstatusResponse::formatNumber($mp_kda, 2);
                                    }
                                    else {
                                        $mp_kda = "Perfect";
                                        $mp_kda_raw = 999999999;
                                    }

                                    $mainplayer['kills'] = $mp_kills;
                                    $mainplayer['deaths'] = $mp_deaths;
                                    $mainplayer['assists'] = $mp_assists;
                                    $mainplayer['kda'] = $mp_kda;
                                    $mainplayer['kda_raw'] = $mp_kda_raw;

                                    //Medal
                                    $mainplayer['medal'] = $processMedal($mstats['medals']);

                                    //Talents
                                    $r_hero = $mplayer['hero'];

                                    $talentMap = [];
                                    foreach ($mplayer['talents'] as $t_name_internal) {
                                        $talentMap[$t_name_internal] = [
                                            "name" => $t_name_internal,
                                            "desc_simple" => "Talent no longer exists...",
                                            "image" => 'storm_ui_icon_monk_trait1',
                                        ];
                                    }

                                    $talentsResult = $db->execute("GetTalentsForHero");
                                    while ($trow = $db->fetchArray($talentsResult)) {
                                        if (key_exists($trow['name_internal'], $talentMap)) {
                                            $talentMap[$trow['name_internal']] = [
                                                "name" => $trow['name'],
                                                "desc_simple" => $trow['desc_simple'],
                                                "image" => $trow['image'],
                                            ];
                                        }
                                    }
                                    $db->freeResult($talentsResult);

                                    //Set talent arr
                                    $talentArr = [];
                                    foreach ($talentMap as $name_internal => $talent) {
                                        $talentArr[] = [
                                            "name" => $talent['name'],
                                            "desc_simple" => $talent['desc_simple'],
                                            "image" => $talent['image'],
                                        ];
                                    }

                                    $mainplayer['talents'] = $talentArr;

                                    $match['player'] = $mainplayer;
                                }
                            }
                        }

                        $team['players'] = $players;


                        //Set team
                        $match['teams'][$t] = $team;
                    }

                    $matches[] = $match;
                }

                $db->freeResult($matchesResult);

                $pagedata['matches'] = $matches;
                $pagedata['offsets']['matches'] = intval($offset);
                $pagedata['limits']['matches'] = intval($limit);

                //Last Updated
                $pagedata['last_updated'] = time();

                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($pagedata);
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::CACHE_PLAYER_UPDATE_TTL); //Cache offset for UPDATE_TTL on redis
            }
        }

        $redis->close();

        $responsedata['data'] = $pagedata;

        $response = $this->json($responsedata);
        $response->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $response->setMaxAge(HotstatusCache::CACHE_PLAYER_UPDATE_TTL); //Cache offset for UPDATE_TTL on player's local cache
        }

        return $response;
    }

    /**
     * Returns match data for a match
     *
     * @Route("/playerdata/pagedata/match/{matchid}", requirements={"matchid": "\d+"}, options={"expose"=true}, condition="request.isXmlHttpRequest()", name="playerdata_pagedata_match")
     */
    public function getPageDataMatchAction(Request $request, $matchid) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataMatchAction";
        $_VERSION = 1;

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = "$_ID:$matchid";

        //Get credentials
        $creds = Credentials::getCredentialsForUser(Credentials::USER_HOTSTATUSWEB);

        //Get redis cache
        $redis = new RedisDatabase();
        $connected_redis = $redis->connect($creds[Credentials::KEY_REDIS_URI], HotstatusCache::CACHE_PLAYERSEARCH_DATABASE_INDEX);

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

                //Prepare Statements
                $t_matches = HotstatusPipeline::$table_pointers['matches'];
                $t_matches_mmr = HotstatusPipeline::$table_pointers['matches_mmr'];

                $db->prepare("GetMatch",
                    "SELECT `type`, `date`, `region`, `winner`, `players`, `bans`, `team_level`, `mmr` FROM `$t_matches` WHERE `id` = ? LIMIT 1");
                $db->bind("GetMatch", "i", $r_match_id);

                $db->prepare("GetMatchMMR",
                    "SELECT `players`, `teams` FROM `$t_matches_mmr` WHERE `id` = ? LIMIT 1");
                $db->bind("GetMatchMMR", "i", $r_match_id);

                $db->prepare("GetTalentsForHero",
                    "SELECT `name`, `name_internal`, `desc_simple`, `image` FROM `herodata_talents` WHERE `hero` = ?");
                $db->bind("GetTalentsForHero", "s", $r_hero);

                $r_match_id = $matchid;

                /*
                 * Functions
                 */
                $processMedal = function($medals) {
                    //Convert regular arr to assoc for filtering
                    $mp_medals = [];
                    foreach ($medals as $mval) {
                        $mp_medals[$mval] = TRUE;
                    }

                    //Delete invalid medals
                    foreach (HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_OUTDATED] as $medalid) {
                        if (key_exists($medalid, $mp_medals)) {
                            unset($mp_medals[$medalid]);
                        }
                    }

                    //Remap any necessary medal ids
                    foreach (HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_REMAPPING] as $mold => $mnew) {
                        if (key_exists($mold, $mp_medals)) {
                            $mp_medals[$mnew] = $mp_medals[$mold];
                            unset($mp_medals[$mold]);
                        }
                    }

                    //Convert assoc back to regular arr
                    $mp_medals_arr = [];
                    foreach ($mp_medals AS $mkey => $mval) {
                        $mp_medals_arr[] = $mkey;
                    }

                    $mp_medal = [
                        "exists" => FALSE,
                    ];

                    if (count($mp_medals_arr) > 0) {
                        $medalid = $mp_medals_arr[0];

                        if (key_exists($medalid, HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_DATA])) {
                            $medalobj = HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_DATA][$medalid];
                            $mp_medal['exists'] = TRUE;
                            $mp_medal['name'] = $medalobj['name'];
                            $mp_medal['desc_simple'] = $medalobj['desc_simple'];
                            $mp_medal['image'] = $medalobj['image'];
                        }
                    }

                    return $mp_medal;
                };

                /*
                 * Collect Match Data
                 */

                /*
                 * Match
                 */
                $players_mmr = [];
                $teams_mmr = [];

                $haveMatchMMR = false;
                $matchMMRResult = $db->execute("GetMatchMMR");
                $matchMMRResultRows = $db->countResultRows($matchMMRResult);
                if ($matchMMRResultRows > 0) {
                    $mmrRow = $db->fetchArray($matchMMRResult);

                    $players_mmr = json_decode($mmrRow['players'], true);
                    $teams_mmr = json_decode($mmrRow['teams'], true);

                    $haveMatchMMR = true;
                }


                $match = [];
                $matchResult = $db->execute("GetMatch");
                $matchResultRows = $db->countResultRows($matchResult);
                if ($matchResultRows > 0) {
                    while ($row = $db->fetchArray($matchResult)) {
                        $arr_players = json_decode($row['players'], true);
                        $arr_team_level = json_decode($row['team_level'], true);
                        $arr_bans = json_decode($row['bans'], true);

                        if ($haveMatchMMR) {
                            $arr_mmr = $teams_mmr;
                        }
                        else {
                            $arr_mmr = json_decode($row['mmr'], true);
                        }

                        $season = HotstatusPipeline::getSeasonStringForDateTime($row['date']);

                        $match['region'] = $row['region'];
                        $match['winner'] = $row['winner'];
                        $match['quality'] = $arr_mmr['quality'];

                        $mtype = $row['type'];
                        $match['hasBans'] = ($mtype === "Hero League" || $mtype === "Team League" || $mtype === "Unranked Draft");

                        //Min/Max Stats
                        $match['stats'] = [
                            "hero_damage" => [
                                "max" => PHP_INT_MIN,
                            ],
                            "siege_damage" => [
                                "max" => PHP_INT_MIN,
                            ],
                            "merc_camps" => [
                                "max" => PHP_INT_MIN,
                            ],
                            "healing" => [
                                "max" => PHP_INT_MIN,
                            ],
                            "damage_taken" => [
                                "max" => PHP_INT_MIN,
                            ],
                            "exp_contrib" => [
                                "max" => PHP_INT_MIN,
                            ],
                        ];


                        //Teams
                        $match['teams'] = [];
                        for ($t = 0; $t <= 1; $t++) {
                            $team = [];

                            //In-depth stats disabled for recentmatches fetch
                            $team['color'] = ($t == 0) ? ("blue") : ("red");

                            //Team level
                            $team['level'] = $arr_team_level[$t];

                            //Bans
                            $team['bans'] = [];
                            $bans = $arr_bans[$t];
                            for ($b = 0; $b < count($bans); $b++) {
                                $ban = HotstatusPipeline::filter_getHeroNameFromHeroAttribute($bans[$b]);

                                if ($ban !== HotstatusPipeline::UNKNOWN) {
                                    $team['bans'][] = [
                                        "name" => $ban,
                                        "image" => HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO][$ban]['image_hero'],
                                    ];
                                }
                            }

                            //MMR
                            $m_mmr = $arr_mmr["$t"];
                            $mmr = [];

                            $mmr['old'] = $m_mmr['old'];
                            $mmr['new'] = $m_mmr['new'];

                            $team['mmr'] = $mmr;

                            //Players
                            $players = [];

                            foreach ($arr_players as $mplayer) {
                                if ($mplayer['team'] == $t) {
                                    $p = [];

                                    //Set relevant player info
                                    $p['id'] = $mplayer['id'];
                                    $p['image_hero'] = HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO][$mplayer['hero']]['image_hero'];
                                    $p['name'] = $mplayer['name'];
                                    $p['hero'] = $mplayer['hero'];
                                    $p['silenced'] = ($mplayer['silenced'] === 0) ? (false) : (true);

                                    //Get party info
                                    $party = 0;
                                    if (count($mplayer['party']) > 0) {
                                        $party = $mplayer['party'][0]['party_id'];
                                    }
                                    $p['party'] = $party;

                                    //Stats
                                    $mstats = $mplayer['stats'];

                                    $mp_kda = $mstats['kills'] + $mstats['assists'];
                                    if ($mstats['deaths'] > 0) {
                                        $mp_kda = round(($mp_kda / ($mstats['deaths'] * 1.00)), 2);
                                        $mp_kda_raw = $mp_kda;
                                        $mp_kda = HotstatusResponse::formatNumber($mp_kda, 2);
                                    }
                                    else {
                                        $mp_kda = "Perfect";
                                        $mp_kda_raw = 999999999;
                                    }

                                    $p['stats'] = [
                                        "kills" => $mstats['kills'],
                                        "deaths" => $mstats['deaths'],
                                        "assists" => $mstats['assists'],
                                        "kda_raw" => $mp_kda_raw,
                                        "kda" => $mp_kda,
                                        "healing_raw" => $mstats['healing'],
                                        "healing" => HotstatusResponse::formatNumber($mstats['healing']),
                                        "damage_taken_raw" => $mstats['damage_taken'],
                                        "damage_taken" => HotstatusResponse::formatNumber($mstats['damage_taken']),
                                        "merc_camps_raw" => $mstats['merc_camps'],
                                        "merc_camps" => HotstatusResponse::formatNumber($mstats['merc_camps']),
                                        "exp_contrib_raw" => $mstats['exp_contrib'],
                                        "exp_contrib" => HotstatusResponse::formatNumber($mstats['exp_contrib']),
                                        "hero_damage_raw" => $mstats['hero_damage'],
                                        "hero_damage" => HotstatusResponse::formatNumber($mstats['hero_damage']),
                                        "siege_damage_raw" => $mstats['siege_damage'],
                                        "siege_damage" => HotstatusResponse::formatNumber($mstats['siege_damage']),
                                    ];

                                    //Maintain min/max stats
                                    foreach ($match['stats'] as $statkey => &$statobj) {
                                        $max = &$statobj['max'];
                                        $pstat = $p['stats'][$statkey . '_raw'];

                                        if ($max < $pstat) $max = $pstat;
                                    }

                                    //Additional
                                    $p['hero_level'] = $mplayer['hero_level'];

                                    //Mmr
                                    if ($haveMatchMMR) {
                                        $mmrPlayer = $players_mmr[$mplayer['id']];
                                    }
                                    else {
                                        $mmrPlayer = $mplayer['mmr'];
                                    }

                                    $mmr_new = (is_numeric($mmrPlayer['new']['rating'])) ? ($mmrPlayer['new']['rating']) : (0);
                                    $mmr_old = (is_numeric($mmrPlayer['old']['rating'])) ? ($mmrPlayer['old']['rating']) : (0);
                                    $p['mmr'] = [
                                        "delta" => $mmr_new - $mmr_old,
                                        "rank" => HotstatusPipeline::getRankNameForPlayerRating($mmrPlayer['old']['rating'], $season),
                                        "tier" => HotstatusPipeline::getRankTierForPlayerRating($mmrPlayer['old']['rating'], $season),
                                    ];

                                    //Medal
                                    $p['medal'] = $processMedal($mstats['medals']);

                                    //Talents
                                    $r_hero = $mplayer['hero'];

                                    $talentMap = [];
                                    foreach ($mplayer['talents'] as $t_name_internal) {
                                        $talentMap[$t_name_internal] = [
                                            "name" => $t_name_internal,
                                            "desc_simple" => "Talent no longer exists...",
                                            "image" => 'storm_ui_icon_monk_trait1',
                                        ];
                                    }

                                    $talentsResult = $db->execute("GetTalentsForHero");
                                    while ($trow = $db->fetchArray($talentsResult)) {
                                        if (key_exists($trow['name_internal'], $talentMap)) {
                                            $talentMap[$trow['name_internal']] = [
                                                "name" => $trow['name'],
                                                "desc_simple" => $trow['desc_simple'],
                                                "image" => $trow['image'],
                                            ];
                                        }
                                    }
                                    $db->freeResult($talentsResult);

                                    //Set talent arr
                                    $talentArr = [];
                                    foreach ($talentMap as $name_internal => $talent) {
                                        $talentArr[] = [
                                            "name" => $talent['name'],
                                            "desc_simple" => $talent['desc_simple'],
                                            "image" => $talent['image'],
                                        ];
                                    }

                                    $p['talents'] = $talentArr;

                                    $players[] = $p;
                                }
                            }

                            $team['players'] = $players;


                            //Set team
                            $match['teams'][$t] = $team;
                        }
                    }
                }

                $pagedata['match'] = $match;

                //Last Updated
                $pagedata['last_updated'] = time();

                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($pagedata);
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::CACHE_PLAYER_UPDATE_TTL); //Expires UPDATE_TTL on redis
            }
        }

        $redis->close();

        $responsedata['data'] = $pagedata;

        $response = $this->json($responsedata);
        $response->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $response->setMaxAge(HotstatusCache::CACHE_DEFAULT_TTL); //Never expires in player local cache
        }

        return $response;
    }

    /**
     * Returns the relevant hero data for a hero necessary to build a hero page
     *
     * @Route("/playerdata/pagedata/{region}/{player}/hero", requirements={"region": "\d+", "player": "\d+"}, options={"expose"=true}, condition="request.isXmlHttpRequest()", name="playerdata_pagedata_player_hero")
     */
    public function getPageDataPlayerHeroAction(Request $request, $region, $player) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataPlayerHeroAction";
        $_VERSION = 1;

        /*
         * Process Query Parameters
         */
        $query = self::hero_initQueries();
        $queryCacheValues = [];
        $querySqlValues = [];

        //Collect WhereOr strings from all query parameters for cache key
        foreach ($query as $qkey => &$qobj) {
            if ($request->query->has($qkey)) {
                $qobj[HotstatusResponse::QUERY_ISSET] = true;
                $qobj[HotstatusResponse::QUERY_RAWVALUE] = $request->query->get($qkey);
                $qobj[HotstatusResponse::QUERY_SQLVALUE] = HotstatusResponse::buildQuery_WhereOr_String($qkey, $qobj[HotstatusResponse::QUERY_SQLCOLUMN], $qobj[HotstatusResponse::QUERY_RAWVALUE], $qobj[HotstatusResponse::QUERY_TYPE]);
                $queryCacheValues[] = $query[$qkey][HotstatusResponse::QUERY_RAWVALUE];
            }
        }

        $querySeason = $query[HotstatusPipeline::FILTER_KEY_SEASON][HotstatusResponse::QUERY_RAWVALUE];
        $queryHero = $query[HotstatusPipeline::FILTER_KEY_HERO][HotstatusResponse::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[HotstatusResponse::QUERY_IGNORE_AFTER_CACHE] && $qobj[HotstatusResponse::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][HotstatusResponse::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCache = HotstatusResponse::buildCacheKey($queryCacheValues);
        $querySql = HotstatusResponse::buildQuery_WhereAnd_String($querySqlValues, true);

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = $_ID . ":$region:$player:" . $queryHero .((strlen($queryCache) > 0) ? (":" . md5($queryCache)) : (""));

        //Get credentials
        $creds = Credentials::getCredentialsForUser(Credentials::USER_HOTSTATUSWEB);

        //Get redis cache
        $redis = new RedisDatabase();
        $connected_redis = $redis->connect($creds[Credentials::KEY_REDIS_URI], HotstatusCache::CACHE_PLAYERSEARCH_DATABASE_INDEX);

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

                //Get season date range
                date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);
                $seasonobj = HotstatusPipeline::$SEASONS[$querySeason];
                $date_start = $seasonobj['start'];
                $date_end = $seasonobj['end'];

                //Prepare Statements
                $t_players_matches_recent_granular = HotstatusPipeline::$table_pointers['players_matches_recent_granular'];

                $db->prepare("GetHeroData",
                    "SELECT `difficulty`, `role_blizzard`, `role_specific`, `universe`, `title`, `desc_tagline`, `desc_bio`, `rarity`, `image_hero` 
                    FROM herodata_heroes WHERE `name` = \"$queryHero\" LIMIT 1");

                $db->prepare("GetHeroStats",
                    "SELECT `played`, `won`, `time_played`, `stats_kills`, `stats_assists`, `stats_deaths`,
                    `stats_siege_damage`, `stats_hero_damage`, `stats_structure_damage`, `stats_healing`, `stats_damage_taken`, `stats_merc_camps`, `stats_exp_contrib`,
                    `stats_best_killstreak`, `stats_time_spent_dead`, `medals`, `talents`, `builds` 
                    FROM `$t_players_matches_recent_granular` WHERE `id` = ? AND `region` = ? AND `date_end` >= ? AND `date_end` <= ? $querySql");
                $db->bind("GetHeroStats", "iiss", $r_player_id, $r_region, $r_date_start, $r_date_end);

                $db->prepare("GetHeroTalents",
                    "SELECT `name`, `name_internal`, `desc_simple`, `image`, `tier_row`, `tier_column` FROM herodata_talents WHERE `hero` = \"$queryHero\" ORDER BY `tier_row` ASC, `tier_column` ASC");

                $db->prepare("GetHeroBuildTalents",
                    "SELECT `talents` FROM `heroes_builds` WHERE `hero` = \"$queryHero\" AND `build` = ?");
                $db->bind("GetHeroBuildTalents", "s", $r_build);


                $r_player_id = $player;
                $r_region = $region;
                $r_date_start = $date_start;
                $r_date_end = $date_end;

                /*
                 * Collect Herodata
                 */
                $pagedata['herodata'] = [
                    "name" => $queryHero,
                    "image_hero" => HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO][$queryHero]['image_hero'],
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

                /*
                 * Collect Stats
                 */
                $heroStatsResult = $db->execute("GetHeroStats");
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

                    $row_medals = json_decode($row['medals'], true);
                    AssocArray::aggregate($a_medals, $row_medals, $null = null, AssocArray::AGGREGATE_SUM);

                    $row_talents = json_decode($row['talents'], true);
                    AssocArray::aggregate($a_talents, $row_talents, $null = null, AssocArray::AGGREGATE_SUM);

                    $row_builds = json_decode($row['builds'], true);
                    AssocArray::aggregate($a_builds, $row_builds, $null = null, AssocArray::AGGREGATE_SUM);
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

                //Played
                $stats['played'] = $a_played;

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
                    "average" => HotstatusResponse::formatNumber($c_avg_kills, 2),
                    "per_minute" => HotstatusResponse::formatNumber($c_pmin_kills, 2)
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
                    "average" => HotstatusResponse::formatNumber($c_avg_assists, 2),
                    "per_minute" => HotstatusResponse::formatNumber($c_pmin_assists, 2)
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
                    "average" => HotstatusResponse::formatNumber($c_avg_deaths, 2),
                    "per_minute" => HotstatusResponse::formatNumber($c_pmin_deaths, 2)
                ];

                //Average KDA
                $c_avg_kda = $c_avg_kills_raw + $c_avg_assists_raw;
                if ($c_avg_deaths_raw > 0) {
                    $c_avg_kda = round(($c_avg_kda / ($c_avg_deaths_raw * 1.00)), 2);
                }
                $stats['kda'] = [
                    "average" => HotstatusResponse::formatNumber($c_avg_kda, 2)
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
                    "average" => HotstatusResponse::formatNumber($c_avg_siege_damage),
                    "per_minute" => HotstatusResponse::formatNumber($c_pmin_siege_damage)
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
                    "average" => HotstatusResponse::formatNumber($c_avg_hero_damage),
                    "per_minute" => HotstatusResponse::formatNumber($c_pmin_hero_damage)
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
                    "average" => HotstatusResponse::formatNumber($c_avg_structure_damage),
                    "per_minute" => HotstatusResponse::formatNumber($c_pmin_structure_damage)
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
                    "average" => HotstatusResponse::formatNumber($c_avg_healing),
                    "per_minute" => HotstatusResponse::formatNumber($c_pmin_healing)
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
                    "average" => HotstatusResponse::formatNumber($c_avg_damage_taken),
                    "per_minute" => HotstatusResponse::formatNumber($c_pmin_damage_taken)
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
                    "average" => HotstatusResponse::formatNumber($c_avg_merc_camps, 2),
                    "per_minute" => HotstatusResponse::formatNumber($c_pmin_merc_camps, 2)
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
                    "average" => HotstatusResponse::formatNumber($c_avg_exp_contrib),
                    "per_minute" => HotstatusResponse::formatNumber($c_pmin_exp_contrib)
                ];

                //Best Killstreak
                $stats['best_killstreak'] = HotstatusResponse::formatNumber($a_best_killstreak);

                //Average Time Spent Dead (in Minutes)
                $c_avg_time_spent_dead = 0;
                $c_avg_time_spent_dead_raw = 0;
                if ($a_played > 0) {
                    $c_avg_time_spent_dead_raw = ($a_time_spent_dead / ($a_played * 1.00)) / 60.0;
                    $c_avg_time_spent_dead = round($c_avg_time_spent_dead_raw, 1);
                }
                $stats['time_spent_dead'] = [
                    "average" => HotstatusResponse::formatNumber($c_avg_time_spent_dead, 1)
                ];

                //Set pagedata stats
                $pagedata['stats'] = $stats;

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

                    if (!key_exists($tcolkey, $talents[$trowkey])) {
                        $talents[$trowkey][$tcolkey] = [];
                    }

                    $talents[$trowkey]['minCol'] = min($row['tier_column'], $talents[$trowkey]['minCol']);
                    $talents[$trowkey]['maxCol'] = max($row['tier_column'], $talents[$trowkey]['maxCol']);

                    //Set row/col talent
                    $talents[$trowkey][$tcolkey][] = [
                        "name" => $row['name'],
                        "name_internal" => $row['name_internal'],
                        "desc_simple" => $row['desc_simple'],
                        "image" => $row['image']
                    ];
                }
                $db->freeResult($heroTalentsResult);

                //Calculate total picked as well as winrates for Talents
                for ($r = $talents['minRow']; $r <= $talents['maxRow']; $r++) {
                    $rowTotalPicked = 0;
                    $rowMinWinrate = PHP_INT_MAX;
                    $rowMaxWinrate = PHP_INT_MIN;

                    for ($c = $talents[$r.'']['minCol']; $c <= $talents[$r.'']['maxCol']; $c++) {
                        for ($cinner = 0; $cinner < count($talents[$r.''][$c.'']); $cinner++) {
                            $talent = &$talents[$r . ''][$c . ''][$cinner];

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
                        for ($cinner = 0; $cinner < count($talents[$r.''][$c.'']); $cinner++) {
                            $talent = &$talents[$r . ''][$c . ''][$cinner];

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
                /*if (key_exists("MVP", $a_medals)) {
                    unset($a_medals['MVP']);
                }*/

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

                for ($i = 0; $i < $smcount; $i++) {
                    $medal = &$sortedMedals[$i];

                    if (key_exists($medal['key'], HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_DATA])) {
                        $medalobj = HotstatusPipeline::$medals[HotstatusPipeline::MEDALS_KEY_DATA][$medal['key']];

                        $medal['name'] = $medalobj['name'];
                        $medal['desc_simple'] = $medalobj['desc_simple'];
                        $medal['image_blue'] = $medalobj['image'] . "_blue";
                        $medal['image_red'] = $medalobj['image'] . "_red";
                    }
                }

                //Splice sortedMedals to top 3
                $sortedMedalsSlice = array_splice($sortedMedals, 0, 3);

                //Set medals
                $pagedata['medals'] = $sortedMedalsSlice;

                //Last Updated
                $pagedata['last_updated'] = time();

                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($pagedata);
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::CACHE_PLAYER_UPDATE_TTL);
            }
        }

        $redis->close();

        $responsedata['data'] = $pagedata;

        $response = $this->json($responsedata);
        $response->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $response->setMaxAge(HotstatusCache::CACHE_PLAYER_UPDATE_TTL);
        }

        return $response;
    }

    /**
     * Returns the top 500 rankings result for the given region/season/gameType
     *
     * @Route("/playerdata/pagedata/rankings", options={"expose"=true}, condition="request.isXmlHttpRequest()", name="playerdata_pagedata_rankings")
     */
    public function getPageDataRankingsAction(Request $request) {
        $_TYPE = GetPageDataRankingsAction::_TYPE();
        $_ID = GetPageDataRankingsAction::_ID();
        $_VERSION = GetPageDataRankingsAction::_VERSION();

        GetPageDataRankingsAction::generateFilters();

        /*
         * Process Query Parameters
         */
        $query = GetPageDataRankingsAction::initQueries();
        $queryCacheValues = [];
        $querySqlValues = [];

        //Collect WhereOr strings from all query parameters for cache key
        foreach ($query as $qkey => &$qobj) {
            if ($request->query->has($qkey)) {
                $qobj[HotstatusResponse::QUERY_ISSET] = true;
                $qobj[HotstatusResponse::QUERY_RAWVALUE] = $request->query->get($qkey);
                $qobj[HotstatusResponse::QUERY_SQLVALUE] = HotstatusResponse::buildQuery_WhereOr_String($qkey, $qobj[HotstatusResponse::QUERY_SQLCOLUMN], $qobj[HotstatusResponse::QUERY_RAWVALUE], $qobj[HotstatusResponse::QUERY_TYPE]);
                $queryCacheValues[] = $query[$qkey][HotstatusResponse::QUERY_RAWVALUE];
            }
        }

        $querySeason = $query[HotstatusPipeline::FILTER_KEY_SEASON][HotstatusResponse::QUERY_RAWVALUE];
        $queryGameType = $query[HotstatusPipeline::FILTER_KEY_GAMETYPE][HotstatusResponse::QUERY_RAWVALUE];
        $queryRegion = $query[HotstatusPipeline::FILTER_KEY_REGION][HotstatusResponse::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[HotstatusResponse::QUERY_IGNORE_AFTER_CACHE] && $qobj[HotstatusResponse::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][HotstatusResponse::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCache = HotstatusResponse::buildCacheKey($queryCacheValues);
        $querySql = HotstatusResponse::buildQuery_WhereAnd_String($querySqlValues, true);

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = "$_ID:rankings".((strlen($queryCache) > 0) ? (":" . md5($queryCache)) : (""));

        //Define Payload
        $payload = [
            "querySeason" => $querySeason,
            "queryGameType" => $queryGameType,
            "queryRegion" => $queryRegion,
            "querySql" => $querySql,
        ];

        //Get credentials
        $creds = Credentials::getCredentialsForUser(Credentials::USER_HOTSTATUSWEB);

        //Get redis cache
        $redis = new RedisDatabase();
        $connected_redis = $redis->connect($creds[Credentials::KEY_REDIS_URI], HotstatusCache::CACHE_PLAYERSEARCH_DATABASE_INDEX);

        //Try to get cached value
        $cacheval = NULL;
        if ($connected_redis !== FALSE) {
            $cacheval = HotstatusCache::readCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION);
        }

        if ($connected_redis !== FALSE && $cacheval !== NULL) {
            //Use cached value
            $responsedata = json_decode($cacheval, true);

            //Queue Update for Cached Value if necessary
            HotstatusCache::QueueCacheRequestForUpdateOnOldAge($_ID, $CACHE_ID, $creds, $responsedata['data']['max_age'], $responsedata['data']['last_updated'], $payload);

            $validResponse = TRUE;
        }
        else {
            //Try to get Mysql value
            $db = new MysqlDatabase();

            $connected_mysql = HotstatusPipeline::hotstatus_mysql_connect($db, $creds);

            if ($connected_mysql !== FALSE) {
                $db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

                //Build Response
                GetPageDataRankingsAction::execute($payload, $db, $pagedata);

                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            $responsedata['data'] = $pagedata;

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($responsedata);
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::CACHE_DEFAULT_TTL);
            }
        }

        $redis->close();

        $response = $this->json($responsedata);
        $response->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $response->setMaxAge(HotstatusCache::CACHE_60_MINUTES);
        }

        return $response;
    }

    /*
     * Initializes the queries object for the hero pagedata
     */
    private static function player_initDefaultQueries() {
        HotstatusPipeline::filter_generate_season();

        $q = [
            HotstatusPipeline::FILTER_KEY_SEASON => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => true,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "season",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_GAMETYPE => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => false,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "gameType",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
        ];

        return $q;
    }

    private static function topHeroes_initQueries() {
        $q = [
            HotstatusPipeline::FILTER_KEY_SEASON => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => true,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "season",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_GAMETYPE => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => false,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "gameType",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
        ];

        return $q;
    }

    private static function parties_initQueries() {
        $q = [
            HotstatusPipeline::FILTER_KEY_SEASON => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => true,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "season",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_GAMETYPE => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => false,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "gameType",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
        ];

        return $q;
    }

    private static function recentMatches_initQueries() {
        $q = [
            HotstatusPipeline::FILTER_KEY_SEASON => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => true,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "season",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_GAMETYPE => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => false,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "type",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
        ];

        return $q;
    }

    /*
     * Initializes the queries object for the hero pagedata
     */
    private static function hero_initQueries() {
        $q = [
            HotstatusPipeline::FILTER_KEY_SEASON => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => true,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "season",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_HERO => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => false,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "hero",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_GAMETYPE => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => false,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "gameType",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_MAP => [
                HotstatusResponse::QUERY_IGNORE_AFTER_CACHE => false,
                HotstatusResponse::QUERY_ISSET => false,
                HotstatusResponse::QUERY_RAWVALUE => null,
                HotstatusResponse::QUERY_SQLVALUE => null,
                HotstatusResponse::QUERY_SQLCOLUMN => "map",
                HotstatusResponse::QUERY_TYPE => HotstatusResponse::QUERY_TYPE_RAW
            ],
        ];

        return $q;
    }
}
