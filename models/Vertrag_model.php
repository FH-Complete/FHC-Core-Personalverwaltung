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
            von,
            bis,
            stundenausmass,
            zeitaufzeichnung,
            azgrelevant,
            homeoffice,
            dienstverhaeltnis_id,
            ba1code,
            verwendung_code,
            hauptberufcode,
            kv_gruppe,
            verwendungsgruppenjahr,
            dvart,
            inkludierte_lehre,
            vertragsart_kurzbz
        FROM hr.tbl_vertragsbestandteil 
        WHERE dienstverhaeltnis_id=?
        ORDER BY von desc
        ";

        return $this->execQuery($qry, array($dv_id));

    }

}