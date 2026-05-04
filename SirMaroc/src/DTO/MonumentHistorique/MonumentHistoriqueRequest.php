<?php

namespace App\DTO\MonumentHistorique;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO utilisé lors de la création d'un monument historique.
 * Contient toutes les données nécessaires envoyées par le client.
 * La validation se fait ici (pas dans le contrôleur) → respect du SRP.
 */
class MonumentHistoriqueRequest
{
    /** Nom du monument à créer */
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(max: 255)]
    public ?string $nom = null;

    /** Adresse physique du monument */
    #[Assert\NotBlank(message: "L'adresse est obligatoire.")]
    public ?string $adresse = null;

    /** Description détaillée (optionnelle) */
    public ?string $description = null;

    /** Liens réseaux sociaux sous forme de tableau associatif */
    public ?string $reseauxSociaux = null;

    /** URL de l'image principale */
    public ?string $image = null;

    /** Prix d'entrée en MAD */
    #[Assert\NotNull(message: 'Le prix est obligatoire.')]
    #[Assert\PositiveOrZero(message: 'Le prix doit être positif ou zéro.')]
    public ?float $prix = null;

    /** ID de la ville associée */
    #[Assert\NotNull(message: 'La ville est obligatoire.')]
    #[Assert\Positive]
    public ?int $villeId = null;
}
