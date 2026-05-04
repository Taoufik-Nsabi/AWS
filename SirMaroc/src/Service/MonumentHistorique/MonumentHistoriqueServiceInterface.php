<?php

namespace App\Service\MonumentHistorique;

use App\DTO\MonumentHistorique\MonumentHistoriqueRequest;
use App\DTO\MonumentHistorique\MonumentHistoriqueResponse;
use App\DTO\MonumentHistorique\MonumentHistoriqueUpdate;

/**
 * Interface définissant le contrat du service MonumentHistorique.
 * Le contrôleur dépend de cette interface (pas de l'implémentation) → Dependency Inversion (SOLID D).
 * Cela permet de changer l'implémentation sans toucher au contrôleur.
 */
interface MonumentHistoriqueServiceInterface
{
    /**
     * Récupère tous les monuments historiques.
     *
     * @return MonumentHistoriqueResponse[] Liste de tous les monuments
     */
    public function getAll(): array;

    /**
     * Récupère un monument par son identifiant.
     *
     * @param int $id Identifiant du monument
     * @return MonumentHistoriqueResponse Le monument trouvé
     * @throws \App\Exception\MonumentNotFoundException Si le monument n'existe pas
     */
    public function getById(int $id): MonumentHistoriqueResponse;

    /**
     * Récupère tous les monuments d'une ville donnée.
     *
     * @param int $villeId Identifiant de la ville
     * @return MonumentHistoriqueResponse[] Liste des monuments de cette ville
     */
    public function getByVille(int $villeId): array;

    /**
     * Crée un nouveau monument historique à partir des données du client.
     *
     * @param MonumentHistoriqueRequest $request Les données de création
     * @return MonumentHistoriqueResponse Le monument créé
     * @throws \App\Exception\VilleNotFoundException Si la ville n'existe pas
     */
    public function create(MonumentHistoriqueRequest $request): MonumentHistoriqueResponse;

    /**
     * Met à jour un monument existant avec les données fournies.
     *
     * @param int $id Identifiant du monument à modifier
     * @param MonumentHistoriqueUpdate $update Les données de mise à jour
     * @return MonumentHistoriqueResponse Le monument modifié
     * @throws \App\Exception\MonumentNotFoundException Si le monument n'existe pas
     */
    public function update(int $id, MonumentHistoriqueUpdate $update): MonumentHistoriqueResponse;

    /**
     * Supprime un monument historique par son identifiant.
     *
     * @param int $id Identifiant du monument à supprimer
     * @throws \App\Exception\MonumentNotFoundException Si le monument n'existe pas
     */
    public function delete(int $id): void;

    /**
     * Recherche des monuments par mot-clé dans le nom ou la description.
     *
     * @param string $keyword Le terme de recherche
     * @return MonumentHistoriqueResponse[] Les monuments correspondants
     */
    public function search(string $keyword): array;
}
