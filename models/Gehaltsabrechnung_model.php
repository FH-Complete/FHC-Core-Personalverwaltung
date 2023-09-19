<?php


class Gehaltsabrechnung_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_gehaltsabrechnung';
		$this->pk = 'gehaltsabrechnung_id';
	}
}    
