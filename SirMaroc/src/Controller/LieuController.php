<?php

namespace App\Controller;

use App\Service\Lieu\LieuServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/lieux')]
class LieuController extends AbstractController
{
    private LieuServiceInterface $lieuService;

    public function __construct(LieuServiceInterface $lieuService)
    {
        $this->lieuService = $lieuService;
    }

    #[Route('', name: 'api_mes_lieux', methods: ['GET'])]
    public function getMyLieux(): JsonResponse
    {
        return $this->json($this->lieuService->getMyLieux());
    }

    #[Route('/admin', name: 'api_admin_lieux', methods: ['GET'])]
    public function getAdminLieux(Request $request): JsonResponse
    {
        $type = $request->query->get('type');
        $status = $request->query->get('status');

        return $this->json($this->lieuService->getAdminLieux($type, $status));
    }

    #[Route('/user/{userId}', name: 'api_lieux_by_user', requirements: ['userId' => '\d+'], methods: ['GET'])]
    public function getLieuxByUser(int $userId): JsonResponse
    {
        return $this->json($this->lieuService->getLieuxByUser($userId));
    }

    #[Route('/{id}', name: 'lieu_detail', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function detail(int $id): JsonResponse
    {
        return $this->json($this->lieuService->getLieuDetail($id));
    }

    #[Route('/{id}', name: 'lieu_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->lieuService->delete($id);

        return $this->json([
            "message" => "Lieu supprime avec succes"
        ]);
    }
}
