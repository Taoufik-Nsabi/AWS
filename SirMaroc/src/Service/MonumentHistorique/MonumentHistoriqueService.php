<?php

namespace App\Service\MonumentHistorique;

use App\DTO\MonumentHistorique\MonumentHistoriqueRequest;
use App\DTO\MonumentHistorique\MonumentHistoriqueResponse;
use App\DTO\MonumentHistorique\MonumentHistoriqueUpdate;
use App\Exception\MonumentNotFoundException;
use App\Exception\VilleNotFoundException;
use App\Mapper\MonumentHistoriqueMapper;
use App\Repository\MonumentHistoriqueRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Ville;
USE App\Service\MonumentHistorique\MonumentHistoriqueServiceInterface;

/**
 * Implémentation du service MonumentHistorique.
 * Contient toute la logique métier : création, modification, suppression, recherche.
 * Responsabilité unique : orchestrer les opérations métier sur les monuments.
 * Le repository gère l'accès aux données, le mapper gère la conversion.
 */
class MonumentHistoriqueService implements MonumentHistoriqueServiceInterface
{
    public function __construct(
        private readonly MonumentHistoriqueRepository $repository,
        private readonly EntityManagerInterface $entityManager,
        private readonly MonumentHistoriqueMapper $mapper,
    ) {}

    /**
     * Récupère tous les monuments et les convertit en DTOs de réponse.
     *
     * @return MonumentHistoriqueResponse[]
     */
    public function getAll(): array
    {
        $monuments = $this->repository->findAll();
        return $this->mapper->toResponseList($monuments);
    }

    /**
     * Récupère un monument par son ID et le convertit en DTO de réponse.
     * Lève une exception si le monument n'existe pas.
     *
     * @param int $id Identifiant du monument
     * @return MonumentHistoriqueResponse
     * @throws MonumentNotFoundException
     */
    public function getById(int $id): MonumentHistoriqueResponse
    {
        $monument = $this->repository->find($id);

        if ($monument === null) {
            throw new MonumentNotFoundException($id);
        }

        return $this->mapper->toResponse($monument);
    }

    /**
     * Récupère tous les monuments appartenant à une ville donnée.
     *
     * @param int $villeId Identifiant de la ville
     * @return MonumentHistoriqueResponse[]
     */
    public function getByVille(int $villeId): array
    {
        $monuments = $this->repository->findByVille($villeId);
        return $this->mapper->toResponseList($monuments);
    }

    /**
     * Crée un nouveau monument à partir du DTO Request.
     * Vérifie d'abord que la ville existe, puis persiste l'entité.
     *
     * @param MonumentHistoriqueRequest $request Données de création
     * @return MonumentHistoriqueResponse Le monument créé
     * @throws VilleNotFoundException Si la ville n'existe pas
     */
    public function create(MonumentHistoriqueRequest $request): MonumentHistoriqueResponse
    {
        $ville = $this->findVilleOrFail($request->villeId);

        $monument = $this->mapper->fromRequestToEntity($request, $ville);

        $this->entityManager->persist($monument);
        $this->entityManager->flush();

        return $this->mapper->toResponse($monument);
    }

    /**
     * Met à jour un monument existant avec les données du DTO Update.
     * Seuls les champs non-null sont modifiés.
     *
     * @param int $id Identifiant du monument
     * @param MonumentHistoriqueUpdate $update Données de mise à jour
     * @return MonumentHistoriqueResponse Le monument modifié
     * @throws MonumentNotFoundException Si le monument n'existe pas
     * @throws VilleNotFoundException Si la nouvelle ville n'existe pas
     */
    public function update(int $id, MonumentHistoriqueUpdate $update): MonumentHistoriqueResponse
    {
        $monument = $this->repository->find($id);

        if ($monument === null) {
            throw new MonumentNotFoundException($id);
        }

        // Si une nouvelle ville est demandée, on la récupère
        $ville = null;
        if ($update->villeId !== null) {
            $ville = $this->findVilleOrFail($update->villeId);
        }

        $this->mapper->applyUpdateToEntity($update, $monument, $ville);

        $this->entityManager->flush();

        return $this->mapper->toResponse($monument);
    }

    /**
     * Supprime un monument historique par son ID.
     * Lève une exception si le monument n'existe pas.
     *
     * @param int $id Identifiant du monument
     * @throws MonumentNotFoundException
     */
    public function delete(int $id): void
    {
        $monument = $this->repository->find($id);

        if ($monument === null) {
            throw new MonumentNotFoundException($id);
        }

        $this->entityManager->remove($monument);
        $this->entityManager->flush();
    }

    /**
     * Recherche des monuments par mot-clé (nom ou description).
     *
     * @param string $keyword Le terme de recherche
     * @return MonumentHistoriqueResponse[]
     */
    public function search(string $keyword): array
    {
        $monuments = $this->repository->searchByKeyword($keyword);
        return $this->mapper->toResponseList($monuments);
    }

    /**
     * Méthode privée pour récupérer une ville ou lever une exception.
     * Évite la duplication de code dans create() et update().
     *
     * @param int $villeId Identifiant de la ville
     * @return Ville L'entité ville trouvée
     * @throws VilleNotFoundException Si la ville n'existe pas
     */
    private function findVilleOrFail(int $villeId): Ville
    {
        $ville = $this->entityManager->getRepository(Ville::class)->find($villeId);

        if ($ville === null) {
            throw new VilleNotFoundException($villeId);
        }

        return $ville;
    }
}