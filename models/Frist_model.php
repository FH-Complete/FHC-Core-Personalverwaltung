<?php

class Frist_model extends DB_Model
{
	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_frist';
		$this->pk = 'frist_id';
	}
}
