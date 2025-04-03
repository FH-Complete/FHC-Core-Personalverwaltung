<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Dienstverhältnis of Gehaltsbestandteil shouldn't be different than dienstverhältnis of assigned Vertragsbestandteil.
 */
class VerschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$gehaltsbestandteil_id = isset($params['gehaltsbestandteil_id']) ? $params['gehaltsbestandteil_id'] : null;
		$vertragsbestandteil_id = isset($params['vertragsbestandteil_id']) ? $params['vertragsbestandteil_id'] : null;

		// get employee data
		$result = $this->getVerschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil(
			$person_id,
			$gehaltsbestandteil_id,
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
					'resolution_params' => array(
						'gehaltsbestandteil_id' => $dataObj->gehaltsbestandteil_id,
						'vertragsbestandteil_id' => $dataObj->vertragsbestandteil_id
					),
					'fehlertext_params' => array(
						'gehaltsbestandteil_id' => $dataObj->gehaltsbestandteil_id,
						'vertragsbestandteil_id' => $dataObj->vertragsbestandteil_id
					)
				);
			}
		}

		return success($results);
	}

	/**
	 * Gehaltsbestandteil sholdn't be assigned to a Vertragsbestandteil with a different Dienstverhältnis.
	 * @param person_id
	 * @param gehaltsbestandteil_id Gehaltsbestandteil violating the plausicheck
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getVerschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil(
		$person_id = null,
		$gehaltsbestandteil_id = null,
		$vertragsbestandteil_id = null
	) {
		$params = array();

		$qry = "
			SELECT
				ben.person_id, dv.dienstverhaeltnis_id, geh.gehaltsbestandteil_id, vtb.vertragsbestandteil_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_gehaltsbestandteil geh USING (dienstverhaeltnis_id)
				JOIN hr.tbl_vertragsbestandteil vtb ON geh.vertragsbestandteil_id = vtb.vertragsbestandteil_id
			WHERE
				geh.dienstverhaeltnis_id <> vtb.dienstverhaeltnis_id";

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

		if (isset($vertragsbestandteil_id))
		{
			$qry .= " AND vtb.vertragsbestandteil_id = ?";
			$params[] = $vertragsbestandteil_id;
		}

		$qry .= "
			ORDER BY
				person_id, dienstverhaeltnis_id, gehaltsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
