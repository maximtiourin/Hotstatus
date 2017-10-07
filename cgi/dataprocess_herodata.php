<?php

/*
 * Command Line Process
 * args:
 * 0: File path of script being executed (default arg from php)
 *
 * output:
 * JSON string of relevant hero data
 */

set_time_limit(0);

//The json array that holds all of the heroes
$global_json = [];
$global_json['heroes'] = [];

//General QoL constants
const E = PHP_EOL;

//QoL constants for referencing json encoded xml
const ATTR = "@attributes";
const ID = "id";
const V = "value";

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

//Blizzard really doesn't like consistent patterns when naming their stuff. Some old hero talents have absolutely no pattern to their mapping, so special cases required
$talentExceptions = [
    "GenericDampenMagic" => "TalentDampenMagic",
];

//What names to convert if encountered
/*$mapNames = [
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
    "Necromancer" => "Xul",
    "SgtHammer" => "Sgt. Hammer",
    "Tinker" => "Gazlowe",
    "WitchDoctor" => "Nazeebo",
    "Wizard" => "Li-Ming",
    "Amazon" => "Cassia",
    "DVa" => "D.Va",
    "KelThuzad" => "Kel'Thuzad",
    "Lucio" => "Lúcio",
    "Zuljin" => "Zul'jin",
    "Guldan" => "Gul'dan"
];*/

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

function extractURLFriendlyProperName($name) {
    return preg_replace('/[^a-zA-Z0-9]/', '', $name);
}

/*
 * Extracts the value of the line with the given identifier in the line seperated file
 * Will also remove any html-like brackets inside of the value, leaving only the basic string
 *
 * Can optionally set $isTalent = true so that the function knows to first check for a version of the lineid with a 'Talent'
 * suffix, before just checking for the lineid.
 *
 * If name internal is set to a hero's internal name, then the regex parsing can be sped up while also making sure that
 * hero names are treated as one word.
 */
