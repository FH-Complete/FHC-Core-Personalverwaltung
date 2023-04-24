<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';
require_once APPPATH.'extensions/FHC-Core-Personalverwaltung/libraries/issues/PersonalverwaltungPlausicheckLib.php';

/**
 * Vertragsbestandteile of type "freitext" should not overlap.
 */
class UeberlappendeFreitextVertragsbestandteile extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$this->_ci->load->library('PersonalverwaltungPlausicheckLib');
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$erste_vertragsbestandteil_id = isset($params['erste_vertragsbestandteil_id']) ? $params['erste_vertragsbestandteil_id'] : null;
		$zweite_vertragsbestandteil_id = isset($params['zweite_vertragsbestandteil_id']) ? $params['zweite_vertragsbestandteil_id'] : null;

		// get employee data
		$result = $this->_ci->personalverwaltungplausichecklib->getUeberlappendeFreitextVertragsbestandteile(
			$person_id,
			$erste_vertragsbestandteil_id,
			$zweite_vertragsbestandteil_id
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
						'erste_vertragsbestandteil_id' => $dataObj->erste_vertragsbestandteil_id,
						'zweite_vertragsbestandteil_id' => $dataObj->zweite_vertragsbestandteil_id
					),
					'fehlertext_params' => array(
						'erste_vertragsbestandteil_id' => $dataObj->erste_vertragsbestandteil_id,
						'zweite_vertragsbestandteil_id' => $dataObj->zweite_vertragsbestandteil_id
					)
				);
			}
		}

		return success($results);
	}
}
