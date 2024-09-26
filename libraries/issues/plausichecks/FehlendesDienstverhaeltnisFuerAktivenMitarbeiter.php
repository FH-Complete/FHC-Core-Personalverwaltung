<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Active employees should have Dienstverhältnis
 */
class FehlendesDienstverhaeltnisFuerAktivenMitarbeiter extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;

		// get employee data
		$result = $this->getFehlendesDienstverhaeltnisFuerAktivenMitarbeiter(
			$person_id
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
					'fehlertext_params' => array(
						'mitarbeiter_uid' => $dataObj->mitarbeiter_uid
					)
				);
			}
		}

		return success($results);
	}

	/**
	 * There shouldn't be employees with active user but no Dienstverhältnis.
	 * @param person_id
	 * @return success with data or error
	 */
	public function getFehlendesDienstverhaeltnisFuerAktivenMitarbeiter($person_id = null)
	{
		$params = array();

		$qry = "
				SELECT
					DISTINCT ma.mitarbeiter_uid, pers.vorname, pers.nachname, pers.person_id
				FROM
					public.tbl_mitarbeiter ma
					JOIN tbl_benutzer ben ON ma.mitarbeiter_uid = ben.uid
					JOIN tbl_person pers USING (person_id)
				WHERE
					ben.aktiv
					AND ma.bismelden
					AND ma.personalnummer > 0
					AND NOT EXISTS (
						SELECT 1
						FROM
							hr.tbl_dienstverhaeltnis
						WHERE
							(bis > NOW() OR bis IS NULL)
							AND mitarbeiter_uid = ma.mitarbeiter_uid
					)";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		$qry .= "
			ORDER BY
				vorname, nachname";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
