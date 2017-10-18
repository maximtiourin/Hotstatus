<?php

namespace Fizzik;

class MMRCalculator {
    /*
     * Executes the MMRCalculator process and returns the output as a json assoc array
     *
     * Expects the absolute directory to the script calling this function, so the script should pass __DIR__
     *
     * If the process encountered an error, the result array will only contain one field:
     * ['error'] => 'DESCRIPTION OF ERROR'
     */
    public static function Calculate($callingDirectory, $team0rank, $team1rank, $playermmrs) {
        $team0size = count($playermmrs['team0']);
        $team1size = count($playermmrs['team1']);

        //Build arg str
        $S = " ";

        $str = "";
        $str .= $team0size.$S;
        $str .= $team1size.$S;
        $str .= $team0rank.$S;
        $str .= $team1rank.$S;

        $i = 0;
        $count = $team0size;
        foreach ($playermmrs['team0'] as $id => $player) {
            $str .= $id.$S;
            $str .= $player['mu'].$S;
            $str .= $player['sigma'];

            if ($i < $count - 1) $str .= $S;

            $i++;
        }

        $str .= $S;

        $i = 0;
        $count = $team1size;
        foreach ($playermmrs['team1'] as $id => $player) {
            $str .= $id.$S;
            $str .= $player['mu'].$S;
            $str .= $player['sigma'];

            if ($i < $count - 1) $str .= $S;

            $i++;
        }

        //Execute
        $output = shell_exec($callingDirectory . HotstatusPipeline::REPLAY_EXECUTABLE_DIRECTORY . HotstatusPipeline::REPLAY_EXECUTABLE_ID_MMRCALCULATOR . " " . $str);

        $json = json_decode($output, true);

        if ($json != null) {
            return $json;
        }
        else {
            return array('error' => 'Could not parse JSON from output');
        }
    }
}