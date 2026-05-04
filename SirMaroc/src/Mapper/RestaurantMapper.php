<?php
namespace App\Mapper;

use App\Entity\Restaurant;
use App\DTO\Restaurant\CreateRestaurantRequest;
use App\DTO\Restaurant\UpdateRestaurantRequest;
use App\DTO\Restaurant\RestaurantResponse;
use App\Enum\CategorieRestaurant;

class RestaurantMapper
{
    public function toEntity(CreateRestaurantRequest $dto): Restaurant
    {
        $r = new Restaurant();

        $r->setNom($dto->nom)
          ->setAdresse($dto->adresse)
          ->setDescription($dto->description)
          ->setReseauSociaux($dto->reseauSociaux)
          ->setPrixMoyen($dto->prixMoyen)
          ->setTelephone($dto->telephone)
          ->setCategorie(CategorieRestaurant::from($dto->categorie));

        return $r;
    }

    public function updateEntity(Restaurant $restaurant, UpdateRestaurantRequest $dto): Restaurant
    {
        if ($dto->nom !== null) $restaurant->setNom($dto->nom);
        if ($dto->adresse !== null) $restaurant->setAdresse($dto->adresse);
        if ($dto->description !== null) $restaurant->setDescription($dto->description);
        if ($dto->reseauSociaux !== null) $restaurant->setReseauSociaux($dto->reseauSociaux);
        if ($dto->prixMoyen !== null) $restaurant->setPrixMoyen($dto->prixMoyen);
        if ($dto->telephone !== null) $restaurant->setTelephone($dto->telephone);
        if ($dto->categorie !== null) {
            $restaurant->setCategorie(CategorieRestaurant::from($dto->categorie));
        }

        return $restaurant;
    }

    public function toResponse(Restaurant $restaurant): RestaurantResponse
    {
        $response = new RestaurantResponse();

        $response->id = $restaurant->getId();
        $response->userId = $restaurant->getUserId();
        $response->nom = $restaurant->getNom();
        $response->adresse = $restaurant->getAdresse();
        $response->description = $restaurant->getDescription();
        $response->reseauSociaux = $restaurant->getReseauSociaux();
        $response->villeId = $restaurant->getVille()?->getId();
        $response->prixMoyen = $restaurant->getPrixMoyen();
        $response->telephone = $restaurant->getTelephone();
        $response->categorie = $restaurant->getCategorie()?->value ?? null;
        $response->status = $restaurant->getStatus()->value;

        
        $response->images = $restaurant->getImages()?->map(function($img) {
            return '/uploads/restaurants/' . $img->getNomFichier();
        })->toArray() ?? [];

        return $response;
    }

}