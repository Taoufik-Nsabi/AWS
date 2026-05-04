<?php

namespace App\Repository;

use App\Entity\Restaurant;
use App\Enum\LieuStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class RestaurantRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Restaurant::class);
    }

    /**
     * Sauvegarder un restaurant
     */
    public function save(Restaurant $restaurant, bool $flush = true): void
    {
        $this->getEntityManager()->persist($restaurant);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Supprimer un restaurant
     */
    public function delete(Restaurant $restaurant, bool $flush = true): void
    {
        $this->getEntityManager()->remove($restaurant);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Trouver un restaurant par ID
     */
    public function findById(int $id): ?Restaurant
    {
        return $this->find($id);
    }

    /**
     * Récupérer tous les restaurants
     */
    public function findAllRestaurants(): array
    {
        return $this->findAll();
    }

    /**
     * Récupérer seulement les restaurants approuvés
     */
    public function findAllApproved(): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.status = :status')
            ->setParameter('status', LieuStatus::APPROVED)
            ->getQuery()
            ->getResult();
    }
}