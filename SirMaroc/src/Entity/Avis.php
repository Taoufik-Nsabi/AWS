<?php

namespace App\Entity;

use App\Repository\AvisRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: AvisRepository::class)]
#[ORM\Table(name: 'avis')]
class Avis
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank(message: 'Le commentaire est obligatoire.')]
    #[Assert\Length(
        min: 2,
        max: 2000,
        minMessage: 'Le commentaire doit contenir au moins {{ limit }} caractères.',
        maxMessage: 'Le commentaire ne doit pas dépasser {{ limit }} caractères.'
    )]
    private ?string $commentaire = null;

    #[ORM\Column(type: 'integer')]
    #[Assert\NotNull(message: 'La note est obligatoire.')]
    #[Assert\Range(
        min: 1,
        max: 5,
        notInRangeMessage: 'La note doit être entre {{ min }} et {{ max }}.'
    )]
    private ?int $etoiles = null;

    #[ORM\Column(name: 'user_id', type: 'integer')]
    #[Assert\NotNull(message: 'L\'identifiant utilisateur est obligatoire.')]
    #[Assert\Positive(message: 'L\'identifiant utilisateur doit être positif.')]
    private ?int $userId = null;

    #[ORM\ManyToOne(targetEntity: Lieu::class, inversedBy: 'avis')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Assert\NotNull(message: 'Le lieu est obligatoire.')]
    private ?Lieu $lieu = null;
   

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(string $commentaire): self
    {
        $this->commentaire = $commentaire;
        return $this;
    }

    public function getEtoiles(): ?int
    {
        return $this->etoiles;
    }

    public function setEtoiles(int $etoiles): self
    {
        $this->etoiles = $etoiles;
        return $this;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): self
    {
        $this->userId = $userId;
        return $this;
    }

    public function getLieu(): ?Lieu
    {
        return $this->lieu;
    }

    public function setLieu(?Lieu $lieu): self
    {
        $this->lieu = $lieu;
        return $this;
    }
}