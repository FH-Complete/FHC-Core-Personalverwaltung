<?php


class ValorisierungHistorie_model extends DB_Model
{

	public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_valorisierung_historie';
		$this->pk = 'valorisierung_historie_id';
	}
}
