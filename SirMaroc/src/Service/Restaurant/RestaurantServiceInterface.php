<?php

namespace App\Service\Restaurant;

use App\DTO\Restaurant\CreateRestaurantRequest;
use App\DTO\Restaurant\UpdateRestaurantRequest;

interface RestaurantServiceInterface
{
    public function create(CreateRestaurantRequest $dto);
    public function update(int $id, UpdateRestaurantRequest $dto);
    public function delete(int $id);
    public function getById(int $id);
    public function getAll();
    public function getEntityById(int $id);
}