<?php


class Kollektivvertrag_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_kollektivvertrag';
		$this->pk = 'kollektivvertrag_kurzbz';
	}

}
