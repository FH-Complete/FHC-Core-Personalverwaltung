<?php


class Gehaltstyp_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_gehaltstyp';
		$this->pk = 'gehaltstyp_kurzbz';
	}

}    
