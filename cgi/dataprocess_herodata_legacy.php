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

/*
 * Map is populated of mappings of CHero Talent Key => GameString Talent Key
 */
$talentMappings = [];

// Blizzard really doesn't like consistent patterns when naming their stuff. For the most part I was able to create a pattern match
// for a large variety of egregious edge cases, but there were a few that were so incredibly stupid that it would just be easier
// to explicitly map them.
$talentExceptions = [
    "AbathurMasteryEnvenomedNestsToxicNest" => "AbathurToxicNestEnvenomedNestTalent",
    "AbathurMasteryVileNestsToxicNest" => "AbathurToxicNestVileNestTalent",
    "GenericTalentCalldownMULE" => "GenericCalldownMule",
    "AbathurCombatStyleLocustBrood" => "AbathurLocustSwarm",
    "RehgarMasteryShamanHealingWard" => "RehgarHealingTotem",
    "RehgarMasteryEarthGraspTotem" => "RehgarEarthbindTotemEarthgraspTotemTalent",
    "HeroGenericExecutionerPassive" => "GenericExecutionerTalent",
    "RaynorMasteryHelsAngelsRaynorsBanshees" => "RaynorRaynorsRaidersHelsAngelsTalent",
    "TassadarTemplarsWill" => "TassadarOracleTemplarsWillTalent",
    "TassadarKhalasCelerityPlasmaShield" => "TassadarKhalasCelerity",
    "GenericTalentFlashoftheStorms" => "GenericBoltoftheStormTalent",
    "FalstadMasteryHammerangSecretWeapon" => "FalstadSecretWeaponTalent",
    "FalstadMasteryFlightEpicMount" => "FalstadEpicMountTalent",
    "BattleMomentumKerrigan" => "KerriganBladedMomentum",
    "GenericTalentBlock" => "GenericBlockTalent",
    "NovaMasteryExplosiveShot" => "NovaSnipeExplosiveRoundTalent",
    "NovaMasteryPerfectShotSnipe" => "NovaPerfectShotTalent",
    "TyraelHeroicAbilityJudgement" => "TyraelJudgment",
    "GenericTalentNullificationShield" => "NullificationShieldTalent",
    "ETCMasteryGuitarHero" => "L90ETCGuitarSoloGuitarHeroTalent",
    "L90ETCMasteryFaceMeltPinballWizard" => "ETCPinballWizardTalent",
    "ETCCombatStyleEchoPedal" => "L90ETCRockstarEchoPedalTalent",
    "ETCHeroicAbilityMoshPit" => "L90ETCMoshPit",
    "ETCHeroicAbilityStageDive" => "L90ETCStageDive",
    "ETCMasteryFaceSmelt" => "L90ETCFaceMeltFaceSmeltTalent",
    "L90ETCMasteryStageDiveCrowdPleaser" => "ETCStageDiveCrowdPleaserTalent",
    "BattleMomentumMuradin" => "MuradinIronforgedMomentum",
    "BattleMomentumCrusader" => "JohannaBlessedMomentum",
    "BattleMomentumTyrael" => "TyraelAngelicMomentum",
    "BattleMomentumDiablo" => "DiabloDiabolicalMomentum",
    "MuradinGiveEmTheAxeExecutioner60DamageBonus" => "MuradinGiveEmTheAxeTalent",
    "GenericTalentHardenedShield" => "HardenedShieldTalent",
    "BrightwingManicPixiePixieDust" => "BrightwingManicPixieTalent",
    "BrightwingPixieCharm" => "FaerieDragonPixieCharmTalent",
    "FaerieDragonMasteryPhaseShield" => "BrightwingPhaseShiftPhaseShieldTalent",
    "FaerieDragonHeroicAbilityBlinkHeal" => "BrightwingBlinkHealAllyDash",
    "FaerieDragonHeroicAbilityEmeraldWind" => "BrightwingEmeraldWind",
    "FaerieDragonMasteryStickyFlare" => "BrightwingArcaneFlareStickyFlareTalent",
    "FaerieDragonMasteryShieldDust" => "BrightwingPixieDustShieldDustTalent",
    "FaerieDragonMasteryCritterize" => "BrightwingPolymorphCritterizeTalent",
    "FaerieDragonHardenedFocus" => "GenericHardenedFocusTalent",
    "BrightwingDoubleWyrmholeBlinkHeal" => "BrightwingDoubleWyrmholeTalent",
    "FaerieDragonMasteryContinuousWinds" => "BrightwingEmeraldWindContinuousWindsTalent",
    "AnubarakMasteryShedExoskeletonHardenCarapace" => "AnubarakRegeneratingCarapaceShedExoskeletonTalent",
    "AnubarakMasteryLeechingScarabs" => "AnubarakLeechingMandiblesTalent",
    "AnubarakScarabHostBeetleJuiced" => "AnubarakBeetleSpitBeetleJuiceTalent",
    "AnubarakCocoonCryptweave" => "AnubarakCryptweaveCocoonTalent",
    "TalentNullificationShield" => "NullificationShieldTalent",
    "ArtanisShieldOverloadShieldSurge" => "ArtanisShieldOverloadShieldSurgeTalentNew",
    "ButcherHeroicAbilityButcherFurnaceBlast" => "ButcherFurnaceBlast",
    "ButcherMasteryFreshMeatBloodFrenzy" => "ButcherFreshBloodFrenzyMeatTalent",
    "CrusaderHeroicMasteryIndestructable" => "CrusaderIndestructableTalent",
    "GreymaneWorgenFormQuicksilverBullets" => "GreymaneQuicksilverBulletsTalent",
    "GreymaneWorgenFormAlphaKiller" => "GreymaneAlphaKillerTalent",
    "NecromancerTalentGrimScythe" => "NecromancerCursedStrikesGrimScythe",
    "NecromancerTalentRapidHarvest" => "NecromancerCursedStrikesRapidHarvest",
    "ArthasMasteryFrostmourneFeedsFrostmourneHungers" => "ArthasFrostmourneFeedsFrostmourneHungersTalents",
    "SgtHammerMasteryFlakCannons" => "SgtHammerConcussiveBlastBarricadeTalent",
    "ThrallHeroicAbilitySundering" => "Sundering",
    "ThrallMasteryFrostwolfsGrace" => "ThrallFrostwolfResilienceSurgeOfHealing",
    "WitchDoctorHeroicAbilityRavenousSpirits" => "WitchDoctorRavenousSpirit",
    "WitchDoctorAnnihilatingSpirits" => "WitchDoctorRavenousSpiritAnnihilatingSpiritTalent",
    "ZagaraHeroicAbilityNydusAssault" => "ZagaraNydusNetwork",
    "ZagaraMasteryCorrosiveSaliva" => "ZagaraCorrosiveSalivaHunterKillerTalent",
    "ZeratulRendingCleave" => "ZeratulCleaveRendingCleaveTalent",
    "AlarakHeroicAbilityCounterStrike" => "AlarakCounterStrikeTargeted",
    "AlarakCounterStrikeItem" => "AlarakCounterStrike2ndHeroic",
    "AlarakDeadlyChargeItem" => "AlarakDeadlyCharge2ndHeroic",
    "AnaHeroicAbilityNanaBoost" => "AnaNanoBoost",
    "LucioBoombox" => "LucioBoomboxBoombox",
    "SamuroPhantomPain" => "SamuroPhantomsStrikeTalent",
    "SamuroWindwalkKawarimi" => "WindwalkKawarimiTalent",
    "SamuroWhirlwindStorm" => "SamuroDanceOfDeathTalent",
    "KaelthasMasterOfFlames" => "KaelthasMasterOfFlamesLivingBomb"
    //"" => "",
];

