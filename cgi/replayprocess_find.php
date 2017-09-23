<?php
/*
 * Replay Process Find
 * In charge of checking hotsapi for unseen replays and inserting initial entries into the 'replays' table then queueing them.
 */

include 'includes/database.php';
include 'includes/hotsapi.php';

set_time_limit(0);

$db = new Database();
$db->connectDefaultReplayProcess();

//Prepare statements
$db->prepare("SelectNewestReplay", "SELECT * FROM replays ORDER BY id DESC LIMIT 1");

//Constants and qol
$toomanyrequestssleepdur = 60;
$sleepdur = 5;
$minisleepdur = 1;
$e = PHP_EOL;

echo 'Replay process <<FIND>> has started'.$e
    .'--------------------------------------'.$e;

//Look for replays to download and handle
while (true) {
    //Get newest replay if there is one to determine where to start looking in hotsapi
    $result = $db->execute("SelectNewestReplay");
    $resrows = $db->countResultRows($result);
    $pagenum = 1; //Default start at page 1
    $replayid = 1; //Default replay id

    if ($resrows > 0) {
        $row = $db->fetchArray($result);

        $replayid = $row['hotsapi_id'] + 1;
        $pagenum = floor($replayid / Hotsapi::REPLAYS_PER_PAGE) + 1;
    }

    $db->freeResult($result);

    echo 'Requesting page '.$pagenum.' from hotsapi, starting at replay '.$replayid.'...'.$e;

    $api = Hotsapi::getPagedReplays($pagenum);

    if ($api['code'] == Hotsapi::HTTP_OK) {
        //Process json data and put it in the database
    }
    else if ($api['code'] == Hotsapi::HTTP_RATELIMITED) {
        //Error too many requests, wait awhile before trying again
        echo 'Error: HTTP Code ' . $api['code'] . '. Rate limited.';
        sleep($toomanyrequestssleepdur - $sleepdur);
    }
    else {
        echo 'Error: HTTP Code ' . $api['code'];
    }

    sleep($sleepdur);
}

?>