<?php

namespace App\Enum;

enum CategorieRestaurant: string
{
    case ITALIENNE = 'italienne';
    case ASIATIQUE = 'asiatique';
    case MAROCAINE = 'marocaine';
    case CAFE = 'cafe';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}