<?php

namespace App\Entity;

use App\Enum\CategorieActivite;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: 'activite')]
class Activite extends Lieu
{
    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $tarif = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $duree = null;

    #[ORM\Column(enumType: CategorieActivite::class, nullable: true)]
    #[Assert\Choice(
        callback: [CategorieActivite::class, 'values'],
        message: "La catégorie n'est pas valide."
    )]
    private ?CategorieActivite $categorie = null;

    public function getTarif(): ?float
    {
        return $this->tarif;
    }

    public function setTarif(?float $tarif): static
    {
        $this->tarif = $tarif;
        return $this;
    }

    public function getDuree(): ?int
    {
        return $this->duree;
    }

    public function setDuree(?int $duree): static
    {
        $this->duree = $duree;
        return $this;
    }

    public function getCategorie(): ?CategorieActivite
    {
        return $this->categorie;
    }

    public function setCategorie(?CategorieActivite $categorie): static
    {
        $this->categorie = $categorie;
        return $this;
    }
}