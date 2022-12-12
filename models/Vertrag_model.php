<?php

class Vertrag_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_vertragsbestandteil';
		$this->pk = 'vertragsbestandteil_id';
	}

    public function getVertragByDV($dv_id)
    {
		$qry = "
        SELECT
            vertragsbestandteil_id,
            dienstverhaeltnis_id,
            vertragsart_kurzbz,
            vertragsbestandteil_kurzbz,
            von,
            bis,
            befristet,
            stundenausmass,
            zeitaufzeichnung,
            azgrelevant,
            homeoffice,
            inkludierte_lehre,            
            verwendung_code,
            hauptberufcode,
            kv_gruppe,
            verwendungsgruppenjahr,            
            vertragsbestandteil_id_parent,
            titel,
            beschreibung
        FROM hr.tbl_vertragsbestandteil 
        WHERE dienstverhaeltnis_id=?
        ORDER BY von desc
        ";

        return $this->execQuery($qry, array($dv_id));

    }

}