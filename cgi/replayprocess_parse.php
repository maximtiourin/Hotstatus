<?php
/*
 * Replay Process Parse
 * In charge of looking for downloaded replays and parsing them to insert their data into a mongodb database
 */

namespace Fizzik;

require_once 'includes/include.php';
require_once 'includes/ReplayParser.php';
require_once 'includes/MMRCalculator.php';

use Fizzik\Database\MySqlDatabase;
use Fizzik\Database\MongoDBDatabase;
use Fizzik\Utility\Console;
use Fizzik\Utility\FileHandling;
use Fizzik\Utility\SleepHandler;
use MongoDB\BulkWriteResult;
use MongoDB\Collection;
use MongoDB\DeleteResult;
use MongoDB\Driver\Exception\BulkWriteException;
use MongoDB\InsertManyResult;
use MongoDB\InsertOneResult;
use MongoDB\UpdateResult;

set_time_limit(0);
date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);

$db = new MysqlDatabase();
$creds = Credentials::getReplayProcessCredentials();
$db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);
$db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

$mongo = new MongoDBDatabase();
$mongo->connect($creds[Credentials::KEY_MONGODB_URI]);
$mongo->selectDatabase('hotstatus');

//Constants and qol
const MONGODB_ERROR_SLEEP_DURATION = 60; //seconds
const SLEEP_DURATION = 5; //seconds
const MINI_SLEEP_DURATION = 1; //seconds
const UNLOCK_DEFAULT_DURATION = 5; //Must be unlocked for atleast 5 seconds
const UNLOCK_PARSING_DURATION = 60; //Must be unlocked for atleast 1 minute while parsing status
const E = PHP_EOL;
$sleep = new SleepHandler();
$console = new Console();

//Prepare statements
$db->prepare("UpdateReplayStatus",
    "UPDATE replays SET status = ?, lastused = ? WHERE id = ?");
$db->bind("UpdateReplayStatus", "sii", $r_status, $r_timestamp, $r_id);
$db->prepare("UpdateReplayParsed",
    "UPDATE replays SET match_id = ?, file = NULL, status = ?, lastused = ? WHERE id = ?");
$db->bind("UpdateReplayParsed", "isii", $r_match_id, $r_status, $r_timestamp, $r_id);
$db->prepare("SelectNextReplayWithStatus-Unlocked",
    "SELECT * FROM replays WHERE status = ? AND lastused <= ? ORDER BY id ASC LIMIT 1");
$db->bind("SelectNextReplayWithStatus-Unlocked", "si", $r_status, $r_timestamp);
$db->prepare("GetHeroNameSortFromAttribute",
    "SELECT name_sort FROM herodata_heroes WHERE name_attribute = ?");
$db->bind("GetHeroNameSortFromAttribute", "s", $r_name_attribute);
$db->prepare("GetHeroNameSortFromHeroName",
    "SELECT name_sort FROM herodata_heroes WHERE name = ?");
$db->bind("GetHeroNameSortFromHeroName", "s", $r_name);
$db->prepare("GetMapNameSortFromMapName",
    "SELECT name_sort FROM herodata_maps WHERE name = ?");
$db->bind("GetMapNameSortFromMapName", "s", $r_name);

//Helper functions

/*
 * Handles the outputting of information about a bulkwrite exception
 */
function BulkWriteExceptionHandler(BulkWriteException $e) {
    $res = $e->getWriteResult();

    echo "MongoDB Bulk Write errors:".E.E;
    foreach ($res->getWriteErrors() as $error) {
        $index = $error->getIndex();
        $msg = $error->getMessage();

        echo "$index: $msg".E.E;
    }

    return $res;
}

function BulkWriteHandler(\MongoDB\Collection $collection, $res) {
    $collectionName = $collection->getCollectionName();

    if ($res instanceof BulkWriteResult) {
        $upsertedCount = $res->getUpsertedCount();
        $modifiedCount = $res->getModifiedCount();
        $insertedCount = $res->getInsertedCount();
        $matchedCount = $res->getMatchedCount();
        $deletedCount = $res->getDeletedCount();

        echo "Matched $matchedCount: Inserted $insertedCount, Upserted $upsertedCount, Modified $modifiedCount, Deleted $deletedCount documents in '$collectionName' collection".E;
    }
    else if ($res instanceof DeleteResult) {
        $deletedCount = $res->getDeletedCount();

        echo "Deleted $deletedCount documents in '$collectionName' collection".E;
    }
    else if ($res instanceof InsertManyResult) {
        $insertedCount = $res->getInsertedCount();
        echo "Inserted $insertedCount documents in '$collectionName' collection".E;
    }
    else if ($res instanceof InsertOneResult) {
        $insertedCount = $res->getInsertedCount();
        echo "Inserted $insertedCount documents in '$collectionName' collection".E;
    }
    else if ($res instanceof UpdateResult) {
        $upsertedCount = $res->getUpsertedCount();
        $modifiedCount = $res->getModifiedCount();
        $matchedCount = $res->getMatchedCount();
        echo "Matched $matchedCount: Upserted $upsertedCount, Modified $modifiedCount documents in '$collectionName' collection".E;
    }
}

/*
 * Inserts match into 'matches' collection
 *
 * If operations are successful, Returns assoc array:
 * ['match'] = Updated parse data with new fields added
 * ['match_id'] = The official match id tied to the match data
 *
 * Otherwise, returns FALSE
 */