// Erroneous words in hero talent ids, ALL key means those words are irrelevant for any heroes that have them
$talentHeroWordDeletionExceptions = [
    "ALL" => [
        "Mastery", "CombatStyle", "HeroicAbility", "Heroic"
    ],
    "Sylvanas" => [
        "Talent"
    ],
    "Lucio" => [
        "Quest"
    ],
    "Probius" => [
        "toRifts"
    ],
    "Valeera" => [
        "Garrote", "Ambush", "CloakOfShadows"
    ]
];

// Experimental, map of words that should be appended to a talent key to try to find a match
$talentAdditionExceptions = [
    "Hotbar", "Talent", "Targeted", "New", "Passive"
];

// Like addition exceptions, except these should be matched after any similar matching has performed for the primary case,
// followed by the empty case, so as to properly consume order of precidence as Primary > Empty > Secondary
$talentSecondaryAdditionExceptions = [
    "Activate", "On", "TargetPoint", "Stationary"
];

$talentHeroAlernateExceptions = [
    "L90ETC" => "ETC",
    "FaerieDragon" => "Brightwing"
];

// Experimental if a hero's internal name is a key, then replace the prefix being used by the mapped value, should only be used if the line being extracted is a description
$talentDescRemapPrefix = [
    "Kaelthas" => "Button/Tooltip/"
];

$talentDescRemapTalent = [
    "KaelthasMasterOfFlames" => TRUE
];

// Experimental map of words that heroes might have rotating as filler between both ids, so add and remove these words at various points to try to find a talent
// Not as useful as it used to be, as ability names for heros are now parsed beforehand and this map is auto-populated, but won't remove already defined data
// so as not not break anything that was already proven to work for talent parsing.
$talentHeroRotateExceptions = [
    "Tyrande" => [
        "Sentinel", "LightOfElune", "HuntersMark", "LunarFlare"
    ],
    "Raynor" => [
        "AdrenalineRush", "PenetratingRound", "RaynorsBanshees"
    ],
    "Uther" => [
        "DivineStorm", "DivineShield", "HolyRadiance"
    ],
    "Illidan" => [
        "SweepingStrike", "Metamorphosis", "Evasion", "Dive", "BetrayersThirst", "TheHunt"
    ],
    "Anubarak" => [
        "BurrowCharge", "CarrionSwarm", "Cocoon", "HardenCarapace", "Impale", "RegeneratingCarapace"
    ],
    "Falstad" => [
        "HinterlandBlast", "BarrelRoll", "Flight", "Hammerang", "Tailwind", "Thunderstorm"
    ],
    "Kerrigan" => [
        "SummonUltralisk"
    ],
    "Barbarian" => [
        "SeismicSlam", "AncientSpear", "Fury", "Leap", "Whirlwind", "WrathoftheBerserker"
    ],
    "Malfurion" => [
        "EntanglingRoots"
    ],
    "Diablo" => [
        "BlackSoulstone", "ShadowCharge", "FireStomp", "LightningBreath"
    ],
    "Arthas" =>  [
        "FrostmourneHungers"
    ],
    "FaerieDragon" => [
        "ArcaneFlare", "PhaseShift", "PixieDust", "SoothingMist", "BlinkHeal"
    ],
    "Crusader" => [
        "Condemn", "Punish"
    ],
    "DemonHunter" => [
        "Vault", "HungeringArrow", "Hatred"
    ],
    "Greymane" => [
        "GoForTheThroat"
    ],
    "Leoric" => [
        "SkeletalSwing", "Undying", "DrainHope", "WraithWalk", "Entomb", "MarchoftheBlackKing"
    ],
    "Monk" => [
        "RadiantDash", "DeadlyReach", "BreathofHeaven", "DivinePalm", "SevenSidedStrike"
    ],
    "Rexxar" => [
        "SpiritSwoop"
    ],
    "SgtHammer" => [
        "ConcussiveBlast", "BluntForceGun", "NapalmStrike"
    ],
    "Sylvanas" => [
        "WitheringFire", "HauntingWave"
    ],
    "Zagara" => [
        "CreepTumor"
    ],
    "Alarak" => [
        "DiscordStrike", "CounterStrike2ndHeroic", "DeadlyCharge2ndHeroic"
    ],
    "DVa" => [
        "Pilot", "Mech"
    ]
];

