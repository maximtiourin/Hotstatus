<?php

namespace AppBundle\Controller;

use Fizzik\Database\MongoDBDatabase;
use Fizzik\HotstatusPipeline;
use Fizzik\Utility\AssocArray;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Asset;
use Fizzik\Database\MySqlDatabase;
use Fizzik\Database\RedisDatabase;
use Fizzik\Credentials;

/*
 * In charge of fetching hero data from database and returning it as requested
 */
class HerodataController extends Controller {
    const CODE_OK = 200;
    const SELECT_ALL = "*";
    const CACHE_TIME = PHP_INT_MAX; //INT_MAX cache time ensures keys are only removed when the volatile-lru eviction policy does it, or manually
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
        $creds = Credentials::getHotstatusWebCredentials();

        $cachekey = HotstatusPipeline::CACHE_REQUEST_DATATABLE_HEROES_STATSLIST;

        $datatable = [];

        //Get redis cache
        $redis = new RedisDatabase();
        $redis->connect($creds[Credentials::KEY_REDIS_URI]);

        //Try to get cached value
        $cacheval = $redis->getCachedString($cachekey);
        if ($cacheval !== NULL) {
            $datatable = json_decode($cacheval, true);
        }
        else {
            //Mysql
            $db = new MysqlDatabase();

            $db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);
            $db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

            //Get image path from packages
            /** @var Asset\Packages $pkgs */
            $pkgs = $this->get("assets.packages");
            $pkg = $pkgs->getPackage("images");
            $imgbasepath = $pkg->getUrl('');

            //Determine time range
            date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);
            //$datetime = new \DateTime("now");
            //TODO Debug use weeks from the past instead of now
            $datetime = new \DateTime();
            $datetime->setISODate(2017, 28, 1);
            //
            $last7days_range = HotstatusPipeline::getMinMaxRangeForLastISODaysInclusive(7, $datetime->format(HotstatusPipeline::FORMAT_DATETIME));
            $old7days_range = HotstatusPipeline::getMinMaxRangeForLastISODaysInclusive(7, $datetime->format(HotstatusPipeline::FORMAT_DATETIME), 7);

            //Prepare statements
            $db->prepare("SelectHeroes", "SELECT name, name_sort, role_blizzard, role_specific, image_hero FROM herodata_heroes");

            $db->prepare("SelectHeroesMatches",
                "SELECT `played`, `won`, `banned` FROM `heroes_matches_recent_granular` WHERE `hero` = ? AND `gameType` = ? AND `date_end` >= ? AND `date_end` <= ?");
            $db->bind("SelectHeroesMatches", "ssss", $r_hero, $r_gameType, $date_range_start, $date_range_end);

            $r_gameType = "Hero League";

            //Iterate through heroes
            $data = [];
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


                /*
                 * Construct row
                 */
                $dtrow = [];

                //Hero Portrait
                $dtrow[] = '<img src="' . $imgbasepath . $row['image_hero'] . '.png" class="rounded-circle hsl-portrait">';

                //Hero proper name
                $dtrow[] = $row['name'];

                //Hero name sort helper
                $dtrow[] = $row['name_sort'];

                //Hero Blizzard role
                $dtrow[] = $row['role_blizzard'];

                //Hero Specific role
                $dtrow[] = $row['role_specific'];

                //Playrate
                $dtrow[] = $dt_playrate;

                //Banrate
                $dtrow[] = $dt_banrate;

                //Winrate
                $colorclass = "hsl-number-winrate-red";
                if ($dt_winrate >= 50.0) $colorclass = "hsl-number-winrate-green";
                $dtrow[] = '<span class="'.$colorclass.'">'.sprintf("%03.1f %%", $dt_winrate).'</span>';

                //Win Delta (This is the % change in winrate from this last 2 iso weeks to previous 2 iso weeks)
                $colorclass = "hsl-number-delta-red";
                if ($dt_windelta >= 0) $colorclass = "hsl-number-delta-green";
                $dtrow[] = '<span class="'.$colorclass.'">'.sprintf("%+-03.1f %%", $dt_windelta).'</span>';

                $data[] = $dtrow;
            }

            $db->freeResult($result);
            $db->close();

            $datatable['data'] = $data;

            $redis->cacheString($cachekey, json_encode($datatable), self::CACHE_TIME);
        }

        $redis->close();

        return $this->json($datatable);
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
