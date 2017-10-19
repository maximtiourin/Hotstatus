<?php

namespace Fizzik;

require_once 'includes/include.php';

use Fizzik\Database\RedisDatabase;
use Fizzik\Utility\FileHandling;
use Fizzik\Database\MySqlDatabase;
use MongoDB\GridFS\ReadableStream;

set_time_limit(0);
date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);

$timestart = microtime(true);
$dataparsed = FALSE;

//Database credentials for use with --dbout command line argument
$creds = Credentials::getReplayProcessCredentials();
$database_credentials = [
    "hostname" => $creds[Credentials::KEY_DB_HOSTNAME],
    "user" => $creds[Credentials::KEY_DB_USER],
    "password" => $creds[Credentials::KEY_DB_PASSWORD],
    "database" => $creds[Credentials::KEY_DB_DATABASE],
    "redis" => $creds[Credentials::KEY_REDIS_URI]
];

//The json array that holds all of the heroes
$global_json = [];
$global_json['build'] = 0;
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
const PATH_DATA = "/data/heroesdata/";
//Buildata
const FILE_BUILDDATA = "mods/core.stormmod/base.stormdata/BuildId.txt";
//Mapdata
const FILE_MAPDATA = "/data/maps.json";
//Stormdata
const PATH_STORMDATA = "mods/heroesdata.stormmod/base.stormdata/GameData/";
const PATH_STORMDATA_STRINGS = "mods/heroesdata.stormmod/enus.stormdata/LocalizedData/";
const PATH_STORMDATA_HEROES = PATH_STORMDATA . "Heroes/";
const PATHFRAG_STORMDATA_HERO_DIR = "Data/";
const PATHFRAG_STORMDATA_HERO_DATA = "Data.xml";
const FILE_STORMDATA_OLDHEROINDEX = PATH_STORMDATA . "HeroData.xml";
const FILE_STORMDATA_OLDTALENTINDEX = PATH_STORMDATA . "TalentData.xml";
const FILE_STORMDATA_OLDACTORINDEX = PATH_STORMDATA . "ActorData.xml";
const FILE_STORMDATA_OLDBUTTONINDEX = PATH_STORMDATA . "ButtonData.xml";
const FILE_STORMDATA_STRINGS_OLDHEROINDEX = PATH_STORMDATA_STRINGS . "GameStrings.txt";
//Heromods
const PATH_HEROMODS = "mods/heromods/";
const PATHFRAG_HEROMODS_HERO_DIR = ".stormmod/base.stormdata/GameData/";
const PATHFRAG_HEROMODS_HERO_STRINGS_DIR = ".stormmod/enus.stormdata/LocalizedData/GameStrings.txt";
const PATHFRAG_HEROMODS_HERO_DATA1 = "HeroData.xml";
const PATHFRAG_HEROMODS_HERO_DATA2 = "Data.xml";
//Images
const PATH_TEXTURES = "mods/heroes.stormmod/base.stormassets/Assets/Textures/";


/*
 * What stormdata heroes to check (Not all *Data.xml files will have <CHero>, but that shouldnt be a problem)
 */
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
    "junkrat" => TRUE,
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
 *
 * If explicitly defining a mapping, remember to encode it in htmlspecialchars
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
    ],
    "HeroMedivh" => [
        "hero" => "ui_targetportrait_hero_medivh"
    ]
];

/*
 * Map is populated of mappings of GameString button key => image name without extension
 */
$buttonImageMappings = [];

/*
 * Map is populated of mappings of
 * ['AWARD ID'] => [
 *      'name' => "AWARD NAME",
 *      'desc' => "AWARD DESCRIPTION"
 * ]
 *
 * if a field of a mapping is stated explicitly here, its values wont be overwritten
 */
$awardMappings = [
    "MostTimeOnPoint" => [
        "desc" => "High Time on Point"
    ]
];

/*
 * List of award ids to ignore
 */
$awardMappingsExceptions = [
    "BooleanValue" => TRUE,
    "GivenToNonwinner" => TRUE,
    "MapSpecific" => TRUE
];

/*
 * Custom Role Mappings for Heroes, if an internal named hero isn't defined here, the const UNKNOWN will be used for their custom role
 */
