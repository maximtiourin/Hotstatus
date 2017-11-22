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
 * In charge of fetching player data from database and returning it as requested
 */
class PlayerdataController extends Controller {
    const QUERY_IGNORE_AFTER_CACHE = "ignoreAfterCache";
    const QUERY_USE_FOR_SECONDARY = "useForSecondary";
    const QUERY_ISSET = "isSet";
    const QUERY_RAWVALUE = "rawValue";
    const QUERY_SQLVALUE = "sqlValue";
    const QUERY_SQLCOLUMN = "sqlColumn";
    const QUERY_TYPE = "mappingType";
    const QUERY_TYPE_RANGE = "range"; //Should look up a range of values from a filter map
    const QUERY_TYPE_RAW = "raw"; //Equality to Raw value should be used for the query

    const COUNT_DEFAULT_MATCHES = 10; //How many matches to initially load for a player page (getPageDataPlayerRecentMatches should have this baked into route default)

    /**
     * Returns the relevant player data for a player necessary to build a player page
     *
     * @Route("/playerdata/pagedata/{player}", options={"expose"=true}, name="playerdata_pagedata_player")
     */
    //condition="request.isXmlHttpRequest()",
    public function getPageDataPlayerAction(Request $request, $player) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataPlayerAction";
        $_VERSION = 0;

        /*
         * Process Query Parameters
         */
        $query = self::player_initDefaultQueries();
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

        $querySeason = $query[HotstatusPipeline::FILTER_KEY_SEASON][self::QUERY_RAWVALUE];

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
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = "$_ID:$player".((strlen($queryCacheSql) > 0) ? (":" . md5($queryCacheSql)) : (""));

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

