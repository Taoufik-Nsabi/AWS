<?php

namespace App\DTO\Activite;

use App\Enum\LieuStatus;
use Symfony\Component\Validator\Constraints as Assert;

class UpdateActiviteStatusRequest
{
    #[Assert\NotBlank]
    #[Assert\Choice(callback: [LieuStatus::class, 'values'], message: "Le statut n'est pas valide.")]
    public ?string $status = null;
}