// To further add to the Blizzard lunacy, some talents have differing patterns for their proper name compared to their description
$talentNameExceptions = [
    "TassadarHeroicAbilityArchon" => "TassadarArchonSelectButton",
    "TassadarMasteryTwilightArchon" => "TassadarArchonTwilightArchonTalentSelectButton"
];

//Some abilities have button keys that map to incorrect ability names, one easy example is 'TassadarArchon' mapping to 'Phase Shift', when it should be 'Archon'
$abilityNameExceptions = [
    "TassadarArchon" => "Archon"
];

//@DEPRECATED What names to convert if encountered
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

function extractImageString($str, $default = "") {
    $arr = [];
    $ret = preg_match("@([a-zA-Z0-9_-]+)\.dds@", $str, $arr);

    if ($ret == 1) {
        return $arr[1];
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

/*
 * @DEPRECATED - Functionality no longer needed, abilities extracted in the extractHero_xmlToJson function
 */
function extractHeroAbilityStrings($nameinternal, &$linesepstring, &$map) {
    if (!key_exists($nameinternal, $map)) {
        $res = [];
        $ret = preg_match_all('@Abil/Name/' . $nameinternal . '.*=(.*)$@mi', $linesepstring, $res);

        if ($ret !== FALSE) {
            //Select the first captured group array
            $results = $res[1];

            foreach ($results as $ability) {
                $str = $ability;
                $str = preg_replace('@[_]|[^\w]@', '', $str);
                $map[$nameinternal][] = $str;
            }
        }
    }
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
 *
 * $namesort name can be used to identify heroes who have multiple name mappings, ex: ETC, L90ETC
 *
 * $isTalentNameVariant is a bool that if true means we're extracting specifically a Talent name, made necessary in order to properly
 * map talent name vs. talent desc disparities caused by Blizzard's disparate naming conventions
 */
function extractLine($prefixarr, $id, &$linesepstring, $defaultValue = "", $isTalent = FALSE, $isTalentNameVariant = FALSE, $nameinternal = "") {
    global $talentMappings, $talentExceptions, $talentNameExceptions, $talentHeroRotateExceptions,
           $talentHeroWordDeletionExceptions, $talentHeroAlernateExceptions, $talentAdditionExceptions,
           $talentSecondaryAdditionExceptions, $talentDescRemapPrefix, $talentDescRemapTalent;

    $regex_match_flags = 'mi';

    $talent = 'Talent';
    $deleteall = "ALL";

    //Build prefix options
    $prefix = "";
    if ($isTalent && !$isTalentNameVariant && key_exists($id, $talentDescRemapTalent) && key_exists($nameinternal, $talentDescRemapPrefix)) {
        //Wacky edge case for using predefined prefixes for certain heroes, ex: Kaelthas MasterOfFlames talent, has no simpledescription so must use verbose tooltip desc
        $prefix = $talentDescRemapPrefix[$nameinternal];
    }
    else {
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
    }

    $namesort = "";
    if (key_exists($nameinternal, $talentHeroAlernateExceptions)) {
        $namesort = $talentHeroAlernateExceptions[$nameinternal];
    }

    $matchtalent = '@' . $prefix . $id . $talent . '=(.*)$@';
    $match = '@' . $prefix . $id . '=(.*)$@';
    $replacebbcode = '/<.*?>/';

    $arr = [];
    $arr2 = [];

    $ret = null;

    if ($isTalent) {
        /*
         * Special exception talent match cases
         */
        $mtalent = [];
        $mtvalid = [];
        $mtex = [];
        $mtex2 = [];
        $mtlimit = [];
        $mtwords = [];
        $tid = 0;

        $talentException = FALSE;

        //Check talent mappings first before trying to do ANY regex parsing, to speed up processing
        if (key_exists($id, $talentMappings)) {
            $talentException = TRUE;
            $mtvalid[$tid] = TRUE;
            $mtalent[$tid] = '@' . $prefix . $talentMappings[$id] . '=(.*)$@';
            $tid++;

            $defaultValue = '$ERROR: '.$talentMappings[$id];
        }
        else if (FALSE) { //TEMP TODO test 100% coverage of talent mappings
            //Talent Exception shortcuts
            if ($isTalentNameVariant && key_exists($id, $talentNameExceptions)) {
                $talentException = TRUE;
                $mtvalid[$tid] = TRUE;
                $mtalent[$tid] = '@' . $prefix . $talentNameExceptions[$id] . '=(.*)$@';
                $tid++;
            }
            if (key_exists($id, $talentExceptions)) {
                $talentException = TRUE;
                $mtvalid[$tid] = TRUE;
                $mtalent[$tid] = '@' . $prefix . $talentExceptions[$id] . '=(.*)$@';
                $tid++;
            }

            //Only run further parsing setup if no explicit mapping was found
            if (!$talentException) {
                //$nameinternal shortcuts
                if (strlen($nameinternal) > 0) {
                    // {HERONAME}{IGNOREALL}FooBar = {HERONAME}FooBar{ADDWORD}? (SKIPS {IGNOREALL} IGNORES $nameinternal)
                    //Primary case
                    foreach ($talentAdditionExceptions as $appendword) {
                        $mtvalid[$tid] = TRUE;
                        $mtalent[$tid] = $id;
                        foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                            $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                        }
                        $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . $appendword . '=(.*)$@';
                        $tid++;
                    }

                    //Empty case
                    $mtvalid[$tid] = TRUE;
                    $mtalent[$tid] = $id;
                    foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                        $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                    }
                    $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . '=(.*)$@';
                    $tid++;

                    //Secondary case
                    foreach ($talentSecondaryAdditionExceptions as $appendword) {
                        $mtvalid[$tid] = TRUE;
                        $mtalent[$tid] = $id;
                        foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                            $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                        }
                        $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . $appendword . '=(.*)$@';
                        $tid++;
                    }

                    //----------Swap to namesort in case hero has different names in use ---------------------------------

                    if (strlen($namesort) > 0) {
                        //Primary case
                        foreach ($talentAdditionExceptions as $appendword) {
                            $mtvalid[$tid] = TRUE;
                            $mtalent[$tid] = $id;
                            $mtalent[$tid] = str_replace($nameinternal, $namesort, $mtalent[$tid]);
                            foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                            }
                            $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . $appendword . '=(.*)$@';
                            $tid++;
                        }

                        //Empty case
                        $mtvalid[$tid] = TRUE;
                        $mtalent[$tid] = $id;
                        $mtalent[$tid] = str_replace($nameinternal, $namesort, $mtalent[$tid]);
                        foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                            $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                        }
                        $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . '=(.*)$@';
                        $tid++;

                        //Secondary case
                        foreach ($talentSecondaryAdditionExceptions as $appendword) {
                            $mtvalid[$tid] = TRUE;
                            $mtalent[$tid] = $id;
                            $mtalent[$tid] = str_replace($nameinternal, $namesort, $mtalent[$tid]);
                            foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                            }
                            $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . $appendword . '=(.*)$@';
                            $tid++;
                        }
                    }
                    // @DEPRECATED - Kept around for compatibility {HERONAME}MasteryFooBar = {HERONAME}FooBarTalent (SKIPS 'Mastery'* IGNORES $nameinternal)
                    $mtvalid[$tid] = TRUE;
                    $mtex[$tid] = "Mastery";
                    $mtalent[$tid] = $id;
                    $mtalent[$tid] = str_replace($mtex[$tid], '', $mtalent[$tid]);
                    $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . $talent . '=(.*)$@';
                    $tid++;
                    // @DEPRECATED - Kept around for compatibility {HERONAME}(HeroicAbility|Mastery)FooBar = {HERONAME}FooBar (SKIPS 'HeroicAbility'* and 'Mastery'* IGNORES $nameinternal)
                    $mtvalid[$tid] = TRUE;
                    $mtex[$tid] = "HeroicAbility";
                    $mtex2[$tid] = "Mastery";
                    $mtalent[$tid] = $id;
                    $mtalent[$tid] = str_replace($mtex[$tid], '', $mtalent[$tid]);
                    $mtalent[$tid] = str_replace($mtex2[$tid], '', $mtalent[$tid]);
                    $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . '=(.*)$@';
                    $tid++;
                    // @DEPRECATED - Kept around for compatibility {HERONAME}(HeroicAbility|Mastery)FooBar = {HERONAME}FooBarHotbar (SKIPS 'HeroicAbility'* and 'Mastery' IGNORES $nameinternal)
                    $mtvalid[$tid] = TRUE;
                    $mtex[$tid] = "HeroicAbility";
                    $mtex2[$tid] = "Mastery";
                    $mtalent[$tid] = $id;
                    $mtalent[$tid] = str_replace($mtex[$tid], '', $mtalent[$tid]);
                    $mtalent[$tid] = str_replace($mtex2[$tid], '', $mtalent[$tid]);
                    $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . 'Hotbar' . '=(.*)$@';
                    $tid++;
                    // Looping experimental word map deletion based on hero name {HERONAME} . Otherwords . (Talent?) (SKIPS $word READDS {HeroName})
                    if (key_exists($nameinternal, $talentHeroRotateExceptions)) {
                        foreach ($talentHeroRotateExceptions[$nameinternal] as $word) {
                            $mtvalid[$tid] = TRUE;
                            $mtalent[$tid] = $id;
                            $mtalent[$tid] = str_replace($nameinternal, '', $mtalent[$tid]);

                            $mtalent[$tid] = str_replace($word, '', $mtalent[$tid]);

                            foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                            }
                            if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                            }

                            $mtalent[$tid] = '@' . $prefix . $nameinternal . $mtalent[$tid] . $talent . '=(.*)$@';
                            $tid++;

                            $mtvalid[$tid] = TRUE;
                            $mtalent[$tid] = $id;
                            $mtalent[$tid] = str_replace($nameinternal, '', $mtalent[$tid]);

                            $mtalent[$tid] = str_replace($word, '', $mtalent[$tid]);

                            foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                            }
                            if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                            }

                            $mtalent[$tid] = '@' . $prefix . $nameinternal . $mtalent[$tid] . '=(.*)$@';
                            $tid++;

                            //-------------------------------------------

                            if (strlen($namesort) > 0) {
                                $mtvalid[$tid] = TRUE;
                                $mtalent[$tid] = $id;
                                $mtalent[$tid] = str_replace($namesort, '', $mtalent[$tid]);

                                $mtalent[$tid] = str_replace($word, '', $mtalent[$tid]);

                                foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                                if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                    foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                        $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                    }
                                }

                                $mtalent[$tid] = '@' . $prefix . $namesort . $mtalent[$tid] . $talent . '=(.*)$@';
                                $tid++;

                                $mtvalid[$tid] = TRUE;
                                $mtalent[$tid] = $id;
                                $mtalent[$tid] = str_replace($namesort, '', $mtalent[$tid]);

                                $mtalent[$tid] = str_replace($word, '', $mtalent[$tid]);

                                foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                                if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                    foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                        $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                    }
                                }

                                $mtalent[$tid] = '@' . $prefix . $namesort . $mtalent[$tid] . '=(.*)$@';
                                $tid++;
                            }
                        }
                    }
                    // Looping experimental word map addition based on hero name {HERONAME} . $word . Otherwords . (Talent?) (SKIPS 'Mastery'* READDS {HeroName})
                    if (key_exists($nameinternal, $talentHeroRotateExceptions)) {
                        foreach ($talentHeroRotateExceptions[$nameinternal] as $word) {
                            $mtvalid[$tid] = TRUE;
                            $mtalent[$tid] = $id;
                            $mtalent[$tid] = str_replace($nameinternal, '', $mtalent[$tid]);

                            foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                            }
                            if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                            }

                            $mtalent[$tid] = '@' . $prefix . $nameinternal . $word . $mtalent[$tid] . $talent . '=(.*)$@';
                            $tid++;

                            $mtvalid[$tid] = TRUE;
                            $mtalent[$tid] = $id;
                            $mtalent[$tid] = str_replace($nameinternal, '', $mtalent[$tid]);

                            foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                            }
                            if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                            }

                            $mtalent[$tid] = '@' . $prefix . $nameinternal . $word . $mtalent[$tid] . '=(.*)$@';
                            $tid++;

                            //-------------------------------------------

                            if (strlen($namesort) > 0) {
                                $mtvalid[$tid] = TRUE;
                                $mtalent[$tid] = $id;
                                $mtalent[$tid] = str_replace($namesort, '', $mtalent[$tid]);

                                foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                                if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                    foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                        $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                    }
                                }

                                $mtalent[$tid] = '@' . $prefix . $namesort . $word . $mtalent[$tid] . $talent . '=(.*)$@';
                                $tid++;

                                $mtvalid[$tid] = TRUE;
                                $mtalent[$tid] = $id;
                                $mtalent[$tid] = str_replace($namesort, '', $mtalent[$tid]);

                                foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                                if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                    foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                        $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                    }
                                }

                                $mtalent[$tid] = '@' . $prefix . $namesort . $word . $mtalent[$tid] . '=(.*)$@';
                                $tid++;
                            }
                        }
                    }
                    // Looping experimental word map rotation based on hero name {HERONAME} . $word . Otherwords . (Talent?) (SKIPS 'Mastery'* and $word READDS {HeroName})
                    if (key_exists($nameinternal, $talentHeroRotateExceptions)) {
                        foreach ($talentHeroRotateExceptions[$nameinternal] as $word) {
                            $mtvalid[$tid] = TRUE;
                            $mtalent[$tid] = $id;
                            $mtalent[$tid] = str_replace($nameinternal, '', $mtalent[$tid]);
                            $mtalent[$tid] = str_replace($word, '', $mtalent[$tid]);

                            foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                            }
                            if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                            }

                            $mtalent[$tid] = '@' . $prefix . $nameinternal . $word . $mtalent[$tid] . $talent . '=(.*)$@';
                            $tid++;

                            $mtvalid[$tid] = TRUE;
                            $mtalent[$tid] = $id;
                            $mtalent[$tid] = str_replace($nameinternal, '', $mtalent[$tid]);
                            $mtalent[$tid] = str_replace($word, '', $mtalent[$tid]);

                            foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                            }
                            if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                            }

                            $mtalent[$tid] = '@' . $prefix . $nameinternal . $word . $mtalent[$tid] . '=(.*)$@';
                            $tid++;

                            //-------------------------------------------

                            if (strlen($namesort) > 0) {
                                $mtvalid[$tid] = TRUE;
                                $mtalent[$tid] = $id;
                                $mtalent[$tid] = str_replace($namesort, '', $mtalent[$tid]);
                                $mtalent[$tid] = str_replace($word, '', $mtalent[$tid]);

                                foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                                if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                    foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                        $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                    }
                                }

                                $mtalent[$tid] = '@' . $prefix . $namesort . $word . $mtalent[$tid] . $talent . '=(.*)$@';
                                $tid++;

                                $mtvalid[$tid] = TRUE;
                                $mtalent[$tid] = $id;
                                $mtalent[$tid] = str_replace($namesort, '', $mtalent[$tid]);
                                $mtalent[$tid] = str_replace($word, '', $mtalent[$tid]);

                                foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                                    $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                }
                                if (key_exists($nameinternal, $talentHeroWordDeletionExceptions)) {
                                    foreach ($talentHeroWordDeletionExceptions[$nameinternal] as $deleteword) {
                                        $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                                    }
                                }

                                $mtalent[$tid] = '@' . $prefix . $namesort . $word . $mtalent[$tid] . '=(.*)$@';
                                $tid++;
                            }
                        }
                    }
                    // {HERONAME} . Otherwords_Except_Word2_Word3_Word4 . 'Talent' (SKIPS {HeroName} and Word 2 and Word 3 and Word 4, READDS {HeroName})
                    $mtvalid[$tid] = FALSE;
                    $mtlimit[$tid] = 4;
                    $mtalent[$tid] = str_replace($nameinternal, '', $id);
                    $mtwords[$tid] = preg_split('/(?=[A-Z])/', $mtalent[$tid], NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
                    if (count($mtwords[$tid]) >= $mtlimit[$tid]) {
                        $mtalent[$tid] = '@' . $prefix . $nameinternal;
                        for ($i = 3; $i < count($mtwords[$tid]); $i++) {
                            $mtalent[$tid] .= $mtwords[$tid][$i];
                        }
                        $mtalent[$tid] = $mtalent[$tid] . $talent . '=(.*)$@';
                        $mtvalid[$tid] = TRUE;
                    }
                    $tid++;
                }
                // GenericFooBar = TalentFooBar (SKIPS 'Generic'*)
                $mtvalid[$tid] = TRUE;
                $mtex[$tid] = "Generic";
                $mtalent[$tid] = $id;
                $mtalent[$tid] = str_replace($mtex[$tid], '', $mtalent[$tid]);
                $mtalent[$tid] = '@' . $prefix . $talent . $mtalent[$tid] . '=(.*)$@';
                $tid++;
                // GenericTalentFooBar = GenericFooBar (SKIPS 'Talent'*)
                $mtvalid[$tid] = TRUE;
                $mtex[$tid] = "Talent";
                $mtalent[$tid] = $id;
                $mtalent[$tid] = str_replace($mtex[$tid], '', $mtalent[$tid]);
                $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . '=(.*)$@';
                $tid++;
                // GenericTalentFooBar = GenericFooBarHotbar (SKIPS 'Talent'*)
                $mtvalid[$tid] = TRUE;
                $mtex[$tid] = "Talent";
                $mtalent[$tid] = $id;
                $mtalent[$tid] = str_replace($mtex[$tid], '', $mtalent[$tid]);
                $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . 'Hotbar' . '=(.*)$@';
                $tid++;
                // Firstword . Arbitraryword . Otherwords . 'Talent' (SKIPS Word 2)
                $mtvalid[$tid] = FALSE;
                $mtlimit[$tid] = 3;
                $mtalent[$tid] = $id;
                $mtwords[$tid] = preg_split('/(?=[A-Z])/', $mtalent[$tid], NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
                if (count($mtwords[$tid]) >= $mtlimit[$tid]) {
                    $mtalent[$tid] = '@' . $prefix . $mtwords[$tid][0] . '[A-Z]+[a-z0-9]*';
                    for ($i = 2; $i < count($mtwords[$tid]); $i++) {
                        $mtalent[$tid] .= $mtwords[$tid][$i];
                    }
                    $mtalent[$tid] = $mtalent[$tid] . $talent . '=(.*)$@';
                    $mtvalid[$tid] = TRUE;
                }
                $tid++;
                // Firstword . Other_words_except_second . 'Talent' (SKIPS Word 2)
                $mtvalid[$tid] = FALSE;
                $mtlimit[$tid] = 3;
                $mtalent[$tid] = $id;
                $mtwords[$tid] = preg_split('/(?=[A-Z])/', $mtalent[$tid], NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
                if (count($mtwords[$tid]) >= $mtlimit[$tid]) {
                    $mtalent[$tid] = '@' . $prefix . $mtwords[$tid][0];
                    for ($i = 2; $i < count($mtwords[$tid]); $i++) {
                        $mtalent[$tid] .= $mtwords[$tid][$i];
                    }
                    $mtalent[$tid] = $mtalent[$tid] . $talent . '=(.*)$@';
                    $mtvalid[$tid] = TRUE;
                }
                $tid++;
                // Firstword . Arbitraryword . Otherwords_except_last . 'Talent' (SKIPS Word 2, Last word)
                $mtvalid[$tid] = FALSE;
                $mtlimit[$tid] = 4;
                $mtalent[$tid] = $id;
                $mtwords[$tid] = preg_split('/(?=[A-Z])/', $mtalent[$tid], NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
                if (count($mtwords[$tid]) >= $mtlimit[$tid]) {
                    $mtalent[$tid] = '@' . $prefix . $mtwords[$tid][0] . '[A-Z]+[a-z0-9]*';
                    for ($i = 2; $i < count($mtwords[$tid]) - 1; $i++) {
                        $mtalent[$tid] .= $mtwords[$tid][$i];
                    }
                    $mtalent[$tid] = $mtalent[$tid] . $talent . '=(.*)$@';
                    $mtvalid[$tid] = TRUE;
                }
                $tid++;
                // Firstword . 2_Arbitrarywords . Otherwords . 'Talent' (SKIPS Word 2 and Word 3)
                $mtvalid[$tid] = FALSE;
                $mtlimit[$tid] = 4;
                $mtalent[$tid] = $id;
                $mtwords[$tid] = preg_split('/(?=[A-Z])/', $mtalent[$tid], NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
                if (count($mtwords[$tid]) >= $mtlimit[$tid]) {
                    $mtalent[$tid] = '@' . $prefix . $mtwords[$tid][0] . '[A-Z]+[a-z0-9]*[A-Z]+[a-z0-9]*';
                    for ($i = 3; $i < count($mtwords[$tid]); $i++) {
                        $mtalent[$tid] .= $mtwords[$tid][$i];
                    }
                    $mtalent[$tid] = $mtalent[$tid] . $talent . '=(.*)$@';
                    $mtvalid[$tid] = TRUE;
                }
                $tid++;
                // Firstword . 2_Arbitrarywords . Otherwords . 'Talent' (SKIPS Nothing)
                $mtvalid[$tid] = FALSE;
                $mtlimit[$tid] = 2;
                $mtalent[$tid] = $id;
                $mtwords[$tid] = preg_split('/(?=[A-Z])/', $mtalent[$tid], NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
                if (count($mtwords[$tid]) >= $mtlimit[$tid]) {
                    $mtalent[$tid] = '@' . $prefix . $mtwords[$tid][0] . '[A-Z]+[a-z0-9]*[A-Z]+[a-z0-9]*';
                    for ($i = 1; $i < count($mtwords[$tid]); $i++) {
                        $mtalent[$tid] .= $mtwords[$tid][$i];
                    }
                    $mtalent[$tid] = $mtalent[$tid] . $talent . '=(.*)$@';
                    $mtvalid[$tid] = TRUE;
                }
                $tid++;
                // GenericTalentFooBar = FooBarTalent (SKIPS 'GenericTalent'*)
                $mtvalid[$tid] = TRUE;
                $mtex[$tid] = "GenericTalent";
                $mtalent[$tid] = $id;
                $mtalent[$tid] = str_replace($mtex[$tid], '', $mtalent[$tid]);
                $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . $talent . '=(.*)$@';
                $tid++;
                // Firstword . Other_words_except_2_and_3 (SKIPS Word 2 and Word 3)
                $mtvalid[$tid] = FALSE;
                $mtlimit[$tid] = 4;
                $mtalent[$tid] = $id;
                $mtwords[$tid] = preg_split('/(?=[A-Z])/', $mtalent[$tid], NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
                if (count($mtwords[$tid]) >= $mtlimit[$tid]) {
                    $mtalent[$tid] = '@' . $prefix . $mtwords[$tid][0];
                    for ($i = 3; $i < count($mtwords[$tid]); $i++) {
                        $mtalent[$tid] .= $mtwords[$tid][$i];
                    }
                    $mtalent[$tid] = $mtalent[$tid] . '=(.*)$@';
                    $mtvalid[$tid] = TRUE;
                }
                $tid++;
                // Firstword . 3Arbitrarywords . Otherwords . 'Talent' (SKIPS Word 2)
                $mtvalid[$tid] = FALSE;
                $mtlimit[$tid] = 3;
                $mtalent[$tid] = $id;
                $mtwords[$tid] = preg_split('/(?=[A-Z])/', $mtalent[$tid], NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
                if (count($mtwords[$tid]) >= $mtlimit[$tid]) {
                    $mtalent[$tid] = '@' . $prefix . $mtwords[$tid][0] . '[A-Z]+[a-z0-9]*[A-Z]+[a-z0-9]*[A-Z]+[a-z0-9]*';
                    for ($i = 2; $i < count($mtwords[$tid]); $i++) {
                        $mtalent[$tid] .= $mtwords[$tid][$i];
                    }
                    $mtalent[$tid] = $mtalent[$tid] . $talent . '=(.*)$@';
                    $mtvalid[$tid] = TRUE;
                }
                $tid++;
                // FooBar = FooBarHotbar (SKIPS Nothing)
                $mtvalid[$tid] = TRUE;
                $mtex[$tid] = "Hotbar";
                $mtalent[$tid] = $id;
                $mtalent[$tid] = '@' . $prefix . $mtalent[$tid] . $mtex[$tid] . '=(.*)$@';
                $tid++;
                // Firstword . 2_Arbitrarywords . Otherwords . 'Talent' (SKIPS Word 2)
                $mtvalid[$tid] = FALSE;
                $mtlimit[$tid] = 3;
                $mtalent[$tid] = $id;
                $mtwords[$tid] = preg_split('/(?=[A-Z])/', $mtalent[$tid], NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
                if (count($mtwords[$tid]) >= $mtlimit[$tid]) {
                    $mtalent[$tid] = '@' . $prefix . $mtwords[$tid][0] . '[A-Z]+[a-z0-9]*[A-Z]+[a-z0-9]*';
                    for ($i = 2; $i < count($mtwords[$tid]); $i++) {
                        $mtalent[$tid] .= $mtwords[$tid][$i];
                    }
                    $mtalent[$tid] = $mtalent[$tid] . $talent . '=(.*)$@';
                    $mtvalid[$tid] = TRUE;
                }
                $tid++;
                // 'Generic' . Otherwords_but_remove_plural . 'Talent' (SKIPS Word 1, REMOVES plurality [s, if it exists])
                $mtvalid[$tid] = FALSE;
                $mtex[$tid] = 'Generic';
                $mtlimit[$tid] = 2;
                $mtalent[$tid] = preg_replace('/(.*)s/', '$1', $id);
                $mtwords[$tid] = preg_split('/(?=[A-Z])/', $mtalent[$tid], NULL, PREG_SPLIT_NO_EMPTY); //Splits into array of words, where every word past [0] is gauranteed capitalized on the first letter
                if (count($mtwords[$tid]) >= $mtlimit[$tid]) {
                    $mtalent[$tid] = '@' . $prefix . $mtex[$tid];
                    for ($i = 1; $i < count($mtwords[$tid]); $i++) {
                        $mtalent[$tid] .= $mtwords[$tid][$i];
                    }
                    $mtalent[$tid] = $mtalent[$tid] . $talent . '=(.*)$@';
                    $mtvalid[$tid] = TRUE;
                }
                $tid++;
                /*
                 * Special last resort case dubbed: "The Guldan", if hero = "Guldan", a hero ability = "FelFlame",
                 * and the talent name = "PursuitOfFlame, then the resulting proper key is:
                 * 'GuldanFelFlameTalentPursuitOfFlame'
                 * where Talent is inserted in the middle by reconstructing the string based on the components above.
                 * Has an optional non-captured group adding the ability name to the end in case it was removed more than once
                 * EX: DrainLifeGlyphofDrainLife => Glyphof
                 */
                foreach ($talentHeroRotateExceptions[$nameinternal] as $ability) {
                    $mtvalid[$tid] = TRUE;
                    $mtalent[$tid] = $id;
                    $mtalent[$tid] = str_replace($nameinternal, '', $mtalent[$tid]);
                    $mtalent[$tid] = str_replace($ability, '', $mtalent[$tid]);
                    foreach ($talentHeroWordDeletionExceptions[$deleteall] as $deleteword) {
                        $mtalent[$tid] = str_replace($deleteword, '', $mtalent[$tid]);
                    }
                    $mtalent[$tid] = '@' . $prefix . $nameinternal . $ability . $talent . $mtalent[$tid] . '(?:' . $ability . ')?=(.*)$@';
                    $tid++;
                }
            }
        }

        //matchTalent
        if (!$talentException) $ret = preg_match($matchtalent . $regex_match_flags, $linesepstring, $arr);

        if (!$talentException && $ret == 1) {
            $str = $arr[1];
            return trim(preg_replace($replacebbcode, '', $str));
        }
        else {
            //match
            if (!$talentException) $ret = preg_match($match . $regex_match_flags, $linesepstring, $arr2);

            if (!$talentException && $ret == 1) {
                $str = $arr2[1];
                return trim(preg_replace($replacebbcode, '', $str));
            }
            else {
                //mtalent Talent Exceptions
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
        }
    }
    else {
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

    $str = file_get_contents($filepath); //Xml string of hero data

    $xml = simplexml_load_string($str);

    if ($xml !== FALSE) {
        foreach ($xml->CTalent as $talent) {
            $name_internal = $talent->attributes()->id;
            $gamestringkey = $talent->Face['value'];

            $talentMappings[strval($name_internal)] = $gamestringkey;
        }
    }
}

function extractHero_xmlToJson($filepath, $file_strings) {
    global $ignoreNames, $mapNames, $global_json, $talentHeroRotateExceptions, $abilityNameExceptions;

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
                    $hero['name_sort'] = extractLine(array("Hero/SortName/"), $name_internal, $str2, extractURLFriendlyProperName($hero['name']));

                    //Attribute name
                    if (key_exists('AttributeId', $j)) {
                        $hero['attribute'] = $j['AttributeId'][ATTR][V];
                    }
                    else {
                        $hero['attribute'] = "None";
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
                        $hero['difficulty'] = $j["Difficulty"][ATTR][V];
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
                        $hero['role'] = "Unknown";
                    }

                    //Universe
                    if (key_exists('Universe', $j)) {
                        $hero['universe'] = $j['Universe'][ATTR][V];
                    }
                    else if (key_exists('UniverseIcon', $j)) {
                        $ustr = $j['UniverseIcon'][ATTR][V];
                        $hero['universe'] = extractUniverseNameFromUniverseIcon($ustr, "Unknown");
                    }
                    else {
                        $hero['universe'] = "Unknown";
                    }

                    //Description Tagline
                    $hero['desc_tagline'] = extractLine(array("Hero/Description/"), $name_internal, $str2, "None");

                    //Description Bio
                    $hero['desc_bio'] = extractLine(array("Hero/Info/"), $name_internal, $str2, "None");

                    /*
                     * Image strings
                     */
                    //$noimage = "NoImage";
                    //Image name
                    $hero['image_name'] = extractURLFriendlyProperName($hero['name']);

                    //Image select screen button
                    /*$imageid = 'SelectScreenButtonImage';
                    $imagekey = 'image_selectscreen';
                    if (key_exists($imageid, $j)
                        && key_exists(ATTR, $j[$imageid])
                        && key_exists(V, $j[$imageid][ATTR])) {
                        $imgstr = $j[$imageid][ATTR][V];
                        $hero[$imagekey] = extractImageString($imgstr, $noimage);
                    }
                    else {
                        $hero[$imagekey] = $noimage;
                    }*/

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
                        $hero['rarity'] = "Unknown";
                    }

                    //Abilities
                    $addAbilityStringsToRotateMap = FALSE;
                    if (!key_exists($name_internal, $talentHeroRotateExceptions)) {
                        $addAbilityStringsToRotateMap = TRUE;
                    }
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
                                        $a['name'] = "Unknown";
                                        $a['name_internal'] = "Unknown";
                                        $a['desc'] = "None";
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
                                        $a['desc'] = extractLine(array("Button/SimpleDisplayText/", "Button/Simple/"), $searchStr, $str2, "None");
                                    }

                                    //Add condensed name to talentHeroRotate map if the hero key doesnt exist yet
                                    if ($addAbilityStringsToRotateMap) {
                                        if (!key_exists($name_internal, $talentHeroRotateExceptions)) {
                                            $talentHeroRotateExceptions[$name_internal] = [];
                                        }
                                        $talentHeroRotateExceptions[$name_internal][] = preg_replace('@[_]|[^\w]@', '', $a['name']);
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
                            $t['name'] = extractLine(array("Button/Name/"), $tname_internal, $str2, "Unknown", true, true, $name_internal);
                            $t['name_internal'] = $tname_internal;
                            $t['desc'] = extractLine(array("Button/SimpleDisplayText/", "Button/Simple/"), $tname_internal, $str2, "None", true, false, $name_internal);

                            //Add a period and a space between instances where the key 'Quest:' shows up right after a word with no spaces between them
                            $t['desc'] = preg_replace('/(.)Quest:/', '$1. Quest:', $t['desc']);

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
 * Look through Data directories and extract talent mappings
 * (Necessary to do this before (and not in conjunction with) hero data
 * due to some legacy heroes sharing hero data in the old index, but only having talents
 * (and not CHero data) in their new index.
 */
$tfp = __DIR__ . FILE_STORMDATA_OLDTALENTINDEX;

//Extract old index
if (file_exists($tfp)) {
    extractTalents($tfp);
}
else {
    die("Old Talent Index File does not exist: " . $tfp);
}

//Extract stormdata
foreach ($stormDataNames as $heroname => $bool_include) {
    if ($bool_include) {
        $fp = __DIR__ . PATH_STORMDATA_HEROES . $heroname . PATHFRAG_STORMDATA_HERO_DIR . $heroname . PATHFRAG_STORMDATA_HERO_DATA;

        if (file_exists($fp)) {
            extractTalents($fp);
        }
        else {
            die("Storm Data File does not exist (for talents): " . $fp);
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
            }
            else {
                die("Hero Mods Special Exception File does not exist (for talents): " . $fp);
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
                $readfile = TRUE;
            }
            if (file_exists($fp2)) {
                extractTalents($fp2);
                $readfile = TRUE;
            }
            if (!$readfile) {
                die("Hero Mods Files do not exist at either location (for talents): (" . $fp1 . ", " . $fp2 . ")");
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

//Output json
echo json_encode($global_json).E;