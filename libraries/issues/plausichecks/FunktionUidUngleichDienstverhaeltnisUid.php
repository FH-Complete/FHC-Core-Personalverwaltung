<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';
require_once APPPATH.'extensions/FHC-Core-Personalverwaltung/libraries/issues/PersonalverwaltungPlausicheckLib.php';

/**
 * Uid of Funktion should be the same as uid from Dienstverhältnis.
 */
class FunktionUidUngleichDienstverhaeltnisUid extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$this->_ci->load->library('PersonalverwaltungPlausicheckLib');
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$dienstverhaeltnis_id = isset($params['dienstverhaeltnis_id']) ? $params['dienstverhaeltnis_id'] : null;

		// get employee data
		$result = $this->_ci->personalverwaltungplausichecklib->getFunktionUidUngleichDienstverhaeltnisUid($person_id, $dienstverhaeltnis_id);

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
					'resolution_params' => array('dienstverhaeltnis_id' => $dataObj->dienstverhaeltnis_id),
					'fehlertext_params' => array(
						'dienstverhaeltnis_id' => $dataObj->dienstverhaeltnis_id,
						'benutzerfunktion_id' => $dataObj->benutzerfunktion_id
					)
				);
			}
		}

		return success($results);
	}
}
