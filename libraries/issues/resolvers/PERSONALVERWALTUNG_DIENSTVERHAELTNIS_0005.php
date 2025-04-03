<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');



/**
 * Active employees should have Dienstverhältnis.
 */
class PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0005 implements IIssueResolvedChecker
{
	public function checkIfIssueIsResolved($params)
	{
		if (!isset($params['issue_person_id']) || !is_numeric($params['issue_person_id']))
			return error('Person Id missing, issue_id: '.$params['issue_id']);

		$this->_ci =& get_instance(); // get code igniter instance

		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/issues/plausichecks/FehlendesDienstverhaeltnisFuerAktivenMitarbeiter');

		// check if issue persists
		$checkRes = $this->_ci->fehlendesdienstverhaeltnisfueraktivenmitarbeiter->getFehlendesDienstverhaeltnisFuerAktivenMitarbeiter(
			$params['issue_person_id']
		);

		if (isError($checkRes)) return $checkRes;

		if (hasData($checkRes))
			return success(false); // not resolved if issue is still present
		else
			return success(true); // resolved otherwise
	}
}
