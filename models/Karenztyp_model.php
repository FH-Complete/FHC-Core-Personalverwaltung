<?php


class Karenztyp_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_karenztyp';
		$this->pk = 'karenztyp_kurzbz';		
	}

}    
