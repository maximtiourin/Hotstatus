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

    const COUNT_DEFAULT_MATCHES = 5; //How many matches to initially load for a player page (getPageDataPlayerRecentMatches has baked in default limit of 5)

    /**
     * Returns the relevant player data for a player necessary to build a player page
     *
     * @Route("/playerdata/pagedata/{player}", options={"expose"=true}, name="playerdata_pagedata_player")
     */
    //condition="request.isXmlHttpRequest()",
    public function getPageDataPlayerAction($player) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataPlayerAction";
        $_VERSION = 0;

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = "$_ID:$player";

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
                $season = "2017 Season 2"; //TODO use older season for debug, use SEASON_CURRENT for actual
                $seasonobj = HotstatusPipeline::$SEASONS[$season];
                $date_start = $seasonobj['start'];
                $date_end = $seasonobj['end'];

                //Prepare Statements


                /*
                 * Collect playerdata
                 */


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
     * @Route("/playerdata/pagedata/{player}/recentmatches/{offset}/{limit}/{season}", defaults={"offset" = 0, "limit" = 5}, requirements={"player": "\d+", "offset": "\d+", "limit": "\d+"}, options={"expose"=true}, name="playerdata_pagedata_player_recentmatches")
     */
    //condition="request.isXmlHttpRequest()",
    public function getPageDataPlayerRecentMatchesAction($player, $offset, $limit, $season) {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_PAGEDATA;
        $_ID = "getPageDataPlayerRecentMatchesAction";
        $_VERSION = 0;

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = "$_ID:$player:$offset:$limit";

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
                $seasonobj = HotstatusPipeline::$SEASONS[$season];
                $date_start = $seasonobj['start'];
                $date_end = $seasonobj['end'];

                //Prepare Statements
                $db->prepare("GetRecentMatches",
                    "SELECT m.`id`, m.`type`, m.`map`, m.`date`, m.`match_length`, m.`winner`, m.`players`, m.`bans`, m.`team_level`, m.`mmr` 
                    FROM `players_matches` `pm` INNER JOIN `matches` `m` ON pm.`match_id` = m.`id` 
                    WHERE pm.`id` = ? AND pm.`date` >= ? AND pm.`date` <= ? ORDER BY pm.`date` DESC LIMIT $limit OFFSET $offset");
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

                    $arr_team_level = json_decode($row['team_level'], true);
                    $arr_bans = json_decode($row['bans'], true);
                    $arr_mmr = json_decode($row['mmr'], true);

                    $match['id'] = $row['id'];
                    $match['gameType'] = $row['type'];
                    $match['map'] = $row['map'];
                    $match['date'] = $row['date'];
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

    private static function formatNumber($n, $decimalPlaces = 0) {
        return number_format($n, $decimalPlaces, '.', ',');
    }
}
