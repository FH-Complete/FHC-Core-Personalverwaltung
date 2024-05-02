<?php
require_once 'IValorisationMethod.php';
require_once 'AbstractValorisationMethod.php';
require_once 'ValorisierungProzent.php';
require_once 'ValorisierungFixBetrag.php';
require_once 'ValorisierungGestaffelt.php';

/**
 * Description of ValorisationFactory
 *
 * @author bambi
 */
class ValorisationFactory
{
	const VALORISATION_PROZENT	= 'ValorisierungProzent';
	const VALORISATION_FIXBETRAG	= 'ValorisierungFixBetrag';
	const VALORISATION_STAGGERED	= 'ValorisierungGestaffelt';
	
	public function getValorisationMethod($method) {
		$instance = null;
		switch ($method)
		{
			case self::VALORISATION_PROZENT:
				$instance = new ValorisierungProzent();
				break;
			
			case self::VALORISATION_FIXBETRAG:
				$instance = new ValorisierungFixBetrag();
				break;

			case self::VALORISATION_STAGGERED:
				$instance = new ValorisierungGestaffelt();
				break;
			
			default:
				throw new Exception('unknown Valorisation Method ' . $method);
		}
		return $instance;
	}
}
