<?php
/*
 * Example credentials configuration file for things such as cgi script connection strings.
 * To create own, rename to Credentials.php and enter relevant info.
 */
class Credentials {
    const KEY_HOSTNAME = "host";
    const KEY_USER = "user";
    const KEY_PASSWORD = "password";
    const KEY_DATABASE = "database";
    //Replay Process Database Connections
    private static $replayProcess_hostname = "%HOSTNAME%";
    private static $replayProcess_user = "%USER%";
    private static $replayProcess_password = "%PASSWORD%";
    private static $replayProcess_database = "%DATABASE%";

    /*
     * Returns an object with const keys [KEY_HOSTNAME, KEY_USER, KEY_PASSWORD, KEY_DATABASE]
     */
    public static function getReplayProcessCredentials() {
        $a = [];
        $a[self::KEY_HOSTNAME] = self::$replayProcess_hostname;
        $a[self::KEY_USER] = self::$replayProcess_user;
        $a[self::KEY_PASSWORD] = self::$replayProcess_password;
        $a[self::KEY_DATABASE] = self::$replayProcess_database;
        return $a;
    }
}
?>