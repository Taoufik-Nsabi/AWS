<?php

namespace App\Exception;

/**
 * Exception levée lorsqu'une ville n'est pas trouvée en base de données.
 */
class VilleNotFoundException extends \RuntimeException
{
    public function __construct(int $id)
    {
        parent::__construct(sprintf('Ville avec l\'id %d introuvable.', $id));
    }
}
