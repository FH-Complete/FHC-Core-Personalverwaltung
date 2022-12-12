<?php

class Vertragsbestandteil_funktionen_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_vertragsbestandteil_funktionen';
		$this->pk = 'vertragsbestandteil_id';
	}
    
}