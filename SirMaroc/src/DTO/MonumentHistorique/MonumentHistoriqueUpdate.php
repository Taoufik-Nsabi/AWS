<?php

namespace App\DTO\MonumentHistorique;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO utilisé lors de la mise à jour d'un monument historique.
 * Tous les champs sont optionnels : on ne modifie que ce qui est envoyé.
 * Cela permet des mises à jour partielles (PATCH-style).
 */
class MonumentHistoriqueUpdate
{
    /** Nouveau nom (optionnel) */
    #[Assert\Length(max: 255)]
    public ?string $nom = null;

    /** Nouvelle adresse (optionnelle) */
    public ?string $adresse = null;

    /** Nouvelle description (optionnelle) */
    public ?string $description = null;

    /** Nouveaux liens réseaux sociaux (optionnel) */
    public ?string $reseauxSociaux = null;

    /** Nouvelle URL d'image (optionnelle) */
    public ?string $image = null;

    /** Nouveau prix (optionnel) */
    #[Assert\PositiveOrZero(message: 'Le prix doit être positif ou zéro.')]
    public ?float $prix = null;

    /** Nouvel ID de ville (optionnel) */
    #[Assert\Positive]
    public ?int $villeId = null;
}
