<?php

class Dienstverhaeltnis_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_dienstverhaeltnis';
		$this->pk = 'dienstverhaeltnis_id';
	}

    public function getAllDVByPersonID($person_id)
    {
        $result = null;

		$qry = "
        SELECT tbl_benutzer.uid,
            tbl_mitarbeiter.personalnummer,
            tbl_mitarbeiter.kurzbz,
            tbl_mitarbeiter.lektor,
            tbl_mitarbeiter.fixangestellt,
            tbl_person.person_id,
            tbl_benutzer.alias,
            dv.von,
            dv.bis,     
            dv.oe_kurzbz,
            dv.vertragsart_kurzbz,       
            dv.updateamum,
            dv.updatevon,
        FROM tbl_mitarbeiter
            JOIN tbl_benutzer ON tbl_mitarbeiter.mitarbeiter_uid::text = tbl_benutzer.uid::text
            JOIN tbl_person USING (person_id)
            JOIN hr.tbl_dienstverhaeltnis dv ON(tbl_benutzer.uid::text = dv.uid::text)
        WHERE tbl_person.person_id=?
        ";

        return $this->execQuery($qry, array($person_id));
		
		return $result;
    }

}