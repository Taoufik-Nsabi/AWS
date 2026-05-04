<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260315225528 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE activite (prix DOUBLE PRECISION, telephone NVARCHAR(20), id INT NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE avis (id INT IDENTITY NOT NULL, commentaire VARCHAR(MAX) NOT NULL, etoiles INT NOT NULL, user_id INT NOT NULL, lieu_id INT NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE INDEX IDX_8F91ABF06AB213CC ON avis (lieu_id)');
        $this->addSql('CREATE TABLE hebergement (prix DOUBLE PRECISION, telephone NVARCHAR(20), categories NVARCHAR(255), id INT NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE lieu (id INT IDENTITY NOT NULL, user_id INT NOT NULL, nom NVARCHAR(255) NOT NULL, adresse NVARCHAR(500) NOT NULL, description VARCHAR(MAX), reseau_sociaux NVARCHAR(500), image NVARCHAR(500), status NVARCHAR(255) NOT NULL, ville_id INT, type_lieu NVARCHAR(255) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE INDEX IDX_2F577D59A73F0036 ON lieu (ville_id)');
        $this->addSql('CREATE TABLE monument_historique (prix DOUBLE PRECISION, id INT NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE restaurant (categorie NVARCHAR(100), telephone NVARCHAR(20), id INT NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE ville (id INT IDENTITY NOT NULL, nom NVARCHAR(255) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('ALTER TABLE activite ADD CONSTRAINT FK_B8755515BF396750 FOREIGN KEY (id) REFERENCES lieu (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE avis ADD CONSTRAINT FK_8F91ABF06AB213CC FOREIGN KEY (lieu_id) REFERENCES lieu (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE hebergement ADD CONSTRAINT FK_4852DD9CBF396750 FOREIGN KEY (id) REFERENCES lieu (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE lieu ADD CONSTRAINT FK_2F577D59A73F0036 FOREIGN KEY (ville_id) REFERENCES ville (id)');
        $this->addSql('ALTER TABLE monument_historique ADD CONSTRAINT FK_80814075BF396750 FOREIGN KEY (id) REFERENCES lieu (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE restaurant ADD CONSTRAINT FK_EB95123FBF396750 FOREIGN KEY (id) REFERENCES lieu (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA db_accessadmin');
        $this->addSql('CREATE SCHEMA db_backupoperator');
        $this->addSql('CREATE SCHEMA db_datareader');
        $this->addSql('CREATE SCHEMA db_datawriter');
        $this->addSql('CREATE SCHEMA db_ddladmin');
        $this->addSql('CREATE SCHEMA db_denydatareader');
        $this->addSql('CREATE SCHEMA db_denydatawriter');
        $this->addSql('CREATE SCHEMA db_owner');
        $this->addSql('CREATE SCHEMA db_securityadmin');
        $this->addSql('ALTER TABLE activite DROP CONSTRAINT FK_B8755515BF396750');
        $this->addSql('ALTER TABLE avis DROP CONSTRAINT FK_8F91ABF06AB213CC');
        $this->addSql('ALTER TABLE hebergement DROP CONSTRAINT FK_4852DD9CBF396750');
        $this->addSql('ALTER TABLE lieu DROP CONSTRAINT FK_2F577D59A73F0036');
        $this->addSql('ALTER TABLE monument_historique DROP CONSTRAINT FK_80814075BF396750');
        $this->addSql('ALTER TABLE restaurant DROP CONSTRAINT FK_EB95123FBF396750');
        $this->addSql('DROP TABLE activite');
        $this->addSql('DROP TABLE avis');
        $this->addSql('DROP TABLE hebergement');
        $this->addSql('DROP TABLE lieu');
        $this->addSql('DROP TABLE monument_historique');
        $this->addSql('DROP TABLE restaurant');
        $this->addSql('DROP TABLE ville');
    }
}
