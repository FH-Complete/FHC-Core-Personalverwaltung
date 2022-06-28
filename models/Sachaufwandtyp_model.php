<?php
class Sachaufwandtyp_model extends DB_Model
{

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_sachaufwandtyp';
		$this->pk = 'sachaufwandtyp_kurzbz';
	}

    
}