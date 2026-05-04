<?php

namespace App\Service\Restaurant;

use App\DTO\Restaurant\CreateRestaurantRequest;
use App\DTO\Restaurant\UpdateRestaurantRequest;
use App\Entity\Restaurant;
use App\Enum\LieuStatus;
use App\Mapper\RestaurantMapper;
use App\Repository\RestaurantRepository;
use App\Repository\VilleRepository;
use App\Security\JwtService;
use App\Service\Image\ImageServiceInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class RestaurantService implements RestaurantServiceInterface
{
    private RestaurantRepository $repository;
    private RestaurantMapper $mapper;
    private ImageServiceInterface $imageService;
    private EntityManagerInterface $em;
    private VilleRepository $villeRepository;
    private JwtService $jwtService;
    private RequestStack $requestStack;

    public function __construct(
        RestaurantRepository $repository,
        RestaurantMapper $mapper,
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

    public function create(CreateRestaurantRequest $dto)
    {
        $userId = $this->getCurrentUserId();
        $payload = $this->getCurrentTokenPayload();

        $restaurant = $this->mapper->toEntity($dto);

        $ville = $this->villeRepository->find($dto->villeId);
        if (!$ville) {
            throw new \Exception("La ville (ID: {$dto->villeId}) n'existe pas.", 404);
        }

        $restaurant->setVille($ville);
        $restaurant->setUserId($userId);

        $role = $payload['role']
            ?? $payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
            ?? 'User';
        $isAdmin = strtolower((string) $role) === 'admin';
        $restaurant->setStatus($isAdmin ? LieuStatus::APPROVED : LieuStatus::PENDING);

        $this->em->persist($restaurant);
        $this->em->flush();

        if (!empty($dto->images)) {
            $this->imageService->addImagesToLieu($restaurant, $dto->images);
        }

        return $this->mapper->toResponse($restaurant);
    }

    public function update(int $id, UpdateRestaurantRequest $dto)
    {
        $restaurant = $this->repository->findById($id);
        if (!$restaurant) {
            throw new \Exception("Restaurant not found", 404);
        }

        $currentUserId = $this->getCurrentUserId();
        if ($restaurant->getUserId() !== $currentUserId) {
            throw new AccessDeniedHttpException("Vous ne pouvez modifier que votre propre annonce.");
        }

        $this->mapper->updateEntity($restaurant, $dto);

        if ($dto->villeId !== null) {
            $ville = $this->villeRepository->find($dto->villeId);
            if (!$ville) {
                throw new \Exception("La ville (ID: {$dto->villeId}) n'existe pas.", 404);
            }
            $restaurant->setVille($ville);
        }

        if (!empty($dto->images)) {
            $this->imageService->addImagesToLieu($restaurant, $dto->images);
        }

        $this->em->flush();

        return $this->mapper->toResponse($restaurant);
    }

    public function delete(int $id)
    {
        $restaurant = $this->repository->findById($id);
        if (!$restaurant) {
            throw new \Exception("Restaurant not found", 404);
        }

        $currentUserId = $this->getCurrentUserId();
        if ($restaurant->getUserId() !== $currentUserId) {
            throw new AccessDeniedHttpException("Vous ne pouvez supprimer que votre propre annonce.");
        }

        foreach ($restaurant->getImages() as $image) {
            $this->em->remove($image);
        }

        $this->em->remove($restaurant);
        $this->em->flush();
    }

    public function getById(int $id)
    {
        $restaurant = $this->repository->findById($id);
        if (!$restaurant) {
            throw new \Exception("Restaurant not found", 404);
        }

        return $this->mapper->toResponse($restaurant);
    }

    public function getAll()
    {
        $result = [];

        foreach ($this->repository->findAllApproved() as $restaurant) {
            $result[] = $this->mapper->toResponse($restaurant);
        }

        return $result;
    }

    public function getEntityById(int $id): ?Restaurant
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
