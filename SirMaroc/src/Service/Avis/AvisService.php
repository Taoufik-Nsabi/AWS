<?php
namespace App\Service\Avis;

use App\DTO\Avis\AvisCreateRequest;
use App\DTO\Avis\UpdateAvisRequest;
use App\Entity\Avis;
use App\Mapper\AvisMapper;
use App\Repository\AvisRepository;
use App\Repository\LieuRepository;
use App\Security\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class AvisService implements IAvisService
{
    private AvisRepository $repository;
    private LieuRepository $lieuRepository;
    private EntityManagerInterface $em;
    private JwtService $jwtService;
    private RequestStack $requestStack;
    private AvisMapper $mapper;

    public function __construct(
        AvisRepository $repository,
        LieuRepository $lieuRepository,
        EntityManagerInterface $em,
        JwtService $jwtService,
        RequestStack $requestStack,
        AvisMapper $mapper
    ) {
        $this->repository = $repository;
        $this->lieuRepository = $lieuRepository;
        $this->em = $em;
        $this->jwtService = $jwtService;
        $this->requestStack = $requestStack;
        $this->mapper = $mapper;
    }

    public function createAvis(AvisCreateRequest $request): Avis
    {
        $userId = $this->getCurrentUserId(); // JWT ONLY

        $lieu = $this->lieuRepository->find($request->lieuId);
        if (!$lieu) {
            throw new \Exception("Lieu introuvable", 404);
        }

        $avis = new Avis();
        $avis->setCommentaire($request->commentaire);
        $avis->setEtoiles($request->etoiles);
        $avis->setUserId($userId);
        $avis->setLieu($lieu);

        $this->repository->save($avis, true);

        return $avis;
    }

   public function updateAvis(int $id, UpdateAvisRequest $request): Avis
    {
        $avis = $this->repository->findById($id);
        if (!$avis) {
            throw new \Exception("Avis non trouvé", 404);
        }

        if ($avis->getUserId() !== $this->getCurrentUserId()) {
            throw new AccessDeniedHttpException("Interdit");
        }

        if ($request->commentaire !== null) {
            $avis->setCommentaire($request->commentaire);
        }

        if ($request->etoiles !== null) {
            $avis->setEtoiles($request->etoiles);
        }

        $this->repository->save($avis, true);

        return $avis;
    }

    public function deleteAvis(int $id): void
    {
        $avis = $this->repository->findById($id);
        if (!$avis) {
            throw new \Exception("Avis non trouvé", 404);
        }

        if ($avis->getUserId() !== $this->getCurrentUserId()) {
            throw new AccessDeniedHttpException("Interdit");
        }

        $this->repository->remove($avis, true);
    }

    public function getAvisById(int $id): Avis
    {
        $avis = $this->repository->find($id);
        if (!$avis) {
            throw new \Exception("Avis non trouvé", 404);
        }

        return $avis;
    }

    public function getAvisByLieu(int $lieuId): array
    {
        return $this->repository->findBy(['lieu' => $lieuId]);
    }

    public function getAverageStarsByLieu(int $lieuId): ?float
    {
        $qb = $this->em->createQueryBuilder();

        $result = $qb
            ->select('AVG(a.etoiles)')
            ->from(Avis::class, 'a')
            ->where('a.lieu = :lieuId')
            ->setParameter('lieuId', $lieuId)
            ->getQuery()
            ->getSingleScalarResult();

        return $result ? (float)$result : null;
    }

    private function getCurrentUserId(): int
    {
        $request = $this->requestStack->getCurrentRequest();
        $authHeader = $request?->headers->get('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            throw new UnauthorizedHttpException('Bearer', "Token manquant");
        }

        $token = str_replace('Bearer ', '', $authHeader);
        $payload = $this->jwtService->decode($token);

        $userId =
            $payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
            ?? $payload['nameid']
            ?? null;

        if (!$userId || !is_numeric((string)$userId)) {
            throw new UnauthorizedHttpException('Bearer', "Utilisateur non identifié");
        }

        return (int)$userId;
    }

   public function getCurrentUserEmail(): string
{
    $request = $this->requestStack->getCurrentRequest();
    $authHeader = $request?->headers->get('Authorization');

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return 'Anonyme';
    }

    try {
        $token = str_replace('Bearer ', '', $authHeader);
        $payload = $this->jwtService->decode($token);

        // Ordre de vérification basé sur votre token réel :
        return $payload['sub'] // C'est ici que se trouve riham@gmail.com dans votre JSON
            ?? $payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
            ?? $payload['email']
            ?? $payload['unique_name']
            ?? 'Utilisateur #' . ($payload['nameid'] ?? 'inconnu');

    } catch (\Exception $e) {
        return 'Anonyme';
    }
}
    public function getAvisByUser(): array
    {
        $userId = $this->getCurrentUserId();
        return $this->repository->findByUser($userId);
    }
}