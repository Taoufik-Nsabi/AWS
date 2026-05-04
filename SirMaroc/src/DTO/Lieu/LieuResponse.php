<?php

namespace App\DTO\Lieu;

class LieuResponse
{
    public ?int $id = null;
    public ?int $userId = null;
    public ?string $nom = null;
    public ?string $adresse = null;
    public ?string $description = null;
    public ?string $reseauSociaux = null;
    public array $images = [];
    public ?int $villeId = null;
    public ?string $villeNom = null;
    public ?float $prix = null; 
    public ?string $telephone = null;
    public ?string $categories = null;
    public ?string $status = null;
    public ?string $type = null; 
}
