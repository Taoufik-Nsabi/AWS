<?php

namespace App\Enum;

enum CategorieHebergement: string
{
    case HOTEL = 'hotel';
    case CHAMBRE = 'chambre';
    case STUDIO = 'studio';
    case MAISON = 'maison';
    case APPARTEMENT = 'appartement';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}