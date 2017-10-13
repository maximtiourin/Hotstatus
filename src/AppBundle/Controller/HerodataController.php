<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\DBAL\Statement;
use Symfony\Component\Asset;

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
        //Get image path from packages
        /** @var Asset\Packages $pkgs */
        $pkgs = $this->get("assets.packages");
        $pkg = $pkgs->getPackage("images");
        $imgbasepath = $pkg->getUrl('');

        //Get db connection
        $db = $this->getDoctrine()->getConnection("hotstatus_mysql");
        $db->setFetchMode(\PDO::FETCH_ASSOC);

        //Prepare statements
        $ps = [];
        $ps['SelectHeroes'] = $db->prepare("SELECT name, name_sort, role_blizzard, role_specific, image_hero FROM herodata_heroes");

        $datatable = [];

        /** @var Statement $stmt */
        $stmt = $ps['SelectHeroes'];
        $stmt->execute();
        $data = [];
        while ($row = $stmt->fetch()) {
            $dtrow = [];

            //Hero Portrait
            $dtrow[] = '<img src="' . $imgbasepath . $row['image_hero'] . '.png" width="40px" height="40px">';

            //Hero proper name
            $dtrow[] = $row['name'];

            //Hero name sort helper
            $dtrow[] = $row['name_sort'];

            //Hero Blizzard role
            $dtrow[] = $row['role_blizzard'];

            //Hero Specific role
            $dtrow[] = $row['role_specific'];

            //Temp Winrate
            $dtrow[] = round((mt_rand() / mt_getrandmax()) * 80.0, 1);

            //Temp Playrate
            $dtrow[] = round((mt_rand() / mt_getrandmax()) * 20.0, 1);

            //Temp Banrate
            $dtrow[] = round((mt_rand() / mt_getrandmax()) * 12.0, 1);

            //Temp win delta
            $dtrow[] = round((mt_rand() / mt_getrandmax()) * 8.0, 1);

            $data[] = $dtrow;
        }

        $datatable['data'] = $data;

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
