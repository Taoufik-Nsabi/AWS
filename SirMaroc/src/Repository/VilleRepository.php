<?php

namespace App\Repository;

use App\Entity\Ville;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class VilleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Ville::class);
    }

    public function findAll(): array
    {
        return $this->createQueryBuilder('v')
            ->orderBy('v.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findById(int $id): ?Ville
    {
        return $this->find($id);
    }
}
