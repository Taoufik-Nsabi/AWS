<?php

namespace App\Controller;

use App\Service\MonumentStaticService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/monuments', name: 'monument_')]
class MonumentHistoriqueController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request, MonumentStaticService $service): JsonResponse
    {
        $villeId = $request->query->getInt('villeId');
        $villeId = $villeId > 0 ? $villeId : null;

        return $this->json($service->getAll($villeId), Response::HTTP_OK);
    }

    #[Route('/search', name: 'search', methods: ['GET'])]
    public function search(Request $request, MonumentStaticService $service): JsonResponse
    {
        $keyword = (string) $request->query->get('q', '');

        if (trim($keyword) === '') {
            return $this->json(
                ['error' => 'Le parametre de recherche "q" est obligatoire.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        return $this->json($service->search($keyword), Response::HTTP_OK);
    }

    #[Route('/ville/{villeId}', name: 'by_ville', methods: ['GET'], requirements: ['villeId' => '\d+'])]
    public function byVille(int $villeId, MonumentStaticService $service): JsonResponse
    {
        return $this->json($service->getAll($villeId), Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id, MonumentStaticService $service): JsonResponse
    {
        $monument = $service->getOne($id);

        if (!$monument) {
            return $this->json(['error' => 'Monument introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($monument, Response::HTTP_OK);
    }
}