const CROLE_HEALER = "Healer";
const CROLE_UTILITY = "Utility";
const CROLE_SIEGE = "Siege";
const CROLE_SUPPORT = "Support";
const CROLE_DMG_SUSTAIN = "Sustained Damage";
const CROLE_DMG_BURST = "Burst Damage";
const CROLE_DMG_AMBUSHER = "Ambusher";
const CROLE_TANK = "Tank";
const CROLE_BRUISER = "Bruiser";
$heroCustomRoleMappings = [
    "Abathur" => CROLE_UTILITY,
    "Alarak" => CROLE_DMG_AMBUSHER,
    "Ana" => CROLE_HEALER,
    "Anubarak" => CROLE_TANK, //Anub'arak
    "Artanis" => CROLE_BRUISER,
    "Arthas" => CROLE_BRUISER,
    "Auriel" => CROLE_HEALER,
    "Azmodan" => CROLE_SIEGE,
    "FaerieDragon" => CROLE_HEALER, //Brightwing
    "Amazon" => CROLE_DMG_SUSTAIN, //Cassia
    "Chen" => CROLE_BRUISER,
    "Cho" => CROLE_TANK,
    "Chromie" => CROLE_DMG_BURST,
    "DVa" => CROLE_TANK, //D.Va
    "Dehaka" => CROLE_BRUISER,
    "Diablo" => CROLE_TANK,
    "L90ETC" => CROLE_TANK, //E.T.C.
    "Falstad" => CROLE_DMG_SUSTAIN,
    "Gall" => CROLE_DMG_SUSTAIN,
    "Garrosh" => CROLE_TANK,
    "Tinker" => CROLE_SIEGE, //Gazlowe
    "Genji" => CROLE_DMG_SUSTAIN,
    "Greymane" => CROLE_DMG_SUSTAIN,
    "Guldan" => CROLE_DMG_SUSTAIN, //Gul'dan
    "Illidan" => CROLE_DMG_SUSTAIN,
    "Jaina" => CROLE_DMG_BURST,
    "Crusader" => CROLE_TANK, //Johanna
    "Junkrat" => CROLE_DMG_BURST,
    "Kaelthas" => CROLE_DMG_BURST, //Kael'thas
    "KelThuzad" => CROLE_DMG_BURST, //Kel'Thuzad
    "Kerrigan" => CROLE_DMG_AMBUSHER,
    "Monk" => CROLE_HEALER, //Kharazim
    "Leoric" => CROLE_BRUISER,
    "LiLi" => CROLE_HEALER,
    "Wizard" => CROLE_DMG_BURST, //Li-Ming
    "Medic" => CROLE_HEALER, //Lt. Morales
    "Lucio" => CROLE_HEALER, //Lúcio
    "Dryad" => CROLE_DMG_SUSTAIN, //Lunara
    "Malfurion" => CROLE_HEALER,
    "Malthael" => CROLE_DMG_SUSTAIN,
    "Medivh" => CROLE_SUPPORT,
    "Muradin" => CROLE_TANK,
    "Murky" => CROLE_UTILITY,
    "WitchDoctor" => CROLE_DMG_SUSTAIN, //Nazeebo
    "Nova" => CROLE_DMG_AMBUSHER,
    "Probius" => CROLE_SIEGE,
    "Ragnaros" => CROLE_DMG_SUSTAIN,
    "Raynor" => CROLE_DMG_SUSTAIN,
    "Rehgar" => CROLE_HEALER,
    "Rexxar" => CROLE_TANK,
    "Samuro" => CROLE_DMG_AMBUSHER,
    "SgtHammer" => CROLE_SIEGE, //Sgt. Hammer
    "Barbarian" => CROLE_BRUISER, //Sonya
    "Stitches" => CROLE_TANK,
    "Stukov" => CROLE_HEALER,
    "Sylvanas" => CROLE_SIEGE,
    "Tassadar" => CROLE_SUPPORT,
    "Butcher" => CROLE_DMG_AMBUSHER, //The Butcher
    "LostVikings" => CROLE_UTILITY, //The Lost Vikings
    "Thrall" => CROLE_DMG_SUSTAIN,
    "Tracer" => CROLE_DMG_SUSTAIN,
    "Tychus" => CROLE_DMG_SUSTAIN,
    "Tyrael" => CROLE_BRUISER,
    "Tyrande" => CROLE_SUPPORT,
    "Uther" => CROLE_HEALER,
    "Valeera" => CROLE_DMG_AMBUSHER,
    "DemonHunter" => CROLE_DMG_SUSTAIN, //Valla
    "Varian" => CROLE_BRUISER,
    "Necromancer" => CROLE_SIEGE, //Xul
    "Zagara" => CROLE_SIEGE,
    "Zarya" => CROLE_TANK,
    "Zeratul" => CROLE_DMG_AMBUSHER,
    "Zuljin" => CROLE_DMG_SUSTAIN
];

/*
 * If a hero internal name is defined here, then their mapped value will be used as their sorting name rather than being parsing the sorting name.
 * Useful is a sorting name is non-ideal, ie: Lucio => Lcio
 */
$heroCustomSortMappings = [
    "Lucio" => "Lucio",
    "Cho" => "Cho",
    "Gall" => "Gall"
];

