<?php

namespace App\Controller;

use App\DTO\Restaurant\CreateRestaurantRequest;
use App\DTO\Restaurant\UpdateRestaurantRequest;
use App\DTO\Restaurant\UpdateRestaurantStatusRequest;
use App\Service\Restaurant\RestaurantServiceInterface;
use App\Service\Lieu\LieuServiceInterface;
use App\Enum\LieuStatus;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/restaurants')]
final class RestaurantController extends AbstractController
{
    private RestaurantServiceInterface $service;
    private LieuServiceInterface $lieuService;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;

    public function __construct(
        RestaurantServiceInterface $service,
        LieuServiceInterface $lieuService,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ) {
        $this->service = $service;
        $this->lieuService = $lieuService;
        $this->serializer = $serializer;
        $this->validator = $validator;
    }

    #[Route('', name: 'restaurant_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $dto = new CreateRestaurantRequest();

        $dto->nom = $request->request->get('nom');
        $dto->adresse = $request->request->get('adresse');
        $dto->description = $request->request->get('description');
        $dto->reseauSociaux = $request->request->get('reseauSociaux');
        $dto->villeId = (int) $request->request->get('villeId');
        $dto->prixMoyen = (float) $request->request->get('prixMoyen');
        $dto->telephone = $request->request->get('telephone');
        $dto->categorie = $request->request->get('categorie');

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

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            $data = [];
            foreach ($errors as $error) {
                $data[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(["errors" => $data], Response::HTTP_BAD_REQUEST);
        }

        $restaurant = $this->service->create($dto);

        return $this->json($restaurant, Response::HTTP_CREATED);
    }

    #[Route('', name: 'restaurant_list', methods: ['GET'])]
    public function getAll(): JsonResponse
    {
        return $this->json($this->service->getAll());
    }

    #[Route('/{id}', name: 'restaurant_get', methods: ['GET'])]
    public function getById(int $id): JsonResponse
    {
        return $this->json($this->service->getById($id));
    }

    #[Route('/{id}', name: 'restaurant_update', methods: ['POST'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $dto = new UpdateRestaurantRequest();

        $dto->nom = $request->request->get('nom');
        $dto->adresse = $request->request->get('adresse');
        $dto->description = $request->request->get('description');
        $dto->reseauSociaux = $request->request->get('reseauSociaux');
        $dto->villeId = $request->request->get('villeId') ? (int)$request->request->get('villeId') : null;
        $dto->prixMoyen = $request->request->get('prixMoyen') ? (float)$request->request->get('prixMoyen') : null;
        $dto->telephone = $request->request->get('telephone');
        $dto->categorie = $request->request->get('categorie');

        $images = $request->files->get('images');
        if ($images) {
            if (!is_array($images)) $images = [$images];
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

        $restaurant = $this->service->update($id, $dto);

        return $this->json($restaurant, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'restaurant_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->service->delete($id);

        return $this->json(["message" => "Restaurant supprimé"]);
    }

    #[Route('/{id}/status', name: 'restaurant_update_status', methods: ['PUT'])]
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $dto = $this->serializer->deserialize(
            $request->getContent(),
            UpdateRestaurantStatusRequest::class,
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

        $restaurant = $this->service->getEntityById($id);
        if (!$restaurant) {
            return $this->json(["error" => "Restaurant not found"], Response::HTTP_NOT_FOUND);
        }

        $newStatus = LieuStatus::from($dto->status);
        $this->lieuService->updateStatus($restaurant, $newStatus);

        return $this->json([
            "message" => "Statut mis à jour avec succès",
            "status" => $newStatus->value
        ]);
    }
}