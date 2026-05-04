<?php

namespace App\Enum;

enum LieuStatus: string
{
    case PENDING  = 'en_attente';
    case APPROVED = 'approuve';
    case REJECTED = 'rejete';

    
    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }
}