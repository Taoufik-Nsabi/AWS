<?php

namespace App\DTO\Lieu;

class LieuDetailResponse
{
    public ?int $id = null;
    public ?int $userId = null;

    public ?string $nom = null;
    public ?string $adresse = null;
    public ?string $description = null;
    public ?string $reseauSociaux = null;

    public ?string $status = null;
    public ?string $type = null;

    public ?int $villeId = null;
    public ?string $villeNom = null;

    /** @var string[] */
    public array $images = [];

    /** @var array */
    public array $avis = [];

    public ?float $prix = null;
    public ?string $telephone = null;
    public ?string $categorie = null;
    public ?int $duree = null;
}