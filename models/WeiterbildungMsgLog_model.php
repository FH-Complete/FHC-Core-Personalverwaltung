<?php


class WeiterbildungMsgLog_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_weiterbildung_msg_log';
		$this->pk = 'weiterbildung_msg_log_id';
	}

}