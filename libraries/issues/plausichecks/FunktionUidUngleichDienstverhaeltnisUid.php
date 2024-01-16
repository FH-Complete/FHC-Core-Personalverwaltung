<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Uid of Funktion should be the same as uid from Dienstverhältnis.
 */
class FunktionUidUngleichDienstverhaeltnisUid extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$dienstverhaeltnis_id = isset($params['dienstverhaeltnis_id']) ? $params['dienstverhaeltnis_id'] : null;

		// get employee data
		$result = $this->getFunktionUidUngleichDienstverhaeltnisUid($person_id, $dienstverhaeltnis_id);

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
					'fehlertext_params' => array(
						'dienstverhaeltnis_id' => $dataObj->dienstverhaeltnis_id,
						'benutzerfunktion_id' => $dataObj->benutzerfunktion_id
					)
				);
			}
		}

		return success($results);
	}

	/**
	 * Uid of Benutzerfunktion should correspond to uid of Dienstverhältnis.
	 * @param person_id
	 * @param dienstverhaeltnis_id Dienstverhältnis violating the plausicheck
	 * @return success with data or error
	 */
	public function getFunktionUidUngleichDienstverhaeltnisUid($person_id = null, $dienstverhaeltnis_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				person_id, dienstverhaeltnis_id, benutzerfunktion_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
				JOIN hr.tbl_vertragsbestandteil_funktion vtb_funktion USING (vertragsbestandteil_id)
				JOIN public.tbl_benutzerfunktion ben_funktion USING (benutzerfunktion_id)
			WHERE
				dv.mitarbeiter_uid <> ben_funktion.uid";

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
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id, benutzerfunktion_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}

	/**
	 * Funktion date span should overlap with date span of Vertragsbestandteil.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getFunktionFaelltNichtInVertragsbestandteilZeitraum($person_id = null, $vertragsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id, benutzerfunktion_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
				JOIN hr.tbl_vertragsbestandteil_funktion vtb_funktion USING (vertragsbestandteil_id)
				JOIN public.tbl_benutzerfunktion ben_funktion USING (benutzerfunktion_id)
			WHERE
				--benutzerfunktion date span does not overlap with vertragsbestandteil date span
				vtb.von > ben_funktion.datum_bis OR vtb.bis < ben_funktion.datum_von";

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

		$qry .= "
			ORDER BY
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id, benutzerfunktion_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
