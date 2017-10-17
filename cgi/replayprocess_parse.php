<?php
/*
 * Replay Process Parse
 * In charge of looking for downloaded replays and parsing them to insert their data into a mongodb database
 */

namespace Fizzik;

require_once 'includes/include.php';
require_once 'includes/ReplayParser.php';

use Fizzik\Database\MySqlDatabase;
use Fizzik\Database\MongoDBDatabase;
use Fizzik\Utility\FileHandling;
use Fizzik\Utility\SleepHandler;
use MongoDB\Collection;
use MongoDB\Driver\Exception\BulkWriteException;
use MongoDB\Exception\InvalidArgumentException;
use MongoDB\Exception\RuntimeException;

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
$db->prepare("GetHeroNameFromAttribute",
    "SELECT name FROM herodata_heroes WHERE name_attribute = ?");
$db->bind("GetHeroNameFromAttribute", "s", $r_name_attribute);

//Helper functions


/*
 * Upserts relevant match data into 'matches' collection
 * Returns assoc array:
 * ['match'] = Updated parse data with new fields added
 * ['match_id'] = The official match id tied to the match data
 */
function insertMatch(&$parse) {
    global $mongo, $r_id;

    $parse['_id'] = $r_id; //Set document id to be the match id

    /* Update document with additional relevant data */
    //Week Data
    $parse['week_info'] = HotstatusPipeline::getWeekDataOfReplay($parse['date']);

    //Begin inserting 'match' document
    /** @var Collection $clc */
    $clc = $mongo->selectCollection('matches');

    $clcres = $clc->insertOne($parse);

    $affectedCount = $clcres->getInsertedCount();
    $affectedId = $clcres->getInsertedId();

    echo $affectedCount.' documents inserted into \'matches\' collection'.E;
    //echo 'Inserted parsed replay #'.$r_id.' as match #'.$affectedId.' into \'matches\' collection...'.E;

    return ['match' => $parse, 'match_id' => $affectedId];
}

/*
 * Updates the 'players' collection with all relevant player data
 */
