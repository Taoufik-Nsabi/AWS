<?php

namespace App\Mapper;

use App\Entity\Lieu;
use App\Entity\Hebergement;
use App\Entity\Restaurant;
use App\Entity\Activite;
use App\DTO\Lieu\LieuResponse;
use App\DTO\Lieu\LieuDetailResponse;
class LieuMapper
{

    private function getFolder(Lieu $lieu): string
{
    return match (true) {
        $lieu instanceof \App\Entity\Restaurant => 'restaurants',
        $lieu instanceof \App\Entity\Hebergement => 'hebergements',
        $lieu instanceof \App\Entity\Activite => 'activites',
        default => 'lieux'
    };
}
    public function toResponse(Lieu $lieu): LieuResponse
    {
        $response = new LieuResponse();
        $response->id = $lieu->getId();
        $response->userId = $lieu->getUserId();
        $response->nom = $lieu->getNom();
        $response->adresse = $lieu->getAdresse();
        $response->description = $lieu->getDescription();
        $response->reseauSociaux = $lieu->getReseauSociaux();
        $response->villeId = $lieu->getVille()?->getId();
        $response->villeNom = $lieu->getVille()?->getNom();
        $response->status = $lieu->getStatus()->value;

        $response->images = $lieu->getImages()
        ->map(function($img) use ($lieu) {
            return 'uploads/' . $this->getFolder($lieu) . '/' . $img->getNomFichier();
        })
        ->toArray();

        
        if ($lieu instanceof Hebergement) {
            $response->prix = $lieu->getPrix();
            $response->telephone = $lieu->getTelephone();
            $response->categories = $lieu->getCategories()?->value; 
            $response->type = "Hébergement";
        } 
        elseif ($lieu instanceof Restaurant) {
            $response->prix = $lieu->getPrixMoyen(); 
            $response->telephone = $lieu->getTelephone();
            $response->categories = $lieu->getCategorie()?->value;
            $response->type = "Restaurant";
        } 
        elseif ($lieu instanceof Activite) {
            $response->prix = $lieu->getTarif(); 
            $response->type = "Activité";
        }

        return $response;
    }



  public function toDetailResponse(Lieu $lieu): LieuDetailResponse
    {
        $dto = new LieuDetailResponse();

        $dto->id = $lieu->getId();
        $dto->userId = $lieu->getUserId();

        $dto->nom = $lieu->getNom();
        $dto->adresse = $lieu->getAdresse();
        $dto->description = $lieu->getDescription();
        $dto->reseauSociaux = $lieu->getReseauSociaux();

        $dto->status = $lieu->getStatus()->value;

        $dto->villeId = $lieu->getVille()?->getId();
        $dto->villeNom = $lieu->getVille()?->getNom();

       $dto->images = $lieu->getImages()
        ->map(fn($img) =>
            'uploads/' . $this->getFolder($lieu) . '/' . $img->getNomFichier()
        )
        ->toArray();

        $dto->avis = $lieu->getAvis()
            ->map(fn($a) => [
                'id' => $a->getId(),
                'commentaire' => $a->getCommentaire(),
                'note' => $a->getNote()
            ])
            ->toArray();

        if ($lieu instanceof \App\Entity\Hebergement) {
            $dto->type = "Hébergement";
            $dto->prix = $lieu->getPrix();
            $dto->telephone = $lieu->getTelephone();
            $dto->categorie = $lieu->getCategories()?->value;
        }

        elseif ($lieu instanceof \App\Entity\Restaurant) {
            $dto->type = "Restaurant";
            $dto->prix = $lieu->getPrixMoyen();
            $dto->telephone = $lieu->getTelephone();
            $dto->categorie = $lieu->getCategorie()?->value;
        }

        elseif ($lieu instanceof \App\Entity\Activite) {
            $dto->type = "Activité";
            $dto->prix = $lieu->getTarif();
            $dto->duree = $lieu->getDuree();
        }

        return $dto;
    }
}
