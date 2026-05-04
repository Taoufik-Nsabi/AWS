<?php

namespace App\Service\Lieu;

use App\DTO\Lieu\LieuDetailResponse;
use App\Entity\Lieu;
use App\Enum\LieuStatus;

interface LieuServiceInterface
{
    public function updateStatus(Lieu $lieu, LieuStatus $status): Lieu;

    public function getAdminLieux(?string $type = null, ?string $status = null): array;

    public function getMyLieux(): array;

    public function getLieuxByUser(int $userId): array;

    public function getLieuDetail(int $id): LieuDetailResponse;

    public function delete(int $id): void;
}
