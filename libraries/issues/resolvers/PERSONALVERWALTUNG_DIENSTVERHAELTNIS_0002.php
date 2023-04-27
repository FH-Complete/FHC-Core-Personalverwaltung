<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'extensions/FHC-Core-Personalverwaltung/libraries/issues/PersonalverwaltungPlausicheckLib.php';

/**
 * Dienstverhältnisse should not have time gaps between the Vertragsbestandteile.
 */
class PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0002 implements IIssueResolvedChecker
{
	public function checkIfIssueIsResolved($params)
	{
		if (!isset($params['issue_person_id']) || !is_numeric($params['issue_person_id']))
			return error('Person Id missing, issue_id: '.$params['issue_id']);

		if (!isset($params['vertragsbestandteil_id']) || !is_numeric($params['vertragsbestandteil_id']))
			return error('Vertragsbestandteil Id missing, issue_id: '.$params['issue_id']);

		$this->_ci =& get_instance(); // get code igniter instance

		$this->_ci->load->library('PersonalverwaltungPlausicheckLib');

		// check if issue persists
		$checkRes = $this->_ci->personalverwaltungplausichecklib->getUndurchgaengigeDienstverhaeltnisse(
			$params['issue_person_id'],
			$params['vertragsbestandteil_id']
		);

		if (isError($checkRes)) return $checkRes;

		if (hasData($checkRes))
			return success(false); // not resolved if issue is still present
		else
			return success(true); // resolved otherwise
	}
}
