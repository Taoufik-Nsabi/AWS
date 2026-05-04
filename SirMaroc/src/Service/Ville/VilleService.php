<?php

namespace App\Service\Ville;

use App\Mapper\VilleMapper;
use App\Repository\VilleRepository;

class VilleService implements VilleServiceInterface
{
    private VilleRepository $repository;
    private VilleMapper $mapper;

    public function __construct(VilleRepository $repository, VilleMapper $mapper)
    {
        $this->repository = $repository;
        $this->mapper = $mapper;
    }

    public function getAll()
    {
        $villes = $this->repository->findAll();
        $result = [];
        foreach ($villes as $ville) {
            $result[] = $this->mapper->toResponse($ville);
        }
        return $result;
    }

    public function getById(int $id)
    {
        $ville = $this->repository->findById($id);
        if (!$ville) {
            throw new \Exception("Ville not found");
        }
        return $this->mapper->toResponse($ville);
    }
}
