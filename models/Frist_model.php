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

	public function batchUpdateStatus(array $fristen, string $status_kurzbz, string $updatevon)
	{
		$this->db->where_in("frist_id", $fristen);
		$result = $this->db->update($this->dbTable, array("status_kurzbz" => $status_kurzbz, "updateamum" => "NOW()", "updatevon" => $updatevon));

        return $result;
	}
}
