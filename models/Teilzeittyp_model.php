<?php


class Teilzeittyp_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_teilzeittyp';
		$this->pk = 'teilzeittyp_kurzbz';		
	}

}    
