<?php

namespace App\Enum;

enum CategorieActivite: string
{
    case SPORT = 'sport';
    case CULTURE = 'culture';
    case AVENTURE = 'aventure';
    case DETENTE = 'detente';
    case GASTRONOMIE = 'gastronomie';
    case DECOUVERTE = 'decouverte';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}