<?php

namespace AppBundle\Controller;

use Fizzik\HotstatusPipeline;
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
            //Get mysql db connection
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

            $data = [];
            $result = $db->execute("SelectHeroes");
            while ($row = $db->fetchArray($result)) {
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

                //Temp Playrate
                $dtrow[] = round((mt_rand() / mt_getrandmax()) * 20.0, 1);

                //Temp Banrate
                $dtrow[] = round((mt_rand() / mt_getrandmax()) * 12.0, 1);

                //Temp Winrate
                $dtrow[] = round((mt_rand() / mt_getrandmax()) * 80.0, 1);

                //Temp win delta (This is the % change in winrate from this iso week to last iso week)
                $dtrow[] = round((mt_rand() / mt_getrandmax()) * 8.0, 1);

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
