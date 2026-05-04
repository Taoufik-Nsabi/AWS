<?php
// src/Entity/Hebergement.php
namespace App\Entity;

use App\Enum\CategorieHebergement;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: 'hebergement')]
class Hebergement extends Lieu
{
    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $prix = null;

    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $telephone = null;

    #[ORM\Column(enumType: CategorieHebergement::class, nullable: true)]
    #[Assert\Choice(
        callback: [CategorieHebergement::class, 'values'],
        message: "La catégorie n'est pas valide."
    )]
    private ?CategorieHebergement $categories = null;

    public function getPrix(): ?float
    {
        return $this->prix;
    }

    public function setPrix(?float $prix): static
    {
        $this->prix = $prix;
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

    public function getCategories(): ?CategorieHebergement
    {
        return $this->categories;
    }

    public function setCategories(?CategorieHebergement $categories): static
    {
        $this->categories = $categories;
        return $this;
    }
}