<?php

namespace App\Repository;

use App\Entity\MonumentHistorique;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repository pour l'accès aux données des monuments historiques.
 * Responsabilité unique : requêtes base de données liées aux monuments.
 * Aucune logique métier ici → elle est dans le Service.
 */
class MonumentHistoriqueRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MonumentHistorique::class);
    }

    /**
     * Récupère tous les monuments d'une ville donnée.
     *
     * @param int $villeId L'identifiant de la ville
     * @return MonumentHistorique[] Liste des monuments dans cette ville
     */
    public function findByVille(int $villeId): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.ville = :villeId')
            ->setParameter('villeId', $villeId)
            ->orderBy('m.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Récupère les monuments dont le prix est inférieur ou égal à un montant donné.
     *
     * @param float $maxPrix Le prix maximum souhaité
     * @return MonumentHistorique[] Liste des monuments filtrés par prix
     */
    public function findByMaxPrix(float $maxPrix): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.prix <= :maxPrix')
            ->setParameter('maxPrix', $maxPrix)
            ->orderBy('m.prix', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Recherche des monuments par mot-clé dans le nom ou la description.
     *
     * @param string $keyword Le mot-clé de recherche
     * @return MonumentHistorique[] Liste des monuments correspondants
     */
    public function searchByKeyword(string $keyword): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.nom LIKE :keyword OR m.description LIKE :keyword')
            ->setParameter('keyword', '%' . $keyword . '%')
            ->orderBy('m.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
