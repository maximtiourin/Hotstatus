<?php

namespace Fizzik;

class HotstatusPipeline {
    const STATS_WEEK_RANGE = 15; //How many weeks of match data to keep alive in the database
    const REPLAY_AGE_LIMIT = 7 * self::STATS_WEEK_RANGE; //Relevant replays are those that are less than or equal to days of age
    const REPLAY_TIMEZONE = "UTC"; //Default timezone used for dating replays as well as process locks
    const REPLAY_DOWNLOAD_DIRECTORY = "replays/"; //Where the replays are downloaded relative to the replayprocess scripts
    const REPLAY_DOWNLOAD_EXTENSION = ".StormReplay"; //Extension of the replays downloaded
    const REPLAY_DOWNLOAD_LIMIT = 10; //How many replays can be downloaded to disk at any one time
    const REPLAY_EXECUTABLE_DIRECTORY = "/bin/"; //Where the executables for processing replays are located
    const REPLAY_EXECUTABLE_ID_REPLAYPARSER = "ReplayParser.exe"; //String id of the replay parser executable, relative to exec dir
    const REPLAY_STATUS_QUEUED = "queued"; //status value for when a replay is queued to be downloaded
    const REPLAY_STATUS_DOWNLOADING = "downloading"; //status value for when a replay is in the process of being downloaded
    const REPLAY_STATUS_DOWNLOADED = "downloaded"; //status value for when a replay has been downloaded
    const REPLAY_STATUS_PARSING = "parsing"; //status value for when a replay is being parsed
    const REPLAY_STATUS_PARSED = "parsed"; //status value for when a replay is done being parsed
    const FORMAT_DATETIME = "Y:m:d H:i:s"; //The format of the datatime strings

    /*
     * Takes a date time string, converts it to a date time, and returns an assoc array
     * that contains the following fields:
     * ['week'] = week # of the year
     * ['year'] = year #
     * ['date_start'] = datetime string of when the week starts
     * ['date_end'] = datetime string of when the week ends
     */
    public static function getWeekDataOfReplay($datetimestring) {
        date_default_timezone_set(self::REPLAY_TIMEZONE);

        $replaydate = new \DateTime($datetimestring);

        $weekOfYear = intval($replaydate->format("W"));
        $yearOfWeek = intval($replaydate->format("o"));

        $weekstartdate = new \DateTime();
        $weekstartdate->setISODate($yearOfWeek, $weekOfYear);
        $weekstartdate->setTime(0, 0, 0);

        $weekenddate = new \DateTime();
        $weekenddate->setISODate($yearOfWeek, $weekOfYear, 7);
        $weekenddate->setTime(23, 59, 59);

        $ret = [];
        $ret['week'] = $weekOfYear;
        $ret['year'] = $yearOfWeek;
        $ret['date_start'] = $weekstartdate->format(self::FORMAT_DATETIME);
        $ret['date_end'] = $weekenddate->format(self::FORMAT_DATETIME);

        return $ret;
    }
}