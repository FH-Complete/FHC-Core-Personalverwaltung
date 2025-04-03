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
		$this->dbTable .= ' t';
		$this->addSelect('t.tmp_store_id, t.mitarbeiter_uid, t.typ, '
			. 'jsonb_extract_path(t.formdata, \'dv\', \'data\', \'dienstverhaeltnisid\') AS dienstverhaeltnisid, '
			. 't.insertvon, t.insertamum, t.updatevon, t.updateamum, '
			. 'pi.nachname AS inachname, pi.vorname AS ivorname, '
			. 'pu.nachname AS unachname, pu.vorname AS uvorname');

		$this->addJoin('public.tbl_benutzer bi', 'bi.uid = t.insertvon', 'LEFT');
		$this->addJoin('public.tbl_person pi', 'bi.person_id = pi.person_id', 'LEFT');
		$this->addJoin('public.tbl_benutzer bu', 'bu.uid = t.updatevon', 'LEFT');
		$this->addJoin('public.tbl_person pu', 'bu.person_id = pu.person_id', 'LEFT');

		return $this->loadWhere(
			array(
				'mitarbeiter_uid' => $uid
			)
		);
	}
}    
