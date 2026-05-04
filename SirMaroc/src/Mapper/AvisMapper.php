<?php

namespace App\Mapper;

use App\DTO\Avis\AvisCreateRequest;
use App\DTO\Avis\AvisCreateResponse;
use App\DTO\Avis\UpdateAvisRequest;
use App\Entity\Avis;

class AvisMapper
{
    // 🔹 Create DTO → Entity
    public function fromCreateRequest(AvisCreateRequest $request, Avis $avis): Avis
    {
        $avis->setCommentaire($request->commentaire);
        $avis->setEtoiles($request->etoiles);

        return $avis;
    }

    // 🔹 Update DTO → Entity
    public function updateEntity(Avis $avis, UpdateAvisRequest $request): Avis
    {
        if ($request->commentaire !== null) {
            $avis->setCommentaire($request->commentaire);
        }

        if ($request->etoiles !== null) {
            $avis->setEtoiles($request->etoiles);
        }

        if ($request->userId !== null) {
            $avis->setUserId($request->userId);
        }

        return $avis;
    }

    // 🔹 Entity → Response (ONE function only)
    public function toResponse(Avis $avis): AvisCreateResponse
    {
        $response = new AvisCreateResponse();
        $response->id = $avis->getId();
        $response->commentaire = $avis->getCommentaire();
        $response->etoiles = $avis->getEtoiles();
        $response->userId = $avis->getUserId();
        $response->lieuId = $avis->getLieu()?->getId();

        return $response;
    }
}