<?php

namespace App\Service\Image;

use App\Entity\Lieu;
use App\Entity\Image;
use App\Repository\ImageRepository;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Doctrine\ORM\EntityManagerInterface;

class ImageService implements ImageServiceInterface
{
    private ImageRepository $repository;
    private EntityManagerInterface $em;

    public function __construct(
        ImageRepository $repository,
        EntityManagerInterface $em
    ) {
        $this->repository = $repository;
        $this->em = $em;
    }

    public function addImagesToLieu(Lieu $lieu, ?array $fichiers): void
    {
        if (!$fichiers) return;

        foreach ($fichiers as $fichier) {
            if (!$fichier instanceof UploadedFile) continue;

            $image = new Image();
            $image->setLieu($lieu);
            $lieu->getImages()->add($image); 
            $image->setImageFile($fichier);
            $this->em->persist($image);
        }

        $this->em->flush();
    }
    public function removeImage(Image $image): void
    {
        $this->em->remove($image);
        $this->em->flush();
    }
}