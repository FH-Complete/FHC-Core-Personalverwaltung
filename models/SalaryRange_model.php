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


	function getAllByDateRange($von, $bis)
	{
		// validate 
		$date_von = DateTime::createFromFormat( 'Y-m-d', $von );
		$date_bis = DateTime::createFromFormat( 'Y-m-d', $bis );
        $von_datestring = $date_von->format("Y-m-d");
		$bis_datestring = $date_bis->format("Y-m-d");
		$qry ="
            SELECT
			gehaltsband_betrag_id,gehaltsband_kurzbz,bezeichnung,aktiv,sort,von,bis,betrag_von,betrag_bis
            FROM hr.tbl_gehaltsband_betrag b JOIN hr.tbl_gehaltsband g USING(gehaltsband_kurzbz)   
			WHERE b.von<=? and (b.bis is null or b.bis>=?)
            ORDER BY g.sort ASC
        ";

		$queryparam = array();
		$queryparam[] = $bis_datestring;
		$queryparam[] = $von_datestring;
		

        return $this->execQuery($qry, $queryparam);		
	}


}
