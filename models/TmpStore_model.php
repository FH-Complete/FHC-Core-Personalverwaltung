<?php


class TmpStore_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_tmp_store';
		$this->pk = 'tmp_store_id';		
	}

	public function listTmpStoreForUid($uid)
	{
		$this->addSelect('tmp_store_id, mitarbeiter_uid, typ, insertvon, '
			. 'insertamum, updatevon, updateamum');

		return $this->loadWhere(
			array(
				'mitarbeiter_uid' => $uid
			)
		);
	}
}    
