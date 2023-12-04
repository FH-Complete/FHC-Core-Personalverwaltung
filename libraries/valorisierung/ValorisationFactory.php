<?php
require_once 'IValorisationMethod.php';
require_once 'ValorisierungProzent.php';
/**
 * Description of ValorisationFactory
 *
 * @author bambi
 */
class ValorisationFactory
{
	const VALORISATION_PROZENT = 'ValorisierungProzent';
	
	public function getValorisationMethod($method) {
		$instance = null;
		switch ($method)
		{
			case self::VALORISATION_PROZENT:
				$instance = new ValorisierungProzent();
				break;

			default:
				throw Exception('unknown Valorisation Method ' . $method);
		}
		return $instance;
	}
}
