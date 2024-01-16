<?php

class Valorisierung_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_valorisierung';
		$this->pk = 'valorisierung_id';
	}

    public function getValoriserungByDV($dv_id)
    {
		$qry = "
        SELECT
            valorisierung_id,  
            jahr,
            prozent,
            betrag,
            dienstverhaeltnis_id            
        FROM hr.tbl_valorisierung 
        WHERE dienstverhaeltnis_id=?
        ORDER BY von desc
        ";

        return $this->execQuery($qry, array($dv_id));

    }

}