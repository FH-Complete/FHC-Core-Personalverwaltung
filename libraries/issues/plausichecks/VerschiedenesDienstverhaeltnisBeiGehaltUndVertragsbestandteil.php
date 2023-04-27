<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';
require_once APPPATH.'extensions/FHC-Core-Personalverwaltung/libraries/issues/PersonalverwaltungPlausicheckLib.php';

/**
 * Dienstverhältnis of Gehaltsbestandteil shouldn't be different than dienstverhältnis of assigned Vertragsbestandteil.
 */
class VerschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$this->_ci->load->library('PersonalverwaltungPlausicheckLib');
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$gehaltsbestandteil_id = isset($params['gehaltsbestandteil_id']) ? $params['gehaltsbestandteil_id'] : null;
		$vertragsbestandteil_id = isset($params['vertragsbestandteil_id']) ? $params['vertragsbestandteil_id'] : null;

		// get employee data
		$result = $this->_ci->personalverwaltungplausichecklib->getVerschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil(
			$person_id,
			$gehaltsbestandteil_id,
			$vertragsbestandteil_id
		);

		// If error occurred then return the error
		if (isError($result)) return $result;

		// If data are present
		if (hasData($result))
		{
			$data = getData($result);

			// populate results with data necessary for writing issues
			foreach ($data as $dataObj)
			{
				$results[] = array(
					'person_id' => $dataObj->person_id,
					'resolution_params' => array(
						'gehaltsbestandteil_id' => $dataObj->gehaltsbestandteil_id,
						'vertragsbestandteil_id' => $dataObj->vertragsbestandteil_id
					),
					'fehlertext_params' => array(
						'gehaltsbestandteil_id' => $dataObj->gehaltsbestandteil_id,
						'vertragsbestandteil_id' => $dataObj->vertragsbestandteil_id
					)
				);
			}
		}

		return success($results);
	}
}
