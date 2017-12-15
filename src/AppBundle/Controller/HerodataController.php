<?php

namespace AppBundle\Controller;

use Fizzik\GetDataTableHeroesStatsListAction;
use Fizzik\GetPageDataHeroAction;
use Fizzik\GetPageDataHeroRequestTotalStatMatrix;
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
 * In charge of fetching hero data from database and returning it as requested
 */
class HerodataController extends Controller {
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
        $query = GetPageDataHeroAction::initQueries();
        $queryCacheValues = [];
        $querySqlValues = [];
        $querySecondaryCacheValues = [];
        $querySecondarySqlValues = [];

        //Collect WhereOr strings from all query parameters for cache key
        foreach ($query as $qkey => &$qobj) {
            if ($request->query->has($qkey)) {
                $qobj[HotstatusResponse::QUERY_ISSET] = true;
                $qobj[HotstatusResponse::QUERY_RAWVALUE] = $request->query->get($qkey);
                $qobj[HotstatusResponse::QUERY_SQLVALUE] = HotstatusResponse::buildQuery_WhereOr_String($qkey, $qobj[HotstatusResponse::QUERY_SQLCOLUMN], $qobj[HotstatusResponse::QUERY_RAWVALUE], $qobj[HotstatusResponse::QUERY_TYPE]);
                $queryCacheValues[] = $query[$qkey][HotstatusResponse::QUERY_RAWVALUE];

                if ($qkey !== HotstatusPipeline::FILTER_KEY_HERO) {
                    $querySecondaryCacheValues[] = $query[$qkey][HotstatusResponse::QUERY_RAWVALUE];
                }
            }
        }

        $queryHero = $query[HotstatusPipeline::FILTER_KEY_HERO][HotstatusResponse::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[HotstatusResponse::QUERY_IGNORE_AFTER_CACHE] && $qobj[HotstatusResponse::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][HotstatusResponse::QUERY_SQLVALUE];
            }
        }

        //Collect WhereOr strings for query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if ($qobj[HotstatusResponse::QUERY_USE_FOR_SECONDARY] && $qobj[HotstatusResponse::QUERY_ISSET]) {
                $querySecondarySqlValues[] = $query[$qkey][HotstatusResponse::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCache = HotstatusResponse::buildCacheKey($queryCacheValues);
        $querySql = HotstatusResponse::buildQuery_WhereAnd_String($querySqlValues, false);
        $querySecondaryCache = HotstatusResponse::buildCacheKey($querySecondaryCacheValues);
        $querySecondarySql = HotstatusResponse::buildQuery_WhereAnd_String($querySecondarySqlValues, true);

        /*
         * Begin building response
         */
        //Main vars
        $responsedata = [];
        $pagedata = [];
        $validResponse = FALSE;

        //Determine Cache Id
        $CACHE_ID = $_ID . ":" . $queryHero .((strlen($queryCache) > 0) ? (":" . md5($queryCache)) : (""));

        //Define Payload
        $payload = [
            "queryHero" => $queryHero,
            "querySql" => $querySql,
            "querySecondaryCache" => $querySecondaryCache,
            "querySecondarySql" => $querySecondarySql,
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
        $query = GetDataTableHeroesStatsListAction::initQueries();
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

        $queryDateKey = $query[HotstatusPipeline::FILTER_KEY_DATE][HotstatusResponse::QUERY_RAWVALUE];

        //Collect WhereOr strings from non-ignored query parameters for dynamic sql query
        foreach ($query as $qkey => &$qobj) {
            if (!$qobj[HotstatusResponse::QUERY_IGNORE_AFTER_CACHE] && $qobj[HotstatusResponse::QUERY_ISSET]) {
                $querySqlValues[] = $query[$qkey][HotstatusResponse::QUERY_SQLVALUE];
            }
        }

        //Build WhereAnd string from collected WhereOr strings
        $queryCache = HotstatusResponse::buildCacheKey($queryCacheValues);
        $querySql = HotstatusResponse::buildQuery_WhereAnd_String($querySqlValues);

        //Determine cache id from query parameters
        $CACHE_ID = $_ID . ((strlen($queryCache) > 0) ? (":" . md5($queryCache)) : (""));

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
}
