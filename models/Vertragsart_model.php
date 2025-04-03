<?php


class Vertragsart_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_vertragsart';
		$this->pk = 'vertragsart_kurzbz';		
	}

}    
