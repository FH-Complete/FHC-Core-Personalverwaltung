<?php


class Gehaltsabrechnung_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_gehaltsabrechnung';
		$this->pk = 'gehaltsabrechnung_id';
	}
	
    public function getEncryptedColumns(): array
    {
		return array(
			'betrag' => array(
				DB_Model::CRYPT_CAST => 'numeric',
				DB_Model::CRYPT_PASSWORD_NAME => 'ENCRYPTIONKEY'
			)
		);
    }
}    
