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

		// get employee data
		$result = $this->getParalelleDienstverhaeltnisseEinUnternehmen(
			$person_id,
			$erste_dienstverhaeltnis_id,
			$zweite_dienstverhaeltnis_id
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
						'zweite_dienstverhaeltnis_id' => $dataObj->zweite_dienstverhaeltnis_id
					),
					'fehlertext_params' => array(
						'erste_dienstverhaeltnis_id' => $dataObj->erste_dienstverhaeltnis_id,
						'zweite_dienstverhaeltnis_id' => $dataObj->zweite_dienstverhaeltnis_id
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
	 * @return success with data or error
	 */
	public function getParalelleDienstverhaeltnisseEinUnternehmen(
		$person_id = null,
		$erste_dienstverhaeltnis_id = null,
		$zweite_dienstverhaeltnis_id = null
	) {
		$params = array();

		$qry = "
			WITH dienstverhaeltnisse AS (
				SELECT
						ben.person_id,
						dv.dienstverhaeltnis_id, dv.oe_kurzbz, dv.von AS dv_von, COALESCE(dv.bis, '9999-12-31') AS dv_bis, dv.vertragsart_kurzbz
				FROM
						public.tbl_benutzer ben
						JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
						JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				WHERE
					vertragsart_kurzbz NOT IN ('werkvertrag')";

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
				GREATEST(erste_dienstverhaeltnis_id, zweite_dienstverhaeltnis_id) AS zweite_dienstverhaeltnis_id
			FROM
			(
				SELECT
					dvs.person_id,
					dvs.dienstverhaeltnis_id AS erste_dienstverhaeltnis_id, dvss.dienstverhaeltnis_id AS zweite_dienstverhaeltnis_id,
					dvs.dv_von AS erstes_dv_von, dvss.dv_von AS zweites_dv_von,
					dvs.dv_bis AS erstes_dv_bis, dvss.dv_bis AS zweites_dv_bis,
					dvs.vertragsart_kurzbz AS erste_vertragsart_kurzbz, dvss.vertragsart_kurzbz AS zweite_vertragsart_kurzbz
				FROM
					dienstverhaeltnisse dvs, dienstverhaeltnisse dvss
				WHERE
					dvss.dienstverhaeltnis_id <> dvs.dienstverhaeltnis_id -- different dienstverhaeltnis
					AND dvss.person_id = dvs.person_id /* same person */
					AND dvss.oe_kurzbz = dvs.oe_kurzbz /* paralell in same unternehmen */";

		if (isset($erste_dienstverhaeltnis_id) && isset($zweite_dienstverhaeltnis_id))
		{
			$qry .= " AND dvs.dienstverhaeltnis_id = ?";
			$params[] = $erste_dienstverhaeltnis_id;

			$qry .= " AND dvss.dienstverhaeltnis_id = ?";
			$params[] = $zweite_dienstverhaeltnis_id;
		}

		$qry .= "
			) alle_dvs
			WHERE
				-- dienstverhaeltnis time paralell
				alle_dvs.zweites_dv_von <= alle_dvs.erstes_dv_bis AND alle_dvs.zweites_dv_bis >= alle_dvs.erstes_dv_von
				-- exclude paralell contracts with certain types
				AND NOT (
					LEAST(erste_vertragsart_kurzbz, zweite_vertragsart_kurzbz) = 'externerlehrender'
					AND GREATEST(erste_vertragsart_kurzbz, zweite_vertragsart_kurzbz) = 'studentischehilfskr'
				)
				AND NOT EXISTS ( /* karenz time can be paralell */
					SELECT 1
					FROM
						hr.tbl_vertragsbestandteil vtb_karenz
						WHERE
						dienstverhaeltnis_id IN (alle_dvs.erste_dienstverhaeltnis_id, alle_dvs.zweite_dienstverhaeltnis_id)
						AND vertragsbestandteiltyp_kurzbz = 'karenz'
						AND von <= GREATEST(alle_dvs.erstes_dv_von, alle_dvs.zweites_dv_von)
						AND COALESCE(bis, '9999-12-31') >= LEAST(alle_dvs.erstes_dv_bis, alle_dvs.zweites_dv_bis)
				)
		";

		$qry .= "
			ORDER BY
				person_id, erste_dienstverhaeltnis_id, zweite_dienstverhaeltnis_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
