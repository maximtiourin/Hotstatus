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
    public function indexAction(Request $request)
    {
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig', [
        ]);
    }

    /**
     * @Route("/Heroes", name="heroes")
     */
    public function heroesAction(Request $request)
    {
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig', [
        ]);
    }

    /**
     * @Route("/Maps", name="maps")
     */
    public function mapsAction(Request $request)
    {
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig', [
        ]);
    }

    /**
     * @Route("/Talents", name="talents")
     */
    public function talentsAction(Request $request)
    {
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig', [
        ]);
    }
}
