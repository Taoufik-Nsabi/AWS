<?php
namespace App\Security;

class JwtService
{
    public function decode(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return [];

        // Gestion correcte du Base64Url (caractères - et _ utilisés par .NET)
        $payload = str_replace(['-', '_'], ['+', '/'], $parts[1]);
        $decoded = base64_decode($payload);
        
        if (!$decoded) return [];

        return json_decode($decoded, true) ?? [];
    }
}