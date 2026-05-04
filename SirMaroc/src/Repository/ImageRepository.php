<?php
namespace App\Repository;

use App\Entity\Image;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ImageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Image::class);
    }

    public function save(Image $image, bool $flush = true): void
    {
        $this->getEntityManager()->persist($image);
        if ($flush) $this->getEntityManager()->flush();
    }

    public function delete(Image $image, bool $flush = true): void
    {
        $this->getEntityManager()->remove($image);
        if ($flush) $this->getEntityManager()->flush();
    }
}