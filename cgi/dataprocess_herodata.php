<?php

namespace Fizzik;

require_once 'includes/include.php';

use Fizzik\Utility\FileHandling;

set_time_limit(0);

//The json array that holds all of the heroes
$global_json = [];
$global_json['heroes'] = [];

//General QoL constants
const NOIMAGE = 'NoImage';
const UNKNOWN = 'Unknown';
const NONE = 'None';
const E = PHP_EOL;

//QoL constants for referencing json encoded xml
const ATTR = "@attributes";
const ID = "id";
const V = "value";
const IDX = "index";

/*
 * Data directory path constants
 */
const PATH_DATA = "/data/";
//Stormdata
const PATH_STORMDATA = PATH_DATA . "mods/heroesdata.stormmod/base.stormdata/GameData/";
const PATH_STORMDATA_STRINGS = PATH_DATA . "mods/heroesdata.stormmod/enus.stormdata/LocalizedData/";
const PATH_STORMDATA_HEROES = PATH_STORMDATA . "Heroes/";
const PATHFRAG_STORMDATA_HERO_DIR = "Data/";
const PATHFRAG_STORMDATA_HERO_DATA = "Data.xml";
const FILE_STORMDATA_OLDHEROINDEX = PATH_STORMDATA . "HeroData.xml";
const FILE_STORMDATA_OLDTALENTINDEX = PATH_STORMDATA . "TalentData.xml";
const FILE_STORMDATA_OLDACTORINDEX = PATH_STORMDATA . "ActorData.xml";
const FILE_STORMDATA_OLDBUTTONINDEX = PATH_STORMDATA . "ButtonData.xml";
const FILE_STORMDATA_STRINGS_OLDHEROINDEX = PATH_STORMDATA_STRINGS . "GameStrings.txt";
//Heromods
const PATH_HEROMODS = PATH_DATA . "mods/heromods/";
const PATHFRAG_HEROMODS_HERO_DIR = ".stormmod/base.stormdata/GameData/";
const PATHFRAG_HEROMODS_HERO_STRINGS_DIR = ".stormmod/enus.stormdata/LocalizedData/GameStrings.txt";
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

//Blizzard naming conventions are a mess, and a few hero data xml's do not follow any of the established patterns, so must insert special cases for them here
$heromodsDataNamesExceptions = [
    "garrosh" => "Garrosh.xml",
    "kelthuzad" => "KelThuzad.xml",
    "guldan" => "GuldanData.xml"
];

//What internal hero names to ignore from the list
$ignoreNames = [
    "Random" => TRUE,
    "TestHero" => TRUE,
    "GreymaneWorgen" => TRUE,
    "ChoGallBundleProduct" => TRUE
];

//Some abilities have button keys that map to incorrect ability names, one easy example is 'TassadarArchon' mapping to 'Phase Shift', when it should be 'Archon'
$abilityNameExceptions = [
    "TassadarArchon" => "Archon"
];

/*
 * Map is populated of mappings of CHero Talent Key => GameString Talent Key
 */
$talentMappings = [];

/*
 * Map is populated of mapping of CActorUnit
 * ['Hero'.{NAMEINTERNAL}] => [
 *      ['hero'] => image name without extension
 *      ['minimap'] => image name without extension
 * ]
 *
 *
 * Can have predefined values that won't be overwritten, for use in special cases where mapped image strings are
 * undesirable, or can not be found with the preestablished CActorUnit pattern
 */
$actorImageMappings = [
    "HeroStukov" => [
        "hero" => "ui_targetportrait_hero_stukov"
    ],
    "HeroDVa" => [
        "hero" => "ui_targetportrait_hero_dva",
        "minimap" => "storm_ui_minimapicon_dva"
    ],
    "HeroLostVikings" => [
        "hero" => "ui_targetportrait_hero_lostvikings",
        "minimap" => "storm_ui_minimapicon_heros_erik"
    ]
];

/*
 * Map is populated of mappings of GameString button key => image name without extension
 */
$buttonImageMappings = [];

