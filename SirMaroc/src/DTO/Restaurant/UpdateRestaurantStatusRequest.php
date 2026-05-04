<?php
namespace App\DTO\Restaurant;

use App\Enum\LieuStatus;
use Symfony\Component\Validator\Constraints as Assert;

class UpdateRestaurantStatusRequest
{
    #[Assert\NotBlank]
    #[Assert\Choice(callback: [LieuStatus::class, 'values'])]
    public ?string $status = null;
}