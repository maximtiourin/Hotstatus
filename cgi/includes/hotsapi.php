<?php
class Hotsapi {
    const API = 'http://hotsapi.net/api/v1';
    const REPLAYS_PER_PAGE = 100;
    const HTTP_OK = 200;
    const HTTP_RATELIMITED = 429;

    /*
     * Returns assoc array of the headers and json body of the paged replays response
     * ['headers'] = assoc array of the various headers such as ['headers']['x-ratelimit-remaining'] = 299
     * ['json'] = assoc array of the json body object of the response
     */
    public function getPagedReplays($page) {
        return Hotsapi::ResponseHeadersAndJson(Hotsapi::API . '/replays/paged?page=' . $page);
    }

    /*
     * Returns assoc array of the headers and json body of the response at url
     * ['code'] = http code of response
     * ['headers'] = assoc array of the various headers such as ['headers']['x-ratelimit-remaining'] = 299
     * ['json'] = assoc array of the json body object of the response
     *
     * If a failed response occured, only the code key will be set, so always check the code first
     */
    public function ResponseHeadersAndJson($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json')); //Tells it to output content as json
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        //curl_setopt($ch, CURLINFO_HEADER_OUT, true); //Tells it to include the header output
        curl_setopt($ch, CURLOPT_URL, $url); //Curl url
        $res = curl_exec($ch);
        $res_info = curl_getinfo($ch);

        $code = $res_info['http_code'];

        $ret = [];
        $ret['code'] = $code;

        if ($code == Hotsapi::HTTP_OK) {
            /*//Splits the headers and the json body, and then stores them neatly in an assoc array
            list($headers, $body) = explode("\n\n", $res, 2);
            $headers = explode("\n", $headers);
            foreach ($headers as $header) {
                list($key, $value) = explode(':', $header, 2);
                $headers[trim($key)] = trim($value);
            }

            $ret['headers'] = $headers;*/
            $ret['json'] = json_decode($res, true);

            return $ret;
        }

        return $ret;
    }
}
?>