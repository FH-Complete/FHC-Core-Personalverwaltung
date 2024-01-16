<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

//require_once APPPATH.'extensions/FHC-Core-Personalverwaltung/libraries/issues/plausichecks/ParalelleDienstverhaeltnisseEinUnternehmen.php';

/**
 * Dienstverhältnisse should not run in paralell at same company (oe).
 */
class PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001 implements IIssueResolvedChecker
{
	public function checkIfIssueIsResolved($params)
	{
		if (!isset($params['issue_person_id']) || !is_numeric($params['issue_person_id']))
			return error('Person Id missing, issue_id: '.$params['issue_id']);

		if (!isset($params['erste_dienstverhaeltnis_id']) || !is_numeric($params['erste_dienstverhaeltnis_id']))
			return error('First Dienstverhaeltnis Id missing, issue_id: '.$params['issue_id']);

		if (!isset($params['zweite_dienstverhaeltnis_id']) || !is_numeric($params['zweite_dienstverhaeltnis_id']))
			return error('Second Dienstverhaeltnis Id missing, issue_id: '.$params['issue_id']);

		$erste_vertragsbestandteil_id = null;
		$zweite_vertragsbestandteil_id = null;
		if (isset($params['erste_vertragsbestandteil_id']) && isset($params['zweite_vertragsbestandteil_id']))
		{
			$erste_vertragsbestandteil_id = $params['erste_vertragsbestandteil_id'];
			$zweite_vertragsbestandteil_id = $params['zweite_vertragsbestandteil_id'];
		}

		$this->_ci =& get_instance(); // get code igniter instance

		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/issues/plausichecks/ParalelleDienstverhaeltnisseEinUnternehmen');

		// check if issue persists
		$checkRes = $this->_ci->paralelledienstverhaeltnisseeinunternehmen->getParalelleDienstverhaeltnisseEinUnternehmen(
			$params['issue_person_id'],
			$params['erste_dienstverhaeltnis_id'],
			$params['zweite_dienstverhaeltnis_id'],
			$erste_vertragsbestandteil_id,
			$zweite_vertragsbestandteil_id
		);

		if (isError($checkRes)) return $checkRes;

		if (hasData($checkRes))
			return success(false); // not resolved if issue is still present
		else
			return success(true); // resolved otherwise
	}
}
