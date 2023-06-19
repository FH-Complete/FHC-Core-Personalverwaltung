<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Dienstverhältnisse should not run in paralell at same company (oe).
 */
class ParalelleDienstverhaeltnisseEinUnternehmen extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$erste_dienstverhaeltnis_id = isset($params['erste_dienstverhaeltnis_id']) ? $params['erste_dienstverhaeltnis_id'] : null;
		$zweite_dienstverhaeltnis_id = isset($params['zweite_dienstverhaeltnis_id']) ? $params['zweite_dienstverhaeltnis_id'] : null;
		$erste_vertragsbestandteil_id = isset($params['erste_vertragsbestandteil_id']) ? $params['erste_vertragsbestandteil_id'] : null;
		$zweite_vertragsbestandteil_id = isset($params['zweite_vertragsbestandteil_id']) ? $params['zweite_vertragsbestandteil_id'] : null;

		// get employee data
		$result = $this->getParalelleDienstverhaeltnisseEinUnternehmen(
			$person_id,
			$erste_dienstverhaeltnis_id,
			$zweite_dienstverhaeltnis_id,
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
						'erste_dienstverhaeltnis_id' => $dataObj->erste_dienstverhaeltnis_id,
						'zweite_dienstverhaeltnis_id' => $dataObj->zweite_dienstverhaeltnis_id,
						'erste_vertragsbestandteil_id' => $dataObj->erste_vertragsbestandteil_id,
						'zweite_vertragsbestandteil_id' => $dataObj->zweite_vertragsbestandteil_id
					),
					'fehlertext_params' => array(
						'erste_dienstverhaeltnis_id' => $dataObj->erste_dienstverhaeltnis_id,
						'zweite_dienstverhaeltnis_id' => $dataObj->zweite_dienstverhaeltnis_id,
						'erste_vertragsbestandteil_id' => isset($dataObj->erste_vertragsbestandteil_id)
							? $dataObj->erste_vertragsbestandteil_id
							: 'N/A',
						'zweite_vertragsbestandteil_id' => isset($dataObj->zweite_vertragsbestandteil_id)
							? $dataObj->zweite_vertragsbestandteil_id
							: 'N/A'
					)
				);
			}
		}

		return success($results);
	}

	/**
	 * There shouldn't be any Dienstverhaeltnisse running in paralell for a person in the same company.
	 * This means: either Dienstverhaeltnis time span or Vertragsbestandteil time span overlap.
	 * @param person_id
	 * @param erste_dienstverhaeltnis_id Dienstverhaeltnis violating the plausicheck
	 * @param zweite_dienstverhaeltnis_id Dienstverhaeltnis violating the plausicheck, overlapping with first
	 * @param erste_vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @param zweite_vertragsbestandteil_id Vertragsbestandteil violating the plausicheck, overlapping with first
	 * @return success with data or error
	 */
	public function getParalelleDienstverhaeltnisseEinUnternehmen(
		$person_id = null,
		$erste_dienstverhaeltnis_id = null,
		$zweite_dienstverhaeltnis_id = null,
		$erste_vertragsbestandteil_id = null,
		$zweite_vertragsbestandteil_id = null
	) {
		$params = array();

		$qry = "
			WITH dienstverhaeltnisse AS (
				SELECT
					ben.person_id, dv.dienstverhaeltnis_id, vtb.vertragsbestandteil_id, dv.oe_kurzbz, vtb.vertragsbestandteiltyp_kurzbz,
					vtb.von AS vtb_von, COALESCE(vtb.bis, '9999-12-31') AS vtb_bis, dv.von AS dv_von, COALESCE(dv.bis, '9999-12-31') AS dv_bis
				FROM
					public.tbl_benutzer ben
					JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
					JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
					LEFT JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
				WHERE
					vertragsbestandteiltyp_kurzbz IS NULL OR vertragsbestandteiltyp_kurzbz NOT IN ('karenz')";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		$qry.=
			")
			SELECT
				DISTINCT person_id,
				LEAST(erste_dienstverhaeltnis_id, zweite_dienstverhaeltnis_id) AS erste_dienstverhaeltnis_id,
				GREATEST(erste_dienstverhaeltnis_id, zweite_dienstverhaeltnis_id) AS zweite_dienstverhaeltnis_id,
				CASE
					WHEN
						paralelle_vtb = TRUE
					THEN
						LEAST(erste_vertragsbestandteil_id, zweite_vertragsbestandteil_id)
					ELSE
						NULL
				END AS erste_vertragsbestandteil_id,
				CASE
					WHEN
						paralelle_vtb = TRUE
					THEN
						GREATEST(erste_vertragsbestandteil_id, zweite_vertragsbestandteil_id)
					ELSE
						NULL
				END AS zweite_vertragsbestandteil_id
			FROM
			(
				SELECT
					dvs.person_id,
					dvs.dienstverhaeltnis_id AS erste_dienstverhaeltnis_id, dvss.dienstverhaeltnis_id AS zweite_dienstverhaeltnis_id,
					dvs.vertragsbestandteil_id AS erste_vertragsbestandteil_id, dvss.vertragsbestandteil_id AS zweite_vertragsbestandteil_id,
					dvs.dv_von AS erstes_dv_von, dvss.dv_von AS zweites_dv_von,
					dvs.vtb_von AS erstes_vtb_von, dvss.vtb_von AS zweites_vtb_von,
					dvs.dv_bis AS erstes_dv_bis, dvss.dv_bis AS zweites_dv_bis,
					dvs.vtb_bis AS erstes_vtb_bis, dvss.vtb_bis AS zweites_vtb_bis,
					(dvss.vtb_von <= dvs.vtb_bis AND dvss.vtb_bis >= dvs.vtb_von) AS paralelle_vtb
				FROM
					dienstverhaeltnisse dvs, dienstverhaeltnisse dvss
				WHERE
					dvss.dienstverhaeltnis_id <> dvs.dienstverhaeltnis_id -- different dienstverhaeltnis
					AND dvss.person_id = dvs.person_id -- same person
					AND dvss.oe_kurzbz = dvs.oe_kurzbz -- paralell in same unternehmen";

		if (isset($erste_dienstverhaeltnis_id) && isset($zweite_dienstverhaeltnis_id))
		{
			$qry .= " AND dvs.dienstverhaeltnis_id = ?";
			$params[] = $erste_dienstverhaeltnis_id;

			$qry .= " AND dvss.dienstverhaeltnis_id = ?";
			$params[] = $zweite_dienstverhaeltnis_id;
		}

		if (isset($erste_vertragsbestandteil_id) && isset($zweite_vertragsbestandteil_id))
		{
			$qry .= " AND dvs.vertragsbestandteil_id = ?";
			$params[] = $erste_vertragsbestandteil_id;

			$qry .= " AND dvss.vertragsbestandteil_id = ?";
			$params[] = $zweite_vertragsbestandteil_id;
		}

		$qry .= "
			) alle_dvs
			WHERE (
					-- vertragsbestandteil time paralell
					paralelle_vtb
					OR (
						-- dienstverhaeltnis time paralell
						alle_dvs.zweites_dv_von <= alle_dvs.erstes_dv_bis AND alle_dvs.zweites_dv_bis >= alle_dvs.erstes_dv_von
						AND NOT EXISTS ( -- karenz time can be paralell
							SELECT 1
							FROM
								hr.tbl_vertragsbestandteil vtb_karenz
							WHERE
								dienstverhaeltnis_id IN (alle_dvs.erste_dienstverhaeltnis_id, alle_dvs.zweite_dienstverhaeltnis_id)
								AND vertragsbestandteiltyp_kurzbz = 'karenz'
								AND von <= GREATEST(alle_dvs.erstes_dv_von, alle_dvs.zweites_dv_von)
								AND COALESCE(bis, '9999-12-31') >= LEAST(alle_dvs.erstes_dv_bis, alle_dvs.zweites_dv_bis)
						)
					)
				)
		";

		$qry .= "
			ORDER BY
				person_id, erste_dienstverhaeltnis_id, zweite_dienstverhaeltnis_id, erste_vertragsbestandteil_id, zweite_vertragsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
