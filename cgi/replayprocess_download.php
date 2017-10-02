<?php
/*
 * Replay Process Download
 * In charge of looking through cataloged replays and downloading them to a temporary location for use with processing further
 * down the pipeline. Can be made to only ever download a fixed amount of replays before waiting for them to be processed to prevent
 * storing too much at once.
 */

require_once 'includes/include.php';
require_once 'includes/MySqlDatabase.php';

set_time_limit(0);
date_default_timezone_set(HotstatusPipeline::REPLAY_TIMEZONE);

$db = new MysqlDatabase();
$creds = Credentials::getReplayProcessCredentials();
$db->connect($creds[Credentials::KEY_DB_HOSTNAME], $creds[Credentials::KEY_DB_USER], $creds[Credentials::KEY_DB_PASSWORD], $creds[Credentials::KEY_DB_DATABASE]);

//Aws
$awsCreds = new Aws\Credentials\Credentials($creds[Credentials::KEY_AWS_KEY], $creds[Credentials::KEY_AWS_SECRET]);
$sdk = new Aws\Sdk([
    'region' => $creds[Credentials::KEY_AWS_REPLAYREGION],
    'version' => 'latest',
    'credentials' => $awsCreds
]);
$s3 = $sdk->createS3();

//Constants and qol
const DOWNLOADLIMIT_SLEEP_DURATION = 60; //seconds
const SLEEP_DURATION = 5; //seconds
const MINI_SLEEP_DURATION = 1; //seconds
const UNLOCK_DEFAULT_DURATION = 5; //Must be unlocked for atleast 5 seconds
const UNLOCK_DOWNLOADING_DURATION = 120; //Must be unlocked for atleast 2 minutes while downloading status
$e = PHP_EOL;
$sleep = new SleepHandler();

//Prepare statements
$db->prepare("UpdateReplayStatus",
"UPDATE replays SET status = ?, lastused = ? WHERE id = ?");
$db->bind("UpdateReplayStatus", "sii", $r_status, $r_timestamp, $r_id);
$db->prepare("UpdateReplayDownloaded",
"UPDATE replays SET file = ?, status = ?, lastused = ? WHERE id = ?");
$db->bind("UpdateReplayDownloaded", "ssii", $r_filepath, $r_status, $r_timestamp, $r_id);
$db->prepare("SelectDownloadedReplays",
"SELECT * FROM replays WHERE status = '" . HotstatusPipeline::REPLAY_STATUS_DOWNLOADED . "'");
$db->prepare("SelectDownloadingReplay-Unlocked",
"SELECT * FROM replays WHERE status = '" . HotstatusPipeline::REPLAY_STATUS_DOWNLOADING . "' AND lastused <= " . (time() - UNLOCK_DOWNLOADING_DURATION) . " ORDER BY id ASC LIMIT 1");
$db->prepare("SelectQueuedReplay-Unlocked",
"SELECT * FROM replays WHERE status = '" . HotstatusPipeline::REPLAY_STATUS_QUEUED . "' AND lastused <= " . (time() - UNLOCK_DEFAULT_DURATION) . " ORDER BY id ASC LIMIT 1");

//Helper functions

//Begin main script
echo '--------------------------------------'.$e
    .'Replay process <<DOWNLOAD>> has started'.$e
    .'--------------------------------------'.$e;

//Look for replays to download and handle
while (true) {
    $result = $db->execute("SelectDownloadedReplays");
    $resrows = $db->countResultRows($result);
    if ($resrows >= HotstatusPipeline::REPLAY_DOWNLOAD_LIMIT) {
        //Reached download limit
        echo 'Reached replay download limit of ' . HotstatusPipeline::REPLAY_DOWNLOAD_LIMIT . ', waiting for downloaded replays to be processed...'.$e;
        $sleep->add(DOWNLOADLIMIT_SLEEP_DURATION);
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

                $r_fingerprint = $row['fingerprint'];
                $r_url = $row['hotsapi_url'];

                //Ensure directory
                FileHandling::ensureDirectory(HotstatusPipeline::REPLAY_DOWNLOAD_DIRECTORY);

                //Determine filepath
                $r_filepath = HotstatusPipeline::REPLAY_DOWNLOAD_DIRECTORY . $r_fingerprint . HotstatusPipeline::REPLAY_DOWNLOAD_EXTENSION;

                //Download
                $api = Hotsapi::DownloadS3Replay($r_url, $r_filepath, $s3);

                if ($api['success'] == TRUE) {
                    //Replay downloaded successfully
                    echo 'Replay #' . $r_id . ' (' . round($api['bytes_downloaded'] / FileHandling::getBytesForMegabytes(1), 2) . ' MB) downloaded to "' . $r_filepath . '"'.$e;

                    $r_status = HotstatusPipeline::REPLAY_STATUS_DOWNLOADED;
                    $r_timestamp = time();

                    $db->execute("UpdateReplayDownloaded");
                }
                else {
                    //Error with downloading the replay
                    echo 'Failed to download replay #' . $r_id . ', HTTP Code : ' . $api['code'] . '...'.$e;

                    $sleep->add(MINI_SLEEP_DURATION);
                }
            }
            else {
                //No unlocked queued replays to download, sleep
                echo 'No unlocked queued replays found...'.time().$e;

                $sleep->add(SLEEP_DURATION);
            }

            $db->freeResult($result3);
        }

        $db->freeResult($result2);
    }

    $db->freeResult($result);

    $sleep->execute();
}

?>