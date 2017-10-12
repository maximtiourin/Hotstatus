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
    .'Replay process <<PARSE>> has started'.$e
    .'--------------------------------------'.$e;


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

        echo 'Found a failed replay parse at replay #' . $row['id'] . ', resetting status to \'' . HotstatusPipeline::REPLAY_STATUS_DOWNLOADED . '\'...'.$e;

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

            echo 'Parsing replay #' . $r_id . '...'.$e;

            $r_filepath = $row['file'];

            $parse = ReplayParser::ParseReplay(__DIR__, $r_filepath);

            if (!key_exists('error', $parse)) {
                //No parse error, add the match to the mongodb collection
                $parse['_id'] = $r_id; //Set document id to be the match id

                /* Update document with additional relevant data */
                //Week Data
                $parse['week_info'] = HotstatusPipeline::getWeekDataOfReplay($parse['date']);

                //Begin inserting document
                $clc = $mongo->selectCollection('matches');

                $inserterror = FALSE;
                $msg = "";
                try {
                    $clcres = $clc->insertOne($parse);

                    $affectedCount = $clcres->getInsertedCount();
                    $affectedId = $clcres->getInsertedId();

                    echo $affectedCount.' documents inserted into \'matches\' collection'.$e;
                    echo 'Inserted parsed replay #'.$r_id.' as match #'.$affectedId.' into \'matches\' collection...'.$e;

                    //Delete local file
                    if (file_exists($r_filepath)) {
                        FileHandling::deleteAllFilesMatchingPattern($r_filepath);
                    }

                    //Update mysql
                    $r_id = $row['id'];
                    $r_match_id = $affectedId;
                    $r_status = HotstatusPipeline::REPLAY_STATUS_PARSED;
                    $r_timestamp = time();

                    $db->execute("UpdateReplayParsed");

                    echo 'Successfully parsed replay #'.$r_id.'...'.$e;
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
                    echo 'Failed to insert parsed data into MongoDB collection...'.$e;
                    echo $msg.$e;

                    $sleep->add(MONGODB_ERROR_SLEEP_DURATION);
                }

            }
            else {
                //Encountered an error parsing replay, output it and cancel parsing
                echo 'Failed to parse replay #' . $r_id . ', Error : "' . $parse['error'] . '"...'.$e;

                $sleep->add(MINI_SLEEP_DURATION);
            }
        }
        else {
            //No unlocked downloaded replays to parse, sleep
            echo 'No unlocked downloaded replays found... '.time().$e;

            $sleep->add(SLEEP_DURATION);
        }

        $db->freeResult($result2);
    }

    $db->freeResult($result);

    $sleep->execute();
}

?>