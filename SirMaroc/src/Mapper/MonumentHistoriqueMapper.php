<?php

namespace App\Mapper;

use App\DTO\MonumentHistorique\MonumentHistoriqueRequest;
use App\DTO\MonumentHistorique\MonumentHistoriqueResponse;
use App\DTO\MonumentHistorique\MonumentHistoriqueUpdate;
use App\Entity\MonumentHistorique;
use App\Entity\Ville;

class MonumentHistoriqueMapper
{
    public function fromRequestToEntity(MonumentHistoriqueRequest $request, Ville $ville): MonumentHistorique
    {
        $monument = new MonumentHistorique();
        $monument->setNom($request->nom);
        $monument->setAdresse($request->adresse);
        $monument->setDescription($request->description);
        $monument->setReseauSociaux($request->reseauxSociaux);
        $monument->setPrix($request->prix);
        $monument->setVille($ville);

        return $monument;
    }

    public function applyUpdateToEntity(
        MonumentHistoriqueUpdate $update,
        MonumentHistorique $monument,
        ?Ville $ville = null
    ): MonumentHistorique {
        if ($update->nom !== null) {
            $monument->setNom($update->nom);
        }

        if ($update->adresse !== null) {
            $monument->setAdresse($update->adresse);
        }

        if ($update->description !== null) {
            $monument->setDescription($update->description);
        }

        if ($update->reseauxSociaux !== null) {
            $monument->setReseauSociaux($update->reseauxSociaux);
        }

        if ($update->prix !== null) {
            $monument->setPrix($update->prix);
        }

        if ($ville !== null) {
            $monument->setVille($ville);
        }

        return $monument;
    }

    public function toResponse(MonumentHistorique $monument): MonumentHistoriqueResponse
    {
        $response = new MonumentHistoriqueResponse();
        $response->id = $monument->getId();
        $response->nom = $monument->getNom();
        $response->adresse = $monument->getAdresse();
        $response->description = $monument->getDescription();
        $response->reseauxSociaux = $monument->getReseauSociaux();
        $response->prix = $monument->getPrix();
        $response->villeNom = $monument->getVille()?->getNom();
        $response->villeId = $monument->getVille()?->getId();

        return $response;
    }

    public function toResponseList(array $monuments): array
    {
        return array_map(
            fn(MonumentHistorique $m) => $this->toResponse($m),
            $monuments
        );
    }
}