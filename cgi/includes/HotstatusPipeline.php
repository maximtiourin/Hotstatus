<?php

namespace Fizzik;

class HotstatusPipeline {
    //General constants
    const STATS_WEEK_RANGE = 15; //How many weeks of match data to keep alive in the database
    const REPLAY_AGE_LIMIT = 7 * self::STATS_WEEK_RANGE; //Relevant replays are those that are less than or equal to days of age
    const REPLAY_TIMEZONE = "UTC"; //Default timezone used for dating replays as well as process locks
    const REPLAY_DOWNLOAD_DIRECTORY = "replays/"; //Where the replays are downloaded relative to the replayprocess scripts
    const REPLAY_DOWNLOAD_DIRECTORY_ERROR = "replays/error/"; //Where the replays are copied to if an error occurs during replayprocess, for debugging purposes
    const REPLAY_DOWNLOAD_EXTENSION = ".StormReplay"; //Extension of the replays downloaded
    const REPLAY_DOWNLOAD_LIMIT = 10; //How many replays can be downloaded to disk at any one time
    const REPLAY_EXECUTABLE_DIRECTORY = "/bin/"; //Where the executables for processing replays are located
    const REPLAY_EXECUTABLE_ID_REPLAYPARSER = "ReplayParser.exe"; //String id of the replay parser executable, relative to exec dir
    const REPLAY_EXECUTABLE_ID_MMRCALCULATOR = "MMRCalculator.exe"; //String id of the mmr calculator executable, relative to exec dir
    const REPLAY_STATUS_QUEUED = "queued"; //status value for when a replay is queued to be downloaded
    const REPLAY_STATUS_DOWNLOADING = "downloading"; //status value for when a replay is in the process of being downloaded
    const REPLAY_STATUS_DOWNLOADED = "downloaded"; //status value for when a replay has been downloaded
    const REPLAY_STATUS_PARSING = "parsing"; //status value for when a replay is being parsed
    const REPLAY_STATUS_PARSED = "parsed"; //status value for when a replay is done being parsed
    const REPLAY_STATUS_PARSE_MMR_ERROR = "parse_mmr_error"; //status value for when a replay had an unknown error during mmr parsing
    const REPLAY_STATUS_PARSE_REPLAY_ERROR = "parse_replay_error"; //status value for when a replay had an unknown error during mmr parsing
    const REPLAY_STATUS_MONGODB_MATCH_WRITE_ERROR = "mongodb_match_write_error"; //status value for when a repaly had an unknown mongodb bulkwrite error during match insertion
    const REPLAY_STATUS_MONGODB_MATCHDATA_WRITE_ERROR = "mongodb_matchdata_write_error"; //status value for when a repaly had an unknown mongodb bulkwrite error during match data insertion
    const FORMAT_DATETIME = "Y:m:d H:i:s"; //The format of the datatime strings
    const DATABASE_CHARSET = "utf8mb4";

    //Enums
    public static $ENUM_REGIONS = ['PTR', 'US', 'EU']; //Regen indexes for use with converting replay data

    /*
     * Season information
     * All dates are UTC, so when looking up Blizzard's season start and end dates, add 7 hours to PST time accordingly
     */
    const SEASON_UNKNOWN = "Legacy"; //This is the season to use when no season dates are defined for a given date time
    public static $SEASONS = [
        "2017 Season 3" => [
            "start" =>  "2017-09-05 07:00:00",
            "end" =>    "2017-12-12 06:59:59"
        ],
        "2017 Season 2" => [
            "start" =>  "2017-06-13 07:00:00",
            "end" =>    "2017-09-05 06:59:59"
        ]
    ];

    /*
     * Cached Requests - Collection of keys to specific cached redis data, should be used to cache or invalidate
     */
    const CACHE_REQUEST_DATATABLE_HEROES_STATSLIST = "Cache_Request_DataTable_Heroes_Statslist";

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

    /*
     * Returns the region string associated with the given region id
     */
    public static function getRegionString($regionid) {
        return self::$ENUM_REGIONS[$regionid];
    }

    /*
     * Returns the season id string that a given date time string belongs within.
     * Returns const SEASON_UNKNOWN if the datetime doesn't fall within a known season time range
     */
    public static function getSeasonStringForDateTime($datetimestring) {
        date_default_timezone_set(self::REPLAY_TIMEZONE);

        $date = new \DateTime($datetimestring);

        foreach (self::$SEASONS as $season => $times) {
            $startdate = new \DateTime($times['start']);
            $enddate = new \DateTime($times['end']);

            if ($date >= $startdate && $date <= $enddate) {
                return $season;
            }
        }

        return self::SEASON_UNKNOWN;
    }

    /*
     * Returns an md5 hash describing a talent build, given an array of talents
     * Hash is generated by concating the talents in the order they were chosen
     */
    public static function getTalentBuildHash(&$talentarr) {
        $str = "";
        foreach ($talentarr as $talent) {
            $str .= $talent;
        }
        return md5($str);
    }

    /*
     * Returns a sorted array of player name strings attained from an array of player party relation objects
     */
    public static function getPlayerNameArrayFromPlayerPartyRelationArray(&$playerpartyarr) {
        $names = [];
        foreach ($playerpartyarr as $partyrelation) {
            $names[] = $partyrelation['name'];
        }

        sort($names);

        return $names;
    }

    /*
     * Returns the 'id' of a player based on their 'name', searching through objects of a supplied players array
     * Returns false if the player of a given name wasn't found in the supplied array
     */
    public static function getPlayerIdFromName($name, &$players) {
        foreach ($players as $player) {
            if ($player['name'] === $name) {
                return $player['id'];
            }
        }
        return false;
    }

    /*
     * Returns an array of player 'id's from a given array of player 'name's, searching the supplied players array
     */
    public static function getPlayerIdArrayFromPlayerNameArray(&$names, &$players) {
        $ids = [];

        foreach ($names as $name) {
            $ids[] = self::getPlayerIdFromName($name, $players);
        }

        return $ids;
    }

    /*
     * Returns an array of player 'id's found from relating a player 'name' from a supplied players array,
     * sorting them by an associated player 'name', which is obtained from searching a supplied player party relation object array
     */
    public static function getPlayerIdArrayFromPlayerPartyRelationArray(&$players, &$playerpartyarr) {
        $names = self::getPlayerNameArrayFromPlayerPartyRelationArray($playerpartyarr);
        return self::getPlayerIdArrayFromPlayerNameArray($names, $players);
    }

    /*
     * Returns an md5 hash describing the other party members of a player, given an array of party relation objects
     * Hash is generated by concating the player names after sorting them
     */
    public static function getPerPlayerPartyHash(&$playerpartyarr) {
        $names = self::getPlayerNameArrayFromPlayerPartyRelationArray($playerpartyarr);

        $str = "";
        foreach ($names as $name) {
            $str .= $name;
        }

        return md5($str);
    }
}