<?php

namespace Fizzik;


class ReplayParser
{
    /*
     * Executes the ReplayParser process and returns the output as a json assoc array
     * If the process encountered an error, the result array will only contain one field:
     * ['error'] => 'DESCRIPTION OF ERROR'
     */
    public static function ParseReplay($replayfilepath) {
        $output = shell_exec(HotstatusPipeline::REPLAY_EXECUTABLE_SHELLEXEC_REPLAYPARSER . " " . $replayfilepath);

        $json = json_decode($output, true);

        if ($json != null) {
            return $json;
        }
        else {
            return array('error' => 'Could not parse JSON from output');
        }
    }
}