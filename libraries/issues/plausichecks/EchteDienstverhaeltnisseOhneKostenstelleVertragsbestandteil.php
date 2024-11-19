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
		$startDate = DateTime::createFromFormat('Y-m-d', $startDate) ? $startDate : null;

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
		$params = array();

		// there should be no day in Dienstverhaeltnis not covered by a Kostenstelle Vertragsbestandteil
		$qry = "
			SELECT
				DISTINCT person_id, dienstverhaeltnis_id
			FROM
			(
				SELECT
					ben.person_id, dv.dienstverhaeltnis_id, dv.von, dv.bis, COALESCE(datum, dv.von) AS dv_tag
				FROM
					public.tbl_benutzer ben
					JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
					JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
					LEFT JOIN generate_series(dv.von, dv.bis, '1 day'::interval) datum ON datum BETWEEN dv.von AND dv.bis
				WHERE
					dv.vertragsart_kurzbz = 'echterdv'";

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

		if (isset($startDate))
		{
			$qry .= " AND dv.von >= ?::date";
			$params[] = $startDate;
		}

		$qry .= "
			) dvs
			WHERE NOT EXISTS
			(
				SELECT
					1
				FROM
					hr.tbl_vertragsbestandteil vb
					JOIN hr.tbl_vertragsbestandteil_funktion vbf USING (vertragsbestandteil_id)
					JOIN public.tbl_benutzerfunktion bf USING (benutzerfunktion_id)
				WHERE
					vb.dienstverhaeltnis_id = dvs.dienstverhaeltnis_id
					AND vb.vertragsbestandteiltyp_kurzbz = 'funktion'
					AND bf.funktion_kurzbz = 'kstzuordnung'
					AND dvs.dv_tag >= vb.von AND (dvs.dv_tag <= vb.bis OR (vb.bis IS NULL))
			)";

		$qry .= "
			ORDER BY
				person_id, dienstverhaeltnis_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
