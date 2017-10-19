<?php

namespace Fizzik;

/*
 * Example credentials configuration file for things such as cgi script connection strings.
 * To create own, rename to Credentials.php and enter relevant info.
 */
class Credentials {
    const KEY_DB_HOSTNAME = "db_host";
    const KEY_DB_USER = "db_user";
    const KEY_DB_PASSWORD = "db_password";
    const KEY_DB_DATABASE = "db_database";
    const KEY_MONGODB_URI = "mongodb_uri";
    const KEY_REDIS_URI = "redis_uri";
    const KEY_AWS_KEY = "aws_key";
    const KEY_AWS_SECRET = "aws_secret";
    const KEY_AWS_REPLAYREGION = 'aws_replayregion';

    //Replay Process Database Connections
    private static $replayProcess_db_hostname = "%HOSTNAME%";
    private static $replayProcess_db_user = "%USER%";
    private static $replayProcess_db_password = "%PASSWORD%";
    private static $replayProcess_db_database = "%DATABASE%";
    private static $replayProcess_mongodb_uri = "%URI%";
    private static $replayProcess_redis_uri = "%URI%";
    //Replay Process AWS credentials
    private static $replayProcess_aws_key = "%KEY%";
    private static $replayProcess_aws_secret = "%SECRET%";
    private static $replayProcess_aws_replayregion = "%REPLAYREGION%"; //Ex: eu-west-1

    //Hotstatus Webserver Database Connections
    private static $hotstatusweb_db_hostname = "%HOSTNAME%";
    private static $hotstatusweb_db_user = "%USER%";
    private static $hotstatusweb_db_password = "%PASSWORD%";
    private static $hotstatusweb_db_database = "%DATABASE%";
    private static $hotstatusweb_mongodb_uri = "%URI%";
    private static $hotstatusweb_redis_uri = "%URI%";


    public static function getReplayProcessCredentials() {
        $a = [];

        $a[self::KEY_DB_HOSTNAME] = self::$replayProcess_db_hostname;
        $a[self::KEY_DB_USER] = self::$replayProcess_db_user;
        $a[self::KEY_DB_PASSWORD] = self::$replayProcess_db_password;
        $a[self::KEY_DB_DATABASE] = self::$replayProcess_db_database;
        $a[self::KEY_MONGODB_URI] = self::$replayProcess_mongodb_uri;
        $a[self::KEY_REDIS_URI] = self::$replayProcess_redis_uri;

        $a[self::KEY_AWS_KEY] = self::$replayProcess_aws_key;
        $a[self::KEY_AWS_SECRET] = self::$replayProcess_aws_secret;
        $a[self::KEY_AWS_REPLAYREGION] = self::$replayProcess_aws_replayregion;

        return $a;
    }

    public static function getHotstatusWebCredentials() {
        $a = [];

        $a[self::KEY_DB_HOSTNAME] = self::$hotstatusweb_db_hostname;
        $a[self::KEY_DB_USER] = self::$hotstatusweb_db_user;
        $a[self::KEY_DB_PASSWORD] = self::$hotstatusweb_db_password;
        $a[self::KEY_DB_DATABASE] = self::$hotstatusweb_db_database;
        $a[self::KEY_MONGODB_URI] = self::$hotstatusweb_mongodb_uri;
        $a[self::KEY_REDIS_URI] = self::$hotstatusweb_redis_uri;

        return $a;
    }
}
?>