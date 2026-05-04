<?php
namespace App\Controller;

use App\DTO\Activite\CreateActiviteRequest;
use App\DTO\Activite\UpdateActiviteRequest;
use App\DTO\Activite\UpdateActiviteStatusRequest;
use App\Service\Activite\ActiviteServiceInterface;
use App\Service\Lieu\LieuServiceInterface;
use App\Enum\LieuStatus;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/activites')]
final class ActiviteController extends AbstractController
{
    private ActiviteServiceInterface $service;
    private LieuServiceInterface $lieuService;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;

    public function __construct(
        ActiviteServiceInterface $service,
        LieuServiceInterface $lieuService,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ) {
        $this->service = $service;
        $this->lieuService = $lieuService;
        $this->serializer = $serializer;
        $this->validator = $validator;
    }

    #[Route('', name: 'activite_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $dto = new CreateActiviteRequest();

        $dto->nom = $request->request->get('nom');
        $dto->adresse = $request->request->get('adresse');
        $dto->description = $request->request->get('description');
        $dto->reseauSociaux = $request->request->get('reseauSociaux');
        
        // ← CORRECTION : Vérifier avant de convertir
        $villeId = $request->request->get('villeId');
        $dto->villeId = $villeId !== null && $villeId !== '' ? (int)$villeId : null;
        
        $tarif = $request->request->get('tarif');
        $dto->tarif = $tarif !== null && $tarif !== '' ? (float)$tarif : null;
        
        $duree = $request->request->get('duree');
        $dto->duree = $duree !== null && $duree !== '' ? (int)$duree : null;
        
        $dto->categorie = $request->request->get('categorie');

        // Récupérer les fichiers images
        $images = [];
        foreach ($request->files->all() as $key => $file) {
            if ($key === 'images') {
                if (is_array($file)) {
                    foreach ($file as $f) {
                        $images[] = $f;
                    }
                } else {
                    $images[] = $file;
                }
            }
        }
        $dto->images = $images;

        // Valider
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            $data = [];
            foreach ($errors as $error) {
                $data[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(["errors" => $data], Response::HTTP_BAD_REQUEST);
        }

        // Créer
        $activite = $this->service->create($dto);

        return $this->json($activite, Response::HTTP_CREATED);
    }

    #[Route('', name: 'activite_list', methods: ['GET'])]
    public function getAll(): JsonResponse
    {
        return $this->json($this->service->getAll());
    }

    #[Route('/{id}', name: 'activite_get', methods: ['GET'])]
    public function getById(int $id): JsonResponse
    {
        return $this->json($this->service->getById($id));
    }

    #[Route('/{id}', name: 'activite_update', methods: ['POST'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $dto = new UpdateActiviteRequest();

        $dto->nom = $request->request->get('nom');
        $dto->adresse = $request->request->get('adresse');
        $dto->description = $request->request->get('description');
        $dto->reseauSociaux = $request->request->get('reseauSociaux');
        
        $villeId = $request->request->get('villeId');
        $dto->villeId = $villeId !== null && $villeId !== '' ? (int)$villeId : null;
        
        $tarif = $request->request->get('tarif');
        $dto->tarif = $tarif !== null && $tarif !== '' ? (float)$tarif : null;
        
        $duree = $request->request->get('duree');
        $dto->duree = $duree !== null && $duree !== '' ? (int)$duree : null;
        
        $dto->categorie = $request->request->get('categorie');

        // Récupérer les images
        $images = $request->files->get('images');
        if ($images) {
            if (!is_array($images)) $images = [$images];
            $dto->images = $images;
        } else {
            $dto->images = null;
        }

        // Valider
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            $data = [];
            foreach ($errors as $error) {
                $data[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(["errors" => $data], Response::HTTP_BAD_REQUEST);
        }

        // Mettre à jour
        $activite = $this->service->update($id, $dto);

        return $this->json($activite, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'activite_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->json(["message" => "Activite supprimée"]);
    }

    #[Route('/{id}/status', name: 'activite_update_status', methods: ['PUT'])]
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $dto = $this->serializer->deserialize(
            $request->getContent(),
            UpdateActiviteStatusRequest::class,
            'json'
        );

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            $data = [];
            foreach ($errors as $error) {
                $data[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(["errors" => $data], Response::HTTP_BAD_REQUEST);
        }

        $activite = $this->service->getEntityById($id);
        if (!$activite) {
            return $this->json(["error" => "Activite not found"], Response::HTTP_NOT_FOUND);
        }

        $newStatus = LieuStatus::from($dto->status);
        $this->lieuService->updateStatus($activite, $newStatus);

        return $this->json([
            "message" => "Statut mis à jour avec succès",
            "status" => $newStatus->value
        ]);
    }
}