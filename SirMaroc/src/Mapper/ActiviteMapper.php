<?php
namespace App\Mapper;

use App\Entity\Activite;
use App\DTO\Activite\CreateActiviteRequest;
use App\DTO\Activite\UpdateActiviteRequest;
use App\DTO\Activite\ActiviteResponse;
use App\Enum\CategorieActivite;

class ActiviteMapper
{
    public function toEntity(CreateActiviteRequest $dto): Activite
    {
        $activite = new Activite();
        $activite->setNom($dto->nom)
                 ->setAdresse($dto->adresse)
                 ->setDescription($dto->description)
                 ->setReseauSociaux($dto->reseauSociaux)
                 ->setTarif($dto->tarif)
                 ->setDuree($dto->duree)
                 ->setCategorie(CategorieActivite::from($dto->categorie));
        return $activite;
    }

    public function updateEntity(Activite $activite, UpdateActiviteRequest $dto): Activite
    {
        if($dto->nom !== null) $activite->setNom($dto->nom);
        if($dto->adresse !== null) $activite->setAdresse($dto->adresse);
        if($dto->description !== null) $activite->setDescription($dto->description);
        if($dto->tarif !== null) $activite->setTarif($dto->tarif);
        if($dto->duree !== null) $activite->setDuree($dto->duree);
        if($dto->categorie !== null) $activite->setCategorie(CategorieActivite::from($dto->categorie));
        return $activite;
    }

    public function toResponse(Activite $activite): ActiviteResponse
    {
        $response = new ActiviteResponse();
        $response->id = $activite->getId();
        $response->userId = $activite->getUserId();
        $response->nom = $activite->getNom();
        $response->adresse = $activite->getAdresse();
        $response->description = $activite->getDescription();
        $response->reseauSociaux = $activite->getReseauSociaux();
        $response->tarif = $activite->getTarif();
        $response->duree = $activite->getDuree();
        $response->categorie = $activite->getCategorie()?->value ?? null;
        $response->villeId = $activite->getVille()?->getId();
        $response->status = $activite->getStatus()->value;

        // ← NOUVEAU : récupérer les URLs des images
        $response->images = $activite->getImages()->map(function($img) {
            return '/uploads/activites/' . $img->getNomFichier();
        })->toArray();

        return $response;
    }
}