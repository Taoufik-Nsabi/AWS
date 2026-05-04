<?php
namespace App\Repository;

use App\Entity\Avis;
use App\Entity\Lieu;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class AvisRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Avis::class);
    }

    public function save(Avis $avis, bool $flush = true): void
    {
        $this->getEntityManager()->persist($avis);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Avis $avis, bool $flush = true): void
    {
        $this->getEntityManager()->remove($avis);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findById(int $id): ?Avis
    {
        return $this->find($id);
    }

    public function findByLieu(int $lieuId): array
    {
        return $this->createQueryBuilder('a')
            ->join('a.lieu', 'l')
            ->where('l.id = :lieuId')
            ->setParameter('lieuId', $lieuId)
            ->orderBy('a.id', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.userId = :uid')
            ->setParameter('uid', $userId)
            ->orderBy('a.id', 'DESC')
            ->getQuery()
            ->getResult();
    }

    // MOYENNE DES ÉTOILES 
    public function getAverageStarsByLieu(int $lieuId): ?float
    {
        return $this->createQueryBuilder('a')
            ->select('AVG(a.etoiles) as avg')
            ->join('a.lieu', 'l')
            ->where('l.id = :lieuId')
            ->setParameter('lieuId', $lieuId)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function hasUserAlreadyCommented(int $userId, int $lieuId): bool
    {
        return (bool) $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->join('a.lieu', 'l')
            ->where('a.userId = :userId')
            ->andWhere('l.id = :lieuId')
            ->setParameter('userId', $userId)
            ->setParameter('lieuId', $lieuId)
            ->getQuery()
            ->getSingleScalarResult();
    }


}