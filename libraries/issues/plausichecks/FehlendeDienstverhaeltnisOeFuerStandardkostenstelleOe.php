<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';
require_once APPPATH.'extensions/FHC-Core-Personalverwaltung/libraries/issues/PersonalverwaltungPlausicheckLib.php';

/**
 * Dienstverhältnis shouldn't have a wrong Organisationseinheit (company oe) for a Standardkostenstelle.
 */
class FehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$this->_ci->load->library('PersonalverwaltungPlausicheckLib');
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$benutzerfunktion_id = isset($params['benutzerfunktion_id']) ? $params['benutzerfunktion_id'] : null;

		// get employee data
		$result = $this->_ci->personalverwaltungplausichecklib->getFehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe(
			$person_id,
			$benutzerfunktion_id
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
					'resolution_params' => array('benutzerfunktion_id' => $dataObj->benutzerfunktion_id),
					'fehlertext_params' => array(
						'benutzerfunktion_id' => $dataObj->benutzerfunktion_id,
						'oe_kurzbz' => $dataObj->oe_kurzbz
					)
				);
			}
		}

		return success($results);
	}
}
