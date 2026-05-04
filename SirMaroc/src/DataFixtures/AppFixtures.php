<?php

namespace App\DataFixtures;

use App\Entity\Activite;
use App\Entity\Hebergement;
use App\Entity\MonumentHistorique;
use App\Entity\Restaurant;
use App\Entity\Ville;
use App\Enum\CategorieRestaurant;
use App\Enum\LieuStatus;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // ─── Villes ───────────────────────────────────────────
        $villes = [];
        foreach ([
            'Marrakech', 'Fès', 'Casablanca', 'Agadir', 'Chefchaouen',
            'Rabat', 'Tanger', 'Oujda', 'Meknès', 'Tétouan',
            'Essaouira', 'Ouarzazate', 'Ifrane', 'Dakhla', 'Nador',
            'Al Hoceima', 'Béni Mellal', 'Khouribga', 'Safi', 'El Jadida'
        ] as $nom) {
            $ville = new Ville();
            $ville->setNom($nom);
            $manager->persist($ville);
            $villes[$nom] = $ville;
        }

        // ─── Fonction utilitaire pour userId, ville et status ───
        $setCommonFields = function($entity, Ville $ville, $status = LieuStatus::APPROVED) {
            $entity->setVille($ville)
                   ->setStatus($status)
                   ->setUserId(1);
            return $entity;
        };

        // ─── Hébergements ─────────────────────────────────────
        foreach ([
            ['La Mamounia', 'Avenue Bab Jdid', 'Hôtel de luxe légendaire.', 2500.0, '+212524388600', 'Marrakech'],
            ['Riad Fès', 'Derb Ben Slimane', 'Riad authentique dans la médina.', 800.0, '+212535741206', 'Fès'],
            ['Four Seasons Casablanca', 'Bd de la Corniche', 'Hôtel 5 étoiles face à l\'Atlantique.', 3200.0, '+212522029000', 'Casablanca'],
            ['Sofitel Agadir', 'Baie des Palmiers', 'Resort de luxe sur la plage.', 1500.0, '+212528820088', 'Agadir'],
            ['Casa Perleta', 'Rue Sidi M\'hamed', 'Maison d\'hôtes dans la ville bleue.', 450.0, '+212539988879', 'Chefchaouen'],
            ['Hôtel Rabat Terminus', 'Ave Mohammed V', 'Hôtel central près de la gare.', 600.0, '+212537200000', 'Rabat'],
            ['Rembrandt Hotel Tanger', 'Rue Ibn Khaldoun', 'Hôtel historique avec vue sur la mer.', 900.0, '+212539370870', 'Tanger'],
            ['Hôtel Oujda', 'Bd Mohammed V', 'Hôtel moderne au centre-ville.', 350.0, '+212536680000', 'Oujda'],
            ['Riad Meknès', 'Derb Riad Zitoun', 'Riad traditionnel dans la médina.', 700.0, '+212535550000', 'Meknès'],
            ['Hôtel Essaouira', 'Rue de la Skala', 'Charme et authenticité face à l\'océan.', 550.0, '+212524472000', 'Essaouira'],
        ] as [$nom, $adresse, $desc, $prix, $tel, $villeNom]) {
            $h = $setCommonFields(new Hebergement(), $villes[$villeNom])
                ->setNom($nom)
                ->setAdresse($adresse)
                ->setDescription($desc)
                ->setPrix($prix)
                ->setTelephone($tel);
            $manager->persist($h);
        }

        // ─── Restaurants ──────────────────────────────────────
        foreach ([
            ['Le Jardin', 'Rue Mouassine', 'Restaurant gastronomique dans un riad.', CategorieRestaurant::MAROCAINE, 'Marrakech'],
            ['Dar Roumana', 'Derb el Amer', 'Cuisine marocaine raffinée.', CategorieRestaurant::MAROCAINE, 'Fès'],
            ['La Sqala', 'Bd des Almohades', 'Restaurant dans un bastion portugais.', CategorieRestaurant::MAROCAINE, 'Casablanca'],
            ['Pure Passion', 'Rue de la Foire', 'Restaurant moderne avec vue sur la baie.', CategorieRestaurant::ASIATIQUE, 'Agadir'],
            ['Bab Ssour', 'Plaza Uta el-Hammam', 'Terrasse panoramique sur la place.', CategorieRestaurant::CAFE, 'Chefchaouen'],
            ['Le Dhow', 'Port de Rabat', 'Restaurant flottant sur le Bouregreg.', CategorieRestaurant::ITALIENNE, 'Rabat'],
            ['El Korsan', 'Rue El Jorf', 'Cuisine andalouse dans un cadre raffiné.', CategorieRestaurant::MAROCAINE, 'Tanger'],
            ['Restaurant Terminus', 'Ave de la Gare', 'Cuisine marocaine authentique.', CategorieRestaurant::MAROCAINE, 'Oujda'],
            ['Riad Restaurant', 'Rue Dar Smen', 'Gastronomie marocaine dans un riad.', CategorieRestaurant::MAROCAINE, 'Meknès'],
            ['Chez Sam', 'Port d\'Essaouira', 'Fruits de mer frais au bord de l\'eau.', CategorieRestaurant::ASIATIQUE, 'Essaouira'],
        ] as [$nom, $adresse, $desc, $categorie, $villeNom]) {
            $r = $setCommonFields(new Restaurant(), $villes[$villeNom])
                ->setNom($nom)
                ->setAdresse($adresse)
                ->setDescription($desc)
                ->setCategorie($categorie);
            $manager->persist($r);
        }

        // ─── Activités ────────────────────────────────────────
        foreach ([
            ['Excursion désert Sahara', 'Route de Ouarzazate', 'Randonnée en dromadaire.', 350.0, 3, 'Marrakech'],
            ['Visite tanneries Chouara', 'Quartier des Tanneurs', 'Découverte des tanneries.', 50.0, 2, 'Fès'],
            ['Surf à Taghazout', 'Plage Taghazout', 'Cours de surf pour tous niveaux.', 200.0, 4, 'Agadir'],
            ['Randonnée dans le Rif', 'Parc National Talassemtane', 'Trek dans les montagnes.', 150.0, 6, 'Chefchaouen'],
            ['Hammam traditionnel', 'Rue de Bab Doukkala', 'Expérience hammam authentique.', 80.0, 1, 'Marrakech'],
            ['Visite Chellah', 'Avenue Yacoub El Mansour', 'Découverte des ruines romaines.', 30.0, 2, 'Rabat'],
            ['Balade en médina', 'Rue de la Kasbah', 'Visite guidée de la vieille ville.', 100.0, 3, 'Tanger'],
            ['Observation étoiles', 'Désert de l\'Oriental', 'Nuit sous les étoiles dans le désert.', 250.0, 8, 'Oujda'],
            ['Visite Volubilis', 'Route de Volubilis', 'Exploration du site romain classé UNESCO.', 70.0, 4, 'Meknès'],
            ['Sortie en mer', 'Port d\'Essaouira', 'Pêche traditionnelle avec les pêcheurs.', 180.0, 5, 'Essaouira'],
        ] as [$nom, $adresse, $desc, $tarif, $duree, $villeNom]) {
            $a = $setCommonFields(new Activite(), $villes[$villeNom])
                ->setNom($nom)
                ->setAdresse($adresse)
                ->setDescription($desc)
                ->setTarif($tarif)
                ->setDuree($duree);
            $manager->persist($a);
        }

        // ─── Monuments Historiques ────────────────────────────
        foreach ([
            ['Koutoubia', 'Avenue Mohammed V', 'Mosquée emblématique de Marrakech.', 0.0, 'Marrakech'],
            ['Médersa Bou Inania', 'Rue Talaa Kebira', 'Chef-d\'œuvre de l\'architecture mérinide.', 20.0, 'Fès'],
            ['Mosquée Hassan II', 'Bd Sidi Mohammed Ben Abdallah', 'L\'une des plus grandes mosquées du monde.', 130.0, 'Casablanca'],
            ['Kasbah d\'Agadir Oufella', 'Colline d\'Agadir', 'Ruines avec vue panoramique.', 0.0, 'Agadir'],
            ['Mosquée Al-Akhdar', 'Plaza Uta el-Hammam', 'Ancienne mosquée dans la médina bleue.', 0.0, 'Chefchaouen'],
            ['Tour Hassan', 'Avenue Mohammed V', 'Minaret inachevé du XIIe siècle.', 0.0, 'Rabat'],
            ['Grottes d\'Hercule', 'Route des Grottes', 'Grottes naturelles légendaires.', 15.0, 'Tanger'],
            ['Mosquée Sidi Wahab', 'Centre-ville', 'Mosquée historique du XIe siècle.', 0.0, 'Oujda'],
            ['Bab Mansour', 'Place El Hedim', 'La plus belle porte du Maroc.', 0.0, 'Meknès'],
            ['Skala de la Ville', 'Rue de la Skala', 'Remparts portugais du XVIIIe siècle.', 10.0, 'Essaouira'],
        ] as [$nom, $adresse, $desc, $prix, $villeNom]) {
            $m = $setCommonFields(new MonumentHistorique(), $villes[$villeNom])
                ->setNom($nom)
                ->setAdresse($adresse)
                ->setDescription($desc)
                ->setPrix($prix);
            $manager->persist($m);
        }

        $manager->flush();
    }
}