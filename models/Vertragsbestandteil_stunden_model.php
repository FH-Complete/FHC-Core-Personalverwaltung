<?php

class Vertragsbestandteil_stunden_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_vertragsbestandteil_stunden';
		$this->pk = 'vertragsbestandteil_id';
	}
    
}