<?php
class SleepHandler {
    private $duration;

    public function __construct() {
        $this->duration = 0;
    }

    public function add($amount) {
        $this->duration += $amount;
    }

    public function execute() {
        if ($this->duration > 0) {
            sleep($this->duration);
        }
        $this->duration = 0;
    }
}