<?php
namespace App\DTO\Restaurant;

namespace App\DTO\Restaurant;

class RestaurantResponse
{
    public ?int $id = null;
    public ?int $userId = null;
    public ?string $nom = null;
    public ?string $adresse = null;
    public ?string $description = null;
    public ?string $reseauSociaux = null;

    /**
     * @var string[]
     */
    public array $images = [];

    public ?int $villeId = null;
    public ?float $prixMoyen = null;
    public ?string $telephone = null;
    public ?string $categorie = null;
    public ?string $status = null;

}