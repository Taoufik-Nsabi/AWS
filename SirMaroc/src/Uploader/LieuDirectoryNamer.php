<?php

namespace App\Uploader;

use App\Entity\Hebergement;
use App\Entity\Restaurant;
use App\Entity\Activite;
use App\Entity\MonumentHistorique;
use Vich\UploaderBundle\Mapping\PropertyMapping;
use Vich\UploaderBundle\Naming\DirectoryNamerInterface;

class LieuDirectoryNamer implements DirectoryNamerInterface
{
    public function directoryName($object, PropertyMapping $mapping): string
    {
        $lieu = $object->getLieu();

        if ($lieu instanceof Hebergement) {
            return 'hebergements';
        }

        if ($lieu instanceof Restaurant) {
            return 'restaurants';
        }

        if ($lieu instanceof Activite) {
            return 'activites';
        }

        if ($lieu instanceof MonumentHistorique) {
            return 'monuments';
        }

        return 'autres';
    }
}