//Extracts the image name withotu extension from a dds image string while converting it to lowercase, default value case is not touched
function extractImageString($str, $default = "") {
    $arr = [];
    $ret = preg_match("@([a-zA-Z0-9_-]+)\.dds@", $str, $arr);

    if ($ret == 1) {
        return strtolower($arr[1]);
    }
    else {
        return $default;
    }
}

function extractUniverseNameFromUniverseIcon($str, $default = "") {
    $arr = [];
    $ret = preg_match("@([a-zA-Z0-9]+)\.dds@", $str, $arr);

    if ($ret == 1) {
        $uname = $arr[1];
        $uname = strtolower($uname);
        switch ($uname) {
            case "sc2":
                return "Starcraft";
            default:
                return $default;
        }
    }
    else {
        return $default;
    }
}

function extractURLFriendlyProperName($name) {
    return preg_replace('/[^a-zA-Z0-9]/', '', $name);
}

function createSpacesBetweenWords($str) {
    return preg_replace('@([a-z\.])([A-Z])@', '$1 $2', $str);
}

/*
 * Extracts the value of the line with the given identifier in the line seperated file
 * Will also remove any html-like brackets inside of the value, leaving only the basic string
 *
 * Can optionally set $isTalent = true so that the function knows to check talent map for proper talent key ids
 */
function extractLine($prefixarr, $id, &$linesepstring, $defaultValue = "", $isTalent = FALSE) {
    global $talentMappings;

    $regex_match_flags = 'mi';

    $talent = 'Talent';

    //Build prefix options
    $prefix = "";
    $prefixarrlen = count($prefixarr);
    if ($prefixarrlen > 0) {
        $pc = 0;
        $prefix = '(?:';
        foreach ($prefixarr as $pref) {
            $prefix .= $pref;

            if ($pc < $prefixarrlen - 1) {
                $prefix .= '|';
            }

            $pc++;
        }
        $prefix .= ')';
    }

    $match = '@' . $prefix . $id . '=(.*)$@';
    $replacebbcode = '/<.*?>/';

    $arr = [];

    $ret = null;

    if ($isTalent) {
        /*
         * Talent Matches
         */
        $mtalent = [];
        $mtvalid = [];
        $tid = 0;

        //Check talent mappings first before trying to do ANY regex parsing, to speed up processing
        if (key_exists($id, $talentMappings)) {
            //Account for edge case where the simpledescription key possibly having one appended word 'Talent' (before resulting to tooltip prefix)
            $mtvalid[$tid] = TRUE;
            $mtalent[$tid] = '@' . $prefix . $talentMappings[$id] . '(?:' . $talent . ')?=(.*)$@';
            $tid++;
        }
        else {
            $mtvalid[$tid] = TRUE;
            $mtalent[$tid] = $match;
            $tid++;
        }

        //Loop through match regexes and return the first one that succeeds
        for ($i = 0; $i < $tid; $i++) {
            if ($mtvalid[$i]) $ret = preg_match($mtalent[$i] . $regex_match_flags, $linesepstring, $arr);

            if ($mtvalid[$i] && $ret == 1) {
                $str = $arr[1];
                return trim(preg_replace($replacebbcode, '', $str));
            }
        }

        //Exhausted all possibilities, just return default value
        return $defaultValue;
    }
    else {
        //Regular line matching
        $ret = preg_match($match . $regex_match_flags, $linesepstring, $arr);

        if ($ret == 1) {
            $str = $arr[1];
            return trim(preg_replace($replacebbcode, '', $str));
        }
        else {
            return $defaultValue;
        }
    }
}

function extractTalents($filepath) {
    global $talentMappings;

    $str = file_get_contents($filepath); //Xml string of talent data

    $xml = simplexml_load_string($str);

    if ($xml !== FALSE) {
        foreach ($xml->CTalent as $talent) {
            $name_internal = $talent->attributes()->id;
            $gamestringkey = $talent->Face['value'];

            $talentMappings[strval($name_internal)] = $gamestringkey;
        }
    }
}

