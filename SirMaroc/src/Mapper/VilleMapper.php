<?php

namespace App\Mapper;

use App\Entity\Ville;
use App\DTO\Ville\VilleResponse;

class VilleMapper
{
    public function toResponse(Ville $ville): VilleResponse
    {
        $response = new VilleResponse();
        $response->id = $ville->getId();
        $response->nom = $ville->getNom();
        return $response;
    }
}
