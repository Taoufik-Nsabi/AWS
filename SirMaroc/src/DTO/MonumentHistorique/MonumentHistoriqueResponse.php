<?php

namespace App\DTO\MonumentHistorique;

/**
 * DTO de réponse renvoyé au client après lecture/création/modification.
 * Sépare la représentation API de l'entité Doctrine → respect du SRP.
 * On ne retourne jamais l'entité directement au client.
 */
class MonumentHistoriqueResponse
{
    /** Identifiant unique du monument */
    public int $id;

    /** Nom du monument */
    public string $nom;

    /** Adresse physique */
    public string $adresse;

    /** Description détaillée */
    public ?string $description;

    /** Liens réseaux sociaux */
    public ?String $reseauxSociaux;

    /** URL de l'image */
    public ?string $image;

    /** Prix d'entrée en MAD */
    public float $prix;

    /** Nom de la ville associée */
    public string $villeNom;

    /** ID de la ville associée */
    public int $villeId;
}
