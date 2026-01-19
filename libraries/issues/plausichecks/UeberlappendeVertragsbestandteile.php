<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Vertragsbestandteile with same type should not overlap.
 */
class UeberlappendeVertragsbestandteile extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$erste_vertragsbestandteil_id = isset($params['erste_vertragsbestandteil_id']) ? $params['erste_vertragsbestandteil_id'] : null;
		$zweite_vertragsbestandteil_id = isset($params['zweite_vertragsbestandteil_id']) ? $params['zweite_vertragsbestandteil_id'] : null;

		// get employee data
		$result = $this->getUeberlappendeVertragsbestandteile(
			$person_id,
			$erste_vertragsbestandteil_id,
			$zweite_vertragsbestandteil_id
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
						'erste_vertragsbestandteil_id' => $dataObj->erste_vertragsbestandteil_id,
						'zweite_vertragsbestandteil_id' => $dataObj->zweite_vertragsbestandteil_id
					),
					'fehlertext_params' => array(
						'erste_vertragsbestandteil_id' => $dataObj->erste_vertragsbestandteil_id,
						'zweite_vertragsbestandteil_id' => $dataObj->zweite_vertragsbestandteil_id
					)
				);
			}
		}

		return success($results);
	}

	/**
	 * Vertragsbestandteile of a Dienstverhältnis which are marked as not overlapping and are of same type should not overlap in time.
	 * @param person_id
	 * @param erste_vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @param zweite_vertragsbestandteil_id Vertragsbestandteil violating the plausicheck, overlapping with first
	 * @return success with data or error
	 */
	public function getUeberlappendeVertragsbestandteile(
		$person_id = null,
		$erste_vertragsbestandteil_id = null,
		$zweite_vertragsbestandteil_id = null
	) {
		$params = array();

		$qry = "
			WITH vertragsbestandteile AS (
				SELECT
					ben.person_id, dv.dienstverhaeltnis_id,
					vtb.vertragsbestandteil_id, vtb.vertragsbestandteiltyp_kurzbz, dv.oe_kurzbz,
					dv.von AS dv_von, COALESCE(dv.bis, '9999-12-31') AS dv_bis,
					vtb.von AS vtb_von, COALESCE(vtb.bis, '9999-12-31') AS vtb_bis
				FROM
					public.tbl_benutzer ben
					JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
					JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
					JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
					JOIN hr.tbl_vertragsbestandteiltyp vtb_typ USING (vertragsbestandteiltyp_kurzbz)
				WHERE
					vtb_typ.ueberlappend = FALSE";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		$qry.= "
			)
			SELECT
				DISTINCT vtbs.person_id, vtbs.dv_von, vtbs.dienstverhaeltnis_id,
				LEAST(vtbs.vertragsbestandteil_id, vtbss.vertragsbestandteil_id) AS erste_vertragsbestandteil_id,
				GREATEST(vtbs.vertragsbestandteil_id, vtbss.vertragsbestandteil_id) AS zweite_vertragsbestandteil_id
			FROM
				vertragsbestandteile vtbs, vertragsbestandteile vtbss
			WHERE /* there is overlapping vertragsbestandteil */
			(
				vtbs.dienstverhaeltnis_id = vtbss.dienstverhaeltnis_id -- same Dienstverhaeltnis
				AND vtbs.vertragsbestandteil_id <> vtbss.vertragsbestandteil_id -- different Vertragsbestandteil
				AND vtbs.vertragsbestandteiltyp_kurzbz = vtbss.vertragsbestandteiltyp_kurzbz -- same type
				AND (vtbss.vtb_von <= vtbs.vtb_bis AND vtbss.vtb_bis >= vtbs.vtb_von) -- overlap
			)";

		if (isset($erste_vertragsbestandteil_id) && isset($zweite_vertragsbestandteil_id))
		{
			$qry .= " AND vtbs.vertragsbestandteil_id = ?";
			$params[] = $erste_vertragsbestandteil_id;

			$qry .= " AND vtbss.vertragsbestandteil_id = ?";
			$params[] = $zweite_vertragsbestandteil_id;
		}

		$qry .= "
			ORDER BY
				vtbs.person_id, vtbs.dienstverhaeltnis_id, erste_vertragsbestandteil_id, zweite_vertragsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
