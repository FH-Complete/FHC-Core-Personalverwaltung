<?php


class ValorisierungHistorie_model extends DB_Model implements IEncryption
{

	public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_valorisierung_historie';
		$this->pk = 'valorisierung_historie_id';
	}

	public function getEncryptedColumns(): array
	{
		return array(
			'betrag_valorisiert' => array(
				DB_Model::CRYPT_CAST => 'numeric',
				DB_Model::CRYPT_PASSWORD_NAME => 'ENCRYPTIONKEYGEHALT'
			)
		);
    }
}
