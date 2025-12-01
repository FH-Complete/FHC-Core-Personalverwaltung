<?php
class Weiterbildungdokument_model extends DB_Model
{

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_weiterbildung_dokument';
		$this->pk= array('weiterbildung_id' , 'dms_id');
	}
}