function extractLine($prefix, $id, $linesepstring, $defaultValue = "", $isTalent = FALSE, $nameinternal = NULL) {
    $talent = 'Talent';

    $matchtalent = '@' . $prefix . $id . $talent . '=(.*)$@m';
    $match = '@' . $prefix . $id . '=(.*)$@m';
    $replacebbcode = '/<.*?>/';

    /*
     * Special exception talent match cases
     */
    $mtalent = [];
    $mtvalid = [];
    $mtex = [];
    $mtlimit = [];
    $mtwords = [];
    $tid = 0;
    // {HERONAME}MasteryFooBar = HERONAMEFooBarTalent (SKIPS 'Mastery'*)
    $mt15valid = ($nameinternal != NULL);
    if ($nameinternal != NULL) {
        $mt15ex = "Mastery";
        $mtalent15 = $id;
        $mtalent15 = str_replace($mt15ex, '', $mtalent15);
        $mtalent15 = '@' . $prefix . $nameinternal . $mtalent15 . $talent . '=(.*)$@m';
    }
    // GenericFooBar = TalentFooBar (SKIPS 'Generic'*)
    $mt2valid = TRUE;
    $mt2ex = "Generic";
    $mtalent2 = $id;
    $mtalent2 = str_replace($mt2ex, '', $mtalent2);
    $mtalent2 = '@' . $prefix . $talent . $mtalent2 . '=(.*)$@m';
    // GenericTalentFooBar = GenericFooBar (SKIPS 'Talent'*)
    $mt8valid = TRUE;
    $mt8ex = "Talent";
    $mtalent8 = $id;
    $mtalent8 = str_replace($mt8ex, '', $mtalent8);
    $mtalent8 = '@' . $prefix . $mtalent8 . '=(.*)$@m';
    // Firstword . Arbitraryword . Otherwords . 'Talent' (SKIPS Word 2)
    $mt3valid = FALSE;
    $mt3limit = 3;
    $mtalent3 = $id;
    $mt3words = preg_split('/(?=[A-Z])/', $mtalent3, NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
    if (count($mt3words) >= $mt3limit) {
        $mtalent3 = '@' . $prefix . $mt3words[0] . '[A-Z]+[a-z0-9]*';
        for ($i = 2; $i < count($mt3words); $i++) {
            $mtalent3 .= $mt3words[$i];
        }
        $mtalent3 = $mtalent3 . $talent . '=(.*)$@m';
        $mt3valid = TRUE;
    }
    // Firstword . Other_words_except_second . 'Talent' (SKIPS Word 2)
    $mt4valid = FALSE;
    $mt4limit = 3;
    $mtalent4 = $id;
    $mt4words = preg_split('/(?=[A-Z])/', $mtalent4, NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
    if (count($mt4words) >= $mt4limit) {
        $mtalent4 = '@' . $prefix . $mt4words[0];
        for ($i = 2; $i < count($mt4words); $i++) {
            $mtalent4 .= $mt4words[$i];
        }
        $mtalent4 = $mtalent4 . $talent . '=(.*)$@m';
        $mt4valid = TRUE;
    }
    // Firstword . Arbitraryword . Otherwords_except_last . 'Talent' (SKIPS Word 2, Last word)
    $mt5valid = FALSE;
    $mt5limit = 4;
    $mtalent5 = $id;
    $mt5words = preg_split('/(?=[A-Z])/', $mtalent5, NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
    if (count($mt5words) >= $mt5limit) {
        $mtalent5 = '@' . $prefix . $mt5words[0] . '[A-Z]+[a-z0-9]*';
        for ($i = 2; $i < count($mt5words) - 1; $i++) {
            $mtalent5 .= $mt5words[$i];
        }
        $mtalent5 = $mtalent5 . $talent . '=(.*)$@m';
        $mt5valid = TRUE;
    }
    // Firstword . 2_Arbitrarywords . Otherwords . 'Talent' (SKIPS Word 2 and Word 3)
    $mt6valid = FALSE;
    $mt6limit = 4;
    $mtalent6 = $id;
    $mt6words = preg_split('/(?=[A-Z])/', $mtalent6, NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
    if (count($mt6words) >= $mt6limit) {
        $mtalent6 = '@' . $prefix . $mt6words[0] . '[A-Z]+[a-z0-9]*[A-Z]+[a-z0-9]*';
        for ($i = 3; $i < count($mt6words); $i++) {
            $mtalent6 .= $mt6words[$i];
        }
        $mtalent6 = $mtalent6 . $talent . '=(.*)$@m';
        $mt6valid = TRUE;
    }
    // Firstword . 2_Arbitrarywords . Otherwords . 'Talent' (SKIPS Nothing)
    $mt7valid = FALSE;
    $mt7limit = 2;
    $mtalent7 = $id;
    $mt7words = preg_split('/(?=[A-Z])/', $mtalent7, NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
    if (count($mt7words) >= $mt7limit) {
        $mtalent7 = '@' . $prefix . $mt7words[0] . '[A-Z]+[a-z0-9]*[A-Z]+[a-z0-9]*';
        for ($i = 1; $i < count($mt7words); $i++) {
            $mtalent7 .= $mt7words[$i];
        }
        $mtalent7 = $mtalent7 . $talent . '=(.*)$@m';
        $mt7valid = TRUE;
    }
    // GenericTalentFooBar = FooBarTalent (SKIPS 'GenericTalent'*)
    $mt9valid = TRUE;
    $mt9ex = "GenericTalent";
    $mtalent9 = $id;
    $mtalent9 = str_replace($mt9ex, '', $mtalent9);
    $mtalent9 = '@' . $prefix . $mtalent9 . $talent . '=(.*)$@m';
    // Firstword . Other_words_except_2_and_3 (SKIPS Word 2 and Word 3)
    $mt10valid = FALSE;
    $mt10limit = 4;
    $mtalent10 = $id;
    $mt10words = preg_split('/(?=[A-Z])/', $mtalent10, NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
    if (count($mt10words) >= $mt10limit) {
        $mtalent10 = '@' . $prefix . $mt10words[0];
        for ($i = 3; $i < count($mt10words); $i++) {
            $mtalent10 .= $mt10words[$i];
        }
        $mtalent10 = $mtalent10 . '=(.*)$@m';
        $mt10valid = TRUE;
    }
    // Firstword . 3Arbitrarywords . Otherwords . 'Talent' (SKIPS Word 2)
    $mt11valid = FALSE;
    $mt11limit = 3;
    $mtalent11 = $id;
    $mt11words = preg_split('/(?=[A-Z])/', $mtalent11, NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
    if (count($mt11words) >= $mt11limit) {
        $mtalent11 = '@' . $prefix . $mt11words[0] . '[A-Z]+[a-z0-9]*[A-Z]+[a-z0-9]*[A-Z]+[a-z0-9]*';
        for ($i = 2; $i < count($mt11words); $i++) {
            $mtalent11 .= $mt11words[$i];
        }
        $mtalent11 = $mtalent11 . $talent . '=(.*)$@m';
        $mt11valid = TRUE;
    }
    // FooBar = FooBarHotbar (SKIPS Nothing)
    $mt12valid = TRUE;
    $mt12ex = "Hotbar";
    $mtalent12 = $id;
    $mtalent12 = '@' . $prefix . $mtalent12 . $mt12ex . '=(.*)$@m';
    // Firstword . 2_Arbitrarywords . Otherwords . 'Talent' (SKIPS Word 2)
    $mt13valid = FALSE;
    $mt13limit = 3;
    $mtalent13 = $id;
    $mt13words = preg_split('/(?=[A-Z])/', $mtalent13, NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
    if (count($mt13words) >= $mt13limit) {
        $mtalent13 = '@' . $prefix . $mt13words[0] . '[A-Z]+[a-z0-9]*[A-Z]+[a-z0-9]*';
        for ($i = 2; $i < count($mt13words); $i++) {
            $mtalent13 .= $mt13words[$i];
        }
        $mtalent13 = $mtalent13 . $talent . '=(.*)$@m';
        $mt13valid = TRUE;
    }
    // 'Generic' . Otherwords_but_remove_plural . 'Talent' (SKIPS Word 1, REMOVES plurality [s, if it exists])
    $mt14valid = FALSE;
    $mt14ex = 'Generic';
    $mt14limit = 2;
    $mtalent14 = preg_replace('/(.*)s/', '$1', $id);
    $mt14words = preg_split('/(?=[A-Z])/', $mtalent14, NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
    if (count($mt14words) >= $mt14limit) {
        $mtalent14 = '@' . $prefix . $mt14ex;
        for ($i = 1; $i < count($mt14words); $i++) {
            $mtalent14 .= $mt14words[$i];
        }
        $mtalent14 = $mtalent14 . $talent . '=(.*)$@m';
        $mt14valid = TRUE;
    }

    $arr = [];
    $arr2 = [];

    $ret = null;

    if ($isTalent) {
        //matchTalent
        $ret = preg_match($matchtalent, $linesepstring, $arr);

        if ($ret == 1) {
            $str = $arr[1];
            return trim(preg_replace($replacebbcode, '', $str));
        }
        else {
            //match
            $ret = preg_match($match, $linesepstring, $arr2);

            if ($ret == 1) {
                $str = $arr2[1];
                return trim(preg_replace($replacebbcode, '', $str));
            }
            else {
                //mtalent15
                if ($mt15valid) $ret = preg_match($mtalent15, $linesepstring, $arr);

                if ($mt15valid && $ret == 1) {
                    $str = $arr[1];
                    return trim(preg_replace($replacebbcode, '', $str));
                }
                else {
                    //mtalent2
                    if ($mt2valid) $ret = preg_match($mtalent2, $linesepstring, $arr);

                    if ($mt2valid && $ret == 1) {
                        $str = $arr[1];
                        return trim(preg_replace($replacebbcode, '', $str));
                    } else {
                        //mtalent8
                        if ($mt8valid) $ret = preg_match($mtalent8, $linesepstring, $arr);

                        if ($mt8valid && $ret == 1) {
                            $str = $arr[1];
                            return trim(preg_replace($replacebbcode, '', $str));
                        } else {
                            //mtalent3
                            if ($mt3valid) $ret = preg_match($mtalent3, $linesepstring, $arr);

                            if ($mt3valid && $ret == 1) {
                                $str = $arr[1];
                                return trim(preg_replace($replacebbcode, '', $str));
                            } else {
                                //mtalent4
                                if ($mt4valid) $ret = preg_match($mtalent4, $linesepstring, $arr);

                                if ($mt4valid && $ret == 1) {
                                    $str = $arr[1];
                                    return trim(preg_replace($replacebbcode, '', $str));
                                } else {
                                    //mtalent5
                                    if ($mt5valid) $ret = preg_match($mtalent5, $linesepstring, $arr);

                                    if ($mt5valid && $ret == 1) {
                                        $str = $arr[1];
                                        return trim(preg_replace($replacebbcode, '', $str));
                                    } else {
                                        //mtalent6
                                        if ($mt6valid) $ret = preg_match($mtalent6, $linesepstring, $arr);

                                        if ($mt6valid && $ret == 1) {
                                            $str = $arr[1];
                                            return trim(preg_replace($replacebbcode, '', $str));
                                        } else {
                                            //mtalent7
                                            if ($mt7valid) $ret = preg_match($mtalent7, $linesepstring, $arr);

                                            if ($mt7valid && $ret == 1) {
                                                $str = $arr[1];
                                                return trim(preg_replace($replacebbcode, '', $str));
                                            } else {
                                                //mtalent9
                                                if ($mt9valid) $ret = preg_match($mtalent9, $linesepstring, $arr);

                                                if ($mt9valid && $ret == 1) {
                                                    $str = $arr[1];
                                                    return trim(preg_replace($replacebbcode, '', $str));
                                                } else {
                                                    //mtalent10
                                                    if ($mt10valid) $ret = preg_match($mtalent10, $linesepstring, $arr);

                                                    if ($mt10valid && $ret == 1) {
                                                        $str = $arr[1];
                                                        return trim(preg_replace($replacebbcode, '', $str));
                                                    } else {
                                                        //mtalent11
                                                        if ($mt11valid) $ret = preg_match($mtalent11, $linesepstring, $arr);

                                                        if ($mt11valid && $ret == 1) {
                                                            $str = $arr[1];
                                                            return trim(preg_replace($replacebbcode, '', $str));
                                                        } else {
                                                            //mtalent12
                                                            if ($mt12valid) $ret = preg_match($mtalent12, $linesepstring, $arr);

                                                            if ($mt12valid && $ret == 1) {
                                                                $str = $arr[1];
                                                                return trim(preg_replace($replacebbcode, '', $str));
                                                            } else {
                                                                //mtalent13
                                                                if ($mt13valid) $ret = preg_match($mtalent13, $linesepstring, $arr);

                                                                if ($mt13valid && $ret == 1) {
                                                                    $str = $arr[1];
                                                                    return trim(preg_replace($replacebbcode, '', $str));
                                                                } else {
                                                                    //mtalent14
                                                                    if ($mt14valid) $ret = preg_match($mtalent14, $linesepstring, $arr);

                                                                    if ($mt14valid && $ret == 1) {
                                                                        $str = $arr[1];
                                                                        return trim(preg_replace($replacebbcode, '', $str));
                                                                    } else {
                                                                        return $defaultValue;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else {
        $ret = preg_match($match, $linesepstring, $arr);

        if ($ret == 1) {
            $str = $arr[1];
            return trim(preg_replace($replacebbcode, '', $str));
        }
        else {
            return $defaultValue;
        }
    }
}

function extractHero_xmlToJson($filepath, $file_strings) {
    global $ignoreNames, $mapNames, $global_json;

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
                    $hero['name'] = extractLine("Hero/Name/", $name_internal, $str2, $name_internal);
                    /*if (key_exists($name_internal, $mapNames)) {
                        //Map hero name
                        $hero['name'] = $mapNames[$name_internal];
                    }
                    else {
                        //Use internal name as proper name
                        $hero['name'] = $name_internal;
                    }*/

                    //Internal name
                    $hero['name_internal'] = $name_internal;

                    //Sort name
                    $hero['name_sort'] = extractLine("Hero/SortName/", $name_internal, $str2, extractURLFriendlyProperName($hero['name']));

                    //Attribute name
                    if (key_exists('AttributeId', $j)) {
                        $hero['attribute'] = $j['AttributeId'][ATTR][V];
                    }
                    else {
                        $hero['attribute'] = "NONE";
                    }

                    //Difficulty
                    if (key_exists('Difficulty', $j)) $hero['difficulty'] = $j["Difficulty"][ATTR][V];

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
                        $hero['role'] = "Unknown";
                    }

                    //Universe
                    if (key_exists('Universe', $j)) {
                        $hero['universe'] = $j['Universe'][ATTR][V];
                    }
                    else {
                        $hero['universe'] = "Unknown";
                    }

                    //Description Tagline
                    $hero['desc_tagline'] = extractLine("Hero/Description/", $name_internal, $str2, "None");

                    //Description Bio
                    $hero['desc_bio'] = extractLine("Hero/Info/", $name_internal, $str2, "None");

                    //Image name
                    $hero['image_name'] = extractURLFriendlyProperName($hero['name']);

                    //Ratings
                    $hero['ratings'] = [];
                    if (key_exists('Ratings', $j)) {
                        //Damage
                        if (key_exists('Damage', $j['Ratings'])) {
                            $hero['ratings']['damage'] = intval($j['Ratings']['Damage'][ATTR][V]);
                        }
                        else {
                            $hero['ratings']['damage'] = 0;
                        }
                        //Utility
                        if (key_exists('Utility', $j['Ratings'])) {
                            $hero['ratings']['utility'] = intval($j['Ratings']['Utility'][ATTR][V]);
                        }
                        else {
                            $hero['ratings']['utility'] = 0;
                        }
                        //Survivability
                        if (key_exists('Survivability', $j['Ratings'])) {
                            $hero['ratings']['survivability'] = intval($j['Ratings']['Survivability'][ATTR][V]);
                        }
                        else {
                            $hero['ratings']['survivability'] = 0;
                        }
                        //Complexity
                        if (key_exists('Complexity', $j['Ratings'])) {
                            $hero['ratings']['complexity'] = intval($j['Ratings']['Complexity'][ATTR][V]);
                        }
                        else {
                            $hero['ratings']['complexity'] = 0;
                        }
                    }

                    //Rarity
                    if (key_exists('Rarity', $j)) {
                        $hero['rarity'] = $j['Rarity'][ATTR][V];
                    }
                    else {
                        $hero['rarity'] = "Unknown";
                    }

                    //Talents
                    $hero['talents'] = [];
                    if (key_exists('TalentTreeArray', $j)) {
                        foreach ($j['TalentTreeArray'] as $talent) {
                            $t = [];
                            $tname_internal = $talent[ATTR]['Talent'];
                            $t['name'] = extractLine("Button/Name/", $tname_internal, $str2, $tname_internal, true);
                            $t['name_internal'] = $tname_internal;
                            $t['desc'] = extractLine("Button/SimpleDisplayText/", $tname_internal, $str2, "None", true);
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

//Output json
echo json_encode($global_json).E;