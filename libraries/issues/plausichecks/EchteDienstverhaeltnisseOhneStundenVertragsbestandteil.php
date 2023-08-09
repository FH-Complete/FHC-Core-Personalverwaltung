<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Dienstverhältnisse with type "echterdv" should have Vertragsbestandteil with type "stunden".
 */
class EchteDienstverhaeltnisseOhneStundenVertragsbestandteil extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$dienstverhaeltnis_id = isset($params['dienstverhaeltnis_id']) ? $params['dienstverhaeltnis_id'] : null;

		// get employee data
		$result = $this->getEchteDienstverhaeltnisseOhneStundenVertragsbestandteil(
			$person_id,
			$dienstverhaeltnis_id
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
					'resolution_params' => array('dienstverhaeltnis_id' => $dataObj->dienstverhaeltnis_id),
					'fehlertext_params' => array('dienstverhaeltnis_id' => $dataObj->dienstverhaeltnis_id)
				);
			}
		}

		return success($results);
	}

	/**
	 * "Echte" Dienstverhaeltnisse should have a Vertragsbestandteil with "stunden" type.
	 * @param person_id
	 * @param dienstverhaeltnis_id Dienstverhaeltnis violating the plausicheck
	 * @return success with data or error
	 */
	public function getEchteDienstverhaeltnisseOhneStundenVertragsbestandteil($person_id = null, $dienstverhaeltnis_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				person_id, dienstverhaeltnis_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
			WHERE
				vertragsart_kurzbz = 'echterdv'
				AND NOT EXISTS (
					SELECT 1
					FROM
						hr.tbl_vertragsbestandteil
					WHERE
						dienstverhaeltnis_id = dv.dienstverhaeltnis_id
						AND vertragsbestandteiltyp_kurzbz = 'stunden'
				)";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		if (isset($dienstverhaeltnis_id))
		{
			$qry .= " AND dv.dienstverhaeltnis_id = ?";
			$params[] = $dienstverhaeltnis_id;
		}

		$qry .= "
			ORDER BY
				person_id, dienstverhaeltnis_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
