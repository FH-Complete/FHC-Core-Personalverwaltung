<?php
require_once 'IValorisationMethod.php';
require_once 'AbstractValorisationMethod.php';
require_once 'ValorisierungKeine.php';
require_once 'ValorisierungProzent.php';
require_once 'ValorisierungFixBetrag.php';
require_once 'ValorisierungGestaffelt.php';

/**
 * Factory for retrieving correct valorisation method
 */
class ValorisationFactory
{
	const VALORISATION_KEINE	= 'ValorisierungKeine';
	const VALORISATION_PROZENT	= 'ValorisierungProzent';
	const VALORISATION_FIXBETRAG	= 'ValorisierungFixBetrag';
	const VALORISATION_STAGGERED	= 'ValorisierungGestaffelt';

	/**
	* Get the valorisation method object.
	* @param method name of method
	* @return valorisation method object
	*/
	public function getValorisationMethod($method) {
		$instance = null;
		switch ($method)
		{
			case self::VALORISATION_KEINE:
				$instance = new ValorisierungKeine();
				break;

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
