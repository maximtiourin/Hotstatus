<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

/*
 * In charge of fetching hero data from database and passing variables to an empty rendered twig
 * This controller is meant to always have its actions embedded in another twig
 */
class HerodataController extends Controller {
    public function getHeroesAction() {
        $db = $this->getDoctrine()->getConnection("hotstatus_mysql");
        $db->setFetchMode(\PDO::FETCH_ASSOC);

        //Prepare statements
        $ps = [];
        $ps['SelectHeroes'] = $db->prepare("SELECT * FROM herodata_heroes");

        $heroes = [];

        $stmt = $ps['SelectHeroes'];
        $stmt->execute();
        while ($row = $stmt->fetch()) {
            $heroes[] = $row;
        }

        return $this->render("snippets/variableinjection.html.twig", [
            'herodata_heroes' => $heroes
        ]);
    }
}
