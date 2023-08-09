<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Vertragsbestandteil start should not be before Dienstverhaeltnis start.
 */
class VertragsbestandteilStartBeforeDienstverhaeltnis extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$vertragsbestandteil_id = isset($params['vertragsbestandteil_id']) ? $params['vertragsbestandteil_id'] : null;

		// get employee data
		$result = $this->getVertragsbestandteilStartBeforeDienstverhaeltnis(
			$person_id,
			$vertragsbestandteil_id
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
					'resolution_params' => array('vertragsbestandteil_id' => $dataObj->vertragsbestandteil_id),
					'fehlertext_params' => array('vertragsbestandteil_id' => $dataObj->vertragsbestandteil_id)
				);
			}
		}

		return success($results);
	}

	/**
	 * Von Datum of Vertragsbestandteil shouldn't be before Dienstverhaeltnis start.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getVertragsbestandteilStartBeforeDienstverhaeltnis($person_id = null, $vertragsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
			WHERE
				vtb.von < dv.von
			";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		if (isset($vertragsbestandteil_id))
		{
			$qry .= " AND vtb.vertragsbestandteil_id = ?";
			$params[] = $vertragsbestandteil_id;
		}

		$qry .= "
			ORDER BY
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
