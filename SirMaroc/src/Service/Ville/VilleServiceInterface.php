<?php

namespace App\Service\Ville;

interface VilleServiceInterface
{
    public function getAll();
    public function getById(int $id);
}
