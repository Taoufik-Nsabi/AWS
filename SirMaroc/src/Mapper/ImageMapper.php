<?php
namespace App\Mapper;

use App\Entity\Image;
use App\Entity\Lieu;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ImageMapper
{
    public function toEntity(Lieu $lieu, UploadedFile $fichier): Image
    {
        $image = new Image();
        $image->setLieu($lieu);
        $image->setImageFile($fichier); 
        return $image;
    }
}