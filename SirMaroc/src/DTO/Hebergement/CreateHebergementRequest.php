<?php
namespace App\DTO\Hebergement;

use App\Enum\CategorieHebergement;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class CreateHebergementRequest
{
    #[Assert\NotBlank, Assert\Length(max:255)]
    public ?string $nom = null;

    #[Assert\NotBlank, Assert\Length(max:500)]
    public ?string $adresse = null;

    #[Assert\Length(max:2000)]
    public ?string $description = null;

    #[Assert\Url]
    public ?string $reseauSociaux = null;

    #[Assert\NotNull, Assert\Positive]
    public ?int $villeId = null;

    #[Assert\NotNull, Assert\PositiveOrZero]
    public ?float $prix = null;

    #[Assert\Length(max:20), Assert\Regex("/^[0-9]+$/")]
    public ?string $telephone = null;

    #[Assert\Choice(callback:[CategorieHebergement::class,'values'])]
    public ?string $categories = null;

    /** @var UploadedFile[]|null */
    #[Assert\All([new Assert\File(maxSize:"5M", mimeTypes:["image/jpeg","image/png","image/webp"])])]
    public ?array $images = null;
}