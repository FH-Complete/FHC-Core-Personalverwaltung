<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Grundgehalt should be assigned to a Vertragsbestandteil with type "stunden".
 */
class GrundgehaltKeinemStundenVertragsbestandteilZugewiesen extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$gehaltsbestandteil_id = isset($params['gehaltsbestandteil_id']) ? $params['gehaltsbestandteil_id'] : null;

		// get employee data
		$result = $this->getGrundgehaltKeinemStundenVertragsbestandteilZugewiesen(
			$person_id,
			$gehaltsbestandteil_id
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
					'resolution_params' => array('gehaltsbestandteil_id' => $dataObj->gehaltsbestandteil_id),
					'fehlertext_params' => array('gehaltsbestandteil_id' => $dataObj->gehaltsbestandteil_id)
				);
			}
		}

		return success($results);
	}

	/**
	 * Grundgehalt should be assigned to "stunden" Vertragsbestandteil.
	 * @param person_id
	 * @param gehaltsbestandteil_id Gehaltsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getGrundgehaltKeinemStundenVertragsbestandteilZugewiesen($person_id = null, $gehaltsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				person_id, dv.dienstverhaeltnis_id, vtb.vertragsbestandteil_id, geh.gehaltsbestandteil_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_gehaltsbestandteil geh USING (dienstverhaeltnis_id)
				LEFT JOIN hr.tbl_vertragsbestandteil vtb USING (vertragsbestandteil_id)
			WHERE
				geh.gehaltstyp_kurzbz = 'grundgehalt'
				AND (vtb.vertragsbestandteil_id IS NULL OR vtb.vertragsbestandteiltyp_kurzbz <> 'stunden')";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		if (isset($gehaltsbestandteil_id))
		{
			$qry .= " AND geh.gehaltsbestandteil_id = ?";
			$params[] = $gehaltsbestandteil_id;
		}

		$qry .= "
			ORDER BY
				person_id, dv.dienstverhaeltnis_id, vtb.vertragsbestandteil_id, geh.gehaltsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
