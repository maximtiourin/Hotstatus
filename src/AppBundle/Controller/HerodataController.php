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

/*
 * In charge of fetching hero data from database and returning it as requested
 */
class HerodataController extends Controller {
    const CODE_OK = 200;
    const SELECT_ALL = "*";
    private static $herodata_heroes_keys = [
        "name", "name_internal", "name_sort", "name_attribute", "difficulty", "role_blizzard", "role_specific", "universe",
        "title", "desc_tagline", "desc_bio", "rarity", "image_hero", "image_minimap", "rating_damage", "rating_utility",
        "rating_survivability", "rating_complexity"
    ];

    /**
     * Returns the the relevant data to populate a DataTable heroes-statslist with any necessary formatting (IE: images wrapped in image tags)
     *
     * @Route("/herodata/datatable/heroes/statslist", name="herodata_datatable_heroes_statslist")
     */
    public function getDataTableHeroesStatsListAction() {
        $_TYPE = HotstatusCache::CACHE_REQUEST_TYPE_DATATABLE;
        $_ID = "getDataTableHeroesStatsListAction";
        $_VERSION = 0;

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
            $cacheval = HotstatusCache::readCacheRequest($redis, $_TYPE, $_ID, $_VERSION);
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
                //$datetime = new \DateTime("now");
                $datetime = new \DateTime("2017-07-18"); //TODO Debug use weeks from the past instead of now for testing
                //$datetime->setISODate(2017, 28, 3);
                //
                $last7days_range = HotstatusPipeline::getMinMaxRangeForLastISODaysInclusive(7, $datetime->format(HotstatusPipeline::FORMAT_DATETIME));
                $old7days_range = HotstatusPipeline::getMinMaxRangeForLastISODaysInclusive(7, $datetime->format(HotstatusPipeline::FORMAT_DATETIME), 7);

                //Prepare statements
                $db->prepare("SelectHeroes", "SELECT name, name_sort, role_blizzard, role_specific, image_hero FROM herodata_heroes");

                $db->prepare("SelectHeroesMatches",
                    "SELECT `played`, `won`, `banned` FROM `heroes_matches_recent_granular` WHERE `hero` = ? AND `gameType` = ? AND `date_end` >= ? AND `date_end` <= ?");
                $db->bind("SelectHeroesMatches", "ssss", $r_hero, $r_gameType, $date_range_start, $date_range_end);

                $db->prepare("CountMatches",
                    "SELECT COUNT(`id`) AS match_count FROM `matches` WHERE `type` = ? AND `date` >= ? AND `date` <= ?");
                $db->bind("CountMatches", "sss", $r_gameType, $date_range_start, $date_range_end);

                $r_gameType = "Hero League"; //TODO

                //Determine matches played for recent granularity
                $matchesPlayed = 0;
                $date_range_start = $last7days_range['date_start'];
                $date_range_end = $last7days_range['date_end'];

                $matchCountResult = $db->execute("CountMatches");
                $matchCountResult_rows = $db->countResultRows($matchCountResult);
                if ($matchCountResult_rows > 0) {
                    $mcrow = $db->fetchArray($matchCountResult);

                    $matchesPlayed = $mcrow['match_count'];
                }

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
                     * Calculate statistics for hero
                     */
                    //Last 7 Days
                    $date_range_start = $last7days_range['date_start'];
                    $date_range_end = $last7days_range['date_end'];

                    $statsResult = $db->execute("SelectHeroesMatches");
                    $statsResult_rows = $db->countResultRows($statsResult);
                    if ($statsResult_rows > 0) {
                        while ($statsrow = $db->fetchArray($statsResult)) {
                            $dt_playrate += $statsrow['played'];
                            $dt_banrate += $statsrow['banned'];
                            $won += $statsrow['won'];
                        }
                    }
                    $db->freeResult($statsResult);

                    //Old 7 Days
                    $date_range_start = $old7days_range['date_start'];
                    $date_range_end = $old7days_range['date_end'];

                    $statsResult = $db->execute("SelectHeroesMatches");
                    $statsResult_rows = $db->countResultRows($statsResult);
                    if ($statsResult_rows > 0) {
                        while ($statsrow = $db->fetchArray($statsResult)) {
                            $old_playrate += $statsrow['played'];
                            $old_won += $statsrow['won'];
                        }
                    }
                    $db->freeResult($statsResult);

                    //Winrate
                    if ($dt_playrate > 0) {
                        $dt_winrate = round(($won / ($dt_playrate * 1.00)) * 100.0, 1);
                    }

                    //Old Winrate
                    if ($old_playrate > 0) {
                        $old_winrate = round(($old_won / ($old_playrate * 1.00)) * 100.0, 1);
                    }

                    //Win Delta
                    $dt_windelta = $dt_winrate - $old_winrate;

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
                $maxPopularity = PHP_INT_MIN;
                $minPopularity = PHP_INT_MAX;
                foreach ($herodata as &$rhero) {
                    $dt_popularity = round(((($rhero['dt_playrate'] + $rhero['dt_banrate']) * 1.00) / (($matchesPlayed) * 1.00)) * 100.0, 1);

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
                    $percentOnRange = ((($hero['dt_popularity'] - $minPopularity) * 1.00) / (($maxPopularity - $minPopularity) * 1.00)) * 100.0;
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
                HotstatusCache::writeCacheRequest($redis, $_TYPE, $_ID, $_VERSION, $encoded);
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

    private static function buildQuerySelectString($key, &$str) {
        //EXAMPLE: Build select string based on query parameters in the request
        /*$selectstr = "";
        foreach (self::$herodata_heroes_keys as $field) {
            if ($request->query->has($field)) self::buildQuerySelectString($field, $selectstr);
        }
        if (strlen($selectstr) == 0) $selectstr = self::SELECT_ALL;*/

        if (strlen($str) > 0) {
            $str .= ", $key";
        }
        else {
            $str = $key;
        }
    }
}
