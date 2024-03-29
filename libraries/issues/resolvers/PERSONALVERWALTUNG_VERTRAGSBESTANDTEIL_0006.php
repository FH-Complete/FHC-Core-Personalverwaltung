<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');



/**
 * Vertragsbestandteil of a certain type shouldn't have the wrong "additional" table.
 */
class PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0006 implements IIssueResolvedChecker
{
	public function checkIfIssueIsResolved($params)
	{
		if (!isset($params['issue_person_id']) || !is_numeric($params['issue_person_id']))
			return error('Person Id missing, issue_id: '.$params['issue_id']);

		if (!isset($params['vertragsbestandteil_id']) || !is_numeric($params['vertragsbestandteil_id']))
			return error('Vertragsbestandteil Id missing, issue_id: '.$params['issue_id']);

		if (!isset($params['vertragsbestandteiltyp_kurzbz']))
			return error('Vertragsbestandteiltyp missing, issue_id: '.$params['issue_id']);

		$this->_ci =& get_instance(); // get code igniter instance

		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/issues/plausichecks/VertragsbestandteilFalscheZusatztabelle');

		// check if issue persists
		$checkRes = $this->_ci->vertragsbestandteilfalschezusatztabelle->getVertragsbestandteilFalscheZusatztabelle(
			$params['issue_person_id'],
			$params['vertragsbestandteil_id'],
			$params['vertragsbestandteiltyp_kurzbz']
		);

		if (isError($checkRes)) return $checkRes;

		if (hasData($checkRes))
			return success(false); // not resolved if issue is still present
		else
			return success(true); // resolved otherwise
	}
}
