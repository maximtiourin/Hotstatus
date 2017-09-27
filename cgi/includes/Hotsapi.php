<?php
class Hotsapi {
    const API = 'http://hotsapi.net/api/v1';
    const REPLAYS_PER_PAGE = 100;
    const HTTP_OK = 200;
    const HTTP_RATELIMITED = 429;
    const MAX_REPLAY_AGE = 90; //90 days
    public static $validMatchTypes = array("QuickMatch", "HeroLeague", "TeamLeague", "UnrankedDraft");

    /*
     * Returns assoc array of the headers and json body of the paged replays response
     * ['headers'] = assoc array of the various headers such as ['headers']['x-ratelimit-remaining'] = 299
     * ['json'] = assoc array of the json body object of the response
     */
    public static function getPagedReplays($page) {
        return Hotsapi::ResponseHeadersAndJson(Hotsapi::API . '/replays/paged?page=' . $page);
    }

    /*
     * Returns assoc array of http code and json body of the response at url
     * ['code'] = http code of response
     * ['json'] = assoc array of the json body object of the response
     *
     * If a failed response occured, only the code key will be set, so always check the code first
     */
    public static function ResponseHeadersAndJson($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json')); //Tells it to output content as json
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, $url); //Curl url
        $res = curl_exec($ch);
        $res_info = curl_getinfo($ch);

        $code = $res_info['http_code'];

        $ret = [];
        $ret['code'] = $code;

        if ($code == Hotsapi::HTTP_OK) {
            $ret['json'] = json_decode($res, true);

            return $ret;
        }

        return $ret;
    }

    /*
     * Takes and array $replays and returns a subarray that might be empty, and contains all replay objects
     * that have a page index equal to or greater than $id. Optionally also filter for valid match types.
     * Adds an extra key 'page_index' that is set to the replays original page index before the filtering occured
     */
    public static function getReplaysGreaterThanEqualToId($replays, $id, $filterValidMatchTypes = true, $filterByDays = Hotsapi::MAX_REPLAY_AGE) {
        $arr = [];
        $i = 1;
        foreach ($replays as $replay) {
            $modreplay = $replay;
            $modreplay['page_index'] = $i;
            $replaytype = $modreplay['game_type'];
            $replaydate = $modreplay['game_date'];


            if ($i >= $id && self::getReplayAgeInDays($replaydate) <= $filterByDays) {
                if ($filterValidMatchTypes) {
                    if (in_array($replaytype, Hotsapi::$validMatchTypes, true)) {
                        $arr[] = $modreplay;
                    }
                }
                else {
                    $arr[] = $modreplay;
                }
            }
            $i++;
        }
        return $arr;
    }

    /*
     * Takes the replay date string and returns the amount of days since it was created
     */
    public static function getReplayAgeInDays($str) {
        date_default_timezone_set("UTC");
        $replaydate = new DateTime($str);
        $nowdate = new DateTime("now");
        $interval = $replaydate->diff($nowdate);
        return $interval->days;
    }
}
?>