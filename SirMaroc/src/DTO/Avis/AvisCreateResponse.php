<?php

namespace App\DTO\Avis;


class AvisCreateResponse
{
    public ?int $id = null;
    public ?string $commentaire = null;
    public ?int $etoiles = null;
    public ?int $userId = null;
    public ?string $email = null;
    public ?int $lieuId = null;
    public ?string $message = null;

}