function insertMatch(&$parse, $mapMapping, $heroNameMappings, &$mmrcalc, &$old_mmrs, &$new_mmrs) {
    global $mongo, $r_id;

    $parse['_id'] = $r_id; //Set document id to be the match id

    /* Update document with additional relevant data */
    //Week Data
    $parse['week_info'] = HotstatusPipeline::getWeekDataOfReplay($parse['date']);

    //Team MMR
    $parse['mmr'] = [
        '0' => [
            'old' => [
                'rating' => $mmrcalc['team_ratings']['initial'][0]
            ],
            'new' => [
                'rating' => $mmrcalc['team_ratings']['final'][0]
            ]
        ],
        '1' => [
            'old' => [
                'rating' => $mmrcalc['team_ratings']['initial'][1]
            ],
            'new' => [
                'rating' => $mmrcalc['team_ratings']['final'][1]
            ]
        ],
        'quality' => $mmrcalc['match_quality']
    ];

    //Map mapping
    $parse['map'] = $mapMapping;

    //Player MMR && Hero Name mappings
    foreach ($parse['players'] as &$player) {
        $player['hero'] = $heroNameMappings[$player['hero']];

        $player['mmr'] = [
            'old' => [
                'rating' => $old_mmrs['team'.$player['team']][$player['id'].""]['rating'],
                'mu' => $old_mmrs['team'.$player['team']][$player['id'].""]['mu'],
                'sigma' => $old_mmrs['team'.$player['team']][$player['id'].""]['sigma'],
            ],
            'new' => [
                'rating' => $new_mmrs['team'.$player['team']][$player['id'].""]['rating'],
                'mu' => $new_mmrs['team'.$player['team']][$player['id'].""]['mu'],
                'sigma' => $new_mmrs['team'.$player['team']][$player['id'].""]['sigma'],
            ]
        ];
    }

    //Begin inserting 'match' document
    /** @var Collection $clc */
    $clc = $mongo->selectCollection('matches');

    try {
        $res = $clc->insertOne($parse);

        $ret = true;
    }
    catch (BulkWriteException $e) {
        $res = BulkWriteExceptionHandler($e);

        $ret = false;
    }

    BulkWriteHandler($clc, $res);

    if ($ret) {
        return ['match' => $parse, 'match_id' => $res->getInsertedId()];
    }
    else {
        return FALSE;
    }
}

/*
 * Upserts the 'weeklyMatches' collection with relevant match data
 * Returns TRUE on complete success, FALSE if any errors occurred
 */
function updateWeeklyMatches(&$match) {
    global $mongo;

    /** @var Collection $clc_weeklyMatches */
    $clc_weeklyMatches = $mongo->selectCollection('weeklyMatches');

    $scope = "";

    //Multi Calc values
    $weekinfo = $match['week_info'];
    $mapid = $match['map'];
    $gametypeid = $match['type'];

    //Init Arrays
    $filter = [];
    $addToSet = [];

    $filter['_id'] = [
        'year' => $weekinfo['year'],
        'week' => $weekinfo['week'],
    ];
    $set["date_start"] = $weekinfo['date_start'];
    $set["date_end"] = $weekinfo['date_end'];
    $scope = "matches.$mapid.$gametypeid";
    $addToSet[$scope] = $match['_id'];

    //Execute write and handle displaying info about it
    try {
        $res = $clc_weeklyMatches->updateOne(
            $filter,        //Filter Array
            [               //Update Array
                '$addToSet' => $addToSet
            ],
            [               //Options Array
                'upsert' => true
            ]
        );

        $ret = TRUE;
    }
    catch (BulkWriteException $e) {
        $res = BulkWriteExceptionHandler($e);

        $ret = FALSE;
    }

    BulkWriteHandler($clc_weeklyMatches, $res);

    return $ret;
}

/*
 * Updates the 'players' collection with all relevant player data
 * Returns TRUE on complete success, FALSE if any errors occurred
 */