function updatePlayers(&$match) {
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

        //Init Arrays
        $filter = [];
        $set = [];
        $setOnInsert = [];
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
        $w_scope = "$scope.talents";
        foreach ($player['talents'] as $talent) {
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
        $w_scope .= ".".HotstatusPipeline::getTalentBuildHash($player['talents']);
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
        $setOnInsert["$w_scope.talents"] = $player['talents'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
        $inc["$w_scope.played"] = 1;
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
        $inc["$w_scope.won"] = $inc_wonMatch;
        // >>> weekly_data
        $scope = "weekly_data";
        // >>>.>>> "ISO_YEAR"
        $scope .= ".".$match['week_info']['year'];
        // >>>.>>>.>>> "ISO_WEEK"
        $scope .= ".".$match['week_info']['week'];
        // >>>.>>>.>>>.>>> date_start
        $setOnInsert["$scope.date_start"] = $match['week_info']['date_start'];
        // >>>.>>>.>>>.>>> date_end
        $setOnInsert["$scope.date_end"] = $match['week_info']['date_end'];
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
        $b_scope = "$w_scope.talents";
        foreach ($player['talents'] as $talent) {
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
        $b_scope .= ".".HotstatusPipeline::getTalentBuildHash($player['talents']);
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
        $setOnInsert["$b_scope.talents"] = $player['talents'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
        $inc["$b_scope.played"] = 1;
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
        $inc["$b_scope.won"] = $inc_wonMatch;
        if (count($player['party']) > 0) {
            // >>>.>>>.>>>.>>>.>>> parties
            $w_scope = "$scope.parties";
            // >>>.>>>.>>>.>>>.>>>.>>> "PartyHashKey"
            $w_scope .= "." . HotstatusPipeline::getPerPlayerPartyHash($player['party']);
            // >>>.>>>.>>>.>>>.>>>.>>>.>>> players
            $setOnInsert["$w_scope.players"] = HotstatusPipeline::getPlayerIdArrayFromPlayerPartyRelationArray($match['players'], $player['party']);
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
                '$setOnInsert' => $setOnInsert,
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
    $res = $clc_players->bulkWrite($bulkWrites, [
        'ordered' => false
    ]);

    $upsertedCount = $res->getUpsertedCount();

    echo $upsertedCount.' documents upserted into \'players\' collection'.E;
}

/*
 * Updates the 'heroes' collection with all relevant hero data
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

        //Init Arrays
        $filter = [];
        $set = [];
        $setOnInsert = [];
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
        $w_scope = "$scope.talents";
        foreach ($player['talents'] as $talent) {
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
        $w_scope .= ".".HotstatusPipeline::getTalentBuildHash($player['talents']);
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
        $setOnInsert["$w_scope.talents"] = $player['talents'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
        $inc["$w_scope.played"] = 1;
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
        $inc["$w_scope.won"] = $inc_wonMatch;
        // >>> weekly_data #@@#
        $scope = "weekly_data";
        // >>>.>>> "ISO_YEAR"
        $scope .= ".".$match['week_info']['year'];
        // >>>.>>>.>>> "ISO_WEEK"
        $scope .= ".".$match['week_info']['week'];
        // >>>.>>>.>>>.>>> date_start
        $setOnInsert["$scope.date_start"] = $match['week_info']['date_start'];
        // >>>.>>>.>>>.>>> date_end
        $setOnInsert["$scope.date_end"] = $match['week_info']['date_end'];
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
        $b_scope = "$w_scope.talents";
        foreach ($player['talents'] as $talent) {
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
        $b_scope .= ".".HotstatusPipeline::getTalentBuildHash($player['talents']);
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
        $setOnInsert["$b_scope.talents"] = $player['talents'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
        $inc["$b_scope.played"] = 1;
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
        $inc["$b_scope.won"] = $inc_wonMatch;
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
        $b_scope = "$w_scope.talents";
        foreach ($player['talents'] as $talent) {
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
        $b_scope .= ".".HotstatusPipeline::getTalentBuildHash($player['talents']);
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< talents
        $setOnInsert["$b_scope.talents"] = $player['talents'];
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< played
        $inc["$b_scope.played"] = 1;
        // <<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<<.<<< won
        $inc["$b_scope.won"] = $inc_wonMatch;
        // >>>.>>>.>>>.>>>.>>> list
        $addToSet["$scope.list"] = $match['_id'];



        // !!!!!!!!!! Build Complete Operation
        $op = [
            $filter,        //Filter Array
            [               //Update Array
                '$set' => $set,
                '$setOnInsert' => $setOnInsert,
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
        $scope .= $match['map'];
        // >>>.>>>.>>>.>>>.>>> "GameTypeId"
        $scope .= $match['type'];
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
    $res = $clc_heroes->bulkWrite($bulkWrites, [
        'ordered' => false
    ]);

    $upsertedCount = $res->getUpsertedCount();

    echo $upsertedCount.' documents upserted into \'heroes\' collection'.E;
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

            echo 'Parsing replay #' . $r_id . '...'.E;

            $r_filepath = $row['file'];

            $parse = ReplayParser::ParseReplay(__DIR__, $r_filepath);

            if (!key_exists('error', $parse)) {
                //Collect mapping of ban attributes to hero names
                $bannedHeroes = [];
                foreach ($parse['bans'] as $teambans) {
                    foreach ($teambans as $heroban) {
                        $r_name_attribute = $heroban;

                        $result3 = $db->execute("GetHeroNameFromAttribute");
                        $resrows3 = $db->countResultRows($result3);
                        if ($resrows3 > 0) {
                            $row2 = $db->fetchArray($result3);

                            $bannedHeroes[] = $row2['name'];
                        }
                        $db->freeResult($result3);
                    }
                }

                //No parse error, add all relevant match data to database in needed collections
                $inserterror = FALSE;
                $msg = "";
                try {
                    //Matches
                    $insertResult = insertMatch($parse);
                    //Players
                    updatePlayers($insertResult['match']);
                    //Heroes
                    updateHeroes($insertResult['match'], $bannedHeroes);
                    //WeeklyMatches

                    //Delete local file
                    if (file_exists($r_filepath)) {
                        FileHandling::deleteAllFilesMatchingPattern($r_filepath);
                    }

                    //Update mysql
                    $r_id = $row['id'];
                    $r_match_id = $insertResult['match_id'];
                    $r_status = HotstatusPipeline::REPLAY_STATUS_PARSED;
                    $r_timestamp = time();

                    $db->execute("UpdateReplayParsed");

                    echo 'Successfully parsed replay #'.$r_id.'...'.E;
                }
                catch (InvalidArgumentException $e) {
                    $inserterror = TRUE;
                    $msg = $e->getMessage();
                }
                catch (BulkWriteException $e) {
                    $inserterror = TRUE;
                    $msg = $e->getMessage();
                }
                catch (RuntimeException $e) {
                    $inserterror = TRUE;
                    $msg = $e->getMessage();
                }

                if ($inserterror) {
                    //Error adding to collection, cancel parsing, long sleep to potentially account for hitting mongodb size limit
                    echo 'Failed to ingest parsed data into MongoDB collection...'.E;
                    echo $msg.E;

                    $sleep->add(MONGODB_ERROR_SLEEP_DURATION);
                }
            }
            else {
                //Encountered an error parsing replay, output it and cancel parsing
                echo 'Failed to parse replay #' . $r_id . ', Error : "' . $parse['error'] . '"...'.E;

                $sleep->add(MINI_SLEEP_DURATION);
            }
        }
        else {
            //No unlocked downloaded replays to parse, sleep
            echo 'No unlocked downloaded replays found... '.E;

            $sleep->add(SLEEP_DURATION);
        }

        $db->freeResult($result2);
    }

    $db->freeResult($result);

    $sleep->execute();
}

?>