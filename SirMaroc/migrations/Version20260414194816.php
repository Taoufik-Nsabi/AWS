<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260414194816 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Align current SQL Server schema with updated Symfony entities.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("IF COL_LENGTH('activite', 'tarif') IS NULL ALTER TABLE activite ADD tarif FLOAT NULL");
        $this->addSql("IF COL_LENGTH('activite', 'duree') IS NULL ALTER TABLE activite ADD duree INT NULL");
        $this->addSql("IF COL_LENGTH('activite', 'categorie') IS NULL ALTER TABLE activite ADD categorie NVARCHAR(255) NULL");

        $this->addSql("IF COL_LENGTH('restaurant', 'prix_moyen') IS NULL ALTER TABLE restaurant ADD prix_moyen FLOAT NULL");
        $this->addSql("IF COL_LENGTH('restaurant', 'categorie') IS NOT NULL ALTER TABLE restaurant ALTER COLUMN categorie NVARCHAR(255) NULL");

        $this->addSql("IF COL_LENGTH('lieu', 'image') IS NOT NULL ALTER TABLE lieu DROP COLUMN image");
        $this->addSql("IF COL_LENGTH('lieu', 'user_id') IS NOT NULL ALTER TABLE lieu ALTER COLUMN user_id INT NULL");

        $this->addSql(<<<'SQL'
IF OBJECT_ID(N'image', N'U') IS NULL
BEGIN
    CREATE TABLE image (
        id INT IDENTITY NOT NULL,
        nom_fichier NVARCHAR(255) NOT NULL,
        updated_at DATETIME2(6) NULL,
        lieu_id INT NOT NULL,
        PRIMARY KEY (id)
    )
END
SQL);

        $this->addSql(<<<'SQL'
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IDX_C53D045F6AB213CC'
      AND object_id = OBJECT_ID(N'image')
)
BEGIN
    CREATE INDEX IDX_C53D045F6AB213CC ON image (lieu_id)
END
SQL);

        $this->addSql(<<<'SQL'
IF OBJECT_ID(N'image', N'U') IS NOT NULL
AND NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_C53D045F6AB213CC'
)
BEGIN
    ALTER TABLE image
    ADD CONSTRAINT FK_C53D045F6AB213CC FOREIGN KEY (lieu_id) REFERENCES lieu (id)
END
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_C53D045F6AB213CC'
)
BEGIN
    ALTER TABLE image DROP CONSTRAINT FK_C53D045F6AB213CC
END
SQL);

        $this->addSql(<<<'SQL'
IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IDX_C53D045F6AB213CC'
      AND object_id = OBJECT_ID(N'image')
)
BEGIN
    DROP INDEX IDX_C53D045F6AB213CC ON image
END
SQL);

        $this->addSql("IF OBJECT_ID(N'image', N'U') IS NOT NULL DROP TABLE image");

        $this->addSql("IF COL_LENGTH('lieu', 'image') IS NULL ALTER TABLE lieu ADD image NVARCHAR(500) NULL");
        $this->addSql("IF COL_LENGTH('lieu', 'user_id') IS NOT NULL ALTER TABLE lieu ALTER COLUMN user_id INT NOT NULL");

        $this->addSql("IF COL_LENGTH('restaurant', 'prix_moyen') IS NOT NULL ALTER TABLE restaurant DROP COLUMN prix_moyen");
        $this->addSql("IF COL_LENGTH('restaurant', 'categorie') IS NOT NULL ALTER TABLE restaurant ALTER COLUMN categorie NVARCHAR(100) NULL");

        $this->addSql("IF COL_LENGTH('activite', 'categorie') IS NOT NULL ALTER TABLE activite DROP COLUMN categorie");
        $this->addSql("IF COL_LENGTH('activite', 'duree') IS NOT NULL ALTER TABLE activite DROP COLUMN duree");
        $this->addSql("IF COL_LENGTH('activite', 'tarif') IS NOT NULL ALTER TABLE activite DROP COLUMN tarif");
    }
}
