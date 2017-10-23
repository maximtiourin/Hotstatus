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
            //Mongo
            $mongo = new MongoDBDatabase();
            $mongo->connect($creds[Credentials::KEY_MONGODB_URI]);
            $mongo->selectDatabase("hotstatus");

            //Mysql
            $db = new MysqlDatabase();

            $db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);
            $db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

            //Prepare statements
            $db->prepare("SelectHeroes", "SELECT name, name_sort, role_blizzard, role_specific, image_hero FROM herodata_heroes");

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
            $datetime->setISODate("2017", "30");
            //
            $last2weeks = HotstatusPipeline::getLastISOWeeksInclusive(2, $datetime->format(HotstatusPipeline::FORMAT_DATETIME));
            $old2weeks = HotstatusPipeline::getLastISOWeeksInclusive(2, $datetime->format(HotstatusPipeline::FORMAT_DATETIME), 2);
            $filter = [];
            $weekprojection = [];
            $weekprojection['_id'] = 0;
            foreach ($last2weeks as $isoweek) {
                $y = $isoweek['year'];
                $w = $isoweek['week'];
                $weekprojection["weekly_data.$y.$w.matches.Hero League.played"] = 1;
                $weekprojection["weekly_data.$y.$w.matches.Hero League.banned"] = 1;
                $weekprojection["weekly_data.$y.$w.matches.Hero League.won"] = 1;
            }
            foreach ($old2weeks as $isoweek) {
                $y = $isoweek['year'];
                $w = $isoweek['week'];
                $weekprojection["weekly_data.$y.$w.matches.Hero League.played"] = 1;
                $weekprojection["weekly_data.$y.$w.matches.Hero League.banned"] = 1;
                $weekprojection["weekly_data.$y.$w.matches.Hero League.won"] = 1;
            }

            //Select heroes collection
            $clc_heroes = $mongo->selectCollection("heroes");

            //Iterate through heroes
            $data = [];
            $result = $db->execute("SelectHeroes");
            while ($row = $db->fetchArray($result)) {
                /*
                 * Collect hero data
                 */
                $dt_playrate = 0;
                $dt_banrate = 0;
                $dt_winrate = 0.0;
                $dt_windelta = 0.0;

                $filter['_id'] = $row['name_sort'];
                $res = $clc_heroes->findOne(
                    $filter,
                    [               //Options Array
                        'projection' => $weekprojection
                    ]
                );
                if ($res !== NULL) {
                    $won = 0;
                    $old_playrate = 0;
                    $old_won = 0;
                    $old_winrate = 0.0;

                    foreach ($last2weeks as $isoweek) {
                        $y = $isoweek['year'];
                        $w = $isoweek['week'];

                        if (AssocArray::keyChainExists($res, 'weekly_data', $y.'', $w.'', 'matches', 'Hero League')) {
                            $obj = $res['weekly_data'][$y.""][$w.""]['matches']['Hero League'];

                            //Playrate
                            if (key_exists('played', $obj)) {
                                $dt_playrate += $obj['played'];
                            }

                            //Banrate
                            if (key_exists('banned', $obj)) {
                                $dt_banrate += $obj['banned'];
                            }

                            //Won
                            if (key_exists('won', $obj)) {
                                $won += $obj['won'];
                            }
                        }
                    }

                    foreach ($old2weeks as $isoweek) {
                        $y = $isoweek['year'];
                        $w = $isoweek['week'];

                        if (AssocArray::keyChainExists($res, 'weekly_data', $y.'', $w.'', 'matches', 'Hero League')) {
                            $obj = $res['weekly_data'][$y.""][$w.""]['matches']['Hero League'];

                            //Playrate
                            if (key_exists('played', $obj)) {
                                $old_playrate += $obj['played'];
                            }

                            //Won
                            if (key_exists('won', $obj)) {
                                $old_won += $obj['won'];
                            }
                        }
                    }

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
                }


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
