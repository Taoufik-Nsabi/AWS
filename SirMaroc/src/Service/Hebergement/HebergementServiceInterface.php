<?php

namespace App\Service\Hebergement;

use App\Entity\Hebergement;
use App\DTO\Hebergement\CreateHebergementRequest;
use App\DTO\Hebergement\UpdateHebergementRequest;

interface HebergementServiceInterface
{
    public function create(CreateHebergementRequest $dto);
    public function update(int $id, UpdateHebergementRequest $dto);
    public function delete(int $id);
    public function getById(int $id);
    public function getAll();
    public function getAllHebergements();
    public function getEntityById(int $id): ?Hebergement; 
}