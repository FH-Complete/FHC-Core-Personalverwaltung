<?php


class Verwendungsgruppenjahr_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_kollektivvertrag_verwendungsgruppenjahr';
		$this->pk = 'kv_jahre';
	}

}
