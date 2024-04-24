<?php


class SalaryRangeFunktion_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_gehaltsband_betrag';
		$this->pk = 'gehaltsband_funktion _id';
	}

}
