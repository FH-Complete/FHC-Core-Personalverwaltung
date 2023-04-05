<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Library containing database queries for execution of Personalverwaltung plausichecks.
 */
class PlausicheckLib
{
	private $_ci; // Code igniter instance
	private $_db; // database object

	/**
	 * Object initialization
	 */
	public function __construct()
	{
		$this->_ci =& get_instance(); // get ci instance

		// load models
		$this->_ci->load->model('crm/Prestudent_model', 'PrestudentModel');
		$this->_ci->load->model('crm/Prestudentstatus_model', 'PrestudentstatusModel');
		$this->_ci->load->model('organisation/Studiensemester_model', 'StudiensemesterModel');

		// get database for queries
		$this->_db = new DB_Model();
	}

	//------------------------------------------------------------------------------------------------------------------
	// Dienstverhältnis checks

	/**
	 * There shouldn't be any Dienstverhaeltnisse running in paralell for a person in the same company.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getParalelleDienstverhaeltnisseEinUnternehmen($person_id = null, $vertragsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			WITH dienstverhaeltnisse AS (
				SELECT
					ben.person_id, dv.dienstverhaeltnis_id, vtb.vertragsbestandteil_id, dv.oe_kurzbz, vtb.vertragsbestandteiltyp_kurzbz,
					vtb.von, COALESCE(vtb.bis, '9999-12-31') AS bis
				FROM
					public.tbl_benutzer ben
					JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
					JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
					JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
				WHERE
					vertragsbestandteiltyp_kurzbz NOT IN ('karenz')";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		$qry.=
			")
			SELECT
				DISTINCT ON (person_id) *
			FROM
				dienstverhaeltnisse dvs
			WHERE
				EXISTS (
					SELECT 1
					FROM
						dienstverhaeltnisse dvss
					WHERE
						dvss.dienstverhaeltnis_id <> dvs.dienstverhaeltnis_id -- different dienstverhaeltnis
						AND dvss.person_id = dvs.person_id -- same person
						AND dvss.oe_kurzbz = dvs.oe_kurzbz -- paralell in same unternehmen
						AND (dvss.von <= dvs.bis AND dvss.bis >= dvs.von)
				)";

		if (isset($vertragsbestandteil_id))
		{
			$qry .= " AND dvs.vertragsbestandteil_id = ?";
			$params[] = $vertragsbestandteil_id;
		}

		$qry .= "
			ORDER BY
				person_id, von, dienstverhaeltnis_id, vertragsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}

	/**
	 * There shouldn't be any time gaps in any Dienstverhaeltnis.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getUndurchgaengigeDienstverhaeltnisse($person_id = null, $dienstverhaeltnis_id = null)
	{
		$params = array();

		$qry = "
			WITH dienstverhaeltnisse AS (
				SELECT ben.person_id, dv.dienstverhaeltnis_id, vtb.vertragsbestandteil_id,
					dv.von AS dv_von, COALESCE(dv.bis, '9999-12-31') AS dv_bis,
					vtb.von AS vtb_von, COALESCE(vtb.bis, '9999-12-31') AS vtb_bis,
					dv.oe_kurzbz, RANK() OVER(PARTITION BY dienstverhaeltnis_id ORDER BY vtb.von) AS reihenfolge
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
			SELECT DISTINCT ON (person_id) *
			FROM
				dienstverhaeltnisse dvs
			WHERE
			(
				NOT EXISTS ( -- there is no following vertragsbestandteil, and it's not the end of dienstverhaeltnis
					SELECT 1
					FROM
						dienstverhaeltnisse dvss
					WHERE
						dvs.vertragsbestandteil_id <> dvss.vertragsbestandteil_id
						AND dvs.dienstverhaeltnis_id = dvss.dienstverhaeltnis_id
						AND ((dvss.vtb_von <= dvs.vtb_bis + INTERVAL '1 day' AND (dvss.vtb_bis >= dvs.vtb_bis OR dvs.vtb_bis = dvs.dv_bis)))
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
				person_id, vtb_von, dienstverhaeltnis_id, vertragsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}
}
