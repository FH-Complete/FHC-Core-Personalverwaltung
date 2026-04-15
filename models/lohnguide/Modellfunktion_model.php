<?php


class Modellfunktion_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_lohnguide_modellfunktion';
		$this->pk = 'modellfunktion_kurzbz';
	}

}    
