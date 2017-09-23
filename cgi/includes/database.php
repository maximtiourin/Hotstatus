<?php
/**
 * Base class for creating a Database object that handles connections
 */
class Database {
    private $db = null;
    private $pstate = []; //Map of : names => prepared statements

    public function connect($host, $user, $password, $dbname) {
        if ($this->db != null) {
            $this->close();
        }

        $this->db = new mysqli($host, $user, $password, $dbname);
        if (mysqli_connect_errno()) {
            die('Could not connect: ' . mysqli_connect_error());
        }

        return $this->db;
    }

    /*
     * Default connection credentials for replay processes
     */
    public function connectDefaultReplayProcess() {
        return $this->connect("localhost", "replayprocess", "changeme", "hotstatus");
    }

    /*
     * Prepares a query statement with the given name,
     * for the current connection, if there is one.
     * use ? for params
     */
    public function prepare($name, $query) {
        if ($this->db != null) {
            $e = $this->db->prepare($query);
            if (!$e) {
                die("prepare error (".$name.")");
            }
            $this->pstate[$name] = $e;
            return $e;
        }
    }

    /*
     * Binds the given variables with their given type string to the prepared statement of given name.
     * Type string is a string where each character represents the type of the variable at the same index
     * Valid characters are: i=integer, d=double, s=string, b=blob
     */
    public function bind($name, $types, &...$vars) {
        if ($this->db != null) {
            $e = $this->pstate[$name];
            if ($e != null) {
                return $e->bind_param($types, ...$vars);
            }
        }

        return false;
    }

    /*
     * Executes the prepared query with the given variable name,
     * returns a result set if the query creates one, or false otherwise;
     */
    public function execute($name) {
        if ($this->db != null) {
            $e = $this->pstate[$name];
            if ($e != null) {
                $exec = $e->execute();

                if ($exec) {
                    return $e->get_result();
                }
            }
        }

        return false;
    }

    public function query($query) {
        $result = $this->db->query($query);
        if (!$result) {
            die('Query failed: ' . $this->db->error());
        }
        return $result;
    }

    public function fetchArray($result) {
        return $result->fetch_assoc();
    }

    public function freeResult($result) {
        $result->free();
    }

    /*
     * Counts the amount of rows returned in the result
     */
    public function countResultRows($result) {
        return $result->num_rows;
    }

    public function isConnected() {
        return $this->db != null;
    }

    public function connection() {
        return $this->db;
    }

    public function closeStatements() {
        foreach ($this->pstate as $statement) {
            $statement->close();
        }
    }

    public function close() {
        $this->closeStatements();
        $this->pstate = [];
        $this->db->close();
        $this->db = null;
    }
}
?>