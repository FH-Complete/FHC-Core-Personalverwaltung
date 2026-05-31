<?php


class Zeitmodell_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_zeitmodell';
		$this->pk = 'zeitmodell_id';
	}

}
