<?php

namespace App\DTO\Avis;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateAvisResponse{

    public ?string $commentaire = null;
    public ?int $etoiles = null;

    public ?int $userId = null;

    public ?int $lieuId = null;

}
?>