function extractActorImages($filepath) {
    global $actorImageMappings;
    
    $default = NOIMAGE;

    $str = file_get_contents($filepath); //Xml string of actor data

    $xml = simplexml_load_string($str);

    if ($xml !== FALSE) {
        foreach ($xml->CActorUnit as $actor) {          
            $am = [];
            
            $name_internal = $actor->attributes()->id;
            
            $namestr = strval($name_internal);

            //Images
            $am['hero'] = extractImageString($actor->HeroIcon['value'], $default);
            $am['minimap'] = extractImageString($actor->MinimapIcon['value'], $default);
            
            //Set mapping without overwriting the structure (in case explicit exceptions were made)
            if (!key_exists($namestr, $actorImageMappings)) {
                $actorImageMappings[$namestr] = $am;
            }
            else {
                if (!key_exists('hero', $actorImageMappings[$namestr])) {
                    $actorImageMappings[$namestr]['hero'] = $am['hero'];
                }
                if (!key_exists('minimap', $actorImageMappings[$namestr])) {
                    $actorImageMappings[$namestr]['minimap'] = $am['minimap'];
                }
            }
        }
    }
}

function extractButtonImages($filepath) {
    global $buttonImageMappings;

    $default = NOIMAGE;

    $str = file_get_contents($filepath); //Xml string of actor data

    $xml = simplexml_load_string($str);

    if ($xml !== FALSE) {
        foreach ($xml->CButton as $btn) {
            $name_internal = $btn->attributes()->id;

            $namestr = strval($name_internal);

            //Image
            $image = extractImageString($btn->Icon['value'], $default);

            //Set mapping without overwriting the structure (in case explicit exceptions were made)
            if (!key_exists($namestr, $buttonImageMappings)) {
                $buttonImageMappings[$namestr] = $image;
            }
        }
    }
}

