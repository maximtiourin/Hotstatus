<?php

namespace AppBundle\Controller;

use Fizzik\HotstatusPipeline;
use Fizzik\Utility\AssocArray;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Asset;
use Fizzik\Database\MySqlDatabase;
use Fizzik\Database\RedisDatabase;
use Fizzik\Credentials;
use Fizzik\HotstatusCache;
use Symfony\Component\HttpFoundation\Request;

/*
 * In charge of fetching hero data from database and returning it as requested
 */
class PlayerdataController extends Controller {
    const QUERY_IGNORE_AFTER_CACHE = "ignoreAfterCache";
    const QUERY_USE_FOR_SECONDARY = "useForSecondary";
    const QUERY_ISSET = "isSet";
    const QUERY_RAWVALUE = "rawValue";
    const QUERY_SQLVALUE = "sqlValue";
    const QUERY_SQLCOLUMN = "sqlColumn";
    const QUERY_TYPE = "mappingType";
    const QUERY_TYPE_RANGE = "range"; //Should look up a range of values from a filter map
    const QUERY_TYPE_RAW = "raw"; //Equality to Raw value should be used for the query

    /*
     * Given an array of query string fragments of type 'WhereOr', will construct a query string fragment joining them
     * with AND keywords, while prepending a single AND keyword. Will return an empty string if supplied an empty array.
     *
     * EX:
     *
     * 0 fragments : ''
     * 1 fragment  : ' AND frag1'
     * 3 fragments : ' AND frag1 AND frag2 AND frag3'
     */
    private static function buildQuery_WhereAnd_String($whereors, $prependAnd = TRUE) {
        $ret = "";

        $i = 0;
        $count = count($whereors);
        if ($prependAnd && $count > 0) $ret = " AND ";
        foreach ($whereors as $or) {
            $ret .= $or;

            if ($i < $count - 1) {
                $ret .= " AND ";
            }

            $i++;
        }

        return $ret;
    }

    /*
     * Given a comma separated string of values for a given field, will construct a query string fragment,
     * taking into account mapping type and filter key, non-numeric values are surrounded by quotes EX:
     *
     * Map Type 'Raw'   : '(`field` = val1 OR `field` = val2 OR `field` = "val3")'
     * Map Type 'Range' : '((`field` >= valmin1 AND `field` <= valmax1) OR (`field` >= valmin2 AND `field` <= valmax2) OR (`field` >= "valmin3" AND `field` <= "valmax3"))'
     */
    private static function buildQuery_WhereOr_String($key, $field, $str, $mappingType = self::QUERY_TYPE_RAW) {
        $decode = htmlspecialchars_decode($str);

        $values = explode(",", $str);

        $ret = "(";

        $i = 0;
        $count = count($values);
        foreach ($values as $value) {
            if ($mappingType === self::QUERY_TYPE_RAW) {
                $val = $value;
                if (!is_numeric($value)) {
                    $val = '"' . $value . '"';
                }

                $ret .= "`$field` = $val";
            }
            else if ($mappingType === self::QUERY_TYPE_RANGE) {
                $obj = HotstatusPipeline::$filter[$key][$value];
                $min = $obj["min"];
                $max = $obj["max"];

                if (!is_numeric($min)) {
                    $min = '"' . $min . '"';
                }
                if (!is_numeric($max)) {
                    $max = '"' . $max . '"';
                }

                if ($count > 1) $ret .= "(";

                $ret .= "`$field` >= $min AND `$field` <= $max";

                if ($count > 1) $ret .= ")";
            }

            if ($i < $count - 1) {
                $ret .= " OR ";
            }

            $i++;
        }

        $ret .= ")";

        return $ret;
    }

    private static function formatNumber($n, $decimalPlaces = 0) {
        return number_format($n, $decimalPlaces, '.', ',');
    }
}
