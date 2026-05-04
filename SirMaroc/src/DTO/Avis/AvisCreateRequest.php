<?php

namespace App\DTO\Avis;

use Symfony\Component\Validator\Constraints as Assert;

class AvisCreateRequest
{
    #[Assert\NotBlank(message: "Le commentaire est obligatoire")]
    #[Assert\Length(min: 10, max: 1000)]
    public ?string $commentaire = null;

    #[Assert\NotNull(message: "Les étoiles sont obligatoires")]
    #[Assert\Range(min: 1, max: 5)]
    public ?int $etoiles = null;

    #[Assert\NotNull(message: "Le lieu est obligatoire")]
    public ?int $lieuId = null;
}