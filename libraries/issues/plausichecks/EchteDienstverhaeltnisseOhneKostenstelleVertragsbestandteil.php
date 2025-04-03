<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Dienstverhältnisse with type "echterdv" should have a Kostenstelle assigned.
 */
class EchteDienstverhaeltnisseOhneKostenstelleVertragsbestandteil extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$dienstverhaeltnis_id = isset($params['dienstverhaeltnis_id']) ? $params['dienstverhaeltnis_id'] : null;

		// get start date from config
		$this->_ci->load->config('extensions/FHC-Core-Personalverwaltung/issues');
		$startDate = $this->_ci->config->item('STANDARDKOSTENSTELLE_START_DATE');

		// if config not set, do not execute check
		if (!isset($startDate) || !$startDate) return success([]);

		// check if start date valid
		$startDate = DateTime::createFromFormat('Y-m-d', $startDate) ? $startDate : '1970-01-01';

		// get employee data
		$result = $this->_getEchteDienstverhaeltnisseOhneKostenstelleVertragsbestandteil(
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
	 * "Echte" Dienstverhaeltnisse should have a Vertragsbestandteil with "Kostenstelle" type.
	 * @param person_id
	 * @param dienstverhaeltnis_id Dienstverhaeltnis violating the plausicheck
	 * @param startDate date, after which Dienstverhaeltnisse are checked
	 * @return success with data or error
	 */
	public function _getEchteDienstverhaeltnisseOhneKostenstelleVertragsbestandteil(
		$person_id = null,
		$dienstverhaeltnis_id = null,
		$startDate = null
	) {
		$params = array($startDate, $startDate, $startDate, $startDate);

		// there should be no day in Dienstverhaeltnis not covered by a Kostenstelle Vertragsbestandteil
		$qry = "
			WITH vbs AS
			(
				SELECT
					vb.dienstverhaeltnis_id, MIN(vb.von) OVER (PARTITION BY dienstverhaeltnis_id) AS erster_vb_start, vertragsbestandteil_id,
					vb.von, vb.bis, LEAD(vb.von) OVER (PARTITION BY dienstverhaeltnis_id ORDER BY vb.von, vb.bis) AS naechstes_von
				FROM
					(
						SELECT 
							vertragsbestandteil_id, 
							dienstverhaeltnis_id, 
							GREATEST(?::date, von) as von,
							bis,
							vertragsbestandteiltyp_kurzbz
						from 
							hr.tbl_vertragsbestandteil
						where
							COALESCE(bis, '9999-12-31'::date) >= ?::date
					) vb
					JOIN hr.tbl_vertragsbestandteil_funktion vbf USING (vertragsbestandteil_id)
					JOIN public.tbl_benutzerfunktion bf USING (benutzerfunktion_id)
				WHERE
					vb.vertragsbestandteiltyp_kurzbz = 'funktion'
					AND bf.funktion_kurzbz = 'kstzuordnung'

				ORDER BY
					dienstverhaeltnis_id, von
			)
			SELECT
				DISTINCT ben.person_id, dv.dienstverhaeltnis_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				LEFT JOIN vbs ON dv.dienstverhaeltnis_id = vbs.dienstverhaeltnis_id
			WHERE
				dv.vertragsart_kurzbz = 'echterdv'
				AND (
					vbs.vertragsbestandteil_id IS NULL
					OR vbs.naechstes_von - vbs.bis NOT BETWEEN 0 AND 1 -- there is a gap inbetween
					OR vbs.erster_vb_start > GREATEST(?::date, dv.von) -- there is a gap in the beginning
					OR (vbs.naechstes_von IS NULL AND (COALESCE(vbs.bis, '9999-12-31') < COALESCE(dv.bis, '9999-12-31'))) -- there is a gap at the end
				)
				AND COALESCE(dv.bis, '9999-12-31'::date) >= ?::date";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		if (isset($dienstverhaeltnis_id))
		{
			$qry .= " AND dv.dienstverhaeltnis_id = ?";
			$params[] = $dienstverhaeltnis_id;
		}

		$qry .= "
			ORDER BY
				ben.person_id, dv.dienstverhaeltnis_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
