<?php
/*
 * Replay Process Parse
 * In charge of looking for downloaded replays and parsing them to insert their data into a mongodb database
 */

namespace Fizzik;

require_once 'includes/include.php';

use Fizzik\Database\MySqlDatabase;
use Fizzik\Database\MongoDBDatabase;
use Fizzik\Utility\SleepHandler;

set_time_limit(0);
date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);

$db = new MysqlDatabase();
$creds = Credentials::getReplayProcessCredentials();
$db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);

//Constants and qol
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
$db->prepare("SelectDownloadedReplay-Unlocked",
    "SELECT * FROM replays WHERE status = '" . HotstatusPipeline::REPLAY_STATUS_DOWNLOADED . "' AND lastused <= " . (time() - UNLOCK_DEFAULT_DURATION) . " ORDER BY id ASC LIMIT 1");
$db->prepare("SelectParsingReplay-Unlocked",
    "SELECT * FROM replays WHERE status = '" . HotstatusPipeline::REPLAY_STATUS_PARSING . "' AND lastused <= " . (time() - UNLOCK_PARSING_DURATION) . " ORDER BY id ASC LIMIT 1");

//Helper functions

//Begin main script
echo '--------------------------------------'.$e
    .'Replay process <<PARSE>> has started'.$e
    .'--------------------------------------'.$e;


//Look for replays to parse and handle
while (true) {
    //Check for unlocked failed replay parses
    $result = $db->execute("SelectParsingReplay-Unlocked");
    $resrows = $db->countResultRows($result);
    if ($resrows > 0) {
        //Found a failed replay parse, reset it to downloaded
        $row = $db->fetchArray($result);

        echo 'Found a failed replay parse at replay #' . $row['id'] . ', resetting status to \'' . HotstatusPipeline::REPLAY_STATUS_DOWNLOADED . '\'...'.$e;

        $r_id = $row['id'];
        $r_status = HotstatusPipeline::REPLAY_STATUS_DOWNLOADED;
        $r_timestamp = time();

        $db->execute("UpdateReplayStatus");
    }
    else {
        //No replay parsing has previously failed, look for an unlocked downloaded replay to parse
        $result2 = $db->execute("SelectDownloadedReplay-Unlocked");
        $resrows2 = $db->countResultRows($result2);
        if ($resrows2 > 0) {
            //Found an unlocked downloaded replay, parse it

        }
        else {
            //No unlocked downloaded replays to parse, sleep
            echo 'No unlocked downloaded replays found...'.$e;

            $sleep->add(SLEEP_DURATION);
        }

        $db->freeResult($result2);
    }

    $db->freeResult($result);

    $sleep->execute();
}

?>