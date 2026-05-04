<?php
namespace App\Repository;

use App\Entity\Activite;
use App\Enum\LieuStatus;  // ← AJOUTEZ
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ActiviteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Activite::class);
    }

    public function save(Activite $activite, bool $flush = true): void
    {
        $this->getEntityManager()->persist($activite);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function delete(Activite $activite, bool $flush = true): void
    {
        $this->getEntityManager()->remove($activite);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findById(int $id): ?Activite
    {
        return $this->find($id);
    }

    public function findAllApproved(): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.status = :status')
            ->setParameter('status', LieuStatus::APPROVED)  // ← CHANGÉ
            ->getQuery()
            ->getResult();
    }
}