<?php
/**
 *
 * @author bambi
 */
interface IValorisationMethod
{
	public function initialize($gehaltsbestandteile, $params);
	public function checkParams();
	public function checkIfApplicable();
	public function doValorisation();
}
