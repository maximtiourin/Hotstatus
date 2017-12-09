<?php

namespace AppBundle\Controller;

use Fizzik\GetDataTableHeroesStatsListAction;
use Fizzik\GetPageDataHeroAction;
use Fizzik\GetPageDataHeroRequestTotalStatMatrix;
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

    /**
     * Returns the relevant hero data for a hero necessary to build a hero page
     *
     * @Route("/herodata/pagedata/hero", options={"expose"=true}, condition="request.isXmlHttpRequest()", name="herodata_pagedata_hero")
     */
    public function getPageDataHeroAction(Request $request) {
        $_TYPE = GetPageDataHeroAction::_TYPE();
        $_ID = GetPageDataHeroAction::_ID();
        $_VERSION = GetPageDataHeroAction::_VERSION();

        GetPageDataHeroAction::generateFilters();

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
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = $_ID . ":" . $queryHero .((strlen($queryCacheSql) > 0) ? (":" . md5($queryCacheSql)) : (""));

        //Define Payload
        //Get image path from packages
        /** @var Asset\Packages $pkgs */
        $pkgs = $this->get("assets.packages");
        $pkg = $pkgs->getPackage("images");
        $imgbasepath = $pkg->getUrl('');

        $payload = [
            "queryHero" => $queryHero,
            "querySql" => $querySql,
            "querySecondarySql" => $querySecondarySql,
            "imgbasepath" => $imgbasepath,
        ];

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
                GetPageDataHeroAction::execute($payload, $db, $connected_mysql, $redis, $connected_redis, $pagedata);

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

    /**
     * Returns the the relevant data to populate a DataTable heroes-statslist with any necessary formatting (IE: images wrapped in image tags)
     *
     * @Route("/herodata/datatable/heroes/statslist", options={"expose"=true}, condition="request.isXmlHttpRequest()", name="herodata_datatable_heroes_statslist")
     */
    public function getDataTableHeroesStatsListAction(Request $request) {
        $_TYPE = GetDataTableHeroesStatsListAction::_TYPE();
        $_ID = GetDataTableHeroesStatsListAction::_ID();
        $_VERSION = GetDataTableHeroesStatsListAction::_VERSION();

        GetDataTableHeroesStatsListAction::generateFilters();

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

        //Define payload
        $payload = [
            "queryDateKey" => $queryDateKey,
            "querySql" => $querySql,
        ];

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

            //Queue Update for Cached Value if necessary
            HotstatusCache::QueueCacheRequestForUpdateOnOldAge($_ID, $CACHE_ID, $creds, $datatable['data']['max_age'], $datatable['data']['last_updated'], $payload);

            $validResponse = TRUE;
        }
        else {
            //Try to get Mysql value
            $db = new MysqlDatabase();

            $connected_mysql = HotstatusPipeline::hotstatus_mysql_connect($db, $creds);

            $pagedata = [];
            if ($connected_mysql !== FALSE) {
                //Use mysql value
                $db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

                //Execute response
                GetDataTableHeroesStatsListAction::execute($payload, $db, $pagedata);

                $db->close();

                $validResponse = TRUE;
            }

            $datatable['data'] = $pagedata;

            //Store mysql value in cache
            if ($validResponse && $connected_redis) {
                $encoded = json_encode($datatable);
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $CACHE_ID, $_VERSION, $encoded, HotstatusCache::CACHE_DEFAULT_TTL);
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
            $jsonResponse->setMaxAge(HotstatusCache::CACHE_60_MINUTES);
        }

        return $jsonResponse;
    }

    /*
     * Initializes the queries object for the hero pagedata
     */
    private static function hero_initQueries() {
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
                if (!is_numeric($val)) {
                    $val = '"' . $val . '"';
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
