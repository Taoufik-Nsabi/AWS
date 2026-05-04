<?php
namespace App\DTO\Activite;

class ActiviteResponse
{
    public ?int $id = null;
    public ?int $userId = null;
    public ?string $nom = null;
    public ?string $adresse = null;
    public ?string $description = null;
    public ?string $reseauSociaux = null;

    /** @var string[] */
    public array $images = [];  // ← CHANGÉ : string unique → array

    public ?int $villeId = null;
    public ?float $tarif = null;
    public ?int $duree = null;
    public ?string $categorie = null;
    public ?string $status = null;
}