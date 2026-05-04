<?php
namespace App\DTO\Activite;

use App\Enum\CategorieActivite;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class CreateActiviteRequest
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
    public ?float $tarif = null;

    #[Assert\NotNull, Assert\Positive]
    public ?int $duree = null;

    #[Assert\Choice(callback:[CategorieActivite::class,'values'])]
    public ?string $categorie = null;

    /** @var UploadedFile[]|null */
    #[Assert\All([new Assert\File(maxSize:"5M", mimeTypes:["image/jpeg","image/png","image/webp"])])]
    public ?array $images = null;
}