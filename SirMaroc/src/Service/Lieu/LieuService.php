<?php

namespace App\Service\Lieu;

use App\DTO\Lieu\LieuDetailResponse;
use App\Entity\Lieu;
use App\Enum\LieuStatus;
use App\Mapper\LieuMapper;
use App\Repository\LieuRepository;
use App\Security\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class LieuService implements LieuServiceInterface
{
    private EntityManagerInterface $em;
    private LieuRepository $lieuRepository;
    private LieuMapper $lieuMapper;
    private JwtService $jwtService;
    private RequestStack $requestStack;

    public function __construct(
        EntityManagerInterface $em,
        LieuRepository $lieuRepository,
        LieuMapper $lieuMapper,
        JwtService $jwtService,
        RequestStack $requestStack
    ) {
        $this->em = $em;
        $this->lieuRepository = $lieuRepository;
        $this->lieuMapper = $lieuMapper;
        $this->jwtService = $jwtService;
        $this->requestStack = $requestStack;
    }

    public function updateStatus(Lieu $lieu, LieuStatus $status): Lieu
    {
        $this->ensureAdmin();

        $lieu->setStatus($status);
        $this->em->flush();

        return $lieu;
    }

    public function getAdminLieux(?string $type = null, ?string $status = null): array
    {
        $this->ensureAdmin();

        $statusEnum = null;
        if ($status !== null && $status !== '') {
            $statusEnum = LieuStatus::from($status);
        }

        $lieux = $this->lieuRepository->findAdminLieux($type, $statusEnum);

        return array_map(
            fn($lieu) => $this->lieuMapper->toResponse($lieu),
            $lieux
        );
    }

    public function getMyLieux(): array
    {
        $userId = $this->getCurrentUserId();

        $lieux = $this->lieuRepository->findAllByUserId($userId);

        return array_map(
            fn($lieu) => $this->lieuMapper->toResponse($lieu),
            $lieux
        );
    }

    public function getLieuxByUser(int $userId): array
    {
        $this->ensureAdmin();

        $lieux = $this->lieuRepository->findAllByUserId($userId);

        return array_map(
            fn($lieu) => $this->lieuMapper->toResponse($lieu),
            $lieux
        );
    }

    public function getLieuDetail(int $id): LieuDetailResponse
    {
        $lieu = $this->lieuRepository->findById($id);

        if (!$lieu) {
            throw new \Exception("Lieu introuvable", 404);
        }

        $this->checkOwner($lieu);

        return $this->lieuMapper->toDetailResponse($lieu);
    }

    public function delete(int $id): void
    {
        $lieu = $this->lieuRepository->findById($id);

        if (!$lieu) {
            throw new \Exception("Lieu non trouve", 404);
        }

        $this->checkOwner($lieu);

        foreach ($lieu->getImages() as $image) {
            $this->em->remove($image);
        }

        $this->em->remove($lieu);
        $this->em->flush();
    }

    private function checkOwner(Lieu $lieu): void
    {
        $currentUserId = $this->getCurrentUserId();

        if ($lieu->getUserId() !== $currentUserId) {
            throw new AccessDeniedHttpException(
                "Acces refuse : ce lieu ne vous appartient pas."
            );
        }
    }

    private function getCurrentUserId(): int
    {
        $request = $this->requestStack->getCurrentRequest();

        $userId = $request?->headers->get('X-User-Id');
        if ($userId && is_numeric($userId)) {
            return (int) $userId;
        }

        $authHeader = $request?->headers->get('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
            throw new UnauthorizedHttpException('Bearer', "Token manquant ou mal forme");
        }

        $token = $matches[1];
        try {
            $payload = $this->jwtService->decode($token);
        } catch (\Exception $e) {
            throw new UnauthorizedHttpException('Bearer', "Token invalide");
        }

        $userId = $payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
            ?? $payload['nameid']
            ?? $payload['id']
            ?? null;

        if (!$userId) {
            throw new UnauthorizedHttpException('Bearer', "Utilisateur non identifiable dans le token");
        }

        return (int) $userId;
    }

    private function getCurrentTokenPayload(): array
    {
        $request = $this->requestStack->getCurrentRequest();
        $authHeader = $request?->headers->get('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
            throw new UnauthorizedHttpException('Bearer', "Token manquant ou mal forme");
        }

        try {
            return $this->jwtService->decode($matches[1]);
        } catch (\Exception) {
            throw new UnauthorizedHttpException('Bearer', "Token invalide");
        }
    }

    private function ensureAdmin(): void
    {
        $payload = $this->getCurrentTokenPayload();
        $role = $payload['role']
            ?? $payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
            ?? null;

        if (strtolower((string) $role) !== 'admin') {
            throw new AccessDeniedHttpException("Acces refuse : reserve a l'administrateur.");
        }
    }
}
