<?php

class Vertragsbestandteil_kuendigungsfrist_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_vertragsbestandteil_kuendigungsfrist';
		$this->pk = 'vertragsbestandteil_id';
	}
    
}