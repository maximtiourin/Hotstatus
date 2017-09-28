<?php
class HotstatusPipeline {
    const REPLAY_DOWNLOAD_LIMIT = 1; //How many replays can be downloaded to disk at any one time.
    const REPLAY_STATUS_QUEUED = "queued"; //status value for when a replay is queued to be downloaded
    const REPLAY_STATUS_DOWNLOADING = "downloading"; //status value for when a replay is in the process of being downloaded
    const REPLAY_STATUS_DOWNLOADED = "downloaded"; //status value for when a replay has been downloaded
}