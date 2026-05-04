<?php

namespace App\Controller;

use App\Service\Avis\IAvisService;
use App\DTO\Avis\AvisCreateRequest;
use App\DTO\Avis\UpdateAvisRequest;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/avis')]
class AvisController extends AbstractController
{
    private IAvisService $service;

    public function __construct(IAvisService $service)
    {
        $this->service = $service;
    }

  #[Route('', methods: ['POST'])]
public function create(Request $request): JsonResponse
{
    $data = json_decode($request->getContent(), true);

    $dtoReq = new AvisCreateRequest();
    $dtoReq->commentaire = $data['commentaire'] ?? null;
    $dtoReq->etoiles = $data['etoiles'] ?? null;
    $dtoReq->lieuId = $data['lieuId'] ?? null;

    // 1. On crée l'avis en base
    $avis = $this->service->createAvis($dtoReq);

    // 2. On récupère l'email via le service (extrait du JWT)
    $userEmail = $this->service->getCurrentUserEmail();

    // 3. On retourne le JSON complet
    return $this->json([
        'id' => $avis->getId(),
        'commentaire' => $avis->getCommentaire(),
        'etoiles' => $avis->getEtoiles(),
        'userId' => $avis->getUserId(),
        'email' => $userEmail, // <--- Renvoie l'email au Front
        'lieuId' => $avis->getLieu()?->getId(),
        'message' => 'Avis publié avec succès'
    ], JsonResponse::HTTP_CREATED);
}
    

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $dto = new UpdateAvisRequest();
        $dto->commentaire = $data['commentaire'] ?? null;
        $dto->etoiles = $data['etoiles'] ?? null;

        $avis = $this->service->updateAvis($id, $dto);

        return $this->json([
            'id' => $avis->getId(),
            'commentaire' => $avis->getCommentaire(),
            'etoiles' => $avis->getEtoiles(),
            'userId' => $avis->getUserId(),
            'lieuId' => $avis->getLieu()?->getId()
        ]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->service->deleteAvis($id);

        return $this->json([
            'message' => 'Avis supprimé avec succès'
        ]);
    }
      #[Route('/me', methods: ['GET'])]
        public function getMyAvis(): JsonResponse
        {
            $avis = $this->service->getAvisByUser();

            return $this->json($avis);
        }

    #[Route('/{id}', methods: ['GET'])]
    public function getById(int $id): JsonResponse
    {
        $avis = $this->service->getAvisById($id);

        return $this->json([
            'id' => $avis->getId(),
            'commentaire' => $avis->getCommentaire(),
            'etoiles' => $avis->getEtoiles(),
            'userId' => $avis->getUserId(),
            'lieuId' => $avis->getLieu()?->getId()
        ]);
    }

    #[Route('/lieu/{id}', methods: ['GET'])]
    public function getByLieu(int $id): JsonResponse
    {
        $avisList = $this->service->getAvisByLieu($id);
        $userEmail = $this->service->getCurrentUserEmail();
        $data = array_map(fn($avis) => [
            'id' => $avis->getId(),
            'commentaire' => $avis->getCommentaire(),
            'etoiles' => $avis->getEtoiles(),
            'userId' => $avis->getUserId(),
            'email' => $userEmail,
        ], $avisList);

        return $this->json($data);
    }

    


    #[Route('/lieu/{id}/moyenne', methods: ['GET'])]
    public function getAverage(int $id): JsonResponse
    {
        return $this->json([
            'average' => $this->service->getAverageStarsByLieu($id)
        ]);
    }
}