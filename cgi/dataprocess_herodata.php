<?php

/*
 * Command Line Process
 * args:
 * 0: File path of script being executed (default arg from php)
 *
 * output:
 * JSON string of relevant hero data
 */
//The json array that holds all of the heroes
$global_json = [];
$global_json['heroes'] = [];

//General QoL constants
const E = PHP_EOL;

//QoL constants for referencing json encoded xml
const ATTR = "@attributes";
const ID = "id";
const V = "value";

//Data directory path constants
const PATH_DATA = "/Data/";
const PATH_STORMDATA = PATH_DATA . "mods/heroesdata.stormmod/base.stormdata/GameData/";
const PATH_STORMDATA_HEROES = PATH_STORMDATA . "Heroes/";
const PATHFRAG_STORMDATA_HERO_DIR = "Data/";
const PATHFRAG_STORMDATA_HERO_DATA = "Data.xml";
const FILE_STORMDATA_OLDHEROINDEX = PATH_STORMDATA . "HeroData.xml";
const PATH_HEROMODS = PATH_DATA . "mods/heromods/";
const PATHFRAG_HEROMODS_HERO_DIR = ".stormmod/base.stormdata/GameData/";
const PATHFRAG_HEROMODS_HERO_DATA1 = "HeroData.xml";
const PATHFRAG_HEROMODS_HERO_DATA2 = "Data.xml";


//What stormdata heroes to check (Not all *Data.xml files will have <CHero>, but that shouldnt be a problem)
$stormDataNames = [
    "Anubarak" => TRUE,
    "Artanis" => TRUE,
    "Azmodan" => TRUE,
    "Butcher" => TRUE,
    "Chen" => TRUE,
    "Crusader" => TRUE,
    "DemonHunter" => TRUE,
    "Diablo" => TRUE,
    "Dryad" => TRUE,
    "Genn" => TRUE,
    "Jaina" => TRUE,
    "Kaelthas" => TRUE,
    "Leoric" => TRUE,
    "LostVikings" => TRUE,
    "Medic" => TRUE,
    "Monk" => TRUE,
    "Murky" => TRUE,
    "Necromancer" => TRUE,
    "Rexxar" => TRUE,
    "SgtHammer" => TRUE,
    "Stitches" => TRUE,
    "Sylvanas" => TRUE,
    "Tassadar" => TRUE,
    "Thrall" => TRUE,
    "Tinker" => TRUE,
    "Uther" => TRUE,
    "WitchDoctor" => TRUE,
    "Wizard" => TRUE,
    "Zagara" => TRUE,
    "Zeratul" => TRUE
];

//What heromods hero identifiers to use for folders (and hopefully for underlying xml data as well)
$heromodsDataNames = [
    "alarak" => TRUE,
    "amazon" => TRUE,
    "ana" => TRUE,
    "auriel" => TRUE,
    "chogall" => TRUE,
    "chromie" => TRUE,
    "dehaka" => TRUE,
    "dva" => TRUE,
    "garrosh" => TRUE,
    "genji" => TRUE,
    "guldan" => TRUE,
    "kelthuzad" => TRUE,
    "lucio" => TRUE,
    "malthael" => TRUE,
    "medivh" => TRUE,
    "probius" => TRUE,
    "samuro" => TRUE,
    "stukov" => TRUE,
    "thefirelords" => TRUE,
    "tracer" => TRUE,
    "valeera" => TRUE,
    "varian" => TRUE,
    "zarya" => TRUE,
    "zuljin" => TRUE
];

//Blizzard developers are a mess, and a few hero data xml's do not follow any of the established patterns, so must insert special cases for them here
$heromodsDataNamesExceptions = [
    "garrosh" => "Garrosh.xml",
    "kelthuzad" => "KelThuzad.xml"
];

//What internal hero names to ignore from the list
$ignoreNames = [
    "Random" => TRUE,
    "TestHero" => TRUE,
    "GreymaneWorgen" => TRUE
];

//What names to convert if encountered
$mapNames = [
    "LiLi" => "Li Li",
    "Barbarian" => "Sonya",
    "FaerieDragon" => "Brightwing",
    "L90ETC" => "E.T.C.",
    "Anubarak" => "Anub'arak",
    "Butcher" => "The Butcher",
    "Crusader" => "Johanna",
    "DemonHunter" => "Valla",
    "Dryad" => "Lunara",
    "Kaelthas" => "Kael'thas",
    "LostVikings" => "The Lost Vikings",
    "Medic" => "Lt. Morales",
    "Monk" => "Kharazim",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
    "" => "",
];

function extractImageString($str) {
    $arr = [];
    $ret = preg_match("/.*\\\\(.*).dds/", $str, $arr);

    if ($ret == 1) {
        return $arr[1];
    }
    else {
        return "";
    }
}

