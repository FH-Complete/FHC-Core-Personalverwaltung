<?php


class Jobfamilie_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_lohnguide_jobfamilie';
		$this->pk = 'jobfamilie_kurzbz';
	}

}
