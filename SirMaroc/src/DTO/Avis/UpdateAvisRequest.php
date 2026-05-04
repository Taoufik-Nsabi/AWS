<?php

namespace App\DTO\Avis;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateAvisRequest
{
    #[Assert\Length(
        min: 2,
        max: 2000,
        minMessage: 'Le commentaire doit contenir au moins {{ limit }} caractères.',
        maxMessage: 'Le commentaire ne doit pas dépasser {{ limit }} caractères.'
    )]
    public ?string $commentaire = null;

    #[Assert\Range(
        min: 1,
        max: 5,
        notInRangeMessage: 'La note doit être entre {{ min }} et {{ max }}.'
    )]
    public ?int $etoiles = null;

    #[Assert\Positive(message: 'L’identifiant utilisateur doit être positif.')]
    public ?int $userId = null;

    #[Assert\Positive(message: 'L’identifiant du lieu doit être positif.')]
    public ?int $lieuId = null;
}
?>