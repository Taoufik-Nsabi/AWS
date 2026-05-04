<?php

namespace App\Service\Activite;

use App\DTO\Activite\CreateActiviteRequest;
use App\DTO\Activite\UpdateActiviteRequest;

interface ActiviteServiceInterface
{
    public function create(CreateActiviteRequest $dto);
    public function update(int $id, UpdateActiviteRequest $dto);
    public function delete(int $id);
    public function getById(int $id);
    public function getAll();
    public function getEntityById(int $id);
}