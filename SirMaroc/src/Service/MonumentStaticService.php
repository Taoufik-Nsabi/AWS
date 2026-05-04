<?php

namespace App\Service;

use Symfony\Component\HttpKernel\KernelInterface;

class MonumentStaticService
{
    private string $filePath;

    public function __construct(KernelInterface $kernel)
    {
        $this->filePath = $kernel->getProjectDir() . '/data/monuments.json';
    }

    public function getAll(?int $villeId = null): array
    {
        $items = $this->read();

        if ($villeId !== null) {
            $items = array_values(array_filter(
                $items,
                fn(array $item) => (int) ($item['villeId'] ?? 0) === $villeId
            ));
        }

        return $items;
    }

    public function getOne(int $id): ?array
    {
        foreach ($this->read() as $item) {
            if ((int) ($item['id'] ?? 0) === $id) {
                return $item;
            }
        }

        return null;
    }

    public function search(string $query): array
    {
        $query = mb_strtolower(trim($query));

        if ($query === '') {
            return [];
        }

        return array_values(array_filter(
            $this->read(),
            function (array $item) use ($query): bool {
                $haystacks = [
                    $item['nom'] ?? '',
                    $item['villeNom'] ?? '',
                    $item['description'] ?? '',
                    $item['histoire'] ?? '',
                    $item['categorie'] ?? '',
                ];

                foreach ($haystacks as $value) {
                    if (mb_stripos((string) $value, $query) !== false) {
                        return true;
                    }
                }

                return false;
            }
        ));
    }

    private function read(): array
    {
        if (!file_exists($this->filePath)) {
            return [];
        }

        $json = file_get_contents($this->filePath);
        $data = json_decode($json, true);

        return is_array($data) ? $data : [];
    }
}
