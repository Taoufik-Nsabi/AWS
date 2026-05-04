<?php
namespace App\Repository;

use App\Enum\LieuStatus;
use App\Entity\Hebergement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class HebergementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Hebergement::class);
    }

    public function save(Hebergement $hebergement, bool $flush = true): void
    {
        $this->getEntityManager()->persist($hebergement);
        if ($flush) $this->getEntityManager()->flush();
    }

    public function delete(Hebergement $hebergement, bool $flush = true): void
    {
        $this->getEntityManager()->remove($hebergement);
        if ($flush) $this->getEntityManager()->flush();
    }

    public function findById(int $id): ?Hebergement
    {
        return $this->find($id);
    }

    public function findAllApproved(): array
    {
        return $this->createQueryBuilder('h')
            ->where('h.status = :status')
            ->setParameter('status', LieuStatus::APPROVED)
            ->getQuery()
            ->getResult();
    }

    public function findAllHebergements(): array
    {
        return $this->findAll();
    }
}