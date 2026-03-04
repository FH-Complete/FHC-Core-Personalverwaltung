<?php


class Fachrichtung_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_lohnguide_fachrichtung';
		$this->pk = 'fachrichtung_kurzbz';
	}

}    
