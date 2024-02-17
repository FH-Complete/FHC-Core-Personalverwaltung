<?php


class ValorisierungInstanz_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_valorisierunginstanz';
		$this->pk = 'valorisierunginstanz_id';		
	}

	public function getValorisierungInstanzForDatum($valorisierungsdatum) {
		$res = $this->loadWhere('valorisierungsdatum = ' . $this->db->escape($valorisierungsdatum));
		if( hasData($res) ) {
			return getData($res);
		}
	}
	
	public function getValorisierungInstanzForDienstverhaeltnis($dienstverhaeltnis_id) {
		$this->dbTable .= ' vi';
		$this->addSelect('vi.*');
		$this->addJoin('hr.tbl_valorisierung_dienstverhaeltnis vdv', 'valorisierunginstanz_id');
		$res = $this->loadWhere('vdv.dienstverhaeltnis_id = ' . $this->db->escape($dienstverhaeltnis_id));
		if( hasData($res) ) {
			return (getData($res))[0];
		}
	}
}    
