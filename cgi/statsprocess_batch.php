<?php
/*
 * Stats Process Batch
 * In charge of batch aggregating match statistics over a variety of ranges
 */

namespace Fizzik;

require_once 'includes/include.php';

use Fizzik\Database\MySqlDatabase;
use Fizzik\Database\MongoDBDatabase;
use Fizzik\Utility\FileHandling;
use Fizzik\Utility\SleepHandler;
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
$e = PHP_EOL;
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

//Helper functions

//Begin main script
echo '--------------------------------------'.$e
    .'Stats process <<BATCH>> has started'.$e
    .'--------------------------------------'.$e;


//Look for replays to parse and handle
while (true) {


    $sleep->execute();
}

?>