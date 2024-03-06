<?php


class FristStatus_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_frist_status';
		$this->pk = 'status_kurzbz';
	}

}
