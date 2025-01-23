<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Dienstverhältnisse with type "echterdv" should have own Organisationseinheit.
 */
class EchteDienstverhaeltnisseOhneOeVertragsbestandteil extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$dienstverhaeltnis_id = isset($params['dienstverhaeltnis_id']) ? $params['dienstverhaeltnis_id'] : null;

		// get start date from config
		$this->_ci->load->config('extensions/FHC-Core-Personalverwaltung/issues');
		$startDate = $this->_ci->config->item('OEZUORDNUNG_START_DATE');

		// if config not set, do not execute check
		if (!isset($startDate) || !$startDate) return success([]);

		// check if start date valid
		$startDate = DateTime::createFromFormat('Y-m-d', $startDate) ? $startDate : null;

		// get employee data
		$result = $this->_getEchteDienstverhaeltnisseOhneOeVertragsbestandteil(
			$person_id,
			$dienstverhaeltnis_id,
			$startDate
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
	 * "Echte" Dienstverhaeltnisse should have an Organisationseinheit Vertragsbestandteil.
	 * @param person_id
	 * @param dienstverhaeltnis_id Dienstverhaeltnis violating the plausicheck
	 * @param startDate date, after which Dienstverhaeltnisse are checked
	 * @return success with data or error
	 */
	private function _getEchteDienstverhaeltnisseOhneOeVertragsbestandteil($person_id = null, $dienstverhaeltnis_id = null, $startDate = null)
	{
		$params = array();

		// there should be no day in Dienstverhaeltnis not covered by an Organisationseinheit Vertragsbestandteil
		$qry = "
			SELECT
				DISTINCT ON (person_id, dienstverhaeltnis_id) person_id, dienstverhaeltnis_id, vertragsbestandteil_id
			FROM
			(
				SELECT
					ben.person_id, dv.dienstverhaeltnis_id, MIN(vb.von) OVER (PARTITION BY dienstverhaeltnis_id) AS erster_vb_start, vertragsbestandteil_id,
					vb.von, vb.bis, LEAD(vb.von) OVER (PARTITION BY dienstverhaeltnis_id ORDER BY vb.von, vb.bis) AS naechstes_von,
					dv.von AS dv_von, dv.bis AS dv_bis
				FROM
					public.tbl_benutzer ben
					JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
					JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
					JOIN hr.tbl_vertragsbestandteil vb USING (dienstverhaeltnis_id)
					JOIN hr.tbl_vertragsbestandteil_funktion vbf USING (vertragsbestandteil_id)
					JOIN public.tbl_benutzerfunktion bf USING (benutzerfunktion_id)
				WHERE
					dv.vertragsart_kurzbz = 'echterdv'
					AND vb.vertragsbestandteiltyp_kurzbz = 'funktion'
					AND bf.funktion_kurzbz = 'oezuordnung'
				ORDER BY
					dienstverhaeltnis_id, von
			) vbs
			WHERE
			(
				naechstes_von - bis > 1 -- there is a gap inbetween
				OR erster_vb_start > dv_von -- there is a gap in the beginning
				OR naechstes_von IS NULL AND (COALESCE(bis, '9999-12-13') < COALESCE(dv_bis, '9999-12-13')) -- there is a gap at the end
			)";

		if (isset($person_id))
		{
			$qry .= " AND person_id = ?";
			$params[] = $person_id;
		}

		if (isset($dienstverhaeltnis_id))
		{
			$qry .= " AND dienstverhaeltnis_id = ?";
			$params[] = $dienstverhaeltnis_id;
		}

		if (isset($startDate))
		{
			$qry .= " AND dv_von >= ?::date";
			$params[] = $startDate;
		}

		$qry .= "
			ORDER BY
				person_id, dienstverhaeltnis_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
