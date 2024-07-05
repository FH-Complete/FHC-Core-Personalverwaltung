<?php
/**
 *
 * @author bambi
 */
interface IValorisationMethod
{
	public function initialize($dienstverhaeltnis, $vertragsbestandteile, $gehaltsbestandteile, $params);
	public function checkParams();
	public function checkIfApplicable();
	public function calculateValorisation();
}
