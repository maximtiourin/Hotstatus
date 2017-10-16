<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Asset;

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
        return $this->render('default/heroes.html.twig', [
        ]);
    }

    /**
     * @Route("/talents", name="talents")
     */
    public function talentsAction(Request $request) {
        return $this->render('default/index.html.twig', [
        ]);
    }

    /**
     * @Route("/rankings", name="rankings")
     */
    public function rankingsAction(Request $request) {
        return $this->render('default/index.html.twig', [
        ]);
    }

    /**
     * @Route("/upload", name="upload")
     */
    public function uploadAction(Request $request) {
        return $this->render('default/index.html.twig', [
        ]);
    }
}
