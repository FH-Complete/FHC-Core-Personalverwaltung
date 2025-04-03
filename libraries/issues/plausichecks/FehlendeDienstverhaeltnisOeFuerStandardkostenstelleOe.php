<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH.'libraries/issues/plausichecks/PlausiChecker.php';

/**
 * Dienstverhältnis shouldn't have a wrong Organisationseinheit (company oe) for a Standardkostenstelle.
 */
class FehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe extends PlausiChecker
{
	public function executePlausiCheck($params)
	{
		$results = array();

		$person_id = isset($params['person_id']) ? $params['person_id'] : null;
		$benutzerfunktion_id = isset($params['benutzerfunktion_id']) ? $params['benutzerfunktion_id'] : null;

		// get employee data
		$result = $this->getFehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe(
			$person_id,
			$benutzerfunktion_id
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
					'resolution_params' => array('benutzerfunktion_id' => $dataObj->benutzerfunktion_id),
					'fehlertext_params' => array(
						'benutzerfunktion_id' => $dataObj->benutzerfunktion_id,
						'oe_kurzbz' => $dataObj->oe_kurzbz
					)
				);
			}
		}

		return success($results);
	}

	/**
	 * There shouldn't be Dienstverhältnisse with a wrong Organisationseinheit for Standardkostenstellen Organisationseinheiten.
	 * @param person_id
	 * @param benutzerfunktion_id Benutzerverhältnis violating the plausicheck
	 * @return success with data or error
	 */
	public function getFehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe($person_id = null, $benutzerfunktion_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				ben.person_id, kst.benutzerfunktion_id, kst.oe_kurzbz
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN public.tbl_benutzerfunktion kst ON ben.uid = kst.uid
				JOIN hr.tbl_dienstverhaeltnis dvs ON ben.uid = dvs.mitarbeiter_uid
			WHERE
				kst.funktion_kurzbz = 'kstzuordnung' -- Standardkostenstellenzuordnung
				-- dates of Kostenstellenfunktion and Dienstverhältnis overlap
				AND (kst.datum_von <= dvs.bis OR dvs.bis IS NULL) AND (kst.datum_bis >= dvs.von OR kst.datum_bis IS NULL)
				AND NOT EXISTS ( -- a dv with parent oe does not exist for the benutzerfunktion (kostenstelle) oe
					WITH RECURSIVE oes(oe_kurzbz, oe_parent_kurzbz) AS
					(
						SELECT
							oe_kurzbz, oe_parent_kurzbz
						FROM
							public.tbl_organisationseinheit
						WHERE
							oe_kurzbz = kst.oe_kurzbz
						UNION ALL
						SELECT
							o.oe_kurzbz, o.oe_parent_kurzbz
						FROM
							public.tbl_organisationseinheit o, oes
						WHERE
							o.oe_kurzbz=oes.oe_parent_kurzbz
					)
					SELECT
						1
					FROM
						hr.tbl_dienstverhaeltnis dvss
					WHERE
						dvss.mitarbeiter_uid = ma.mitarbeiter_uid
						AND (kst.datum_von <= dvss.bis OR dvss.bis IS NULL)
						AND (kst.datum_bis >= dvss.von OR kst.datum_bis IS NULL)
						AND oe_kurzbz IN (SELECT oe_kurzbz FROM oes)
				)";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		if (isset($benutzerfunktion_id))
		{
			$qry .= " AND kst.benutzerfunktion_id = ?";
			$params[] = $benutzerfunktion_id;
		}

		$qry .= "
			ORDER BY
				person_id, benutzerfunktion_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