function extractHero_xmlToJson($filepath) {
    global $ignoreNames, $mapNames, $global_json;

    $str = file_get_contents($filepath);

    //Extract relevant xml from larger xml string (Essentially Selects everything between <CHero></CHero> tags, while ignoring <CHero/> tags)
    $res = [];
    $ret = preg_match_all("/<CHero id=[^\/]*>.*<\/CHero>/Ums", $str, $res);

    if ($ret !== FALSE) {
        //Select the overall result array of individual results
        $results = $res[0];

        foreach ($results as $xmlres) {
            //Prep the xml string to be properly used by simple xml
            $s = $xmlres;
            $s = str_replace(array("\n", "\r", "\t"), '', $s);
            $s = trim(str_replace('"', "'", $s));

            //Create simple xml object from xml string
            $xmlobj = simplexml_load_string($s);

            //Decode xml into json
            $j = json_decode(json_encode($xmlobj, JSON_HEX_QUOT), true);

            //Make sure hero even has an id
            if (key_exists(ATTR, $j)) {
                $name_internal = $j[ATTR][ID];

                //Make sure hero isnt on ignore list
                if (!key_exists($name_internal, $ignoreNames) || $ignoreNames[$name_internal] == FALSE) {
                    //Construct hero object from json decoded xml
                    $hero = [];
                    if (key_exists($name_internal, $mapNames)) {
                        //Map hero name
                        $hero['name'] = $mapNames[$name_internal];
                    }
                    else {
                        //Use internal name as proper name
                        $hero['name'] = $name_internal;
                    }
                    $hero['name_internal'] = $name_internal;
                    if (key_exists('AttributeId', $j)) $hero['attribute'] = $j['AttributeId'][ATTR][V];
                    if (key_exists('Difficulty', $j)) $hero['difficulty'] = $j["Difficulty"][ATTR][V];
                    if (key_exists('ProductId', $j)) $hero['product_id'] = $j['ProductId'][ATTR][V];
                    if (key_exists('Role', $j)) $hero['role'] = $j['Role'][ATTR][V];
                    if (key_exists('RolesMultiClass', $j) && key_exists(ATTR, $j['RolesMultiClass'])) $hero['role_multiclass'] = $j['RolesMultiClass'][ATTR][V];
                    if (key_exists('CollectionCategory', $j)) $hero['role_collection'] = $j['CollectionCategory'][ATTR][V];
                    if (key_exists('Universe', $j)) $hero['universe'] = $j['Universe'][ATTR][V];
                    if (key_exists('SelectScreenButtonImage', $j)) $hero['image_heroselect'] = extractImageString($j['SelectScreenButtonImage'][ATTR][V]);
                    if (key_exists('UniverseIcon', $j)) $hero['image_universe'] = extractImageString($j['UniverseIcon'][ATTR][V]);
                    if (key_exists('HyperlinkId', $j)) $hero['image_hyperlink'] = extractImageString($j['HyperlinkId'][ATTR][V]);
                    $hero['ratings'] = [];
                    if (key_exists('Ratings', $j)) {
                        if (key_exists('Damage', $j['Ratings'])) $hero['ratings']['damage'] = $j['Ratings']['Damage'][ATTR][V];
                        if (key_exists('Utility', $j['Ratings'])) $hero['ratings']['utility'] = $j['Ratings']['Utility'][ATTR][V];
                        if (key_exists('Survivability', $j['Ratings'])) $hero['ratings']['survivability'] = $j['Ratings']['Survivability'][ATTR][V];
                        if (key_exists('Complexity', $j['Ratings'])) $hero['ratings']['complexity'] = $j['Ratings']['Complexity'][ATTR][V];
                    }
                    if (key_exists('Rarity', $j)) $hero['rarity'] = $j['Rarity'][ATTR][V];
                    $hero['talents'] = [];
                    if (key_exists('TalentTreeArray', $j)) {
                        foreach ($j['TalentTreeArray'] as $talent) {
                            $t = [];
                            $t['name'] = $talent[ATTR]['Talent'];
                            $t['tier'] = $talent[ATTR]['Tier'];
                            $t['column'] = $talent[ATTR]['Column'];
                            $hero['talents'][] = $t;
                        }
                    }

                    $global_json['heroes'][] = $hero;
                }
            }
        }
    }
}

/*
 * Look through Data directories and extract data
 */
//Extract heroes from old hero index
$fp = __DIR__ . FILE_STORMDATA_OLDHEROINDEX;

if (file_exists($fp)) {
    extractHero_xmlToJson($fp);
}
else {
    die("Old Hero Index File does not exist: " . $fp);
}

//Extract stormdata
foreach ($stormDataNames as $heroname => $bool_include) {
    if ($bool_include) {
        $fp = __DIR__ . PATH_STORMDATA_HEROES . $heroname . PATHFRAG_STORMDATA_HERO_DIR . $heroname . PATHFRAG_STORMDATA_HERO_DATA;

        if (file_exists($fp)) {
            extractHero_xmlToJson($fp);
        }
        else {
            die("Storm Data File does not exist: " . $fp);
        }
    }
}

//Extract heromods
foreach ($heromodsDataNames as $heroname => $bool_include) {
    if ($bool_include) {
        if (key_exists($heroname, $heromodsDataNamesExceptions)) {
            //Special exception hero mods case
            $fp = __DIR__ . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . $heromodsDataNamesExceptions[$heroname];

            if (file_exists($fp)) {
                extractHero_xmlToJson($fp);
            }
            else {
                die("Hero Mods Special Exception File does not exist: " . $fp);
            }
        }
        else {
            //Regular hero mods case
            $fp1 = __DIR__ . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . PATHFRAG_HEROMODS_HERO_DATA1;
            $fp2 = __DIR__ . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . ucfirst($heroname) . PATHFRAG_HEROMODS_HERO_DATA2;

            if (file_exists($fp1)) {
                extractHero_xmlToJson($fp1);
            }
            else if (file_exists($fp2)) {
                extractHero_xmlToJson($fp2);
            }
            else {
                die("Hero Mods Files do not exist at either location: (" . $fp1 . ", " . $fp2 . ")");
            }
        }
    }
}

//Output json
echo json_encode($global_json).E;