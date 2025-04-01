<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Amount in Valorisierung history should be the same as newly calculated, starting from Grundbetrag.
 */
class ValorisierungsBetragAbweichendVonBerechnung extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		// load authentication helper because Valorisierungs classes use authUid, and plausichecks can be executed from command line
		$this->_ci->load->helper('hlp_authentication');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Gehaltshistorie_model', 'GehaltshistorieModel');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Gehaltshistorie_model', 'GehaltshistorieModel');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungAPI_model');
		$this->_ci->load->model('vertragsbestandteil/Gehaltsbestandteil_model', 'GehaltsbestandteilModel');
		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungCheckLib', null, 'ValorisierungCheckLib');

		$results = [];

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$dienstverhaeltnis_id = isset($params['dienstverhaeltnis_id']) ? $params['dienstverhaeltnis_id'] : null;

		$dvIdArr = [];

		// if dv id provided, use the id
		if (isset($dienstverhaeltnis_id))
		{
			$dvIdArr[] = $dienstverhaeltnis_id;
		}
		else // otherwise get all dvs for current date
		{
			$dvRes = $this->_ci->ValorisierungAPI_model->getDVsForValorisation(date("Y-m-d"), null, $person_id);

			// If error occurred then return the error
			if (isError($dvRes)) return $dvRes;

			if (hasData($dvRes)) $dvIdArr = array_column(getData($dvRes), 'dienstverhaeltnis_id');
		}

		if( $person_id !== null && count($dvIdArr) === 0 )
		{
			//specific person but currently no active dvs
			return success(array());
		}

		$invalidGehaltsbestandteile = $this->_ci->ValorisierungCheckLib->getInvalidGehaltsbestandteile($dvIdArr);

		foreach ($invalidGehaltsbestandteile as $gehaltsbestandteil_id)
		{
			$issueData = $this->_getIssueDataFromGehaltsbestandteil($gehaltsbestandteil_id);
			if (isset($issueData))
			{
				$results[] = array(
						'person_id' => $issueData->person_id,
						'resolution_params' => array('dienstverhaeltnis_id' => $issueData->dienstverhaeltnis_id),
						'fehlertext_params' => array('gehaltsbestandteil_id' => $issueData->gehaltsbestandteil_id)
				);
			}
		}

		return success($results);
	}

	private function _getIssueDataFromGehaltsbestandteil($gehaltsbestandteil_id)
	{
		$dataObj = null;

		$this->_ci->GehaltsbestandteilModel->addSelect('dienstverhaeltnis_id, gehaltsbestandteil_id, person_id');
		$this->_ci->GehaltsbestandteilModel->addJoin('hr.tbl_dienstverhaeltnis dv', 'dienstverhaeltnis_id');
		$this->_ci->GehaltsbestandteilModel->addJoin('public.tbl_benutzer ben', 'dv.mitarbeiter_uid = ben.uid');
		$result = $this->_ci->GehaltsbestandteilModel->loadWhere(array('gehaltsbestandteil_id' => $gehaltsbestandteil_id));

		if (hasData($result))
		{
			$data = getData($result)[0];
			$dataObj = new stdClass();
			$dataObj->gehaltsbestandteil_id = $data->gehaltsbestandteil_id;
			$dataObj->dienstverhaeltnis_id = $data->dienstverhaeltnis_id;
			$dataObj->person_id = $data->person_id;
		}

		return $dataObj;
	}
}
