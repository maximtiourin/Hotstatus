<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request) {
        return $this->render('default/index.html.twig', [
        ]);
    }

    /**
     * @Route("/heroes", name="heroes")
     */
    public function heroesAction(Request $request) {
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

        return $this->render('default/heroes.html.twig', [
            'herodata_heroes' => $heroes
        ]);
    }

    /**
     * @Route("/maps", name="maps")
     */
    public function mapsAction(Request $request) {
        return $this->render('default/index.html.twig', [
        ]);
    }

    /**
     * @Route("/talents", name="talents")
     */
    public function talentsAction(Request $request) {
        return $this->render('default/index.html.twig', [
        ]);
    }
}
