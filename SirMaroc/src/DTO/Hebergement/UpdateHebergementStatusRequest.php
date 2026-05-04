<?php

namespace App\DTO\Hebergement;

use App\Enum\LieuStatus;
use Symfony\Component\Validator\Constraints as Assert;

class UpdateHebergementStatusRequest
{
    #[Assert\NotBlank]
    #[Assert\Choice(callback: [LieuStatus::class, 'values'], message: "Le statut n'est pas valide.")]
    public ?string $status = null;
}