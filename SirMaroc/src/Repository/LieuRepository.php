<?php

namespace App\Repository;

use App\Entity\Lieu;
use App\Repository\Interface\LieuRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use App\Enum\LieuStatus;

/**
 * Implémentation concrète du repository Lieu.
 *
 * Responsabilité unique (SRP) : accès et persistance des données.
 * Aucune logique métier ici.
 */
class LieuRepository extends ServiceEntityRepository 
{
    private const TYPE_CLASS_MAP = [
        'hebergements' => \App\Entity\Hebergement::class,
        'restaurants' => \App\Entity\Restaurant::class,
        'activites' => \App\Entity\Activite::class,
        'monuments' => \App\Entity\MonumentHistorique::class,
    ];

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Lieu::class);
    }

    // riham 
      public function findApproved(string $entityClass): array
    {
        return $this->_em->getRepository($entityClass)
            ->createQueryBuilder('l')
            ->where('l.status = :status')
            ->setParameter('status', LieuStatus::APPROVED)
            ->getQuery()
            ->getResult();
    }

    public function findById(int $id): ?Lieu
    {
        return $this->find($id);
    }


     public function delete(Lieu $Lieu, bool $flush = true): void
    {
        $this->getEntityManager()->remove($Lieu);
        if ($flush) $this->getEntityManager()->flush();
    }


   public function findAllByUserId(int $userId): array
    {
        return $this->createQueryBuilder('l')
            ->where('l.userId = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('l.id', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findDetailById(int $id): ?Lieu
    {
        return $this->createQueryBuilder('l')
            ->leftJoin('l.ville', 'v')->addSelect('v')
            ->leftJoin('l.images', 'i')->addSelect('i')
            ->leftJoin('l.avis', 'a')->addSelect('a')
            ->where('l.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findAdminLieux(?string $type = null, ?LieuStatus $status = null): array
    {
        if ($type !== null && $type !== '') {
            $entityClass = self::TYPE_CLASS_MAP[$type] ?? null;

            if ($entityClass === null) {
                return [];
            }

            $qb = $this->getEntityManager()
                ->getRepository($entityClass)
                ->createQueryBuilder('l');
        } else {
            $qb = $this->createQueryBuilder('l');
        }

        $qb->leftJoin('l.ville', 'v')->addSelect('v')
            ->orderBy('l.id', 'DESC');

        if ($status !== null) {
            $qb->andWhere('l.status = :status')
                ->setParameter('status', $status);
        }

        return $qb->getQuery()->getResult();
    }
}
