<?php

namespace App\Service\Hebergement;

use App\DTO\Hebergement\CreateHebergementRequest;
use App\DTO\Hebergement\UpdateHebergementRequest;
use App\Entity\Hebergement;
use App\Enum\LieuStatus;
use App\Mapper\HebergementMapper;
use App\Repository\HebergementRepository;
use App\Repository\VilleRepository;
use App\Security\JwtService;
use App\Service\Image\ImageServiceInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class HebergementService implements HebergementServiceInterface
{
    private HebergementRepository $repository;
    private HebergementMapper $mapper;
    private ImageServiceInterface $imageService;
    private EntityManagerInterface $em;
    private VilleRepository $villeRepository;
    private RequestStack $requestStack;
    private JwtService $jwtService;

    public function __construct(
        HebergementRepository $repository,
        HebergementMapper $mapper,
        ImageServiceInterface $imageService,
        EntityManagerInterface $em,
        VilleRepository $villeRepository,
        JwtService $jwtService,
        RequestStack $requestStack
    ) {
        $this->repository = $repository;
        $this->mapper = $mapper;
        $this->imageService = $imageService;
        $this->em = $em;
        $this->villeRepository = $villeRepository;
        $this->jwtService = $jwtService;
        $this->requestStack = $requestStack;
    }

    public function create(CreateHebergementRequest $dto)
    {
        $userId = $this->getCurrentUserId();
        $payload = $this->getCurrentTokenPayload();

        $hebergement = $this->mapper->toEntity($dto);

        $ville = $this->villeRepository->find($dto->villeId);
        if (!$ville) {
            throw new \Exception("La ville (ID: {$dto->villeId}) n'existe pas.", 404);
        }

        $hebergement->setVille($ville);
        $hebergement->setUserId($userId);

        $role = $payload['role']
            ?? $payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
            ?? 'User';
        $isAdmin = strtolower((string) $role) === 'admin';
        $hebergement->setStatus($isAdmin ? LieuStatus::APPROVED : LieuStatus::PENDING);

        $this->em->persist($hebergement);
        $this->em->flush();

        if (!empty($dto->images)) {
            $this->imageService->addImagesToLieu($hebergement, $dto->images);
        }

        return $this->mapper->toResponse($hebergement);
    }

    public function update(int $id, UpdateHebergementRequest $dto)
    {
        $hebergement = $this->repository->findById($id);
        if (!$hebergement) {
            throw new \Exception("Hebergement non trouve", 404);
        }

        $currentUserId = $this->getCurrentUserId();
        if ($hebergement->getUserId() !== $currentUserId) {
            throw new AccessDeniedHttpException("Vous ne pouvez modifier que votre propre annonce.");
        }

        $this->mapper->updateEntity($hebergement, $dto);

        if ($dto->villeId !== null) {
            $ville = $this->villeRepository->find($dto->villeId);
            if ($ville) {
                $hebergement->setVille($ville);
            }
        }

        if (!empty($dto->images)) {
            $this->imageService->addImagesToLieu($hebergement, $dto->images);
        }

        $this->em->flush();

        return $this->mapper->toResponse($hebergement);
    }

    public function delete(int $id)
    {
        $hebergement = $this->repository->findById($id);
        if (!$hebergement) {
            throw new \Exception("Hebergement non trouve", 404);
        }

        $currentUserId = $this->getCurrentUserId();
        if ($hebergement->getUserId() !== $currentUserId) {
            throw new AccessDeniedHttpException("Vous ne pouvez supprimer que votre propre annonce.");
        }

        foreach ($hebergement->getImages() as $image) {
            $this->em->remove($image);
        }

        $this->em->remove($hebergement);
        $this->em->flush();
    }

    public function getById(int $id)
    {
        $hebergement = $this->repository->findById($id);
        if (!$hebergement) {
            throw new \Exception("Hebergement non trouve", 404);
        }

        return $this->mapper->toResponse($hebergement);
    }

    public function getAll()
    {
        $result = [];

        foreach ($this->repository->findAllApproved() as $hebergement) {
            $result[] = $this->mapper->toResponse($hebergement);
        }

        return $result;
    }

    public function getAllHebergements()
    {
        return array_map(
            fn($hebergement) => $this->mapper->toResponse($hebergement),
            $this->repository->findAllHebergements()
        );
    }

    public function getEntityById(int $id): ?Hebergement
    {
        return $this->repository->findById($id);
    }

    private function getCurrentUserId(): int
    {
        $request = $this->requestStack->getCurrentRequest();
        $userId = $request?->headers->get('X-User-Id');

        if ($userId && is_numeric($userId)) {
            return (int) $userId;
        }

        $payload = $this->getCurrentTokenPayload();
        $userId = $payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
            ?? $payload['nameid']
            ?? null;

        if (!$userId || !is_numeric((string) $userId)) {
            throw new UnauthorizedHttpException('Bearer', "Impossible d'identifier l'utilisateur connecte.");
        }

        return (int) $userId;
    }

    private function getCurrentTokenPayload(): array
    {
        $request = $this->requestStack->getCurrentRequest();
        $authHeader = $request?->headers->get('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            throw new UnauthorizedHttpException('Bearer', "Acces refuse : token manquant.");
        }

        $token = str_replace('Bearer ', '', $authHeader);
        return $this->jwtService->decode($token);
    }
}
