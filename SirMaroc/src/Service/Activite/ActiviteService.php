<?php

namespace App\Service\Activite;

use App\DTO\Activite\CreateActiviteRequest;
use App\DTO\Activite\UpdateActiviteRequest;
use App\Entity\Activite;
use App\Enum\LieuStatus;
use App\Mapper\ActiviteMapper;
use App\Repository\ActiviteRepository;
use App\Repository\VilleRepository;
use App\Security\JwtService;
use App\Service\Image\ImageServiceInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class ActiviteService implements ActiviteServiceInterface
{
    private ActiviteRepository $repository;
    private ImageServiceInterface $imageService;
    private ActiviteMapper $mapper;
    private EntityManagerInterface $em;
    private VilleRepository $villeRepository;
    private JwtService $jwtService;
    private RequestStack $requestStack;

    public function __construct(
        ActiviteRepository $repository,
        ImageServiceInterface $imageService,
        ActiviteMapper $mapper,
        EntityManagerInterface $em,
        VilleRepository $villeRepository,
        JwtService $jwtService,
        RequestStack $requestStack
    ) {
        $this->repository = $repository;
        $this->imageService = $imageService;
        $this->mapper = $mapper;
        $this->em = $em;
        $this->villeRepository = $villeRepository;
        $this->jwtService = $jwtService;
        $this->requestStack = $requestStack;
    }

    public function create(CreateActiviteRequest $dto)
    {
        $userId = $this->getCurrentUserId();
        $payload = $this->getCurrentTokenPayload();

        $activite = $this->mapper->toEntity($dto);

        $ville = $this->villeRepository->find($dto->villeId);
        if (!$ville) {
            throw new \Exception("La ville (ID: {$dto->villeId}) n'existe pas.", 404);
        }

        $activite->setVille($ville);
        $activite->setUserId($userId);

        $role = $payload['role']
            ?? $payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
            ?? 'User';
        $isAdmin = strtolower((string) $role) === 'admin';
        $activite->setStatus($isAdmin ? LieuStatus::APPROVED : LieuStatus::PENDING);

        $this->em->persist($activite);
        $this->em->flush();

        if (!empty($dto->images)) {
            $this->imageService->addImagesToLieu($activite, $dto->images);
        }

        return $this->mapper->toResponse($activite);
    }

    public function update(int $id, UpdateActiviteRequest $dto)
    {
        $activite = $this->repository->findById($id);
        if (!$activite) {
            throw new \Exception("Activite not found", 404);
        }

        $currentUserId = $this->getCurrentUserId();
        if ($activite->getUserId() !== $currentUserId) {
            throw new AccessDeniedHttpException("Vous ne pouvez modifier que votre propre annonce.");
        }

        $this->mapper->updateEntity($activite, $dto);

        if ($dto->villeId !== null) {
            $ville = $this->villeRepository->find($dto->villeId);
            if (!$ville) {
                throw new \Exception("La ville (ID: {$dto->villeId}) n'existe pas.", 404);
            }
            $activite->setVille($ville);
        }

        if (!empty($dto->images)) {
            $this->imageService->addImagesToLieu($activite, $dto->images);
        }

        $this->em->flush();

        return $this->mapper->toResponse($activite);
    }

    public function delete(int $id)
    {
        $activite = $this->repository->findById($id);
        if (!$activite) {
            throw new \Exception("Activite not found", 404);
        }

        $currentUserId = $this->getCurrentUserId();
        if ($activite->getUserId() !== $currentUserId) {
            throw new AccessDeniedHttpException("Vous ne pouvez supprimer que votre propre annonce.");
        }

        foreach ($activite->getImages() as $image) {
            $this->em->remove($image);
        }

        $this->em->remove($activite);
        $this->em->flush();
    }

    public function getById(int $id)
    {
        $activite = $this->repository->findById($id);
        if (!$activite) {
            throw new \Exception("Activite not found", 404);
        }

        return $this->mapper->toResponse($activite);
    }

    public function getAll()
    {
        $result = [];

        foreach ($this->repository->findAllApproved() as $activite) {
            $result[] = $this->mapper->toResponse($activite);
        }

        return $result;
    }

    public function getEntityById(int $id): ?Activite
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
