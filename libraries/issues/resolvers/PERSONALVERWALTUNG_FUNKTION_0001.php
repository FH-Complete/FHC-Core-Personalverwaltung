<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');



/**
 * Uid of Funktion should be the same as uid from Dienstverhältnis.
 */
class PERSONALVERWALTUNG_FUNKTION_0001 implements IIssueResolvedChecker
{
	public function checkIfIssueIsResolved($params)
	{
		if (!isset($params['issue_person_id']) || !is_numeric($params['issue_person_id']))
			return error('Person Id missing, issue_id: '.$params['issue_id']);

		if (!isset($params['dienstverhaeltnis_id']) || !is_numeric($params['dienstverhaeltnis_id']))
			return error('Dienstverhältnis Id missing, issue_id: '.$params['issue_id']);

		$this->_ci =& get_instance(); // get code igniter instance

		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/issues/plausichecks/FunktionUidUngleichDienstverhaeltnisUid');

		// check if issue persists
		$checkRes = $this->_ci->funktionuidungleichdienstverhaeltnisuid->getFunktionUidUngleichDienstverhaeltnisUid(
			$params['issue_person_id'],
			$params['dienstverhaeltnis_id']
		);

		if (isError($checkRes)) return $checkRes;

		if (hasData($checkRes))
			return success(false); // not resolved if issue is still present
		else
			return success(true); // resolved otherwise
	}
}