function updatePlayers(&$match, $seasonid, &$new_mmrs) {
    global $mongo;

    //A assoc array of bulk write operations, {'OP_NAME' => ['PARAMETERS', ...]}
    $bulkWrites = [];

    //Players collection
    /** @var Collection $clc_players */
    $clc_players = $mongo->selectCollection('players');

    //Iterate through players and update relevant structures while aggregating stats
    foreach ($match['players'] as $player) {
        //Init helpers
        $scope = "";
        $w_scope = "";
        $b_scope = "";

        //Multi Calc values
        $inc_wonMatch = ($player['team'] === $match['winner']) ? (1) : (0); //Did player win the match?
        $set_playermmr = $new_mmrs['team'.$player['team']][$player['id'].""]; //The player's new mmr object
        $talents = $player['talents'];

        //Init Arrays
        $filter = [];
        $set = [];
        $max = [];
        $inc = [];
        $addToSet = [];

        /* !!!!!!!!!! Build Filter Array */
        // ??? _id
        $filter['_id'] = $player['id'];
        /* !!!!!!!!!! Build Update Array */
        // >>> name
        $set['name'] = $player['name'];
        // >>> tag
        $set['tag'] = $player['tag'];
        // >>> region
        $set['region'] = $match['region'];
        // >>> account_level
        $max['account_level'] = $player['account_level'];
        // >>> summary_data
        // >>>.>>> mmr
        // >>>.>>>.>>> granular
        $scope = "summary_data.mmr.granular";
        // >>>.>>>.>>>.>>> "SeasonId"
        $scope .= ".".$seasonid;
        // >>>.>>>.>>>.>>>.>>> "GameTypeId"
        $scope .= ".".$match['type'];
        // >>>.>>>.>>>.>>>.>>>.>>> rating
        $set["$scope.rating"] = $set_playermmr['rating'];
        // >>>.>>>.>>>.>>>.>>>.>>> mu
        $set["$scope.mu"] = $set_playermmr['mu'];
        // >>>.>>>.>>>.>>>.>>>.>>> sigma
        $set["$scope.sigma"] = $set_playermmr['sigma'];
        // >>>.>>> matches
        // >>>.>>>.>>> total
        $scope = "summary_data.matches.total";
        // >>>.>>>.>>>.>>> played
        $inc["$scope.played"] = 1;
        // >>>.>>>.>>>.>>> won
        $inc["$scope.won"] = $inc_wonMatch;
        // >>>.>>>.>>>.>>> timeplayed
        $inc["$scope.timeplayed"] = $match['match_length'];
        // >>>.>>>.>>>.>>> silenced_played
        $inc["$scope.silenced_played"] = ($player['silenced'] === 1) ? ($match['match_length']) : (0);
        // >>>.>>>.>>>.>>> stats
        $scope .= ".stats";
        // >>>.>>>.>>>.>>>.>>> kills
        $inc["$scope.kills"] = $player['stats']['kills'];
        // >>>.>>>.>>>.>>>.>>> assists
        $inc["$scope.assists"] = $player['stats']['assists'];
        // >>>.>>>.>>>.>>>.>>> deaths
        $inc["$scope.deaths"] = $player['stats']['deaths'];
        // >>>.>>>.>>>.>>>.>>> siege_damage
        $inc["$scope.siege_damage"] = $player['stats']['siege_damage'];
        // >>>.>>>.>>>.>>>.>>> hero_damage
        $inc["$scope.hero_damage"] = $player['stats']['hero_damage'];
        // >>>.>>>.>>>.>>>.>>> structure_damage
        $inc["$scope.structure_damage"] = $player['stats']['structure_damage'];
        // >>>.>>>.>>>.>>>.>>> healing
        $inc["$scope.healing"] = $player['stats']['healing'];
        // >>>.>>>.>>>.>>>.>>> damage_taken
        $inc["$scope.damage_taken"] = $player['stats']['damage_taken'];
        // >>>.>>>.>>>.>>>.>>> merc_camps
        $inc["$scope.merc_camps"] = $player['stats']['merc_camps'];
        // >>>.>>>.>>>.>>>.>>> exp_contrib
        $inc["$scope.exp_contrib"] = $player['stats']['exp_contrib'];
        // >>>.>>>.>>>.>>>.>>> best_killstreak
        $max["$scope.best_killstreak"] = $player['stats']['best_killstreak'];
        // >>>.>>>.>>>.>>>.>>> time_spent_dead
        $inc["$scope.time_spent_dead"] = $player['stats']['time_spent_dead'];
        // <<<.<<<.<<<.<<<.<<< medals
        $w_scope = "$scope.medals";
        foreach ($player['stats']['medals'] as $medal) {
        // <<<.<<<.<<<.<<<.<<<.<<< "MedalId"
            $l_scope = "$w_scope.$medal";
            $inc["$l_scope.count"] = 1;
        }
        // >>>.>>>.>>> granular
        $scope = "summary_data.matches.granular";
        // >>>.>>>.>>>.>>> "HeroId"
        $scope .= ".".$player['hero'];
        // >>>.>>>.>>>.>>>.>>> hero_level
        $max["$scope.hero_level"] = $player['hero_level'];
        // >>>.>>>.>>>.>>>.>>> "MapId"
        $scope .= ".".$match['map'];
        // >>>.>>>.>>>.>>>.>>>.>>> "GameTypeId"
        $scope .= ".".$match['type'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> played
        $inc["$scope.played"] = 1;
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> won
        $inc["$scope.won"] = $inc_wonMatch;
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> timeplayed
        $inc["$scope.timeplayed"] = $match['match_length'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> stats
        $scope .= ".stats";
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> kills
        $inc["$scope.kills"] = $player['stats']['kills'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> assists
        $inc["$scope.assists"] = $player['stats']['assists'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> deaths
        $inc["$scope.deaths"] = $player['stats']['deaths'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> siege_damage
        $inc["$scope.siege_damage"] = $player['stats']['siege_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> hero_damage
        $inc["$scope.hero_damage"] = $player['stats']['hero_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> structure_damage
        $inc["$scope.structure_damage"] = $player['stats']['structure_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> healing
        $inc["$scope.healing"] = $player['stats']['healing'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> damage_taken
        $inc["$scope.damage_taken"] = $player['stats']['damage_taken'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> merc_camps
        $inc["$scope.merc_camps"] = $player['stats']['merc_camps'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> exp_contrib
        $inc["$scope.exp_contrib"] = $player['stats']['exp_contrib'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> best_killstreak
        $max["$scope.best_killstreak"] = $player['stats']['best_killstreak'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> time_spent_dead
        $inc["$scope.time_spent_dead"] = $player['stats']['time_spent_dead'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< medals
        $w_scope = "$scope.medals";
        foreach ($player['stats']['medals'] as $medal) {
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "MedalId"
            $l_scope = "$w_scope.$medal";
            $inc["$l_scope.count"] = 1;
        }
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
        if (count($talents) > 0) {
            $w_scope = "$scope.talents";
            foreach ($talents as $talent) {
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "TalentId"
                $l_scope = "$w_scope.$talent";
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
                $inc["$l_scope.played"] = 1;
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
                $inc["$l_scope.won"] = $inc_wonMatch;
            }
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< builds
            $w_scope = "$scope.builds";
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "BuildTalentHashKey"
            $w_scope .= "." . HotstatusPipeline::getTalentBuildHash($talents);
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
            $set["$w_scope.talents"] = $talents;
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
            $inc["$w_scope.played"] = 1;
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
            $inc["$w_scope.won"] = $inc_wonMatch;
        }
        // >>> weekly_data
        $scope = "weekly_data";
        // >>>.>>> "ISO_YEAR"
        $scope .= ".".$match['week_info']['year'];
        // >>>.>>>.>>> "ISO_WEEK"
        $scope .= ".".$match['week_info']['week'];
        // >>>.>>>.>>>.>>> date_start
        $set["$scope.date_start"] = $match['week_info']['date_start'];
        // >>>.>>>.>>>.>>> date_end
        $set["$scope.date_end"] = $match['week_info']['date_end'];
        // >>>.>>>.>>>.>>> matches
        $scope .= ".matches";
        // >>>.>>>.>>>.>>>.>>> total
        $w_scope = "$scope.total";
        // >>>.>>>.>>>.>>>.>>>.>>> played
        $inc["$w_scope.played"] = 1;
        // >>>.>>>.>>>.>>>.>>>.>>> won
        $inc["$w_scope.won"] = $inc_wonMatch;
        // >>>.>>>.>>>.>>>.>>>.>>> timeplayed
        $inc["$w_scope.timeplayed"] = $match['match_length'];
        // >>>.>>>.>>>.>>>.>>>.>>> stats
        $w_scope .= ".stats";
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> kills
        $inc["$w_scope.kills"] = $player['stats']['kills'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> assists
        $inc["$w_scope.assists"] = $player['stats']['assists'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> deaths
        $inc["$w_scope.deaths"] = $player['stats']['deaths'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> siege_damage
        $inc["$w_scope.siege_damage"] = $player['stats']['siege_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> hero_damage
        $inc["$w_scope.hero_damage"] = $player['stats']['hero_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> structure_damage
        $inc["$w_scope.structure_damage"] = $player['stats']['structure_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> healing
        $inc["$w_scope.healing"] = $player['stats']['healing'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> damage_taken
        $inc["$w_scope.damage_taken"] = $player['stats']['damage_taken'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> merc_camps
        $inc["$w_scope.merc_camps"] = $player['stats']['merc_camps'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> exp_contrib
        $inc["$w_scope.exp_contrib"] = $player['stats']['exp_contrib'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> best_killstreak
        $max["$w_scope.best_killstreak"] = $player['stats']['best_killstreak'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> time_spent_dead
        $inc["$w_scope.time_spent_dead"] = $player['stats']['time_spent_dead'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<< medals
        $b_scope = "$w_scope.medals";
        foreach ($player['stats']['medals'] as $medal) {
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "MedalId"
            $l_scope = "$b_scope.$medal";
            $inc["$l_scope.count"] = 1;
        }
        // >>>.>>>.>>>.>>>.>>> granular
        $w_scope = "$scope.granular";
        // >>>.>>>.>>>.>>>.>>>.>>> "HeroId"
        $w_scope .= ".".$player['hero'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> "MapId"
        $w_scope .= ".".$match['map'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> "GameTypeId"
        $w_scope .= ".".$match['type'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> played
        $inc["$w_scope.played"] = 1;
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> won
        $inc["$w_scope.won"] = $inc_wonMatch;
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> timeplayed
        $inc["$w_scope.timeplayed"] = $match['match_length'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> stats
        $w_scope .= ".stats";
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> kills
        $inc["$w_scope.kills"] = $player['stats']['kills'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> assists
        $inc["$w_scope.assists"] = $player['stats']['assists'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> deaths
        $inc["$w_scope.deaths"] = $player['stats']['deaths'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> siege_damage
        $inc["$w_scope.siege_damage"] = $player['stats']['siege_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> hero_damage
        $inc["$w_scope.hero_damage"] = $player['stats']['hero_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> structure_damage
        $inc["$w_scope.structure_damage"] = $player['stats']['structure_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> healing
        $inc["$w_scope.healing"] = $player['stats']['healing'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> damage_taken
        $inc["$w_scope.damage_taken"] = $player['stats']['damage_taken'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> merc_camps
        $inc["$w_scope.merc_camps"] = $player['stats']['merc_camps'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> exp_contrib
        $inc["$w_scope.exp_contrib"] = $player['stats']['exp_contrib'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> best_killstreak
        $max["$w_scope.best_killstreak"] = $player['stats']['best_killstreak'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> time_spent_dead
        $inc["$w_scope.time_spent_dead"] = $player['stats']['time_spent_dead'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< medals
        $b_scope = "$w_scope.medals";
        foreach ($player['stats']['medals'] as $medal) {
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "MedalId"
            $l_scope = "$b_scope.$medal";
            $inc["$l_scope.count"] = 1;
        }
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
        if (count($talents) > 0) {
            $b_scope = "$w_scope.talents";
            foreach ($talents as $talent) {
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "TalentId"
                $l_scope = "$b_scope.$talent";
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
                $inc["$l_scope.played"] = 1;
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
                $inc["$l_scope.won"] = $inc_wonMatch;
            }
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< builds
            $b_scope = "$w_scope.builds";
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "BuildTalentHashKey"
            $b_scope .= "." . HotstatusPipeline::getTalentBuildHash($talents);
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
            $set["$b_scope.talents"] = $talents;
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
            $inc["$b_scope.played"] = 1;
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
            $inc["$b_scope.won"] = $inc_wonMatch;
        }
        if (count($player['party']) > 0) {
            // >>>.>>>.>>>.>>>.>>> parties
            $w_scope = "$scope.parties";
            // >>>.>>>.>>>.>>>.>>>.>>> "PartyHashKey"
            $w_scope .= "." . HotstatusPipeline::getPerPlayerPartyHash($player['party']);
            // >>>.>>>.>>>.>>>.>>>.>>>.>>> players
            $set["$w_scope.players"] = HotstatusPipeline::getPlayerIdArrayFromPlayerPartyRelationArray($match['players'], $player['party']);
            // >>>.>>>.>>>.>>>.>>>.>>>.>>> played
            $inc["$w_scope.played"] = 1;
            // >>>.>>>.>>>.>>>.>>>.>>>.>>> won
            $inc["$w_scope.won"] = $inc_wonMatch;
        }
        // >>>.>>>.>>>.>>>.>>> list
        $addToSet["$scope.list"] = $match['_id'];


        // !!!!!!!!!! Build Complete Operation
        $op = [
            $filter,        //Filter Array
            [               //Update Array
                '$set' => $set,
                '$max' => $max,
                '$inc' => $inc,
                '$addToSet' => $addToSet
            ],
            [               //Options Array
                'upsert' => true
            ]
        ];

        $bulkWrites[] = ['updateOne' => $op];
    }

    //Bulk write out all operations with unordered option (Failed operations do not impact other operations)
    try {
        $res = $clc_players->bulkWrite($bulkWrites, [
            'ordered' => false
        ]);

        $ret = TRUE;
    }
    catch (BulkWriteException $e) {
        $res = BulkWriteExceptionHandler($e);

        $ret = FALSE;
    }

    BulkWriteHandler($clc_players, $res);

    return $ret;
}

/*
 * Updates the 'heroes' collection with all relevant hero data
 * Returns TRUE on complete success, FALSE if any errors occurred
 */
function updateHeroes(&$match, &$bannedHeroes) {
    global $mongo;

    //A assoc array of bulk write operations, {'OP_NAME' => ['PARAMETERS', ...]}
    $bulkWrites = [];

    //Heroes collection
    /** @var Collection $clc_heroes */
    $clc_heroes = $mongo->selectCollection('heroes');

    //Iterate through players and update relevant structures while aggregating stats
    foreach ($match['players'] as $player) {
        //Init helpers
        $scope = "";
        $w_scope = "";
        $b_scope = "";

        //Multi Calc values
        $inc_wonMatch = ($player['team'] === $match['winner']) ? (1) : (0); //Did player win the match?
        $talents = $player['talents'];

        //Init Arrays
        $filter = [];
        $set = [];
        $max = [];
        $inc = [];
        $addToSet = [];

        /* !!!!!!!!!! Build Filter Array */
        // ??? _id
        $filter['_id'] = $player['hero'];
        /* !!!!!!!!!! Build Update Array */
        // >>> summary_data #@@#
        // >>>.>>> matches
        // >>>.>>>.>>> total #@@#
        $scope = "summary_data.matches.total";
        // >>>.>>>.>>>.>>> played
        $inc["$scope.played"] = 1;
        // >>>.>>>.>>>.>>> won
        $inc["$scope.won"] = $inc_wonMatch;
        // >>>.>>>.>>>.>>> timeplayed
        $inc["$scope.timeplayed"] = $match['match_length'];
        // >>>.>>>.>>>.>>> stats
        $scope .= ".stats";
        // >>>.>>>.>>>.>>>.>>> kills
        $inc["$scope.kills"] = $player['stats']['kills'];
        // >>>.>>>.>>>.>>>.>>> assists
        $inc["$scope.assists"] = $player['stats']['assists'];
        // >>>.>>>.>>>.>>>.>>> deaths
        $inc["$scope.deaths"] = $player['stats']['deaths'];
        // >>>.>>>.>>>.>>>.>>> siege_damage
        $inc["$scope.siege_damage"] = $player['stats']['siege_damage'];
        // >>>.>>>.>>>.>>>.>>> hero_damage
        $inc["$scope.hero_damage"] = $player['stats']['hero_damage'];
        // >>>.>>>.>>>.>>>.>>> structure_damage
        $inc["$scope.structure_damage"] = $player['stats']['structure_damage'];
        // >>>.>>>.>>>.>>>.>>> healing
        $inc["$scope.healing"] = $player['stats']['healing'];
        // >>>.>>>.>>>.>>>.>>> damage_taken
        $inc["$scope.damage_taken"] = $player['stats']['damage_taken'];
        // >>>.>>>.>>>.>>>.>>> merc_camps
        $inc["$scope.merc_camps"] = $player['stats']['merc_camps'];
        // >>>.>>>.>>>.>>>.>>> exp_contrib
        $inc["$scope.exp_contrib"] = $player['stats']['exp_contrib'];
        // >>>.>>>.>>>.>>>.>>> best_killstreak
        $max["$scope.best_killstreak"] = $player['stats']['best_killstreak'];
        // >>>.>>>.>>>.>>>.>>> time_spent_dead
        $inc["$scope.time_spent_dead"] = $player['stats']['time_spent_dead'];
        // <<<.<<<.<<<.<<<.<<< medals
        $w_scope = "$scope.medals";
        foreach ($player['stats']['medals'] as $medal) {
            // <<<.<<<.<<<.<<<.<<<.<<< "MedalId"
            $l_scope = "$w_scope.$medal";
            $inc["$l_scope.count"] = 1;
        }
        // >>>.>>>.>>> granular #@@#
        $scope = "summary_data.matches.granular";
        // >>>.>>>.>>>.>>>.>>> "MapId"
        $scope .= ".".$match['map'];
        // >>>.>>>.>>>.>>>.>>>.>>> "GameTypeId"
        $scope .= ".".$match['type'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> played
        $inc["$scope.played"] = 1;
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> won
        $inc["$scope.won"] = $inc_wonMatch;
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> timeplayed
        $inc["$scope.timeplayed"] = $match['match_length'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> stats
        $scope .= ".stats";
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> kills
        $inc["$scope.kills"] = $player['stats']['kills'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> assists
        $inc["$scope.assists"] = $player['stats']['assists'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> deaths
        $inc["$scope.deaths"] = $player['stats']['deaths'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> siege_damage
        $inc["$scope.siege_damage"] = $player['stats']['siege_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> hero_damage
        $inc["$scope.hero_damage"] = $player['stats']['hero_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> structure_damage
        $inc["$scope.structure_damage"] = $player['stats']['structure_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> healing
        $inc["$scope.healing"] = $player['stats']['healing'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> damage_taken
        $inc["$scope.damage_taken"] = $player['stats']['damage_taken'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> merc_camps
        $inc["$scope.merc_camps"] = $player['stats']['merc_camps'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> exp_contrib
        $inc["$scope.exp_contrib"] = $player['stats']['exp_contrib'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> best_killstreak
        $max["$scope.best_killstreak"] = $player['stats']['best_killstreak'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> time_spent_dead
        $inc["$scope.time_spent_dead"] = $player['stats']['time_spent_dead'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< medals
        $w_scope = "$scope.medals";
        foreach ($player['stats']['medals'] as $medal) {
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "MedalId"
            $l_scope = "$w_scope.$medal";
            $inc["$l_scope.count"] = 1;
        }
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
        if (count($talents) > 0) {
            $w_scope = "$scope.talents";
            foreach ($talents as $talent) {
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "TalentId"
                $l_scope = "$w_scope.$talent";
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
                $inc["$l_scope.played"] = 1;
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
                $inc["$l_scope.won"] = $inc_wonMatch;
            }
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< builds
            $w_scope = "$scope.builds";
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "BuildTalentHashKey"
            $w_scope .= "." . HotstatusPipeline::getTalentBuildHash($talents);
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
            $set["$w_scope.talents"] = $talents;
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
            $inc["$w_scope.played"] = 1;
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
            $inc["$w_scope.won"] = $inc_wonMatch;
        }
        // >>> weekly_data #@@#
        $scope = "weekly_data";
        // >>>.>>> "ISO_YEAR"
        $scope .= ".".$match['week_info']['year'];
        // >>>.>>>.>>> "ISO_WEEK"
        $scope .= ".".$match['week_info']['week'];
        // >>>.>>>.>>>.>>> date_start
        $set["$scope.date_start"] = $match['week_info']['date_start'];
        // >>>.>>>.>>>.>>> date_end
        $set["$scope.date_end"] = $match['week_info']['date_end'];
        // >>>.>>>.>>>.>>> matches #@@#
        $scope .= ".matches";
        // >>>.>>>.>>>.>>>.>>> total #@@#
        $w_scope = "$scope.total";
        // >>>.>>>.>>>.>>>.>>>.>>> played
        $inc["$w_scope.played"] = 1;
        // >>>.>>>.>>>.>>>.>>>.>>> won
        $inc["$w_scope.won"] = $inc_wonMatch;
        // >>>.>>>.>>>.>>>.>>>.>>> timeplayed
        $inc["$w_scope.timeplayed"] = $match['match_length'];
        // >>>.>>>.>>>.>>>.>>>.>>> stats
        $w_scope .= ".stats";
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> kills
        $inc["$w_scope.kills"] = $player['stats']['kills'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> assists
        $inc["$w_scope.assists"] = $player['stats']['assists'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> deaths
        $inc["$w_scope.deaths"] = $player['stats']['deaths'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> siege_damage
        $inc["$w_scope.siege_damage"] = $player['stats']['siege_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> hero_damage
        $inc["$w_scope.hero_damage"] = $player['stats']['hero_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> structure_damage
        $inc["$w_scope.structure_damage"] = $player['stats']['structure_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> healing
        $inc["$w_scope.healing"] = $player['stats']['healing'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> damage_taken
        $inc["$w_scope.damage_taken"] = $player['stats']['damage_taken'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> merc_camps
        $inc["$w_scope.merc_camps"] = $player['stats']['merc_camps'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> exp_contrib
        $inc["$w_scope.exp_contrib"] = $player['stats']['exp_contrib'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> best_killstreak
        $max["$w_scope.best_killstreak"] = $player['stats']['best_killstreak'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> time_spent_dead
        $inc["$w_scope.time_spent_dead"] = $player['stats']['time_spent_dead'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<< medals
        $b_scope = "$w_scope.medals";
        foreach ($player['stats']['medals'] as $medal) {
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "MedalId"
            $l_scope = "$b_scope.$medal";
            $inc["$l_scope.count"] = 1;
        }
        // >>>.>>>.>>>.>>>.>>> 'Hero League' #@@#
        $w_scope = "$scope.Hero League";
        // >>>.>>>.>>>.>>>.>>>.>>> played
        $inc["$w_scope.played"] = 1;
        // >>>.>>>.>>>.>>>.>>>.>>> won
        $inc["$w_scope.won"] = $inc_wonMatch;
        // >>>.>>>.>>>.>>>.>>>.>>> timeplayed
        $inc["$w_scope.timeplayed"] = $match['match_length'];
        // >>>.>>>.>>>.>>>.>>>.>>> stats
        $w_scope .= ".stats";
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> kills
        $inc["$w_scope.kills"] = $player['stats']['kills'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> assists
        $inc["$w_scope.assists"] = $player['stats']['assists'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> deaths
        $inc["$w_scope.deaths"] = $player['stats']['deaths'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> siege_damage
        $inc["$w_scope.siege_damage"] = $player['stats']['siege_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> hero_damage
        $inc["$w_scope.hero_damage"] = $player['stats']['hero_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> structure_damage
        $inc["$w_scope.structure_damage"] = $player['stats']['structure_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> healing
        $inc["$w_scope.healing"] = $player['stats']['healing'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> damage_taken
        $inc["$w_scope.damage_taken"] = $player['stats']['damage_taken'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> merc_camps
        $inc["$w_scope.merc_camps"] = $player['stats']['merc_camps'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> exp_contrib
        $inc["$w_scope.exp_contrib"] = $player['stats']['exp_contrib'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> best_killstreak
        $max["$w_scope.best_killstreak"] = $player['stats']['best_killstreak'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> time_spent_dead
        $inc["$w_scope.time_spent_dead"] = $player['stats']['time_spent_dead'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< medals
        $b_scope = "$w_scope.medals";
        foreach ($player['stats']['medals'] as $medal) {
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "MedalId"
            $l_scope = "$b_scope.$medal";
            $inc["$l_scope.count"] = 1;
        }
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
        if (count($talents) > 0) {
            $b_scope = "$w_scope.talents";
            foreach ($talents as $talent) {
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "TalentId"
                $l_scope = "$b_scope.$talent";
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
                $inc["$l_scope.played"] = 1;
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
                $inc["$l_scope.won"] = $inc_wonMatch;
            }
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< builds
            $b_scope = "$w_scope.builds";
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "BuildTalentHashKey"
            $b_scope .= "." . HotstatusPipeline::getTalentBuildHash($talents);
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
            $set["$b_scope.talents"] = $talents;
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
            $inc["$b_scope.played"] = 1;
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
            $inc["$b_scope.won"] = $inc_wonMatch;
        }
        // >>>.>>>.>>>.>>>.>>> granular #@@#
        $w_scope = "$scope.granular";
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> "MapId"
        $w_scope .= ".".$match['map'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> "GameTypeId"
        $w_scope .= ".".$match['type'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> played
        $inc["$w_scope.played"] = 1;
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> won
        $inc["$w_scope.won"] = $inc_wonMatch;
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> timeplayed
        $inc["$w_scope.timeplayed"] = $match['match_length'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> stats
        $w_scope .= ".stats";
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> kills
        $inc["$w_scope.kills"] = $player['stats']['kills'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> assists
        $inc["$w_scope.assists"] = $player['stats']['assists'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> deaths
        $inc["$w_scope.deaths"] = $player['stats']['deaths'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> siege_damage
        $inc["$w_scope.siege_damage"] = $player['stats']['siege_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> hero_damage
        $inc["$w_scope.hero_damage"] = $player['stats']['hero_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> structure_damage
        $inc["$w_scope.structure_damage"] = $player['stats']['structure_damage'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> healing
        $inc["$w_scope.healing"] = $player['stats']['healing'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> damage_taken
        $inc["$w_scope.damage_taken"] = $player['stats']['damage_taken'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> merc_camps
        $inc["$w_scope.merc_camps"] = $player['stats']['merc_camps'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> exp_contrib
        $inc["$w_scope.exp_contrib"] = $player['stats']['exp_contrib'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> best_killstreak
        $max["$w_scope.best_killstreak"] = $player['stats']['best_killstreak'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> time_spent_dead
        $inc["$w_scope.time_spent_dead"] = $player['stats']['time_spent_dead'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< medals
        $b_scope = "$w_scope.medals";
        foreach ($player['stats']['medals'] as $medal) {
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "MedalId"
            $l_scope = "$b_scope.$medal";
            $inc["$l_scope.count"] = 1;
        }
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
        if (count($talents) > 0) {
            $b_scope = "$w_scope.talents";
            foreach ($talents as $talent) {
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "TalentId"
                $l_scope = "$b_scope.$talent";
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
                $inc["$l_scope.played"] = 1;
                // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
                $inc["$l_scope.won"] = $inc_wonMatch;
            }
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< builds
            $b_scope = "$w_scope.builds";
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< "BuildTalentHashKey"
            $b_scope .= "." . HotstatusPipeline::getTalentBuildHash($talents);
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
            $set["$b_scope.talents"] = $talents;
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
            $inc["$b_scope.played"] = 1;
            // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
            $inc["$b_scope.won"] = $inc_wonMatch;
        }
        // >>>.>>>.>>>.>>>.>>> list
        $addToSet["$scope.list"] = $match['_id'];



        // !!!!!!!!!! Build Complete Operation
        $op = [
            $filter,        //Filter Array
            [               //Update Array
                '$set' => $set,
                '$max' => $max,
                '$inc' => $inc,
                '$addToSet' => $addToSet
            ],
            [               //Options Array
                'upsert' => true
            ]
        ];

        $bulkWrites[] = ['updateOne' => $op];
    }

    //Handle bans
    foreach ($bannedHeroes as $heroban) {
        //Init helpers
        $scope = "";
        $w_scope = "";
        $b_scope = "";

        //Init Arrays
        $inc = [];

        /* !!!!!!!!!! Build Filter Array */
        // ??? _id
        $filter['_id'] = $heroban;
        /* !!!!!!!!!! Build Update Array */
        // >>> summary_data
        // >>>.>>> matches #@@#
        // >>>.>>>.>>> granular #@@#
        $scope = "summary_data.matches.granular";
        // >>>.>>>.>>>.>>> "MapId"
        $scope .= ".".$match['map'];
        // >>>.>>>.>>>.>>>.>>> "GameTypeId"
        $scope .= ".".$match['type'];
        // >>>.>>>.>>>.>>>.>>>.>>> banned
        $inc["$scope.banned"] = 1;
        // >>> weekly_data #@@#
        $scope = "weekly_data";
        // >>>.>>> "ISO_YEAR"
        $scope .= ".".$match['week_info']['year'];
        // >>>.>>>.>>> "ISO_WEEK"
        $scope .= ".".$match['week_info']['week'];
        // >>>.>>>.>>>.>>> matches #@@#
        $scope .= ".matches";
        // >>>.>>>.>>>.>>>.>>> 'Hero League' #@@#
        $w_scope = "$scope.Hero League";
        // >>>.>>>.>>>.>>>.>>>.>>> banned
        $inc["$w_scope.banned"] = 1;
        // >>>.>>>.>>>.>>>.>>> granular #@@#
        $w_scope = "$scope.granular";
        // >>>.>>>.>>>.>>>.>>>.>>>.>>> "MapId"
        $w_scope .= ".".$match['map'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> "GameTypeId"
        $w_scope .= ".".$match['type'];
        // >>>.>>>.>>>.>>>.>>>.>>>.>>>.>>>.>>> banned
        $inc["$w_scope.banned"] = 1;



        // !!!!!!!!!! Build Complete Operation
        $op = [
            $filter,        //Filter Array
            [               //Update Array
                '$inc' => $inc
            ],
            [               //Options Array
                'upsert' => true
            ]
        ];

        $bulkWrites[] = ['updateOne' => $op];
    }

    //Bulk write out all operations with unordered option (Failed operations do not impact other operations)
    try {
        $res = $clc_heroes->bulkWrite($bulkWrites, [
            'ordered' => false
        ]);

        $ret = TRUE;
    }
    catch (BulkWriteException $e) {
        $res = BulkWriteExceptionHandler($e);

        $ret = FALSE;
    }

    BulkWriteHandler($clc_heroes, $res);

    return $ret;
}



//Begin main script
echo '--------------------------------------'.E
    .'Replay process <<PARSE>> has started'.E
    .'--------------------------------------'.E;

//Look for replays to parse and handle
while (true) {
    //Check for unlocked failed replay parses
    $r_status = HotstatusPipeline::REPLAY_STATUS_PARSING;
    $r_timestamp = time() - UNLOCK_PARSING_DURATION;
    $result = $db->execute("SelectNextReplayWithStatus-Unlocked");
    $resrows = $db->countResultRows($result);
    if ($resrows > 0) {
        //Found a failed replay parse, reset it to downloaded
        $row = $db->fetchArray($result);

        echo 'Found a failed replay parse at replay #' . $row['id'] . ', resetting status to \'' . HotstatusPipeline::REPLAY_STATUS_DOWNLOADED . '\'...'.E;

        $r_id = $row['id'];
        $r_status = HotstatusPipeline::REPLAY_STATUS_DOWNLOADED;
        $r_timestamp = time();

        $db->execute("UpdateReplayStatus");
    }
    else {
        //No replay parsing has previously failed, look for an unlocked downloaded replay to parse
        $r_status = HotstatusPipeline::REPLAY_STATUS_DOWNLOADED;
        $r_timestamp = time() - UNLOCK_DEFAULT_DURATION;
        $result2 = $db->execute("SelectNextReplayWithStatus-Unlocked");
        $resrows2 = $db->countResultRows($result2);
        if ($resrows2 > 0) {
            //Found an unlocked downloaded replay, parse it
            $row = $db->fetchArray($result2);

            $r_id = $row['id'];
            $r_status = HotstatusPipeline::REPLAY_STATUS_PARSING;
            $r_timestamp = time();

            $db->execute("UpdateReplayStatus");

            echo 'Parsing replay #' . $r_id . '...                                       '.E;

            $r_filepath = $row['file'];
            $r_fingerprint = $row['fingerprint'];

            $parse = ReplayParser::ParseReplay(__DIR__, $r_filepath);

            $createReplayCopy = FALSE;

            //Check if parse was a success
            if (!key_exists('error', $parse)) {
                /* Collect player mmrs and calculate new mmr for match season */
                $seasonid = HotstatusPipeline::getSeasonStringForDateTime($parse['date']);
                $matchtype = $parse['type'];

                $team0rank = ($parse['winner'] === 0) ? (1) : (2);
                $team1rank = ($parse['winner'] === 1) ? (1) : (2);

                //Get old mmrs if any
                $player_old_mmrs = [
                    "team0" => [],
                    "team1" => []
                ];
                foreach ($parse['players'] as $player) {
                    /** @var Collection $clc_players */
                    $clc_players = $mongo->selectCollection('players');
                    $res = $clc_players->findOne(
                        [               //Filter Array
                            '_id' => $player['id'],
                            "summary_data.mmr.granular.$seasonid.$matchtype" => ['$exists' => true]
                        ],
                        [               //Options Array
                            'projection' => [
                                '_id' => 0,
                                "summary_data.mmr.granular.$seasonid.$matchtype" => 1
                            ]
                        ]
                    );
                    if ($res !== null) {
                        //Found player mmr
                        $obj = $res['summary_data']['mmr']['granular'][$seasonid][$matchtype];

                        $mmr = [
                            'rating' => $obj['rating'],
                            'mu' => $obj['mu'],
                            'sigma' => $obj['sigma']
                        ];

                        $player_old_mmrs['team'.$player['team']][$player['id'].""] = $mmr;
                    }
                    else {
                        //Did not find an mmr for player
                        $mmr = [
                            'rating' => "?",
                            'mu' => "?",
                            'sigma' => "?"
                        ];

                        $player_old_mmrs['team'.$player['team']][$player['id'].""] = $mmr;
                    }
                }

                //Calculate new mmrs
                echo 'Calculating MMR...'.E;
                $calc = MMRCalculator::Calculate(__DIR__, $team0rank, $team1rank, $player_old_mmrs);

                //Check if mmr calculation was a success
                if (!key_exists('error', $calc)) {
                    //Collect new player mmrs
                    $player_new_mmrs = [
                        "team0" => [],
                        "team1" => []
                    ];
                    foreach ($parse['players'] as $player) {
                        $obj = $calc['players'][$player['id'].""];

                        $mmr = [
                            'rating' => $obj['mmr'],
                            'mu' => $obj['mu'],
                            'sigma' => $obj['sigma']
                        ];

                        $player_new_mmrs['team'.$player['team']][$player['id'].""] = $mmr;
                    }

                    //Collect mapping of ban attributes to hero name sorts
                    $bannedHeroes = [];
                    foreach ($parse['bans'] as $teambans) {
                        foreach ($teambans as $heroban) {
                            $r_name_attribute = $heroban;

                            $result3 = $db->execute("GetHeroNameSortFromAttribute");
                            $resrows3 = $db->countResultRows($result3);
                            if ($resrows3 > 0) {
                                $row2 = $db->fetchArray($result3);

                                $bannedHeroes[] = $row2['name_sort'];
                            }
                            $db->freeResult($result3);
                        }
                    }

                    //Collect mapping of hero names to hero name sorts
                    $heroNameMappings = [];
                    foreach ($parse['players'] as $player) {
                        $r_name = $player['hero'];

                        $heroNameMappings[$r_name] = $r_name; //Default Value

                        $result3 = $db->execute("GetHeroNameSortFromHeroName");
                        $resrows3 = $db->countResultRows($result3);
                        if ($resrows3 > 0) {
                            $row2 = $db->fetchArray($result3);

                            $heroNameMappings[$r_name] = $row2['name_sort'];
                        }
                        $db->freeResult($result3);
                    }

                    //Collect mapping of map names to map name sort
                    $mapMapping = $parse['map']; //Default Value

                    $r_name = $parse['map'];

                    $result3 = $db->execute("GetMapNameSortFromMapName");
                    $resrows3 = $db->countResultRows($result3);
                    if ($resrows3 > 0) {
                        $row2 = $db->fetchArray($result3);

                        $mapMapping = $row2['name_sort'];
                    }
                    $db->freeResult($result3);

                    //No parse error, add all relevant match data to database in needed collections
                    $insertResult = insertMatch($parse, $mapMapping, $heroNameMappings, $calc, $player_old_mmrs, $player_new_mmrs);

                    if ($insertResult === FALSE) {
                        //Error parsing match and inserting into 'matches', cancel parsing
                        //Copy local file into replay error directory for debugging purposes
                        $createReplayCopy = TRUE;

                        //Flag replay match status as 'mongodb_match_error'
                        $r_id = $row['id'];
                        $r_status = HotstatusPipeline::REPLAY_STATUS_MONGODB_MATCH_WRITE_ERROR;
                        $r_timestamp = time();

                        $db->execute("UpdateReplayStatus");

                        $sleep->add(MONGODB_ERROR_SLEEP_DURATION);
                    }
                    else {
                        //No error parsing match, continue with upserting of players, heroes, and weeklyMatches
                        $success_weeklymatches = false;
                        $success_players = false;
                        $success_heroes = false;

                        //WeeklyMatches
                        $success_weeklymatches = updateWeeklyMatches($insertResult['match']);
                        //Players
                        $success_players = updatePlayers($insertResult['match'], $seasonid, $player_new_mmrs);
                        //Heroes
                        $success_heroes = updateHeroes($insertResult['match'], $bannedHeroes);

                        $hadError = !$success_weeklymatches || !$success_players || !$success_heroes;

                        $errorstr = "";
                        if (!$success_weeklymatches) $errorstr .= "weeklyMatches";
                        if (!$success_players) $errorstr .= ", players";
                        if (!$success_heroes) $errorstr .= ", heroes";

                        if (!$hadError) {
                            //Flag replay as fully parsed
                            $r_id = $row['id'];
                            $r_match_id = $insertResult['match_id'];
                            $r_status = HotstatusPipeline::REPLAY_STATUS_PARSED;
                            $r_timestamp = time();

                            $db->execute("UpdateReplayParsed");

                            echo 'Successfully parsed replay #'.$r_id.'...'.E.E;
                        }
                        else {
                            //Copy local file into replay error directory for debugging purposes
                            $createReplayCopy = TRUE;

                            //Flag replay as partially parsed with mongodb_matchdata_error
                            $r_id = $row['id'];
                            $r_match_id = $insertResult['match_id'];
                            $r_status = HotstatusPipeline::REPLAY_STATUS_MONGODB_MATCHDATA_WRITE_ERROR;
                            $r_timestamp = time();

                            $db->execute("UpdateReplayParsed");

                            echo 'Semi-Successfully parsed replay #'.$r_id.'. MongoDB had trouble with portions of : '. $errorstr .'...'.E.E;
                        }
                    }
                }
                else {
                    //Copy local file into replay error directory for debugging purposes
                    $createReplayCopy = TRUE;

                    //Encountered an error parsing replay, output it, and flag replay as 'parse_mmr_error'
                    $r_id = $row['id'];
                    $r_status = HotstatusPipeline::REPLAY_STATUS_PARSE_MMR_ERROR;
                    $r_timestamp = time();

                    $db->execute("UpdateReplayStatus");

                    echo 'Failed to calculate mmr for replay #' . $r_id . ', Error : "' . $calc['error'] . '"...'.E.E;

                    $sleep->add(MINI_SLEEP_DURATION);
                }
            }
            else {
                //Copy local file into replay error directory for debugging purposes
                $createReplayCopy = TRUE;

                //Encountered an error parsing replay, output it and flag replay as 'parse_replay_error'
                $r_id = $row['id'];
                $r_status = HotstatusPipeline::REPLAY_STATUS_PARSE_REPLAY_ERROR;
                $r_timestamp = time();

                $db->execute("UpdateReplayStatus");

                echo 'Failed to parse replay #' . $r_id . ', Error : "' . $parse['error'] . '"...'.E.E;

                $sleep->add(MINI_SLEEP_DURATION);
            }

            if ($createReplayCopy) {
                //Copy local file into replay error directory for debugging purposes
                if (file_exists($r_filepath)) {
                    $errordir = __DIR__ . '/' . HotstatusPipeline::REPLAY_DOWNLOAD_DIRECTORY_ERROR;

                    FileHandling::ensureDirectory($errordir);

                    $newfilepath = $errordir . $r_fingerprint . HotstatusPipeline::REPLAY_DOWNLOAD_EXTENSION;
                    FileHandling::copyFile($r_filepath, $newfilepath);
                }
            }

            //Delete local file
            if (file_exists($r_filepath)) {
                FileHandling::deleteAllFilesMatchingPattern($r_filepath);
            }
        }
        else {
            //No unlocked downloaded replays to parse, sleep
            $dots = $console->animateDotDotDot();
            echo "No unlocked downloaded replays found$dots                           \r";

            $sleep->add(SLEEP_DURATION);
        }

        $db->freeResult($result2);
    }

    $db->freeResult($result);

    $sleep->execute();
}

?>