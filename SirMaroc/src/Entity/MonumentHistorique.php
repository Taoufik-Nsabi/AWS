<?php

namespace App\Entity;

use App\Repository\MonumentHistoriqueRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Entité représentant un monument historique.
 * Hérite de Lieu pour les champs communs :
 * nom, adresse, description, réseaux sociaux, statut, ville, etc.
 */
#[ORM\Entity(repositoryClass: MonumentHistoriqueRepository::class)]
#[ORM\Table(name: 'monument_historique')]
class MonumentHistorique extends Lieu
{
    #[ORM\Column(type: 'float')]
    #[Assert\NotNull(message: 'Le prix est obligatoire.')]
    #[Assert\PositiveOrZero(message: 'Le prix doit être positif ou zéro.')]
    private ?float $prix = null;

    public function getPrix(): ?float
    {
        return $this->prix;
    }

    public function setPrix(float $prix): static
    {
        $this->prix = $prix;
        return $this;
    }
}