<?php
/*
 * Replay Process Download
 * In charge of looking through cataloged replays and downloading them to a temporary location for use with processing further
 * down the pipeline. Can be made to only ever download a fixed amount of replays before waiting for them to be processed to prevent
 * storing too much at once.
 */

require_once 'includes/include.php';

set_time_limit(0);

$db = new Database();
$creds = Credentials::getReplayProcessCredentials();
$db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);

//Aws
$awsCreds = new Aws\Credentials\Credentials($creds[Credentials::KEY_AWS_KEY], $creds[Credentials::KEY_AWS_SECRET]);
$sdk = new Aws\Sdk([
    'region' => $creds[Credentials::KEY_AWS_REPLAYREGION],
    'version' => 'latest',
    'credentials' => $awsCreds
]);

//Constants and qol
const DOWNLOADLIMIT_SLEEP_DURATION = 60; //seconds
const SLEEP_DURATION = 5; //seconds
const MINI_SLEEP_DURATION = 1; //seconds
const UNLOCK_DEFAULT_DURATION = 5; //Must be unlocked for atleast 5 seconds
const UNLOCK_DOWNLOADING_DURATION = 120; //Must be unlocked for atleast 2 minutes while downloading status
$e = PHP_EOL;
$dosleep = false;

//Prepare statements
$db->prepare("UpdateReplayStatus",
"UPDATE replays SET status = ?, lastused = ? WHERE id = ?");
$db->bind("UpdateReplayStatus", "sii", $r_status, $r_timestamp, $r_id);
$db->prepare("SelectDownloadedReplays",
"SELECT * FROM replays WHERE status = '" . HotstatusPipeline::REPLAY_STATUS_DOWNLOADED . "'");
$db->prepare("SelectDownloadingReplay-Unlocked",
"SELECT * FROM replays WHERE status = '" . HotstatusPipeline::REPLAY_STATUS_DOWNLOADING . "' AND lastused <= " . (time() - UNLOCK_DOWNLOADING_DURATION) . " ORDER BY id ASC LIMIT 1");
$db->prepare("SelectQueuedReplay-Unlocked",
"SELECT * FROM replays WHERE status = '" . HotstatusPipeline::REPLAY_STATUS_QUEUED . "' AND lastused <= " . (time() - UNLOCK_DEFAULT_DURATION) . " ORDER BY id ASC LIMIT 1");

//Helper functions
function smartSleep($duration, $mainsleep = false, $mainsleepDuration = SLEEP_DURATION) {
    global $dosleep;

    if ($mainsleep) {
        if ($dosleep) {
            sleep($duration);

            $dosleep = false;
        }
    }
    else {
        sleep($duration - $mainsleepDuration);

        $dosleep = true;
    }
}

//Begin main script
echo 'Replay process <<DOWNLOAD>> has started'.$e
    .'--------------------------------------'.$e;

//Look for replays to download and handle
while (true) {
    $result = $db->execute("SelectDownloadedReplays");
    $resrows = $db->countResultRows($result);
    if ($resrows >= HotstatusPipeline::REPLAY_DOWNLOAD_LIMIT) {
        //Reached download limit
        echo 'Reached replay download limit of ' . HotstatusPipeline::REPLAY_DOWNLOAD_LIMIT . ', waiting for replays to be processed...'.$e;
        smartSleep(DOWNLOADLIMIT_SLEEP_DURATION);
    }
    else {
        //Have not reached download limit yet, check for unlocked failed replay downloads
        $result2 = $db->execute("SelectDownloadingReplay-Unlocked");
        $resrows2 = $db->countResultRows($result2);
        if ($resrows2 > 0) {
            //Found a failed replay download, reset it to queued
            $row = $db->fetchArray($result2);

            echo 'Found a failed replay download at replay #' . $row['id'] . ', resetting status to \'' . HotstatusPipeline::REPLAY_STATUS_QUEUED . '\'...'.$e;

            $r_id = $row['id'];
            $r_status = HotstatusPipeline::REPLAY_STATUS_QUEUED;
            $r_timestamp = time();

            $db->execute("UpdateReplayStatus");
        }
        else {
            //No replay downloads previously failed, look for an unlocked queued replay to download
            $result3 = $db->execute("SelectQueuedReplay-Unlocked");
            $resrows3 = $db->countResultRows($result3);
            if ($resrows3 > 0) {
                //Found a queued unlocked replay, softlock for downloading and download it.
                $row = $db->fetchArray($result3);

                $r_id = $row['id'];
                $r_status = HotstatusPipeline::REPLAY_STATUS_DOWNLOADING;
                $r_timestamp = time();

                $db->execute("UpdateReplayStatus");

                echo 'Downloading replay #' . $r_id . '...'.$e;

                
            }
            else {
                //No unlocked queued replays to download, sleep
                echo 'No unlocked queued replays found...'.$e;

                $dosleep = true;
            }

            $db->freeResult($result3);
        }

        $db->freeResult($result2);
    }

    $db->freeResult($result);

    if ($dosleep) {
        smartSleep(SLEEP_DURATION, true);
    }
}

?>