function extractHero_xmlToJson($filepath, $file_strings) {
    global $ignoreNames, $global_json, $abilityNameExceptions, $talentMappings, $actorImageMappings, $buttonImageMappings;

    $str = file_get_contents($filepath); //Xml string of hero data
    $str2 = $file_strings; //Line seperated hero localization strings

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

                    //Proper name
                    $hero['name'] = extractLine(array("Hero/Name/"), $name_internal, $str2, $name_internal);

                    //Internal name
                    $hero['name_internal'] = $name_internal;

                    //Sort name
                    $hero['name_sort'] = extractLine(array("Hero/SortName/"), $name_internal, $str2, extractURLFriendlyProperName($hero['name']));

                    //Attribute name
                    if (key_exists('AttributeId', $j)) {
                        $hero['attribute'] = $j['AttributeId'][ATTR][V];
                    }
                    else {
                        $hero['attribute'] = NONE;
                    }

                    //Product id
                    /*if (key_exists('ProductId', $j)) {
                        $hero['product_id'] = intval($j["ProductId"][ATTR][V]);
                    }
                    else {
                        $hero['product_id'] = -1;
                    }*/

                    //Difficulty
                    if (key_exists('Difficulty', $j)) {
                        $hero['difficulty'] = createSpacesBetweenWords($j["Difficulty"][ATTR][V]);
                    }
                    else {
                        $hero['difficulty'] = "Easy";
                    }

                    //Role
                    if (key_exists('Role', $j)) {
                        $hero['role'] = $j['Role'][ATTR][V];
                    }
                    else if (key_exists('RolesMultiClass', $j) && key_exists(ATTR, $j['RolesMultiClass'])) {
                        $hero['role'] = $j['RolesMultiClass'][ATTR][V];
                    }
                    else if (key_exists('CollectionCategory', $j)) {
                        $hero['role'] = $j['CollectionCategory'][ATTR][V];
                    }
                    else {
                        $hero['role'] = UNKNOWN;
                    }

                    //Universe
                    if (key_exists('Universe', $j)) {
                        $hero['universe'] = $j['Universe'][ATTR][V];
                    }
                    else if (key_exists('UniverseIcon', $j)) {
                        $ustr = $j['UniverseIcon'][ATTR][V];
                        $hero['universe'] = extractUniverseNameFromUniverseIcon($ustr, UNKNOWN);
                    }
                    else {
                        $hero['universe'] = UNKNOWN;
                    }

                    //Title
                    $hero['title'] = extractLine(array("Hero/Title/"), $name_internal, $str2, "");

                    //Description Tagline
                    $hero['desc_tagline'] = extractLine(array("Hero/Description/"), $name_internal, $str2, NONE);

                    //Description Bio
                    $hero['desc_bio'] = extractLine(array("Hero/Info/"), $name_internal, $str2, NONE);

                    /*
                     * Image strings
                     */
                    $actorstr = "Hero".$name_internal;
                    //Image name
                    //$hero['image_name'] = extractURLFriendlyProperName($hero['name']);

                    //Actor mapping images
                    if (key_exists($actorstr, $actorImageMappings)) {
                        if (key_exists('hero', $actorImageMappings[$actorstr]) && $actorImageMappings[$actorstr]['hero'] !== NOIMAGE) {
                            $hero['image_hero'] = $actorImageMappings[$actorstr]['hero'];
                        }
                        else {
                            //    Some heroes, for whatever reason, don't have a HeroIcon node in their CActorUnit, so try to
                            // find a Portrait for them in their CHero data
                            if (key_exists('Portrait', $j)
                                && key_exists(ATTR, $j['Portrait'])
                                && key_exists(V, $j['Portrait'][ATTR])) {
                                $hero['image_hero'] = extractImageString($j['Portrait'][ATTR][V], NOIMAGE);
                            }
                            else {
                                $hero['image_hero'] = NOIMAGE;
                            }
                        }
                        if (key_exists('minimap', $actorImageMappings[$actorstr]) && $actorImageMappings[$actorstr]['minimap'] !== NOIMAGE) {
                            $hero['image_minimap'] = $actorImageMappings[$actorstr]['minimap'];
                        }
                        else {
                            $hero['image_minimap'] = NOIMAGE;
                        }
                    }
                    else {
                        $hero['image_hero'] = NOIMAGE;
                        $hero['image_minimap'] = NOIMAGE;
                    }

                    //Ratings
                    $hero['ratings'] = [];
                    if (key_exists('Ratings', $j)) {
                        //Damage
                        if (key_exists('Damage', $j['Ratings'])) {
                            $hero['ratings']['damage'] = intval($j['Ratings']['Damage'][ATTR][V]);
                        }
                        else if (key_exists(ATTR, $j['Ratings']) && key_exists('Damage', $j['Ratings'][ATTR])) {
                            $hero['ratings']['damage'] = intval($j['Ratings'][ATTR]['Damage']);
                        }
                        else {
                            $hero['ratings']['damage'] = 0;
                        }
                        //Utility
                        if (key_exists('Utility', $j['Ratings'])) {
                            $hero['ratings']['utility'] = intval($j['Ratings']['Utility'][ATTR][V]);
                        }
                        else if (key_exists(ATTR, $j['Ratings']) && key_exists('Utility', $j['Ratings'][ATTR])) {
                            $hero['ratings']['utility'] = intval($j['Ratings'][ATTR]['Utility']);
                        }
                        else {
                            $hero['ratings']['utility'] = 0;
                        }
                        //Survivability
                        if (key_exists('Survivability', $j['Ratings'])) {
                            $hero['ratings']['survivability'] = intval($j['Ratings']['Survivability'][ATTR][V]);
                        }
                        else if (key_exists(ATTR, $j['Ratings']) && key_exists('Survivability', $j['Ratings'][ATTR])) {
                            $hero['ratings']['survivability'] = intval($j['Ratings'][ATTR]['Survivability']);
                        }
                        else {
                            $hero['ratings']['survivability'] = 0;
                        }
                        //Complexity
                        if (key_exists('Complexity', $j['Ratings'])) {
                            $hero['ratings']['complexity'] = intval($j['Ratings']['Complexity'][ATTR][V]);
                        }
                        else if (key_exists(ATTR, $j['Ratings']) && key_exists('Complexity', $j['Ratings'][ATTR])) {
                            $hero['ratings']['complexity'] = intval($j['Ratings'][ATTR]['Complexity']);
                        }
                        else {
                            $hero['ratings']['complexity'] = 0;
                        }
                    }
                    else {
                        //Ratings couldn't be found, default to 0
                        $hero['ratings']['damage'] = 0;
                        $hero['ratings']['utility'] = 0;
                        $hero['ratings']['survivability'] = 0;
                        $hero['ratings']['complexity'] = 0;
                    }

                    //Rarity
                    if (key_exists('Rarity', $j)) {
                        $hero['rarity'] = $j['Rarity'][ATTR][V];
                    }
                    else {
                        $hero['rarity'] = UNKNOWN;
                    }

                    //Abilities
                    $hero['abilities'] = [];
                    if (key_exists('HeroAbilArray', $j)) {
                        foreach ($j['HeroAbilArray'] as $ability) {
                            //Determine if valid ability
                            if (key_exists('Flags', $ability)) {
                                $isValidAbility = FALSE;
                                $heroic = FALSE;
                                $trait = FALSE;
                                foreach ($ability['Flags'] as $aflag) {
                                    if (key_exists(ATTR, $aflag)
                                    && key_exists(IDX, $aflag[ATTR])
                                    && key_exists(V, $aflag[ATTR])
                                    && intval($aflag[ATTR][V]) == 1) {
                                        if ($aflag[ATTR][IDX] == "ShowInHeroSelect") {
                                            $isValidAbility = TRUE;
                                        }
                                        else if ($aflag[ATTR][IDX] == "Heroic") {
                                            $heroic = TRUE;
                                        }
                                        else if ($aflag[ATTR][IDX] == "Trait") {
                                            $trait = TRUE;
                                        }
                                    }
                                }

                                if ($isValidAbility) {
                                    $a = [];

                                    $aname_internal = "";
                                    $aname_button = "";
                                    $haveButton = FALSE;
                                    $haveAbil = FALSE;

                                    if (key_exists('Abil', $ability[ATTR])) {
                                        $aname_internal = $ability[ATTR]['Abil'];
                                        $haveAbil = TRUE;
                                    }
                                    if (key_exists('Button', $ability[ATTR])) {
                                        $aname_button = $ability[ATTR]['Button'];
                                        $haveButton = TRUE;
                                    }

                                    //Commented out lines below enable {ability key > button key} precidence when they are uncommented
                                    $searchStr = $aname_internal;
                                    $searchPrefix = "Abil/Name/";
                                    $searchDefault = $aname_internal;
                                    if ($haveButton /*&& !$haveAbil*/) {
                                        $searchStr = $aname_button;
                                        $searchPrefix = "Button/Name/";
                                        /*if (strlen($searchDefault) == 0)*/ $searchDefault = $aname_button;
                                    }
                                    if (!$haveButton && !$haveAbil) {
                                        $a['name'] = UNKNOWN;
                                        $a['name_internal'] = UNKNOWN;
                                        $a['desc'] = NONE;
                                    }
                                    else {
                                        $backupDefault = $searchDefault;
                                        /*if ($haveButton && $haveAbil) {
                                            //Some older heroes don't have ability name keys and just have button name keys, account for that while still prefer ability key > button key
                                            $backupDefault = extractLine(array("Button/Name/"), $aname_button, $str2, $searchDefault);
                                        }*/

                                        if (key_exists($searchStr, $abilityNameExceptions)) {
                                            $a['name'] = $abilityNameExceptions[$searchStr];
                                        }
                                        else {
                                            $a['name'] = extractLine(array($searchPrefix), $searchStr, $str2, $backupDefault);
                                        }
                                        $a['name_internal'] = $searchDefault;
                                        $a['desc'] = extractLine(array("Button/SimpleDisplayText/", "Button/Simple/", "Button/Tooltip/"), $searchStr, $str2, NONE);
                                    }

                                    //Set image
                                    if (key_exists($searchStr, $buttonImageMappings)) {
                                        $a['image'] = $buttonImageMappings[$searchStr];
                                    }
                                    else {
                                        $a['image'] = NOIMAGE;
                                    }

                                    //Set ability type
                                    $abilityType = "";
                                    if ($heroic || $trait) {
                                        if ($heroic) {
                                            $abilityType .= "Heroic";
                                        }
                                        if ($trait) {
                                            $abilityType .= "Trait";
                                        }
                                    }
                                    else {
                                        $abilityType = "Normal";
                                    }
                                    $a['type'] = $abilityType;

                                    $hero['abilities'][] = $a;
                                }
                            }
                        }
                    }

                    //Talents
                    $hero['talents'] = [];
                    if (key_exists('TalentTreeArray', $j)) {
                        foreach ($j['TalentTreeArray'] as $talent) {
                            $t = [];
                            $tname_internal = $talent[ATTR]['Talent'];
                            $t['name'] = extractLine(array("Button/Name/"), $tname_internal, $str2, UNKNOWN, true);
                            $t['name_internal'] = $tname_internal;
                            $t['desc'] = extractLine(array("Button/SimpleDisplayText/", "Button/Simple/", "Button/Tooltip/"), $tname_internal, $str2, NONE, true);

                            //Add a period and a space between instances where the key 'Quest:' shows up right after a word with no spaces between them
                            $t['desc'] = preg_replace('/(.)Quest:/', '$1. Quest:', $t['desc']);

                            //Set image
                            if (key_exists($tname_internal, $talentMappings)
                                && key_exists(strval($talentMappings[$tname_internal]), $buttonImageMappings)) {
                                $t['image'] = $buttonImageMappings[strval($talentMappings[$tname_internal])];
                            }
                            else {
                                $t['image'] = NOIMAGE;
                            }

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
 * Look through Data directories and extract talent mappings, actor mappings, button mappings
 * (Necessary to do this before (and not in conjunction with) hero data
 * due to some legacy heroes sharing hero data in the old index, but only having talents/actors
 * (and not CHero data) in their new index.
 */
$tfp = __DIR__ . FILE_STORMDATA_OLDTALENTINDEX;
$afp = __DIR__ . FILE_STORMDATA_OLDACTORINDEX;
$bfp = __DIR__ . FILE_STORMDATA_OLDBUTTONINDEX;

//Extract old index
if (file_exists($tfp)) {
    extractTalents($tfp);
}
else {
    die("Old Talent Index File does not exist: " . $tfp);
}
if (file_exists($afp)) {
    extractActorImages($afp);
}
else {
    die("Old Actor Index File does not exist: " . $afp);
}
if (file_exists($bfp)) {
    extractButtonImages($bfp);
}
else {
    die("Old Button Index File does not exist: " . $bfp);
}

//Extract stormdata
foreach ($stormDataNames as $heroname => $bool_include) {
    if ($bool_include) {
        $fp = __DIR__ . PATH_STORMDATA_HEROES . $heroname . PATHFRAG_STORMDATA_HERO_DIR . $heroname . PATHFRAG_STORMDATA_HERO_DATA;

        if (file_exists($fp)) {
            extractTalents($fp);
            extractActorImages($fp);
            extractButtonImages($fp);
        }
        else {
            die("Storm Data File does not exist (for talents/actors): " . $fp);
        }
    }
}

$strfile = null; //Clear mem

//Extract heromods
foreach ($heromodsDataNames as $heroname => $bool_include) {
    if ($bool_include) {
        $strfile = null;

        if (key_exists($heroname, $heromodsDataNamesExceptions)) {
            //Special exception hero mods case
            $fp = __DIR__ . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . $heromodsDataNamesExceptions[$heroname];

            if (file_exists($fp)) {
                extractTalents($fp);
                extractActorImages($fp);
                extractButtonImages($fp);
            }
            else {
                die("Hero Mods Special Exception File does not exist (for talents/actors): " . $fp);
            }
        }
        else {
            //Regular hero mods case
            $fp1 = __DIR__ . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . PATHFRAG_HEROMODS_HERO_DATA1;
            $fp2 = __DIR__ . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . ucfirst($heroname) . PATHFRAG_HEROMODS_HERO_DATA2;

            //Extract talents from all files in case of weird splitting
            $readfile = FALSE;
            if (file_exists($fp1)) {
                extractTalents($fp1);
                extractActorImages($fp1);
                extractButtonImages($fp1);
                $readfile = TRUE;
            }
            if (file_exists($fp2)) {
                extractTalents($fp2);
                extractActorImages($fp2);
                extractButtonImages($fp2);
                $readfile = TRUE;
            }
            if (!$readfile) {
                die("Hero Mods Files do not exist at either location (for talents/actors): (" . $fp1 . ", " . $fp2 . ")");
            }
        }
    }
}

/*
 * Look through Data directories and extract hero data
 */
//Extract heroes from old hero index
$fp = __DIR__ . FILE_STORMDATA_OLDHEROINDEX;
$strfp = __DIR__ . FILE_STORMDATA_STRINGS_OLDHEROINDEX;
$strfile = null;

if (file_exists($strfp)) {
    $strfile = file_get_contents($strfp);
}
else {
    die("Old Hero Index String File does not exist: " . $strfp);
}

if (file_exists($fp)) {
    extractHero_xmlToJson($fp, $strfile);
}
else {
    die("Old Hero Index File does not exist: " . $fp);
}

//Extract stormdata (use same strings from old hero index)
foreach ($stormDataNames as $heroname => $bool_include) {
    if ($bool_include) {
        $fp = __DIR__ . PATH_STORMDATA_HEROES . $heroname . PATHFRAG_STORMDATA_HERO_DIR . $heroname . PATHFRAG_STORMDATA_HERO_DATA;

        if (file_exists($fp)) {
            extractHero_xmlToJson($fp, $strfile);
        }
        else {
            die("Storm Data File does not exist: " . $fp);
        }
    }
}

$strfile = null;

//Extract heromods
foreach ($heromodsDataNames as $heroname => $bool_include) {
    if ($bool_include) {
        $strfp = __DIR__ . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_STRINGS_DIR;

        $strfile = null;

        if (file_exists($strfp)) {
            $strfile = file_get_contents($strfp);
        }
        else {
            die("Hero Modes String File does not exist: " . $strfp);
        }

        if (key_exists($heroname, $heromodsDataNamesExceptions)) {
            //Special exception hero mods case
            $fp = __DIR__ . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . $heromodsDataNamesExceptions[$heroname];

            if (file_exists($fp)) {
                extractHero_xmlToJson($fp, $strfile);
            }
            else {
                die("Hero Mods Special Exception File does not exist: " . $fp);
            }
        }
        else {
            //Regular hero mods case
            $fp1 = __DIR__ . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . PATHFRAG_HEROMODS_HERO_DATA1;
            $fp2 = __DIR__ . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . ucfirst($heroname) . PATHFRAG_HEROMODS_HERO_DATA2;

            //Parse for CHero data, fp1 > fp2, so if hero was Alarak and he had
            // both a AlarakData.xml and a HeroData.xml, the HeroData.xml would take precedence
            // if it was $fp1 and would be parsed for the CHero data
            if (file_exists($fp1)) {
                extractHero_xmlToJson($fp1, $strfile);
            }
            else if (file_exists($fp2)) {
                extractHero_xmlToJson($fp2, $strfile);
            }
            else {
                die("Hero Mods Files do not exist at either location: (" . $fp1 . ", " . $fp2 . ")");
            }
        }
    }
}

function imageOutHelper($imagestr, $ext, &$imagearr) {
    if ($imagestr !== NOIMAGE) {
        $imagearr[] = $imagestr . $ext;
    }
}

/*
 * Command Line Process
 */
/*
 * The map of valid args to their expected additional arg count and closure
 * [{arg}] => [
 *      ['count'] => amount of additional arguments expected
 *      ['exec'] => the closure to execute, expects "count" amount of arguments
 * ]
 */
$validargs = [
    "--help" => [
        "count" => 0,
        "syntax" => "--help",
        "desc" => "Lists all available arguments.",
        "exec" => function (...$args) {
            global $validargs;

            echo 'List of Valid Arguments:'.E;

            foreach ($validargs as $varg) {
                echo '--------------------------------------------------------'.E;
                echo $varg['syntax'].E;
                echo $varg['desc'].E;
                echo '--------------------------------------------------------'.E;
            }
        }
    ],
    "--out" => [
        "count" => 1,
        "syntax" => "--out <json_output_filepath>",
        "desc" => "Outputs json formatted data to filepath, creating any subdirectories as needed.",
        "exec" => function (...$args) {
            global $global_json;

            if (count($args) == 1) {
                $fp = $args[0];

                $dir = dirname($fp);

                FileHandling::ensureDirectory($dir);

                $file = fopen($fp, "w") or die("Unable to create and write to file: " . $fp);
                fwrite($file, json_encode($global_json).E);
                fclose($file);
            }
            else {
                die("Invalid amount of arguments exception.");
            }
        }
    ],
    "--dbout" => [
        "count" => 0,
        "syntax" => "--dbout",
        "desc" => "Ensures all relevant data exists in the predefined database through a variety of operations.",
        "exec" => function (...$args) {

        }
    ],
    "--imageout" => [
        "count" => 2,
        "syntax" => "--imageout <image_output_filetype> <dds_image_input_dir> <image_output_dir>",
        "desc" => "Copies and converts relevant images in input_dir to images of output_filetype in output_dir. Creates subdirectories as needed. Requires ImageMagick utility to be installed and in system path.",
        "exec" => function (...$args) {
            global $global_json;

            if (count($args) == 3) {
                $imagetype = $args[0];
                $inputdir = $args[1];
                $outputdir = $args[2];

                //Ensure output dir
                FileHandling::ensureDirectory($outputdir);

                //Compile list of all relevant image strings, appending the sought after file extension
                $ext = ".dds";
                $images = [];

                foreach ($global_json['heroes'] as $hero) {
                    imageOutHelper($hero['image_hero'], $ext, $images);
                    imageOutHelper($hero['image_minimap'], $ext, $images);

                    foreach ($hero['abilities'] as $ability) {
                        imageOutHelper($ability['image'], $ext, $images);
                    }

                    foreach ($hero['talents'] as $talent) {
                        imageOutHelper($talent['image'], $ext, $images);
                    }
                }

                //Copy all relevant images to output dir before mogrifying them
                foreach ($images as $image) {
                    shell_exec('cp ' . $image . ' ' . $outputdir . $image . $ext);
                }

                //Mogrify all copied images, converting them to the appropriate filetype
                foreach ($images as $image) {
                    shell_exec('magick mogrify -format ' . $imagetype . ' ' . $outputdir . $image . $ext);
                }
            }
            else {
                die("Invalid amount of arguments exception.");
            }
        }
    ]
];

if ($argc == 1) {
    //Program ran with no optional arguments, just echo json data
    echo json_encode($global_json).E;
}
else if ($argc > 1) {
    $argcursor = 1;
    while ($argcursor < $argc) {
        //Get next optional argument
        $arg = $argv[$argcursor];

        if (key_exists($arg, $validargs)) {
            $varg = $validargs[$arg];

            //Figure out how many additional args we need before execution
            $addargs = $varg['count'];

            //Collect additional args
            $a = 0;
            $addargsarr = [];
            while ($a < $addargs) {
                $argcursor++;
                if ($argcursor >= $argc) {
                    //Ran out of supplied args
                    echo 'Invalid amount of arguments supplied for '. $arg . ', expected ' . $varg['count'] . '...'.E;
                    echo $varg['syntax'].E;
                    echo $varg['desc'].E;
                    die();
                }
                else {
                    $addargsarr[] = $argv[$argcursor];
                    $a++;
                }
            }

            //Execute optional argument
            $varg['exec'](...$addargsarr);
        }
        else {
            //Invalid optional argument, execute --help
            echo 'Invalid argument supplied: ' . $arg .E;
            $validargs['--help']['exec']();
            die();
        }

        $argcursor++;
    }
}