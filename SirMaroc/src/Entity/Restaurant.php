<?php

namespace App\Entity;

use App\Enum\CategorieRestaurant;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: 'restaurant')]

class Restaurant extends Lieu
{
    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $prixMoyen = null;

    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $telephone = null;

    #[ORM\Column(enumType: CategorieRestaurant::class, nullable: true)]
    #[Assert\Choice(
        callback: [CategorieRestaurant::class, 'values'],
        message: "La catégorie n'est pas valide."
    )]
    private ?CategorieRestaurant $categorie = null;

    public function getPrixMoyen(): ?float
    {
        return $this->prixMoyen;
    }

    public function setPrixMoyen(?float $prixMoyen): static
    {
        $this->prixMoyen = $prixMoyen;
        return $this;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(?string $telephone): static
    {
        $this->telephone = $telephone;
        return $this;
    }

    public function getCategorie(): ?CategorieRestaurant
    {
        return $this->categorie;
    }

    public function setCategorie(?CategorieRestaurant $categorie): static
    {
        $this->categorie = $categorie;
        return $this;
    }
}