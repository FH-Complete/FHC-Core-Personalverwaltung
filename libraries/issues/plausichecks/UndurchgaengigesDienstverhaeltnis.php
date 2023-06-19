<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Dienstverhältnisse should not have time gaps between the Vertragsbestandteile.
 */
class UndurchgaengigesDienstverhaeltnis extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$vertragsbestandteil_id = isset($params['vertragsbestandteil_id']) ? $params['vertragsbestandteil_id'] : null;

		// get employee data
		$result = $this->getUndurchgaengigeDienstverhaeltnisse($person_id, $vertragsbestandteil_id);

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
	 * There shouldn't be any time gaps in any Dienstverhaeltnis.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getUndurchgaengigeDienstverhaeltnisse($person_id = null, $vertragsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			WITH dienstverhaeltnisse AS (
				SELECT ben.person_id, dv.dienstverhaeltnis_id, vtb.vertragsbestandteil_id,
					dv.von AS dv_von, COALESCE(dv.bis, '9999-12-31') AS dv_bis,
					vtb.von AS vtb_von, COALESCE(vtb.bis, '9999-12-31') AS vtb_bis,
					dv.oe_kurzbz, RANK() OVER(PARTITION BY dienstverhaeltnis_id ORDER BY vtb.von, vtb.insertamum) AS reihenfolge
				FROM
					public.tbl_benutzer ben
					JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
					JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
					JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
				WHERE
					vtb.vertragsbestandteiltyp_kurzbz IN ('stunden')";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		$qry.=
			"
				ORDER BY
					vtb.von
			)
			SELECT *
			FROM
				dienstverhaeltnisse dvs
			WHERE
			(
				NOT EXISTS (
					SELECT 1
					FROM
						dienstverhaeltnisse dvss
					WHERE
						(-- there is no following vertragsbestandteil
							dvs.vertragsbestandteil_id <> dvss.vertragsbestandteil_id
							AND dvs.dienstverhaeltnis_id = dvss.dienstverhaeltnis_id
							AND dvss.vtb_von <= dvs.vtb_bis + INTERVAL '1 day'
							AND dvss.vtb_bis > dvs.vtb_bis
						)
						-- and it's not the end of dienstverhaeltnis
						OR dvs.vtb_bis = dvs.dv_bis
				)
				OR (dvs.reihenfolge = 1 AND dvs.vtb_von > dvs.dv_von) -- or time gap at beginning of dienstverhaeltnis
			)";

		if (isset($vertragsbestandteil_id))
		{
			$qry .= " AND dvs.vertragsbestandteil_id = ?";
			$params[] = $vertragsbestandteil_id;
		}

		$qry .= "
			ORDER BY
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
