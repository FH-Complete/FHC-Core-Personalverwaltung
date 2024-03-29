<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');



/**
 * Vertragsbestandteile of type "freitext" should not overlap.
 */
class PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0004 implements IIssueResolvedChecker
{
	public function checkIfIssueIsResolved($params)
	{
		if (!isset($params['issue_person_id']) || !is_numeric($params['issue_person_id']))
			return error('Person Id missing, issue_id: '.$params['issue_id']);

		if (!isset($params['erste_vertragsbestandteil_id']) || !is_numeric($params['erste_vertragsbestandteil_id']))
			return error('First vertragsbestandteil Id missing, issue_id: '.$params['issue_id']);

		if (!isset($params['zweite_vertragsbestandteil_id']) || !is_numeric($params['zweite_vertragsbestandteil_id']))
			return error('Second vertragsbestandteil Id missing, issue_id: '.$params['issue_id']);

		$this->_ci =& get_instance(); // get code igniter instance

		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/issues/plausichecks/UeberlappendeFreitextVertragsbestandteile');

		// check if issue persists
		$checkRes = $this->_ci->ueberlappendefreitextvertragsbestandteile->getUeberlappendeFreitextVertragsbestandteile(
			$params['issue_person_id'],
			$params['erste_vertragsbestandteil_id'],
			$params['zweite_vertragsbestandteil_id']
		);

		if (isError($checkRes)) return $checkRes;

		if (hasData($checkRes))
			return success(false); // not resolved if issue is still present
		else
			return success(true); // resolved otherwise
	}
}
