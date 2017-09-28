<?php
/*
 * Requires lib/AWS/aws-autoloader.php to have been included beforehand
 */
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
        return self::ResponseHeadersAndJson(self::API . '/replays/paged?page=' . $page);
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
        curl_close($ch);

        $ret = [];
        $ret['code'] = $res_info['http_code'];

        if ($ret['code'] == self::HTTP_OK) {
            $ret['json'] = json_decode($res, true);
        }

        return $ret;
    }

    /*
     * Attempts to download a replay at the amazon s3 bucket url with the given credentials.
     * Assumes the bucket uses request pays download model.
     * Returns assoc array with relevant information about the operation (keys contingent on success are labelled with ?):
     * ['code'] = http code of response
     * ['success'] = true if file was downloaded without a hitch, false otherwise
     */
    public static function DownloadS3Replay($urlOfReplay, $fileSaveLocation, $requestSigner, $credentials) {
        /*$file = fopen($fileSaveLocation, "w+");
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $urlOfReplay);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array("x-amz-request-payer: requester"));
        curl_setopt($ch, CURLOPT_FILE, $file);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $res = curl_exec($ch);
        $res_info = curl_getinfo($ch);
        fclose($file);
        curl_close($ch);

        $ret = [];
        $ret['code'] = $res_info['http_code'];

        return $ret;*/

        $client = new GuzzleHttp\Client();

        $file = fopen($fileSaveLocation, "w+");

        $request = new GuzzleHttp\Psr7\Request('GET', $urlOfReplay, [
            'headers' => [
                'x-amz-request-payer' => 'requester'
            ],
            'curl' => [
                CURLOPT_FILE => $file
            ],
        ]);

        $request = $requestSigner.signRequest($request, $credentials);

        $response = $client->send($request);

        fclose($file);

        $ret = [];
        $ret['code'] = $response->getStatusCode();

        if ($ret['code'] == self::HTTP_OK) {
            $ret['success'] = true;
        }
        else {
            $ret['success'] = false;
        }

        return $ret;
    }

    /*
     * Takes an array $replays and returns a subarray that might be empty, and contains all replay objects
     * that have a page index equal to or greater than $id. Optionally also filter for valid match types.
     * Adds an extra key 'page_index' that is set to the replays original page index before the filtering occured.
     * Note that the page index is the replay's index within the individual page, and not the # of the page itself.
     */
    public static function getReplaysGreaterThanEqualToId($replays, $id, $filterValidMatchTypes = true, $filterByDays = self::MAX_REPLAY_AGE) {
        $arr = [];
        $i = 1;
        foreach ($replays as $replay) {
            $modreplay = $replay;
            $modreplay['page_index'] = $i;
            $replaytype = $modreplay['game_type'];
            $replaydate = $modreplay['game_date'];


            if ($i >= $id && self::getReplayAgeInDays($replaydate) <= $filterByDays) {
                if ($filterValidMatchTypes) {
                    if (in_array($replaytype, self::$validMatchTypes, true)) {
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