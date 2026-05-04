<?php
namespace App\Mapper;

use App\DTO\Hebergement\CreateHebergementRequest;
use App\DTO\Hebergement\HebergementResponse;
use App\DTO\Hebergement\UpdateHebergementRequest;
use App\Entity\Hebergement;
use App\Enum\CategorieHebergement;

class HebergementMapper
{
    public function toEntity(CreateHebergementRequest $dto): Hebergement
    {
        $hebergement = new Hebergement();
        $hebergement->setNom($dto->nom)
            ->setAdresse($dto->adresse)
            ->setDescription($dto->description)
            ->setReseauSociaux($dto->reseauSociaux)
            ->setPrix($dto->prix)
            ->setTelephone($dto->telephone)
            ->setCategories(CategorieHebergement::from($dto->categories));

        return $hebergement;
    }

    public function updateEntity(Hebergement $hebergement, UpdateHebergementRequest $dto): Hebergement
    {
        if ($dto->nom !== null) {
            $hebergement->setNom($dto->nom);
        }
        if ($dto->adresse !== null) {
            $hebergement->setAdresse($dto->adresse);
        }
        if ($dto->description !== null) {
            $hebergement->setDescription($dto->description);
        }
        if ($dto->prix !== null) {
            $hebergement->setPrix($dto->prix);
        }
        if ($dto->telephone !== null) {
            $hebergement->setTelephone($dto->telephone);
        }
        if ($dto->categories !== null) {
            $hebergement->setCategories(CategorieHebergement::from($dto->categories));
        }

        return $hebergement;
    }

    public function toResponse(Hebergement $hebergement): HebergementResponse
    {
        $response = new HebergementResponse();
        $response->id = $hebergement->getId();
        $response->userId = $hebergement->getUserId();
        $response->nom = $hebergement->getNom();
        $response->adresse = $hebergement->getAdresse();
        $response->description = $hebergement->getDescription();
        $response->reseauSociaux = $hebergement->getReseauSociaux();
        $response->villeId = $hebergement->getVille()?->getId();
        $response->prix = $hebergement->getPrix();
        $response->telephone = $hebergement->getTelephone();
        $response->categories = $hebergement->getCategories()?->value ?? null;
        $response->status = $hebergement->getStatus()->value;
        $response->images = $hebergement->getImages()->map(function ($image) {
            return 'uploads/hebergements/' . $image->getNomFichier();
        })->toArray();

        return $response;
    }
}