            $connected_mysql = $db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);

            if ($connected_mysql !== FALSE) {
                $db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

                //Get image path from packages
                /** @var Asset\Packages $pkgs */
                $pkgs = $this->get("assets.packages");
                $pkg = $pkgs->getPackage("images");
                $imgbasepath = $pkg->getUrl('');

                //Get season date range
                //TODO - make sure to use season queryValue rather than this baked in
                date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);
                $season = "2017 Season 2"; //TODO use older season for debug, use SEASON_CURRENT for actual
                $seasonobj = HotstatusPipeline::$SEASONS[$season];
                $date_start = $seasonobj['start'];
                $date_end = $seasonobj['end'];

                //Prepare Statements


                /*
                 * Collect playerdata
                 */

                /*
                 * Set playerloader data
                 */
                $limits = [];

                $limits['matches'] = self::COUNT_DEFAULT_MATCHES;

                $pagedata['limits'] = $limits;


                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($pagedata);
                //HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::CACHE_PLAYER_UPDATE_TTL); //TODO enable after testing
            }
        }

        $redis->close();

        $responsedata['data'] = $pagedata;

        $response = $this->json($responsedata);
        /*$response->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $response->setExpires(HotstatusCache::CACHE_PLAYER_UPDATE_TTL);
        }*/ //TODO enable after testing

        return $response;
    }

    /**
     * Returns recent matches for player based on offset and match limit
     *
     * @Route("/playerdata/pagedata/{player}/{offset}/{limit}/recentmatches", defaults={"offset" = 0, "limit" = 10}, requirements={"player": "\d+", "offset": "\d+", "limit": "\d+"}, options={"expose"=true}, name="playerdata_pagedata_player_recentmatches")
     */
    //condition="request.isXmlHttpRequest()",
    public function getPageDataPlayerRecentMatchesAction(Request $request, $player, $offset, $limit) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataPlayerRecentMatchesAction";
        $_VERSION = 0;

        /*
         * Process Query Parameters
         */
        $query = self::recentMatches_initQueries();
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

        $querySeason = $query[HotstatusPipeline::FILTER_KEY_SEASON][self::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[self::QUERY_IGNORE_AFTER_CACHE] && $qobj[self::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][self::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCacheSql = self::buildQuery_WhereAnd_String($queryCacheSqlValues, false);
        $querySql = self::buildQuery_WhereAnd_String($querySqlValues, true);

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = "$_ID:$player:$queryCacheSql:$offset:$limit";

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

            $connected_mysql = $db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);

            if ($connected_mysql !== FALSE) {
                $db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

                //Get image path from packages
                /** @var Asset\Packages $pkgs */
                $pkgs = $this->get("assets.packages");
                $pkg = $pkgs->getPackage("images");
                $imgbasepath = $pkg->getUrl('');

                //Get season date range
                date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);
                $seasonobj = HotstatusPipeline::$SEASONS[$querySeason];
                $date_start = $seasonobj['start'];
                $date_end = $seasonobj['end'];

                //Prepare Statements
                $db->prepare("GetRecentMatches",
                    "SELECT m.`id`, m.`type`, m.`map`, m.`date`, m.`match_length`, m.`winner`, m.`players`, m.`bans`, m.`team_level`, m.`mmr` 
                    FROM `players_matches` `pm` INNER JOIN `matches` `m` ON pm.`match_id` = m.`id` 
                    WHERE pm.`id` = ? AND pm.`date` >= ? AND pm.`date` <= ? $querySql ORDER BY pm.`date` DESC LIMIT $limit OFFSET $offset");
                $db->bind("GetRecentMatches", "iss", $r_player_id, $r_date_start, $r_date_end);

                $r_player_id = $player;
                $r_date_start = $date_start;
                $r_date_end = $date_end;

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
                    $arr_team_level = json_decode($row['team_level'], true);
                    $arr_bans = json_decode($row['bans'], true);
                    $arr_mmr = json_decode($row['mmr'], true);

                    $match['id'] = $row['id'];
                    $match['gameType'] = $row['type'];
                    $match['map'] = $row['map'];
                    $match['date'] = (new \DateTime($row['date']))->getTimestamp();
                    $match['match_length'] = $row['match_length'];
                    $match['winner'] = $row['winner'];
                    $match['quality'] = $arr_mmr['quality'];

                    //Teams
                    $match['teams'] = [];
                    for ($t = 0; $t <= 1; $t++) {
                        $team = [];

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

                        $team['mmr'] = $mmr;

                        //Players
                        $players = [];

                        foreach ($arr_players as $mplayer) {
                            if ($mplayer['team'] == $t) {
                                //TODO
                                if ($mplayer['id'] == $player) {
                                    $mainplayer = [];

                                    //This is the main player, set additional data
                                    $mainplayer['won'] = $match['winner'] == $t;
                                    $mainplayer['hero'] = $mplayer['hero'];
                                    $mainplayer['image_hero'] = $imgbasepath . HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_HERO][$mplayer['hero']]['image_hero'] . ".png";

                                    //Stats
                                    $mp_stats = $mplayer['stats'];
                                    $mp_kills = $mp_stats['kills'];
                                    $mp_deaths = $mp_stats['deaths'];
                                    $mp_assists = $mp_stats['assists'];

                                    $mp_kda = round((($mp_kills + $mp_assists) / ($mp_deaths * 1.00)), 2);

                                    $mainplayer['kills'] = $mp_kills;
                                    $mainplayer['deaths'] = $mp_deaths;
                                    $mainplayer['assists'] = $mp_assists;
                                    $mainplayer['kda'] = self::formatNumber($mp_kda, 2);

                                    //Medal
                                    $mp_medals_nonassoc = $mp_stats['medals'];

                                    //Convert regular arr to assoc for filtering
                                    $mp_medals = [];
                                    foreach ($mp_medals_nonassoc as $mval) {
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
                                            $mp_medal['image'] = $imgbasepath . $medalobj['image'] . "_blue.png";
                                        }
                                    }

                                    $mainplayer['medal'] = $mp_medal;


                                    $match['player'] = $mainplayer;
                                }

                                $p = [];

                                //Set relevant player info

                                $players[] = $p;
                            }
                        }

                        $team['players'] = $players;


                        //Set team
                        $match['teams'][$t] = $team;
                    }

                    $matches[] = $match;
                }

                $pagedata['matches'] = $matches;
                $pagedata['offsets']['matches'] = $offset;
                $pagedata['limits']['matches'] = $limit;

                //Close connection and set valid response
                $db->close();

                $validResponse = TRUE;
            }

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($pagedata);
                //HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::CACHE_PLAYER_UPDATE_TTL); //TODO enable after testing
            }
        }

        $redis->close();

        $responsedata['data'] = $pagedata;

        $response = $this->json($responsedata);
        /*$response->setPublic();

        //Determine expire date on valid response
        if ($validResponse) {
            $response->setExpires(HotstatusCache::CACHE_PLAYER_UPDATE_TTL);
        }*/ //TODO enable after testing

        return $response;
    }

    /*
     * Initializes the queries object for the hero pagedata
     */
    private static function player_initDefaultQueries() {
        HotstatusPipeline::filter_generate_season();

        $q = [
            HotstatusPipeline::FILTER_KEY_SEASON => [
                self::QUERY_IGNORE_AFTER_CACHE => true,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "season",
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
        ];

        return $q;
    }

    private static function recentMatches_initQueries() {
        $q = [
            HotstatusPipeline::FILTER_KEY_SEASON => [
                self::QUERY_IGNORE_AFTER_CACHE => true,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "season",
                self::QUERY_TYPE => self::QUERY_TYPE_RAW
            ],
            HotstatusPipeline::FILTER_KEY_GAMETYPE => [
                self::QUERY_IGNORE_AFTER_CACHE => false,
                self::QUERY_ISSET => false,
                self::QUERY_RAWVALUE => null,
                self::QUERY_SQLVALUE => null,
                self::QUERY_SQLCOLUMN => "type",
                self::QUERY_TYPE => self::QUERY_TYPE_RAW
            ],
        ];

        return $q;
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
