<?php


class Verwendungsgruppe_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_kollektivvertrag_verwendungsgruppe';
		$this->pk = 'verwendungsgruppe_kurzbz';
	}

}
