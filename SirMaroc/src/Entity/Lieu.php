<?php
// src/Entity/Lieu.php
namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\LieuStatus;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: 'lieu')]
#[ORM\InheritanceType('JOINED')]
#[ORM\DiscriminatorColumn(name: 'type_lieu', type: 'string')]
#[ORM\DiscriminatorMap([
    'hebergement' => Hebergement::class,
    'restaurant' => Restaurant::class,
    'activite' => Activite::class,
    'monument_historique' => MonumentHistorique::class,
])]
abstract class Lieu
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: "user_id", type: "integer")]
    private ?int $userId = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank(message: 'Le nom du lieu est obligatoire.')]
    #[Assert\Length(max: 255)]
    private ?string $nom = null;

    #[ORM\Column(type: 'string', length: 500)]
    #[Assert\NotBlank(message: "L'adresse est obligatoire.")]
    #[Assert\Length(max: 500)]
    private ?string $adresse = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $reseauSociaux = null;

    #[ORM\Column(enumType: LieuStatus::class)]
    private LieuStatus $status;

    #[ORM\ManyToOne(targetEntity: Ville::class, inversedBy: 'lieux')]
    #[ORM\JoinColumn(name: 'ville_id', referencedColumnName: 'id', nullable: true)]
    private ?Ville $ville = null;

    #[ORM\OneToMany(mappedBy: 'lieu', targetEntity: Avis::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $avis;

    #[ORM\OneToMany(mappedBy: 'lieu', targetEntity: Image::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $images;

    public function __construct()
    {
        $this->avis = new ArrayCollection();
        $this->images = new ArrayCollection();
        $this->status = LieuStatus::PENDING;
    }


    public function getId(): ?int
    {
        return $this->id;
    }


    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): static
    {
        $this->userId = $userId;
        return $this;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }


    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(string $adresse): static
    {
        $this->adresse = $adresse;
        return $this;
    }


    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }


    public function getReseauSociaux(): ?string
    {
        return $this->reseauSociaux;
    }

    public function setReseauSociaux(?string $reseauSociaux): static
    {
        $this->reseauSociaux = $reseauSociaux;
        return $this;
    }


    public function getStatus(): LieuStatus
    {
        return $this->status;
    }

    public function setStatus(LieuStatus $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getVille(): ?Ville
    {
        return $this->ville;
    }

    public function setVille(?Ville $ville): static
    {
        $this->ville = $ville;
        return $this;
    }


    public function getAvis(): Collection
    {
        return $this->avis;
    }


    public function getImages(): Collection
    {
        return $this->images;
    }

}
