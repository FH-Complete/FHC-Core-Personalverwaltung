<?php


class DvEndeGrund_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_dvendegrund';
		$this->pk = 'dvendegrund_kurzbz';		
	}

}    
