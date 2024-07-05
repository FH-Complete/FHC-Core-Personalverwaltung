<?php


class ValorisierungInstanz_model extends DB_Model
{

    public function __construct()
    {
	    parent::__construct();
	    $this->dbTable = 'hr.tbl_valorisierung_instanz';
	    $this->pk = 'valorisierung_instanz_id';
    }

    public function getValorisierungInstanzForDatum($valorisierungsdatum)
    {
	    $res = $this->loadWhere('valorisierungsdatum = ' . $this->escape($valorisierungsdatum));
	    if( hasData($res) ) {
		    return getData($res);
	    }
    }

    public function loadValorisierungInstanzByKurzbz($valorisierung_kurzbz)
    {
	    $res = $this->loadWhere('valorisierung_kurzbz = ' . $this->escape($valorisierung_kurzbz));
	    if( hasData($res) )
	    {
		    $vals = getData($res);
		    return $vals[0];
	    }
	    return null;
    }

    public function getValorisierungInstanzForDienstverhaeltnis($dienstverhaeltnis_id)
    {
	    $this->addFrom($this->dbTable, 'vi');
	    $this->addSelect('vi.*');
	    $this->addJoin('hr.tbl_valorisierung_dienstverhaeltnis vdv', 'valorisierunginstanz_id');
	    $res = $this->loadWhere('vdv.dienstverhaeltnis_id = ' . $this->escape($dienstverhaeltnis_id));
	    if( hasData($res) ) {
		    return (getData($res))[0];
	    }
    }

    public function getNonSelectedValorisierungInstanzen()
    {
		$qry = '
			SELECT
				valorisierung_kurzbz AS value, valorisierung_kurzbz || \' (\' || valorisierungsdatum || \')\' AS label, \'false\'::boolean AS disabled
			FROM
				hr.tbl_valorisierung_instanz vi
			WHERE
				ausgewaehlt = FALSE
				AND NOT EXISTS (
					SELECT 1
					FROM
						hr.tbl_valorisierung_instanz
					WHERE
						ausgewaehlt
						AND valorisierungsdatum = vi.valorisierungsdatum
				)
			ORDER BY
				valorisierungsdatum DESC';

		return $this->execQuery($qry);
    }
}
