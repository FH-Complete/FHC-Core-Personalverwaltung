<?php


class FristEreignis_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_frist_ereignis';
		$this->pk = 'ereignis_kurzbz';
	}

}
