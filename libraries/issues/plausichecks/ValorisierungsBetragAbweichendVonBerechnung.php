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

		$dienstverhaeltnis_id = isset($params['dienstverhaeltnis_id']) ? $params['dienstverhaeltnis_id'] : null;

		$dv_id_arr = [];

		// if dv id provided, use the id
		if (isset($dienstverhaeltnis_id))
		{
			$dv_id_arr[] = $dienstverhaeltnis_id;
		}
		else // otherwise get all dvs for current date
		{
			$dvRes = $this->_ci->ValorisierungAPI_model->getDVsForValorisation(date("Y-m-d"));

			// If error occurred then return the error
			if (isError($dvRes)) return $dvRes;

			if (hasData($dvRes)) $dv_id_arr = array_column(getData($dvRes), 'dienstverhaeltnis_id');
		}

		$valorisationData = $this->_ci->ValorisierungCheckLib->getValorisationDataForCheck($dv_id_arr);


		// check that valorisationData is valid
		if (!isset($valorisationData['historie'])
			|| !is_array($valorisationData['historie'])
			|| !isset($valorisationData['calculated'])
			|| !is_array($valorisationData['calculated']))
			return error('Invalid valorisation check data');

		$gehaltsbestandteil_id_arr = array_unique(
			array_merge(array_keys($valorisationData['historie']), array_keys($valorisationData['calculated']))
		);

		// for each gehaltsbestandteil id in history or dvs
		foreach ($gehaltsbestandteil_id_arr as $geh_id)
		{
			// if there are differences
			if (!isset($valorisationData['historie'][$geh_id])
				|| !isset($valorisationData['calculated'][$geh_id])
				|| $valorisationData['historie'][$geh_id] != $valorisationData['calculated'][$geh_id])
			{
				// write issue with data of gehaltsbestandteil
				$issueData = $this->_getIssueDataFromGehaltsbestandteil($geh_id);
				if (isset($issueData))
				{
					$results[] = array(
							'person_id' => $issueData->person_id,
							'resolution_params' => array('dienstverhaeltnis_id' => $issueData->dienstverhaeltnis_id),
							'fehlertext_params' => array('gehaltsbestandteil_id' => $issueData->gehaltsbestandteil_id)
					);
				}
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
