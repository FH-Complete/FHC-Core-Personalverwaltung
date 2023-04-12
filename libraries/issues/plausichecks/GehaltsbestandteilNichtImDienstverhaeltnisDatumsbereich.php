<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';
require_once APPPATH.'extensions/FHC-Core-Personalverwaltung/libraries/issues/PlausicheckLib.php';

/**
 * Gehaltsbestandteil date span should be in Dienstverhaeltnis date span.
 */
class GehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$this->_ci->load->library('PlausicheckLib');
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$gehaltsbestandteil_id = isset($params['gehaltsbestandteil_id']) ? $params['gehaltsbestandteil_id'] : null;

		// get employee data
		$result = $this->_ci->plausichecklib->getGehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich($person_id, $gehaltsbestandteil_id);

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
					'resolution_params' => array('gehaltsbestandteil_id' => $dataObj->gehaltsbestandteil_id),
					'fehlertext_params' => array('gehaltsbestandteil_id' => $dataObj->gehaltsbestandteil_id)
				);
			}
		}

		return success($results);
	}
}
