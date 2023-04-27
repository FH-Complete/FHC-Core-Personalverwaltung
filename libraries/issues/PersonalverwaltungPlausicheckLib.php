<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Library containing database queries for execution of Personalverwaltung plausichecks.
 */
class PersonalverwaltungPlausicheckLib
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

	/**
	 * There shouldn't be any time gaps in any Dienstverhaeltnis.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getUndurchgaengigeDienstverhaeltnisse($person_id = null, $vertragsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			WITH dienstverhaeltnisse AS (
				SELECT ben.person_id, dv.dienstverhaeltnis_id, vtb.vertragsbestandteil_id,
					dv.von AS dv_von, COALESCE(dv.bis, '9999-12-31') AS dv_bis,
					vtb.von AS vtb_von, COALESCE(vtb.bis, '9999-12-31') AS vtb_bis,
					dv.oe_kurzbz, RANK() OVER(PARTITION BY dienstverhaeltnis_id ORDER BY vtb.von, vtb.insertamum) AS reihenfolge
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
			SELECT *
			FROM
				dienstverhaeltnisse dvs
			WHERE
			(
				NOT EXISTS (
					SELECT 1
					FROM
						dienstverhaeltnisse dvss
					WHERE
						(-- there is no following vertragsbestandteil
							dvs.vertragsbestandteil_id <> dvss.vertragsbestandteil_id
							AND dvs.dienstverhaeltnis_id = dvss.dienstverhaeltnis_id
							AND dvss.vtb_von <= dvs.vtb_bis + INTERVAL '1 day'
							AND dvss.vtb_bis > dvs.vtb_bis
						)
						-- and it's not the end of dienstverhaeltnis
						OR dvs.vtb_bis = dvs.dv_bis
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
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}

	/**
	 * "Echte" Dienstverhaeltnisse should have a Vertragsbestandteil with "stunden" type.
	 * @param person_id
	 * @param dienstverhaeltnis_id Dienstverhaeltnis violating the plausicheck
	 * @return success with data or error
	 */
	public function getEchteDienstverhaeltnisseOhneStundenVertragsbestandteil($person_id = null, $dienstverhaeltnis_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				person_id, dienstverhaeltnis_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
			WHERE
				vertragsart_kurzbz = 'echterdv'
				AND NOT EXISTS (
					SELECT 1
					FROM
						hr.tbl_vertragsbestandteil
					WHERE
						dienstverhaeltnis_id = dv.dienstverhaeltnis_id
						AND vertragsbestandteiltyp_kurzbz = 'stunden'
				)";

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
				person_id, dienstverhaeltnis_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
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

	//------------------------------------------------------------------------------------------------------------------
	// Vertragsbestandteil checks

	/**
	 * Von Datum of Vertragsbestandteil shouldn't be before Dienstverhaeltnis start.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getVertragsbestandteilStartBeforeDienstverhaeltnis($person_id = null, $vertragsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
			WHERE
				vtb.von < dv.von
			";

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
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}

	/**
	 * Bis Datum of Vertragsbestandteil shouldn't be after Dienstverhaeltnis end.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getVertragsbestandteilEndAfterDienstverhaeltnis($person_id = null, $vertragsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
			WHERE
				dv.bis IS NOT NULL -- null means 'unlimited' with no end.
				AND (vtb.bis > dv.bis OR vtb.bis IS NULL)
			";

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
				person_id, dienstverhaeltnis_id, vertragsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
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
			WHERE -- there is overlapping vertragsbestandteil
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

	/**
	 * Vertragsbestandteile of type "freitext" of a Dienstverhältnis which are marked as not overlapping should not overlap in time.
	 * @param person_id
	 * @param erste_vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @param zweite_vertragsbestandteil_id Vertragsbestandteil violating the plausicheck, overlapping with first
	 * @return success with data or error
	 */
	public function getUeberlappendeFreitextVertragsbestandteile(
		$person_id = null,
		$erste_vertragsbestandteil_id = null,
		$zweite_vertragsbestandteil_id = null
	) {
		$params = array();

		$qry = "
			WITH vertragsbestandteile AS (
				SELECT
					ben.person_id, dv.dienstverhaeltnis_id,
					vtb.vertragsbestandteil_id, vtb_freitext.freitexttyp_kurzbz, dv.oe_kurzbz,
					dv.von AS dv_von, COALESCE(dv.bis, '9999-12-31') AS dv_bis,
					vtb.von AS vtb_von, COALESCE(vtb.bis, '9999-12-31') AS vtb_bis
				FROM
					public.tbl_benutzer ben
					JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
					JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
					JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
					JOIN hr.tbl_vertragsbestandteil_freitext vtb_freitext USING (vertragsbestandteil_id)
					JOIN hr.tbl_vertragsbestandteil_freitexttyp vtb_freitexttyp USING (freitexttyp_kurzbz)
				WHERE
					vtb_freitexttyp.ueberlappend = FALSE";

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
			WHERE -- there is overlapping vertragsbestandteil
			(
				vtbs.dienstverhaeltnis_id = vtbss.dienstverhaeltnis_id -- same Dienstverhaeltnis
				AND vtbs.vertragsbestandteil_id <> vtbss.vertragsbestandteil_id -- different Vertragsbestandteil
				AND vtbs.freitexttyp_kurzbz = vtbss.freitexttyp_kurzbz -- same type
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

	/**
	 * Bis Datum of Vertragsbestandteil shouldn't be after Dienstverhaeltnis end.
	 * @param person_id
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @param vertragsbestandteiltyp_kurzbz Vertragsbestandteil type
	 * @return success with data or error
	 */
	public function getVertragsbestandteilOhneZusatztabelle($person_id = null, $vertragsbestandteil_id = null, $vertragsbestandteiltyp_kurzbz = null)
	{
		$params = array();

		$qry = "
			SELECT
				ben.person_id, vtb.vertragsbestandteil_id, vtb.vertragsbestandteiltyp_kurzbz
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
					(std.vertragsbestandteil_id IS NULL AND vtb.vertragsbestandteiltyp_kurzbz = 'stunden')
					OR (freitext.vertragsbestandteil_id IS NULL AND vtb.vertragsbestandteiltyp_kurzbz = 'freitext')
					OR (karenz.vertragsbestandteil_id IS NULL AND vtb.vertragsbestandteiltyp_kurzbz = 'karenz')
					OR (urlaub.vertragsbestandteil_id IS NULL AND vtb.vertragsbestandteiltyp_kurzbz = 'urlaubsanspruch')
					OR (zt.vertragsbestandteil_id IS NULL AND vtb.vertragsbestandteiltyp_kurzbz = 'zeitaufzeichnung')
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

	//------------------------------------------------------------------------------------------------------------------
	// Gehalt checks

	/**
	 * Grundgehalt should be assigned to "stunden" Vertragsbestandteil.
	 * @param person_id
	 * @param gehaltsbestandteil_id Gehaltsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getGrundgehaltKeinemStundenVertragsbestandteilZugewiesen($person_id = null, $gehaltsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				person_id, dv.dienstverhaeltnis_id, vtb.vertragsbestandteil_id, geh.gehaltsbestandteil_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_gehaltsbestandteil geh USING (dienstverhaeltnis_id)
				LEFT JOIN hr.tbl_vertragsbestandteil vtb USING (vertragsbestandteil_id)
			WHERE
				geh.gehaltstyp_kurzbz = 'grundgehalt'
				AND (vtb.vertragsbestandteil_id IS NULL OR vtb.vertragsbestandteiltyp_kurzbz <> 'stunden')";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		if (isset($gehaltsbestandteil_id))
		{
			$qry .= " AND geh.gehaltsbestandteil_id = ?";
			$params[] = $gehaltsbestandteil_id;
		}

		$qry .= "
			ORDER BY
				person_id, dv.dienstverhaeltnis_id, vtb.vertragsbestandteil_id, geh.gehaltsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}

	/**
	 * Gehaltsbestandteil date span should be in Vertragsbestandteil date span.
	 * @param person_id
	 * @param gehaltsbestandteil_id Gehaltsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getGehaltsbestandteilNichtImVertragsbestandteilDatumsbereich($person_id = null, $gehaltsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				ben.person_id, dv.dienstverhaeltnis_id, vtb.vertragsbestandteil_id, geh.gehaltsbestandteil_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_vertragsbestandteil vtb USING (dienstverhaeltnis_id)
				JOIN hr.tbl_gehaltsbestandteil geh USING (vertragsbestandteil_id)
			WHERE
				(
					geh.von < vtb.von
					OR geh.bis > vtb.bis
					OR geh.von > vtb.bis
					OR geh.bis < vtb.von
				)";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		if (isset($gehaltsbestandteil_id))
		{
			$qry .= " AND geh.gehaltsbestandteil_id = ?";
			$params[] = $gehaltsbestandteil_id;
		}

		$qry .= "
			ORDER BY
				ben.person_id, dv.dienstverhaeltnis_id, geh.gehaltsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}

	/**
	 * Gehaltsbestandteil date span should be part of Dienstverhaeltnis date span.
	 * @param person_id
	 * @param gehaltsbestandteil_id Gehaltsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getGehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich($person_id = null, $gehaltsbestandteil_id = null)
	{
		$params = array();

		$qry = "
			SELECT
				ben.person_id, dv.dienstverhaeltnis_id, geh.gehaltsbestandteil_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_gehaltsbestandteil geh USING (dienstverhaeltnis_id)
			WHERE
				(
					geh.von < dv.von
					OR geh.bis > dv.bis
					OR geh.von > dv.bis
					OR geh.bis < dv.von
				)";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		if (isset($gehaltsbestandteil_id))
		{
			$qry .= " AND geh.gehaltsbestandteil_id = ?";
			$params[] = $gehaltsbestandteil_id;
		}

		$qry .= "
			ORDER BY
				person_id, dienstverhaeltnis_id, gehaltsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}

	/**
	 * Gehaltsbestandteil sholdn't be assigned to a Vertragsbestandteil with a different Dienstverhältnis.
	 * @param person_id
	 * @param gehaltsbestandteil_id Gehaltsbestandteil violating the plausicheck
	 * @param vertragsbestandteil_id Vertragsbestandteil violating the plausicheck
	 * @return success with data or error
	 */
	public function getVerschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil(
		$person_id = null,
		$gehaltsbestandteil_id = null,
		$vertragsbestandteil_id = null
	) {
		$params = array();

		$qry = "
			SELECT
				ben.person_id, dv.dienstverhaeltnis_id, geh.gehaltsbestandteil_id, vtb.vertragsbestandteil_id
			FROM
				public.tbl_benutzer ben
				JOIN public.tbl_mitarbeiter ma ON ben.uid = ma.mitarbeiter_uid
				JOIN hr.tbl_dienstverhaeltnis dv USING (mitarbeiter_uid)
				JOIN hr.tbl_gehaltsbestandteil geh USING (dienstverhaeltnis_id)
				JOIN hr.tbl_vertragsbestandteil vtb ON geh.vertragsbestandteil_id = vtb.vertragsbestandteil_id
			WHERE
				geh.dienstverhaeltnis_id <> vtb.dienstverhaeltnis_id";

		if (isset($person_id))
		{
			$qry .= " AND ben.person_id = ?";
			$params[] = $person_id;
		}

		if (isset($gehaltsbestandteil_id))
		{
			$qry .= " AND geh.gehaltsbestandteil_id = ?";
			$params[] = $gehaltsbestandteil_id;
		}

		if (isset($vertragsbestandteil_id))
		{
			$qry .= " AND vtb.vertragsbestandteil_id = ?";
			$params[] = $vertragsbestandteil_id;
		}

		$qry .= "
			ORDER BY
				person_id, dienstverhaeltnis_id, gehaltsbestandteil_id";

		return $this->_db->execReadOnlyQuery($qry, $params);
	}

	//------------------------------------------------------------------------------------------------------------------
	// Funktion checks

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
