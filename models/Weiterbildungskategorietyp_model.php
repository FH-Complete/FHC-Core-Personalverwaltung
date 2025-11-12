<?php


class Weiterbildungskategorietyp_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_weiterbildungskategorietyp';
		$this->pk = 'weiterbildungskategorietyp_kurzbz';
	}

}    
