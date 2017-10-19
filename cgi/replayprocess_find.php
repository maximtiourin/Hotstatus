<?php
/*
 * Replay Process Find
 * In charge of checking hotsapi for unseen replays and inserting initial entries into the 'replays' table then queueing them.
 */

namespace Fizzik;

require_once 'includes/include.php';
require_once 'includes/Hotsapi.php';

use Fizzik\Database\MySqlDatabase;
use Fizzik\Utility\SleepHandler;

set_time_limit(0);
date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);

$db = new MysqlDatabase();
$creds = Credentials::getReplayProcessCredentials();
$db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);
$db->setEncoding(HotstatusPipeline::DATABASE_CHARSET);

//Constants and qol
const OUT_OF_REPLAYS_SLEEP_DURATION = 3600; //seconds
const UNKNOWN_ERROR_CODE = 300; //seconds
const TOO_MANY_REQUEST_SLEEP_DURATION = 60; //seconds
const SLEEP_DURATION = 5; //seconds
const MINI_SLEEP_DURATION = 1; //seconds
const E = PHP_EOL;
$sleep = new SleepHandler();

//Prepare statements
$db->prepare("SelectNewestReplay", "SELECT * FROM replays ORDER BY hotsapi_page DESC, hotsapi_idinpage DESC LIMIT 1");
$db->prepare("InsertNewReplay", "INSERT INTO replays (hotsapi_id, hotsapi_page, hotsapi_idinpage, fingerprint, hotsapi_url, status, lastused) VALUES (?, ?, ?, ?, ?, ?, ?)");
$db->bind("InsertNewReplay", "iiisssi", $r_id, $r_page, $r_idinpage, $r_fingerprint, $r_s3url, $r_status, $r_timestamp);

//Helper functions
function addToPageIndex($amount) {
    global $pageindex;
    setPageIndex($pageindex + $amount);
}

function setPageIndex($amount) {
    global $pagenum, $pageindex;

    $pageindex = $amount;
    if ($pageindex > Hotsapi::REPLAYS_PER_PAGE) {
        $pagenum++;
        $pageindex = 1;
    }
}

//Begin main script
echo '--------------------------------------'.E
    .'Replay process <<FIND>> has started'.E
    .'--------------------------------------'.E;

//Get newest replay if there is one to determine where to start looking in hotsapi
$result = $db->execute("SelectNewestReplay");
$resrows = $db->countResultRows($result);
$pagenum = 1; //Default start at page 1
$pageindex = 1; //Default replay page id

if ($resrows > 0) {
    $row = $db->fetchArray($result);

    $pagenum = $row['hotsapi_page'];
    setPageIndex($row['hotsapi_idinpage'] + 1);
}

$db->freeResult($result);

//Look for replays to download and handle
while (true) {
    echo 'Requesting page '.$pagenum.' from hotsapi, starting at page index '.$pageindex.'...'.E;

    $api = Hotsapi::getPagedReplays($pagenum);

    $prevpage = $pagenum;

    if ($api['code'] == Hotsapi::HTTP_OK) {
        //Process json data and put it in the database
        $replays = $api['json']['replays'];
        $replaylen = count($replays);
        if ($replaylen > 0) {
            $relevant_replays = Hotsapi::getReplaysGreaterThanEqualToId($replays, $pageindex, true, HotstatusPipeline::REPLAY_AGE_LIMIT);
            if (count($relevant_replays) > 0) {
                foreach ($relevant_replays as $replay) {
                    $r_id = $replay['id'];
                    $r_page = $pagenum;
                    $r_idinpage = $replay['page_index'];
                    $r_fingerprint = $replay['fingerprint'];
                    $r_s3url = $replay['url'];
                    $r_status = HotstatusPipeline::REPLAY_STATUS_QUEUED;
                    $r_timestamp = time();

                    $db->execute("InsertNewReplay");
                }
                addToPageIndex($replaylen); //Finished with page, rollover page index
                echo 'Page #' . $prevpage . ' processed (' . count($relevant_replays) . ' relevant replays).'.E.E;
            }
            else {
                //No relevant replays found here, set next replayid to be greater than the highest id in the replayset
                addToPageIndex($replaylen); //Finished with page, rollover page index
                echo 'Page #' . $prevpage . ' had no more relevant replays.'.E.E;
            }
        }
        else {
            //No more replay pages to process! Long sleep
            echo 'Out of replays to process! Waiting for new hotsapi replay at page index #' . $pageindex . '...'.E;
            $sleep->add(OUT_OF_REPLAYS_SLEEP_DURATION);
        }
    }
    else if ($api['code'] == Hotsapi::HTTP_RATELIMITED) {
        //Error too many requests, wait awhile before trying again
        echo 'Error: HTTP Code ' . $api['code'] . '. Rate limited.'.E.E;
        $sleep->add(TOO_MANY_REQUEST_SLEEP_DURATION);
    }
    else {
        echo 'Error: HTTP Code ' . $api['code'].'.'.E.E;
        $sleep->add(UNKNOWN_ERROR_CODE);
    }

    $sleep->execute();
}

?>