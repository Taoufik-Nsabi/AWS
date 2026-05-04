<?php

namespace App\Controller;

use App\Service\Ville\VilleServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/villes')]
final class VilleController extends AbstractController
{
    private VilleServiceInterface $service;

    public function __construct(VilleServiceInterface $service)
    {
        $this->service = $service;
    }

    // GET /api/villes
    #[Route('', name: 'ville_list', methods: ['GET'])]
    public function getAll(): JsonResponse
    {
        $result = $this->service->getAll();
        return $this->json($result);
    }

    // GET /api/villes/1
    #[Route('/{id}', name: 'ville_get', methods: ['GET'])]
    public function getById(int $id): JsonResponse
    {
        $result = $this->service->getById($id);
        return $this->json($result);
    }
}