//Extracts the image name without extension from a dds image string while converting it to lowercase, default value case is not touched
//Also encodes the string in htmlspecialchars w/ ENT_QUOTES, so it must be decoded before being displayed as plaintext, and for commandline use it must be decoded and then escaped with escapeshellarg()
function extractImageString($str, $default = "") {
    $arr = [];
    $ret = preg_match("@([a-zA-Z0-9_'-]+)\.dds@", $str, $arr);

    if ($ret == 1) {
        $escapestr = $arr[1];
        $escapestr = htmlspecialchars($escapestr, ENT_QUOTES);
        return strtolower($escapestr);
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

function extractBuild($filepath) {
    global $global_json;

    $filelines = file($filepath);

    $buildline = $filelines[0];
    $build = str_replace("BB", "", $buildline);

    $global_json['build'] = intval($build);
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

function extractAwards(&$file_strings) {
    global $awardMappings, $awardMappingsExceptions;

    $str = $file_strings; //Line seperated localization strings

    /* Look through GameStrings to find valid award strings to extract the award name and description */

    //Award Ids to Award Names
    $res = [];
    $ret = preg_match_all('@ScoreValue/Name/EndOfMatchAward(.*?)(?:Boolean)?=(?:.*?>)?(.*?)(?:,.*)?(?:<.*$|$)@m', $str, $res);

    if ($ret !== FALSE) {
        for ($i = 0; $i < count($res[0]); $i++) {
            $awardid = $res[1][$i];
            $awardname = $res[2][$i];

            if (!key_exists($awardid, $awardMappingsExceptions)) {
                if (!key_exists($awardid, $awardMappings)) $awardMappings[$awardid] = [];
                if (!key_exists('name', $awardMappings[$awardid])) $awardMappings[$awardid]['name'] = $awardname;
            }
        }
    }

    //Award Ids to Award Descrptions
    $res = [];
    $ret = preg_match_all('@ScoreValue/Tooltip/EndOfMatchAward(.*?)(?:Boolean)?=(.*)$@m', $str, $res);

    if ($ret !== FALSE) {
        for ($i = 0; $i < count($res[0]); $i++) {
            $awardid = $res[1][$i];
            $awarddesc = $res[2][$i];

            if (!key_exists($awardid, $awardMappingsExceptions)) {
                if (!key_exists($awardid, $awardMappings)) $awardMappings[$awardid] = [];
                if (!key_exists('desc', $awardMappings[$awardid])) $awardMappings[$awardid]['desc'] = $awarddesc;
            }
        }
    }

    //Go through all valid award ids found and enter default values as necessary
    foreach ($awardMappings as &$award) {
        if (!key_exists('name', $award)) $award['name'] = UNKNOWN;
        if (!key_exists('desc', $award)) $award['desc'] = NONE;
    }
}

function extractHero_xmlToJson($filepath, &$file_strings) {
    global $ignoreNames, $global_json, $heroCustomRoleMappings, $heroCustomSortMappings, $abilityNameExceptions, $talentMappings, $actorImageMappings, $buttonImageMappings;

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
                    if (key_exists($name_internal, $heroCustomSortMappings)) {
                        $hero['name_sort'] = $heroCustomSortMappings[$name_internal];
                    }
                    else {
                        $hero['name_sort'] = extractLine(array("Hero/SortName/"), $name_internal, $str2, extractURLFriendlyProperName($hero['name']));
                    }

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
                    //Map Role 'Damage' to 'Assassin' for proper role name
                    if ($hero['role'] === 'Damage') $hero['role'] = 'Assassin';

                    //Custom Role
                    if (key_exists($name_internal, $heroCustomRoleMappings)) {
                        $hero['role_custom'] = $heroCustomRoleMappings[$name_internal];
                    }
                    else {
                        $hero['role_custom'] = UNKNOWN;
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
                    $hero['desc_tagline'] = htmlspecialchars(extractLine(array("Hero/Description/"), $name_internal, $str2, NONE), ENT_COMPAT);

                    //Description Bio
                    $hero['desc_bio'] = htmlspecialchars(extractLine(array("Hero/Info/"), $name_internal, $str2, NONE), ENT_COMPAT);

                    /*
                     * Image strings
                     */
                    $actorstr = "Hero" . $name_internal;
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
                                && key_exists(V, $j['Portrait'][ATTR])
                            ) {
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
                                        && intval($aflag[ATTR][V]) == 1
                                    ) {
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
                                        /*if (strlen($searchDefault) == 0)*/
                                        $searchDefault = $aname_button;
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
                                && key_exists(strval($talentMappings[$tname_internal]), $buttonImageMappings)
                            ) {
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
function extractData() {
    global $timestart, $timeend, $timediff, $dataparsed, $stormDataNames, $heromodsDataNames, $heromodsDataNamesExceptions;

    //Extract build id
    $buildfp = __DIR__ . PATH_DATA . FILE_BUILDDATA;
    if (file_exists($buildfp)) {
        extractBuild($buildfp);
    }
    else {
        die("Build file does not exist: " . $buildfp);
    }

    $tfp = __DIR__ . PATH_DATA . FILE_STORMDATA_OLDTALENTINDEX;
    $afp = __DIR__ . PATH_DATA . FILE_STORMDATA_OLDACTORINDEX;
    $bfp = __DIR__ . PATH_DATA . FILE_STORMDATA_OLDBUTTONINDEX;

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
            $fp = __DIR__ . PATH_DATA . PATH_STORMDATA_HEROES . $heroname . PATHFRAG_STORMDATA_HERO_DIR . $heroname . PATHFRAG_STORMDATA_HERO_DATA;

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
                $fp = __DIR__ . PATH_DATA . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . $heromodsDataNamesExceptions[$heroname];

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
                $fp1 = __DIR__ . PATH_DATA . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . PATHFRAG_HEROMODS_HERO_DATA1;
                $fp2 = __DIR__ . PATH_DATA . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . ucfirst($heroname) . PATHFRAG_HEROMODS_HERO_DATA2;

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
    $fp = __DIR__ . PATH_DATA . FILE_STORMDATA_OLDHEROINDEX;
    $strfp = __DIR__ . PATH_DATA . FILE_STORMDATA_STRINGS_OLDHEROINDEX;
    $strfile = null;

    if (file_exists($strfp)) {
        $strfile = file_get_contents($strfp);
    }
    else {
        die("Old Hero Index String File does not exist: " . $strfp);
    }

    //Extract Award Information
    extractAwards($strfile);

    if (file_exists($fp)) {
        extractHero_xmlToJson($fp, $strfile);
    }
    else {
        die("Old Hero Index File does not exist: " . $fp);
    }

    //Extract stormdata (use same strings from old hero index)
    foreach ($stormDataNames as $heroname => $bool_include) {
        if ($bool_include) {
            $fp = __DIR__ . PATH_DATA . PATH_STORMDATA_HEROES . $heroname . PATHFRAG_STORMDATA_HERO_DIR . $heroname . PATHFRAG_STORMDATA_HERO_DATA;

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
            $strfp = __DIR__ . PATH_DATA . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_STRINGS_DIR;

            $strfile = null;

            if (file_exists($strfp)) {
                $strfile = file_get_contents($strfp);
            }
            else {
                die("Hero Modes String File does not exist: " . $strfp);
            }

            if (key_exists($heroname, $heromodsDataNamesExceptions)) {
                //Special exception hero mods case
                $fp = __DIR__ . PATH_DATA . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . $heromodsDataNamesExceptions[$heroname];

                if (file_exists($fp)) {
                    extractHero_xmlToJson($fp, $strfile);
                }
                else {
                    die("Hero Mods Special Exception File does not exist: " . $fp);
                }
            }
            else {
                //Regular hero mods case
                $fp1 = __DIR__ . PATH_DATA . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . PATHFRAG_HEROMODS_HERO_DATA1;
                $fp2 = __DIR__ . PATH_DATA . PATH_HEROMODS . $heroname . PATHFRAG_HEROMODS_HERO_DIR . ucfirst($heroname) . PATHFRAG_HEROMODS_HERO_DATA2;

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

    $timeend = microtime(true);
    $timediff = round(($timeend - $timestart) * 1000) / 1000.0;
    $dataparsed = TRUE;
}

function listfileImagesHelper($imagestr, &$imagearr) {
    if ($imagestr !== NOIMAGE) {
        $imagearr[htmlspecialchars_decode($imagestr, ENT_QUOTES)] = TRUE;
    }
}

function imageOutHelper($imagestr, &$imagearr) {
    if ($imagestr !== NOIMAGE) {
        $imagearr[$imagestr] = TRUE;
    }
}

function imageOutDirectoryHelper($dir) {
    $dirext = "/";

    $len = strlen($dir);
    if ($len > 0) {
        $idx = $len - 1;

        $lastchar = substr($dir, $idx, $idx);

        if ($lastchar !== $dirext) {
            return $dir . $dirext;
        }
    }

    return $dir;
}

/*
 * Command Line Process
 */
/*
 * The map of valid args to their expected additional arg count and closure
 *
 * All valid args are gauranteed to have the atleast following key/value pairs
 * [{arg}] => [
 *      ['count'] => amount of additional arguments expected
 *      ['shouldExtract'] => whether or not this argument requires data extraction beforehand
 *      ['syntax'] => example syntax of using the argument properly
 *      ['desc'] => description of what the argument does and how to properly use it
 *      ['exec'] => the closure to execute, expects "count" amount of arguments
 * ]
 */
$validargs = [
    "--help" => [
        "count" => 0,
        "shouldExtract" => FALSE,
        "syntax" => "--help",
        "desc" => "Lists all available arguments.",
        "exec" => function (...$args) {
            global $validargs;

            echo 'List of Valid Arguments:' . E;

            foreach ($validargs as $varg) {
                echo '--------------------------------------------------------' . E;
                echo $varg['syntax'] . E;
                echo $varg['desc'] . E;
                echo '--------------------------------------------------------' . E;
            }
        }
    ],
    "--log" => [
        "count" => 1,
        "enabled" => FALSE,
        "shouldExtract" => FALSE,
        "file" => "",
        "syntax" => "--log <log_output_filepath>",
        "desc" => "Logs relevant output from other arguments to filepath. This argument must precede any arguments where logging is desired.",
        "exec" => function (...$args) {
            global $dataparsed, $validargs, $timestart, $timeend, $timediff;

            if (count($args) == 1) {
                $varg = &$validargs['--log'];

                $fp = $args[0];

                $dir = dirname($fp);

                FileHandling::ensureDirectory($dir);

                $file = fopen($fp, "a") or die("Unable to create and write to log file: " . $fp);

                //Write initial timestamp lines and general execution info to help keep track of separate execution logs
                $initstr = "[" . date('Y:m:d H:i:s') . "] Log Append: " . E . E;
                if ($dataparsed) $initstr .= "Heroes of the Storm Data was parsed in " . $timediff . " seconds." . E . E;

                fwrite($file, $initstr);

                $varg['file'] = $file;
                $varg['enabled'] = TRUE;
            }
            else {
                die("Invalid amount of arguments exception.");
            }
        },
        "log" => function ($str) {
            global $validargs;

            $varg = &$validargs['--log'];

            if ($varg['enabled']) {
                $file = $varg['file'];

                fwrite($file, $str . E);
            }
        }
    ],
    "--listfile" => [
        "count" => 2,
        "shouldExtract" => FALSE,
        "syntax" => "--listfile --mode=[heroes]^[images] <listfile_output_path>",
        "desc" => "Outputs a listfile of the given type to the output_path. Creates subdirectories as needed.\n\nMode Options [Required to specify]:\n\n"
            . "[heroes] : --mode=heroes : will output a listfile containing the casc paths of all relevant hero data.\n"
            . "[images] : --mode=images : will output a listfile containing the casc paths of all relevant images, requires parsing previously extracted hero data to do so.\n",
        "exec" => function (...$args) {
            global $global_json, $validargs, $stormDataNames, $heromodsDataNames, $heromodsDataNamesExceptions;

            if (count($args) == 2) {
                //Init logging info
                $log = $validargs['--log']['log'];

                //Begin execution
                $mode = $args[0];
                $fp = $args[1];

                //Determine mode
                $mstr = "--mode=";
                $m_heroes = FALSE;
                $m_images = FALSE;
                if ($mode === $mstr . "heroes") {
                    $m_heroes = TRUE;
                }
                else if ($mode === $mstr . "images") {
                    $m_images = TRUE;
                }
                else {
                    die("Invalid mode argument.");
                }

                $dir = dirname($fp);

                if ($m_heroes) {
                    //Compile list of all possible casc paths for relevant hero data
                    $lfile = "";

                    //Old Index Herodata + Strings
                    $lfile .= FILE_STORMDATA_OLDHEROINDEX.E;
                    $lfile .= FILE_STORMDATA_OLDTALENTINDEX.E;
                    $lfile .= FILE_STORMDATA_OLDACTORINDEX.E;
                    $lfile .= FILE_STORMDATA_OLDBUTTONINDEX.E;
                    $lfile .= FILE_STORMDATA_STRINGS_OLDHEROINDEX.E;

                    //Stormdata Herodata
                    foreach ($stormDataNames as $name => $include) {
                        if ($include) {
                            $path = PATH_STORMDATA_HEROES . $name . PATHFRAG_STORMDATA_HERO_DIR . $name . PATHFRAG_STORMDATA_HERO_DATA;
                            $lfile .= $path . E;
                        }
                    }

                    //Heromods Herodata (Include exceptions and all file fragments)
                    foreach ($heromodsDataNames as $name => $include) {
                        if ($include) {
                            $strpath = PATH_HEROMODS . $name . PATHFRAG_HEROMODS_HERO_STRINGS_DIR;

                            $lfile .= $strpath.E;

                            $bpath = PATH_HEROMODS . $name . PATHFRAG_HEROMODS_HERO_DIR;

                            if (key_exists($name, $heromodsDataNamesExceptions)) {
                                $path = $bpath . $heromodsDataNamesExceptions[$name];
                                $lfile .= $path.E;
                            }
                            else {
                                $path1 = $bpath . PATHFRAG_HEROMODS_HERO_DATA1;
                                $path2 = $bpath . ucfirst($name) . PATHFRAG_HEROMODS_HERO_DATA2;

                                $lfile .= $path1.E;
                                $lfile .= $path2.E;
                            }
                        }
                    }

                    //Replace all '/' with '\' in order to match casc paths
                    $lfile = preg_replace("@/@", "\\", $lfile);

                    //Ensure directory
                    FileHandling::ensureDirectory($dir);

                    //Write out listfile
                    $file = fopen($fp, "w") or die("Unable to create and write to file: " . $fp);
                    $res = fwrite($file, $lfile);
                    fclose($file);

                    if ($res !== FALSE) {
                        $log("[--listfile $mode] Successfully created heroes listfile: $fp".E);
                    }
                    else {
                        $log("[--listfile $mode] ERROR: Could not create heroes listfile: $fp".E);
                    }
                }
                else if ($m_images) {
                    //Extract data in order to get image strings
                    extractData();

                    //Compile list of all relevant image strings
                    $ext = ".dds";
                    $images = []; //Map of unique image keys => TRUE

                    $i = 1;
                    foreach ($global_json['heroes'] as $hero) {
                        listfileImagesHelper($hero['image_hero'], $images);
                        listfileImagesHelper($hero['image_minimap'], $images);

                        foreach ($hero['abilities'] as $ability) {
                            listfileImagesHelper($ability['image'], $images);
                        }

                        foreach ($hero['talents'] as $talent) {
                            listfileImagesHelper($talent['image'], $images);
                        }

                        $i++;
                    }

                    //Compile list of all casc paths for relevant images
                    $lfile = "";

                    foreach ($images as $img => $nbool) {
                        $path = PATH_TEXTURES . $img . $ext;
                        $lfile .= $path.E;
                    }

                    //Replace all '/' with '\' in order to match casc paths
                    $lfile = preg_replace("@/@", "\\", $lfile);

                    //Ensure directory
                    FileHandling::ensureDirectory($dir);

                    //Write out listfile
                    $file = fopen($fp, "w") or die("Unable to create and write to file: " . $fp);
                    $res = fwrite($file, $lfile);
                    fclose($file);

                    if ($res !== FALSE) {
                        $log("[--listfile $mode] Successfully created images listfile: $fp".E);
                    }
                    else {
                        $log("[--listfile $mode] ERROR: Could not create images listfile: $fp".E);
                    }
                }
            }
            else {
                die("Invalid amount of arguments exception.");
            }
        }
    ],
    "--out" => [
        "count" => 1,
        "shouldExtract" => TRUE,
        "syntax" => "--out <json_output_filepath>",
        "desc" => "Outputs json formatted data to filepath, creating any subdirectories as needed.",
        "exec" => function (...$args) {
            global $global_json, $validargs;

            if (count($args) == 1) {
                //Init logging info
                $logging = $validargs['--log']['enabled'];
                $log = $validargs['--log']['log'];

                //Begin execution
                $fp = $args[0];

                $dir = dirname($fp);

                //Ensure directory
                FileHandling::ensureDirectory($dir);

                //If logging, track diff between same filenames
                $d_old_s = "<~@OLD@~>"; //old diff start sep
                $d_old_e = "</~@OLD@~>"; //old diff end sep
                $d_new_s = "<~@NEW@~>"; //new diff start sep
                $d_new_e = "</~@NEW@~>"; //new diff end sep
                $copysuffix = "-copy-" . time(); //Get temp suffix for copy
                $copypath = $fp . $copysuffix;
                $path1 = escapeshellarg($fp);
                $path2 = escapeshellarg($copypath);
                $copied = FALSE;
                if ($logging) {
                    if (file_exists($fp)) {
                        //File already exists, copy old version and then log the diff between the old and the new.
                        shell_exec("cp $path1 $copypath");
                        $copied = TRUE;
                    }
                }

                //Write out file
                $file = fopen($fp, "w") or die("Unable to create and write to file: " . $fp);
                $res = fwrite($file, json_encode($global_json) . E);
                fclose($file);

                if ($res !== FALSE) {
                    $log("[--out] Successfully Wrote JSON to file: $fp".E);
                }
                else {
                    $log("[--out] ERROR: Could not write JSON to file: $fp".E);
                }

                //If were tracking diff, perform the actual diff operations
                if ($res !== FALSE && $copied) {
                    //Get diff
                    $diff = shell_exec('wdiff -3 -w"' . $d_old_s . '" -x"' . $d_old_e . '" -y"' . $d_new_s . '" -z"' . $d_new_e . '" ' . $path2 . ' ' . $path1);

                    //Match all diff results
                    $arr = [];
                    $dres = preg_match_all("#$d_old_s.*$d_new_e#", $diff, $arr);

                    //Check if we found atleast one diff result
                    if ($dres !== FALSE && $dres > 0) {
                        $log("[--out] Found diff between old and new: " . E);

                        //Loop through diff results in order to log them
                        $diffoutersep = "===================================================================";
                        $diffsep = "-------------------------------------------------------------------";
                        $logstr = $diffoutersep . E;
                        foreach ($arr[0] as $result) {
                            $logstr .= $diffsep . E;

                            //Old diff
                            $oldarr = [];
                            $oldres = preg_match("#$d_old_s(.*)$d_old_e#", $result, $oldarr);

                            if ($oldres == 1) {
                                $str = $oldarr[1];
                                $logstr .= $str . E;
                            }

                            //New diff
                            $newarr = [];
                            $newres = preg_match("#$d_new_s(.*)$d_new_e#", $result, $newarr);

                            if ($newres == 1) {
                                $str = $newarr[1];
                                $logstr .= $str . E;
                            }

                            $logstr .= $diffsep . E;
                        }
                        $logstr .= $diffoutersep . E . E;

                        $log($logstr);
                    }

                    //Cleanup and remove copy
                    FileHandling::deleteFileOrDirectoryAndItsContents($copypath);
                }
            }
            else {
                die("Invalid amount of arguments exception.");
            }
        }
    ],
    "--dbout" => [
        "count" => 1,
        "shouldExtract" => TRUE,
        "syntax" => "--dbout --mode=[clean]^[upsert]",
        "desc" => "Ensures all relevant data exists in the predefined database through a variety of operations.\nWill invalidate cached requests that make use of relevant data.\n\nMode Options [Required to specify]:\n\n"
            . "[clean] : --mode=clean : Clears all herodata in the database before updating it with newly parsed data. Should really only be used for development.\n"
            . "[upsert] : --mode=upsert : Attempts to insert newly parsed data to the database, if unique keys already exist for that data, only non-unique fields are updated.\n",
        "exec" => function (...$args) {
            global $validargs, $database_credentials, $global_json, $awardMappings;

            if (count($args) == 1) {
                //Init logging info
                $log = $validargs['--log']['log'];

                //Begin Execution
                $mode = $args[0];

                //Determine mode
                $mstr = "--mode=";
                $m_clean = FALSE;
                $m_upsert = FALSE;
                if ($mode === $mstr . "clean") {
                    $m_clean = TRUE;
                }
                else if ($mode === $mstr . "upsert") {
                    $m_upsert = TRUE;
                }
                else {
                    die("Invalid mode argument.");
                }

                //Setup and connext to database
                $db = new MysqlDatabase();
                $db->connect($database_credentials['hostname'], $database_credentials['user'], $database_credentials['password'], $database_credentials['database']);
                $db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

                /*
                 * Prepare statements
                 */
                // UpsertHero
                $db->prepare("UpsertHero",
                    "INSERT INTO herodata_heroes "
                . "(name, name_internal, name_sort, name_attribute, difficulty, role_blizzard, role_specific, universe, title, desc_tagline, desc_bio, rarity, image_hero, image_minimap, rating_damage, rating_utility, rating_survivability, rating_complexity) "
                . "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
                . "ON DUPLICATE KEY UPDATE "
                . "name_internal = VALUES(name_internal), name_sort = VALUES(name_sort), name_attribute = VALUES(name_attribute), difficulty = VALUES(difficulty), "
                . "role_blizzard = VALUES(role_blizzard), role_specific = VALUES(role_specific), universe = VALUES(universe), title = VALUES(title), desc_tagline = VALUES(desc_tagline), "
                . "desc_bio = VALUES(desc_bio), rarity = VALUES(rarity), image_hero = VALUES(image_hero), image_minimap = VALUES(image_minimap), rating_damage = VALUES(rating_damage), "
                . "rating_utility = VALUES(rating_utility), rating_survivability = VALUES(rating_survivability), rating_complexity = VALUES(rating_complexity)");
                $db->bind("UpsertHero",
                    "ssssssssssssssiiii",
                    $r_name, $r_name_internal, $r_name_sort, $r_name_attribute, $r_difficulty, $r_role_blizzard, $r_role_specific, $r_universe, $r_title, $r_desc_tagline,
                    $r_desc_bio, $r_rarity, $r_image_hero, $r_image_minimap, $r_rating_damage, $r_rating_utility, $r_rating_survivability, $r_rating_complexity);

                // UpsertAbility
                $db->prepare("UpsertAbility",
                    "INSERT INTO herodata_abilities "
                    . "(hero, name, name_internal, desc_simple, image, type) "
                    . "VALUES (?, ?, ?, ?, ?, ?) "
                    . "ON DUPLICATE KEY UPDATE "
                    . "name = VALUES(name), desc_simple = VALUES(desc_simple), image = VALUES(image), type = VALUES(type)");
                $db->bind("UpsertAbility",
                    "ssssss",
                    $r_hero, $r_name, $r_name_internal, $r_desc_simple, $r_image, $r_type);

                // UpsertTalent
                $db->prepare("UpsertTalent",
                    "INSERT INTO herodata_talents "
                    . "(hero, name, name_internal, desc_simple, image, tier_row, tier_column) "
                    . "VALUES (?, ?, ?, ?, ?, ?, ?) "
                    . "ON DUPLICATE KEY UPDATE "
                    . "name = VALUES(name), desc_simple = VALUES(desc_simple), image = VALUES(image), tier_row = VALUES(tier_row), tier_column = VALUES(tier_column)");
                $db->bind("UpsertTalent",
                    "sssssii",
                    $r_hero, $r_name, $r_name_internal, $r_desc_simple, $r_image, $r_tier_row, $r_tier_column);
                // UpsertMap
                $db->prepare("UpsertMap",
                    "INSERT INTO herodata_maps "
                    . "(name, name_sort) "
                    . "VALUES (?, ?) "
                    . "ON DUPLICATE KEY UPDATE "
                    . "name_sort = VALUES(name_sort)");
                $db->bind("UpsertMap",
                    "ss",
                    $r_name, $r_name_sort);
                // UpsertAward
                $db->prepare("UpsertAward",
                    "INSERT INTO herodata_awards "
                    . "(id, name, desc_simple) "
                    . "VALUES (?, ?, ?) "
                    . "ON DUPLICATE KEY UPDATE "
                    . "name = VALUES(name), desc_simple = VALUES(desc_simple)");
                $db->bind("UpsertAward",
                    "sss",
                    $r_id, $r_name, $r_desc_simple);

                /*
                 * Empty tables if specified
                 */
                if ($m_clean) {
                    $db->query("TRUNCATE TABLE herodata_talents");
                    $db->query("TRUNCATE TABLE herodata_abilities");
                    $db->query("TRUNCATE TABLE herodata_heroes");
                    $db->query("TRUNCATE TABLE herodata_maps");
                    $db->query("TRUNCATE TABLE herodata_awards");

                    $log("[--dbout $mode] Emptied herodata tables...");
                }

                /*
                 * Perform queries
                 */
                foreach ($global_json['heroes'] as $hero) {
                    //UpsertHero
                    $r_name = $hero['name'];
                    $r_name_internal = $hero['name_internal'];
                    $r_name_sort = $hero['name_sort'];
                    $r_name_attribute = $hero['attribute'];
                    $r_difficulty = $hero['difficulty'];
                    $r_role_blizzard = $hero['role'];
                    $r_role_specific = $hero['role_custom'];
                    $r_universe = $hero['universe'];
                    $r_title = $hero['title'];
                    $r_desc_tagline = $hero['desc_tagline'];
                    $r_desc_bio = $hero['desc_bio'];
                    $r_rarity = $hero['rarity'];
                    $r_image_hero = $hero['image_hero'];
                    $r_image_minimap = $hero['image_minimap'];

                    $ratings = $hero['ratings'];
                    $r_rating_damage = $ratings['damage'];
                    $r_rating_utility = $ratings['utility'];
                    $r_rating_survivability = $ratings['survivability'];
                    $r_rating_complexity = $ratings['complexity'];

                    $db->execute("UpsertHero");

                    //UpsertAbility
                    foreach ($hero['abilities'] as $ability) {
                        $r_hero = $hero['name'];
                        $r_name = $ability['name'];
                        $r_name_internal = $ability['name_internal'];
                        $r_desc_simple = $ability['desc'];
                        $r_image = $ability['image'];
                        $r_type = $ability['type'];

                        $db->execute("UpsertAbility");
                    }

                    //UpsertTalent
                    foreach ($hero['talents'] as $talent) {
                        $r_hero = $hero['name'];
                        $r_name = $talent['name'];
                        $r_name_internal = $talent['name_internal'];
                        $r_desc_simple = $talent['desc'];
                        $r_image = $talent['image'];
                        $r_tier_row = $talent['tier'];
                        $r_tier_column = $talent['column'];

                        $db->execute("UpsertTalent");
                    }
                }

                //Upsert Maps
                $filepath = __DIR__ . FILE_MAPDATA;
                if (file_exists($filepath)) {
                    $json = json_decode(file_get_contents($filepath), true);
                    foreach ($json as $map) {
                        $r_name = $map['PrimaryName'];
                        $r_name_sort = $map['ImageURL'];
                        $db->execute("UpsertMap");
                    }
                }
                else {
                    $log("[--dbout $mode] Could not find map data file (" . $filepath . ")...".E);
                }

                //Upsert Awards
                if (count($awardMappings) > 0) {
                    foreach ($awardMappings as $awardid => $award) {
                        $r_id = $awardid;
                        $r_name =$award['name'];
                        $r_desc_simple = $award['desc'];
                        $db->execute("UpsertAward");
                    }
                }
                else {
                    $log("[--dbout $mode] No award mappings were found...".E);
                }

                //Invalidate any cached requests that made use of data generated from this operation
                $redis = new RedisDatabase();
                $redis->connect($database_credentials['redis']);

                //Go through the cache requests to expire
                $redis->expire(HotstatusPipeline::CACHE_REQUEST_DATATABLE_HEROES_STATSLIST);

                $log("[--dbout $mode] Updated database with new herodata...".E);
            }
            else {
                die("Invalid amount of arguments exception.");
            }
        }
    ],
    "--imageout" => [
        "count" => 4,
        "shouldExtract" => TRUE,
        "syntax" => "--imageout <--mode=[append]^[overwrite]^[cleardir]> <image_output_filetype> <dds_image_input_dir> <image_output_dir>",
        "desc" => "Copies and converts relavent images in input_dir to images of output_filetype in output_dir. Creates subdirectories as needed.\n"
            . "Requires ImageMagick utility to be installed and in system path.\n\nMode Options [Required to specify]:\n\n"
            . "[append] : --mode=append : will only work on files if they don't already exist in the output directory, will list all files that were newly added at completion.\n\n"
            . "[overwrite] : --mode=overwrite : will work on all files and overwrite any that already exist\n\n"
            . "[cleardir] : --mode=cleardir : completely empty output dir before doing work and will work on all files\n",
        "exec" => function (...$args) {
            global $global_json, $validargs;

            if (count($args) == 4) {
                //Init logging info
                $log = $validargs['--log']['log'];

                //Begin execution
                $mode = $args[0];
                $imagetype = $args[1];
                $inputdir = imageOutDirectoryHelper($args[2]);
                $outputdir = imageOutDirectoryHelper($args[3]);

                //Determine mode
                $mstr = "--mode=";
                $m_append = FALSE;
                $m_overwrite = FALSE;
                $m_cleardir = FALSE;
                if ($mode === $mstr . "append") {
                    $m_append = TRUE;
                }
                else if ($mode === $mstr . "overwrite") {
                    $m_overwrite = TRUE;
                }
                else if ($mode === $mstr . "cleardir") {
                    $m_cleardir = TRUE;
                }
                else {
                    die("Invalid mode argument.");
                }

                if ($m_cleardir) {
                    //Delete output dir if it exists before starting
                    FileHandling::deleteDirectoryContents($outputdir);

                    $log("[--imageout $mode] Deleting directory contents: $outputdir");
                }

                //Ensure output dir
                FileHandling::ensureDirectory($outputdir);

                //Compile list of all relevant image strings
                $ext = ".dds";
                $images = []; //Map of unique image keys => TRUE
                $appendimages = [];

                $count = count($global_json['heroes']);
                $i = 1;
                foreach ($global_json['heroes'] as $hero) {
                    echo "Compiling list of image strings from heroes ($i/$count)                           \r";

                    imageOutHelper($hero['image_hero'], $images);
                    imageOutHelper($hero['image_minimap'], $images);

                    foreach ($hero['abilities'] as $ability) {
                        imageOutHelper($ability['image'], $images);
                    }

                    foreach ($hero['talents'] as $talent) {
                        imageOutHelper($talent['image'], $images);
                    }

                    $i++;
                }

                $count = count($images);

                //Copy all relevant images to output dir before mogrifying them (if mode=append will ignore images that already exist as the final imagetype)
                $i = 1;
                foreach ($images as $img => $bool) {
                    $image = htmlspecialchars_decode($img, ENT_QUOTES); //Decode the image string
                    $path1 = escapeshellarg("$inputdir$image$ext"); //Escape the entire argument
                    $path2 = escapeshellarg("$outputdir$image$ext"); //Escape the entire argument

                    if (!$m_append || !(file_exists("$outputdir$image.$imagetype"))) {
                        echo "Copying images to output directory ($i/$count)                           \r";
                        shell_exec("cp $path1 $path2");
                        $appendimages[] = $image;
                    }
                    else {
                        echo "Append: Output image already exists ($i/$count)                                  \r";
                    }

                    $i++;
                }

                //Further do work according to mode
                if (!$m_append) {
                    //Mogrify all copied images, converting them to the appropriate filetype
                    $i = 1;
                    foreach ($images as $img => $bool) {
                        $image = htmlspecialchars_decode($img, ENT_QUOTES); //Decode the image string
                        $path1 = escapeshellarg("$outputdir$image$ext"); //Escape the entire argument
                        echo "Converting copied images to .$imagetype ($i/$count)                                 \r";
                        shell_exec("magick mogrify -format $imagetype $path1");
                        $i++;
                    }

                    if ($count > 0) {
                        $log("[--imageout $mode] Wrote images to directory: $outputdir");
                    }

                    //Delete all .dds copied images
                    if ($m_cleardir) {
                        //Since output directory was cleaned just now, we essentially own it completely, so safe to do efficient deletion
                        echo "Deleting copied $ext images...                                                                     \r";
                        shell_exec("rm -f $outputdir*$ext");

                        $log("[--imageout $mode] Deleted ANY .dds images in directory: $outputdir");
                    }
                    else {
                        //Only delete our specific files
                        $i = 1;
                        foreach ($images as $img => $bool) {
                            $image = htmlspecialchars_decode($img, ENT_QUOTES); //Decode the image string
                            $path1 = escapeshellarg("$outputdir$image$ext"); //Escape the entire argument
                            echo "Deleting copied $ext images ($i/$count)                                                           \r";
                            shell_exec("rm -f $path1");
                            $i++;
                        }

                        if ($count > 0) {
                            $log("[--imageout $mode] Deleted .dds images in directory: $outputdir");
                        }
                    }

                    echo "Completed.                                                       \r" . E;
                }
                else {
                    //Append special operations, work only on appended files, and output all files that were appended, for easy work comparisons between runs.
                    $count = count($appendimages);

                    if ($count > 0) {
                        //Mogrify copied images, converting them to the appropriate filetype
                        $i = 1;
                        foreach ($appendimages as $image) {
                            $path1 = escapeshellarg("$outputdir$image$ext"); //Escape the entire argument
                            echo "Converting appended copied images to .$imagetype ($i/$count)                             \r";
                            shell_exec("magick mogrify -format $imagetype $path1");
                            $i++;
                        }

                        //Only delete our specific files
                        $i = 1;
                        foreach ($appendimages as $image) {
                            $path1 = escapeshellarg("$outputdir$image$ext"); //Escape the entire argument
                            echo "Deleting appended copied $ext images ($i/$count)                                 \r";
                            shell_exec("rm -f $path1");
                            $i++;
                        }

                        //List all appended images
                        $logging = $validargs['--log']['enabled'];
                        if ($logging) $log("[--imageout $mode] Appended new images: ");

                        echo "Completed: Appended new images....                                            \r" . E . E;
                        foreach ($appendimages as $image) {
                            if ($logging) {
                                $log($image);
                            }
                            else {
                                echo $image . E;
                            }
                        }
                    }
                    else {
                        echo "Completed: No new images appended.                                               \r" . E;
                    }
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
    extractData();
    echo json_encode($global_json) . E;
}
else if ($argc > 1) {
    // Go through, validate, check what arguments are encountered, add arguments to execution list,
    // and see if data should be extracted before arguments are executed.
    $shouldextract = FALSE;
    $argExecQueue = []; //Queue of closures and their supplied arguments
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
                    echo 'Invalid amount of arguments supplied for ' . $arg . ', expected ' . $varg['count'] . '...' . E;
                    echo $varg['syntax'] . E;
                    echo $varg['desc'] . E;
                    die();
                }
                else {
                    $addargsarr[] = $argv[$argcursor];
                    $a++;
                }
            }

            //Should we queue extraction?
            if ($varg['shouldExtract']) $shouldextract = TRUE;

            //Add to execution order
            $argExecQueue[] = array("arg" => $arg, "addargs" => $addargsarr);
        }
        else {
            //Invalid optional argument, execute --help
            echo 'Invalid argument supplied: ' . $arg . E;
            $validargs['--help']['exec']();
            die();
        }

        $argcursor++;
    }

    //Extract data if extraction was queued
    if ($shouldextract) extractData();

    //Go through and actually execute arguments
    foreach ($argExecQueue as $item) {
        $arg = $item['arg'];
        $addargs = $item['addargs'];
        $varg = $validargs[$arg];

        //Log execution of this optional argument if logging has been enabled beforehand
        $log = $validargs['--log']['log'];
        $logging = $validargs['--log']['enabled'];
        if ($logging) {
            $logstr = $argv[0];
            $logstr .= " $arg";

            foreach ($addargs as $addarg) {
                $logstr .= " $addarg";
            }

            $log($logstr . E); //Add additional line
        }

        //Execute optional argument
        $varg['exec'](...$addargs);
    }

    if ($validargs['--log']['enabled']) fclose($validargs['--log']['file']);
}