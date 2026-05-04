<?php
// src/Service/Image/ImageServiceInterface.php
namespace App\Service\Image;

use App\Entity\Image;
use App\Entity\Lieu;
use Symfony\Component\HttpFoundation\File\UploadedFile;

interface ImageServiceInterface
{
    /**
     * @param Lieu $lieu
     * @param UploadedFile[] $files
     */
    public function addImagesToLieu(Lieu $lieu, array $files): void;

    /**
     * @param Image $image
     */
    public function removeImage(Image $image): void;
}