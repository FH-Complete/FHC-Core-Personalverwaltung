<?php


class SalaryRange_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_gehaltsband';
		$this->pk = 'gehaltsband_kurzbz';
	}

	function getAll()
	{
		$qry ="
            SELECT
			gehaltsband_betrag_id,gehaltsband_kurzbz,bezeichnung,aktiv,sort,von,bis,betrag_von,betrag_bis
            FROM hr.tbl_gehaltsband_betrag b JOIN hr.tbl_gehaltsband g USING(gehaltsband_kurzbz)            
            ORDER BY g.sort ASC
        ";

        return $this->execQuery($qry);		
	}

}
