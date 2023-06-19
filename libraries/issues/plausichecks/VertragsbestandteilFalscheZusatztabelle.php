<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Vertragsbestandteil of a certain type shouldn't have the wrong "additional" table.
 */
class VertragsbestandteilFalscheZusatztabelle extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$vertragsbestandteil_id = isset($params['vertragsbestandteil_id']) ? $params['vertragsbestandteil_id'] : null;
		$vertragsbestandteiltyp_kurzbz = isset($params['vertragsbestandteiltyp_kurzbz']) ? $params['vertragsbestandteiltyp_kurzbz'] : null;

		// get employee data
		$result = $this->getVertragsbestandteilFalscheZusatztabelle(
			$person_id,
			$vertragsbestandteil_id,
			$vertragsbestandteiltyp_kurzbz
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
						'vertragsbestandteil_id' => $dataObj->vertragsbestandteil_id,
						'vertragsbestandteiltyp_kurzbz' => $dataObj->vertragsbestandteiltyp_kurzbz
					),
					'fehlertext_params' => array(
						'vertragsbestandteil_id' => $dataObj->vertragsbestandteil_id,
						'vertragsbestandteiltyp_kurzbz' => $dataObj->vertragsbestandteiltyp_kurzbz,
						'zusatztabellen' => $dataObj->zusatztabellen
					)
				);
			}
		}

		return success($results);
	}

	/**
	 * Vertragsbestandteil shouldn't be connected to a table not corresponding to the Vertragsbestandteiltyp.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @param vertragsbestandteiltyp_kurzbz Vertragsbestandteil type
	 * @return success with data or error
	 */
	public function getVertragsbestandteilFalscheZusatztabelle(
		$person_id = null,
		$vertragsbestandteil_id = null,
		$vertragsbestandteiltyp_kurzbz = null
	) {
		$params = array();

		$qry = "
			SELECT
				ben.person_id, vtb.vertragsbestandteil_id, vtb.vertragsbestandteiltyp_kurzbz,
				concat_ws(', '
					, CASE WHEN std.vertragsbestandteil_id IS NOT NULL THEN 'stunden' ELSE NULL END
					, CASE WHEN freitext.vertragsbestandteil_id IS NOT NULL THEN 'freitext' ELSE NULL END
					, CASE WHEN karenz.vertragsbestandteil_id IS NOT NULL THEN 'karenz' ELSE NULL END
					, CASE WHEN urlaub.vertragsbestandteil_id IS NOT NULL THEN 'urlaub' ELSE NULL END
					, CASE WHEN zt.vertragsbestandteil_id IS NOT NULL THEN 'zt' ELSE NULL END
				) AS zusatztabellen
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
				LEFT JOIN hr.tbl_vertragsbestandteil_stunden std ON vtb.vertragsbestandteil_id = std.vertragsbestandteil_id
				LEFT JOIN hr.tbl_vertragsbestandteil_freitext freitext ON vtb.vertragsbestandteil_id = freitext.vertragsbestandteil_id
				LEFT JOIN hr.tbl_vertragsbestandteil_karenz karenz ON vtb.vertragsbestandteil_id = karenz.vertragsbestandteil_id
				LEFT JOIN hr.tbl_vertragsbestandteil_urlaubsanspruch urlaub ON vtb.vertragsbestandteil_id = urlaub.vertragsbestandteil_id
				LEFT JOIN hr.tbl_vertragsbestandteil_zeitaufzeichnung zt ON vtb.vertragsbestandteil_id = zt.vertragsbestandteil_id
			WHERE
				(
					(std.vertragsbestandteil_id IS NOT NULL AND vtb.vertragsbestandteiltyp_kurzbz <> 'stunden')
					OR (freitext.vertragsbestandteil_id IS NOT NULL AND vtb.vertragsbestandteiltyp_kurzbz <> 'freitext')
					OR (karenz.vertragsbestandteil_id IS NOT NULL AND vtb.vertragsbestandteiltyp_kurzbz <> 'karenz')
					OR (urlaub.vertragsbestandteil_id IS NOT NULL AND vtb.vertragsbestandteiltyp_kurzbz <> 'urlaubsanspruch')
					OR (zt.vertragsbestandteil_id IS NOT NULL AND vtb.vertragsbestandteiltyp_kurzbz <> 'zeitaufzeichnung')
				)";

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

		if (isset($vertragsbestandteiltyp_kurzbz))
		{
			$qry .= " AND vtb.vertragsbestandteiltyp_kurzbz = ?";
			$params[] = $vertragsbestandteiltyp_kurzbz;
		}

		$qry .= "
			ORDER BY
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
