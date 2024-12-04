<?php


class Gehaltshistorie_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_gehaltshistorie';
		$this->pk = 'gehaltshistorie_id';
	}
	
    public function getEncryptedColumns(): array
    {
		return array(
			'betrag' => array(
				DB_Model::CRYPT_CAST => 'numeric',
				DB_Model::CRYPT_PASSWORD_NAME => 'ENCRYPTIONKEYGEHALT'
			)
		);
    }

	public function deleteByOrgID($orgID, $date)
    {		
		if (is_null($date) || strtolower($date) === 'null')
		{
			throw new Exception('missing date parameter');
		}
		else
		{
			$date = date("Y-m-t", strtotime($date));
		}

        $qry = 'DELETE FROM
					hr.tbl_gehaltshistorie h USING hr.tbl_gehaltsbestandteil gb, hr.tbl_dienstverhaeltnis dv
				WHERE 
					h.gehaltsbestandteil_id = gb.gehaltsbestandteil_id
					AND gb.dienstverhaeltnis_id = dv.dienstverhaeltnis_id
					AND dv.oe_kurzbz=?
					AND EXTRACT(MONTH FROM h.datum) = ? and EXTRACT(Year FROM h.datum) = ?
		';

        return $this->execQuery($qry, array($orgID, date("n", $date), date("y", $date)));
    }

	public function deleteByGehaltsbestandteilID($gehaltsbestandteil_id)
    {
        $qry = "DELETE FROM " . $this->dbTable ." ".
               "WHERE gehaltsbestandteil_id = ?";

        return $this->execQuery($qry, array($gehaltsbestandteil_id));
    }
}    
