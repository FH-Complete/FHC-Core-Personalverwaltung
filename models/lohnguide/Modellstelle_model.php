<?php


class Modellstelle_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_lohnguide_modellstelle';
		$this->pk = 'modellstelle_kurzbz';
	}

}    
