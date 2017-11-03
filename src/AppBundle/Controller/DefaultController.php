<?php

namespace AppBundle\Controller;

use Fizzik\HotstatusPipeline;
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
        return $this->redirectToRoute("heroes");
    }

    /**
     * @Route("/news", name="news")
     */
    public function newsAction(Request $request) {
        return $this->render('default/index.html.twig', [
        ]);
    }

    /**
     * @Route("/heroes", name="heroes")
     */
    public function heroesAction(Request $request) {
        return $this->render('default/heroes.html.twig', [
            "filter_maps" => HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_MAP],
            "filter_ranks" => HotstatusPipeline::$filter[HotstatusPipeline::FILTER_KEY_RANK]
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

    /**
     * @Route("/contact", name="contact")
     */
    public function contactAction(Request $request) {
        return $this->render('default/index.html.twig', [
        ]);
    }

    /**
     * @Route("/faq", name="faq")
     */
    public function faqAction(Request $request) {
        return $this->render('default/index.html.twig', [
        ]);
    }
}
