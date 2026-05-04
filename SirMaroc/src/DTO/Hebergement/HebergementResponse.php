<?php

namespace App\DTO\Hebergement;

class HebergementResponse
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
    public ?float $prix = null;
    public ?string $telephone = null;
    public ?string $categories = null;
    public ?string $status = null;
}