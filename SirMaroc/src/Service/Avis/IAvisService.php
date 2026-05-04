<?php

namespace App\Service\Avis;

use App\DTO\Avis\AvisCreateRequest;
use App\DTO\Avis\UpdateAvisRequest;
use App\Entity\Avis;

interface IAvisService
{
    public function createAvis(AvisCreateRequest $request): Avis;

    public function updateAvis(int $id, UpdateAvisRequest $request): Avis;

    public function deleteAvis(int $id): void;

    public function getAvisById(int $id): Avis;

    public function getAvisByLieu(int $lieuId): array;

    public function getAvisByUser(): array;
    public function getAverageStarsByLieu(int $lieuId): ?float;
}