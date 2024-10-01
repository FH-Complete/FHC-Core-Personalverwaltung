<?php


class ValorisierungInstanzMethod_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_valorisierung_instanz_methode';
		$this->hasSequence = false;
		$this->pk = array('valorisierung_instanz_id', 'valorisierung_method_kurzbz');
	}

	public function getValorisierungInstanzForDatum($valorisierungsdatum)
	{
		$res = $this->loadWhere('valorisierungsdatum = ' . $this->escape($valorisierungsdatum));
		if( hasData($res) ) {
			return getData($res);
		}
	}

	public function loadValorisierungInstanzById($valorisierung_instanz_id)
	{
		$res = $this->loadWhere('valorisierung_instanz_id = ' . $this->escape($valorisierung_instanz_id));
		if( hasData($res) )
		{
			$vals = getData($res);
			return $vals;
		}
		return array();
	}
}
