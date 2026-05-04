<?php

namespace App\Exception;

/**
 * Exception levée lorsqu'un monument historique n'est pas trouvé en base de données.
 */
class MonumentNotFoundException extends \RuntimeException
{
    public function __construct(int $id)
    {
        parent::__construct(sprintf('Monument historique avec l\'id %d introuvable.', $id));
    }
}
