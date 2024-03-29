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

	public function deleteByGehaltsbestandteilID($gehaltsbestandteil_id)
    {
        $qry = "DELETE FROM " . $this->dbTable ." ".
               "WHERE gehaltsbestandteil_id = ?";

        return $this->execQuery($qry, array($gehaltsbestandteil_id));
    }
}    
