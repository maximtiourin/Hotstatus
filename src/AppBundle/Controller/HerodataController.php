<?php

namespace AppBundle\Controller;

use Fizzik\HotstatusPipeline;
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
        $queryDateKey = $request->query->get(HotstatusPipeline::FILTER_KEY_DATE);

        //Collect WhereOr strings from all query parameters for cache key
        foreach ($query as $qkey => &$qobj) {
            if ($request->query->has($qkey)) {
                $qobj[self::QUERY_ISSET] = true;
                $qobj[self::QUERY_RAWVALUE] = $request->query->get($qkey);
                $qobj[self::QUERY_SQLVALUE] = self::buildQuery_WhereOr_String($qkey, $qobj[self::QUERY_SQLCOLUMN], $qobj[self::QUERY_RAWVALUE], $qobj[self::QUERY_TYPE]);
                $queryCacheSqlValues[] = $query[$qkey][self::QUERY_SQLVALUE];
            }
        }

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
                    $dtrow[] = $hero['name'];

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
            if ($connected_redis) {
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
     * Given an array of query string fragments of type 'WhereOr', will construct a query string fragment joining them
     * with AND keywords, while prepending a single AND keyword. Will return an empty string if supplied an empty array.
     *
     * EX:
     *
     * 0 fragments : ''
     * 1 fragment  : ' AND frag1'
     * 3 fragments : ' AND frag1 AND frag2 AND frag3'
     */
    private static function buildQuery_WhereAnd_String($whereors) {
        $ret = "";

        $i = 0;
        $count = count($whereors);
        if ($count > 0) $ret = " AND ";
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
