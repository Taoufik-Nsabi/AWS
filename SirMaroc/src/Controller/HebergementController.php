<?php

namespace App\Controller;

use App\DTO\Hebergement\CreateHebergementRequest;
use App\DTO\Hebergement\UpdateHebergementRequest;
use App\DTO\Hebergement\UpdateHebergementStatusRequest;
use App\Enum\LieuStatus;
use App\Service\Hebergement\HebergementServiceInterface;
use App\Service\Lieu\LieuServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/hebergements')]
final class HebergementController extends AbstractController
{
    private HebergementServiceInterface $service;
    private LieuServiceInterface $lieuService;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;

    public function __construct(
        HebergementServiceInterface $service,
        LieuServiceInterface $lieuService,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ) {
        $this->service = $service;
        $this->lieuService = $lieuService;
        $this->serializer = $serializer;
        $this->validator = $validator;
    }

    #[Route('', name: 'hebergement_list', methods: ['GET'])]
    public function getAll(): JsonResponse
    {
        return $this->json($this->service->getAll());
    }

    #[Route('/admin', name: 'hebergement_admin_list', methods: ['GET'])]
    public function getAllHebergementsAdmin(): JsonResponse
    {
        return $this->json($this->service->getAllHebergements());
    }

    #[Route('', name: 'hebergement_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $dto = new CreateHebergementRequest();
        $dto->nom = $request->request->get('nom');
        $dto->adresse = $request->request->get('adresse');
        $dto->description = $request->request->get('description');
        $dto->reseauSociaux = $request->request->get('reseauSociaux');
        $dto->villeId = (int) $request->request->get('villeId');
        $dto->prix = (float) $request->request->get('prix');
        $dto->telephone = $request->request->get('telephone');
        $dto->categories = $request->request->get('categories');

        $images = [];
        foreach ($request->files->all() as $key => $file) {
            if ($key === 'images') {
                if (is_array($file)) {
                    foreach ($file as $singleFile) {
                        $images[] = $singleFile;
                    }
                } else {
                    $images[] = $file;
                }
            }
        }
        $dto->images = $images;

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            $data = [];
            foreach ($errors as $error) {
                $data[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(["errors" => $data], Response::HTTP_BAD_REQUEST);
        }

        $hebergement = $this->service->create($dto);

        return $this->json($hebergement, Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'hebergement_get', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function getById(int $id): JsonResponse
    {
        return $this->json($this->service->getById($id));
    }

    #[Route('/{id}', name: 'hebergement_update', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $dto = new UpdateHebergementRequest();

        $dto->nom = $request->request->get('nom');
        $dto->adresse = $request->request->get('adresse');
        $dto->description = $request->request->get('description');
        $dto->reseauSociaux = $request->request->get('reseauSociaux');
        $dto->villeId = $request->request->get('villeId') ? (int) $request->request->get('villeId') : null;
        $dto->prix = $request->request->get('prix') ? (float) $request->request->get('prix') : null;
        $dto->telephone = $request->request->get('telephone');
        $dto->categories = $request->request->get('categories');

        $images = $request->files->get('images');
        if ($images) {
            if (!is_array($images)) {
                $images = [$images];
            }
            $dto->images = $images;
        } else {
            $dto->images = null;
        }

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            $data = [];
            foreach ($errors as $error) {
                $data[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(["errors" => $data], Response::HTTP_BAD_REQUEST);
        }

        $hebergement = $this->service->update($id, $dto);
        return $this->json($hebergement, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'hebergement_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->json(["message" => "Hebergement supprime"]);
    }

    #[Route('/{id}/status', name: 'hebergement_update_status', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $dto = $this->serializer->deserialize(
            $request->getContent(),
            UpdateHebergementStatusRequest::class,
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

        $hebergement = $this->service->getEntityById($id);
        if (!$hebergement) {
            return $this->json(["error" => "Hebergement not found"], Response::HTTP_NOT_FOUND);
        }

        $newStatus = LieuStatus::from($dto->status);
        $this->lieuService->updateStatus($hebergement, $newStatus);

        return $this->json([
            "message" => "Statut mis a jour avec succes",
            "status" => $newStatus->value
        ]);
    }
}
