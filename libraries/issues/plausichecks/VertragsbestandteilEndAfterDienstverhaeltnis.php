<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Vertragsbestandteil end should not be after Dienstverhaeltnis end.
 */
class VertragsbestandteilEndAfterDienstverhaeltnis extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$vertragsbestandteil_id = isset($params['vertragsbestandteil_id']) ? $params['vertragsbestandteil_id'] : null;

		// get employee data
		$result = $this->getVertragsbestandteilEndAfterDienstverhaeltnis($person_id, $vertragsbestandteil_id);

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
	 * Bis Datum of Vertragsbestandteil shouldn't be after Dienstverhaeltnis end.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getVertragsbestandteilEndAfterDienstverhaeltnis($person_id = null, $vertragsbestandteil_id = null)
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
				dv.bis IS NOT NULL -- null means 'unlimited' with no end.
				AND (vtb.bis > dv.bis OR vtb.bis IS NULL)
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
