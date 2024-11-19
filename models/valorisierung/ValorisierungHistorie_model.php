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

	/**
	 * Gets Valorisation history for all Gehaltsbestandteile of given Dienstverhältnisse.
	 * @param $dienstverhaeltnisIdArr
	 * @return success or error object
	 */
	public function getValorisierungHistorieByDv($dienstverhaeltnisIdArr)
	{
		$params = [];

		$qry = '
			SELECT
				gehaltsbestandteil_id, valorisierungsdatum, betrag_valorisiert AS betr_valorisiert_decrypted
			FROM
				hr.tbl_valorisierung_historie h
			WHERE EXISTS
			(
				SELECT 1
				FROM
					hr.tbl_dienstverhaeltnis
					JOIN hr.tbl_gehaltsbestandteil USING (dienstverhaeltnis_id)
				WHERE
					gehaltsbestandteil_id = h.gehaltsbestandteil_id';

		if (isset($dienstverhaeltnisIdArr) && !isEmptyArray($dienstverhaeltnisIdArr))
		{
			$qry .= '
					AND dienstverhaeltnis_id IN ?';

			$params[] = $dienstverhaeltnisIdArr;
		}

		$qry .= ')';

		return $this->execQuery(
			$qry,
			$params,
			$this->getEncryptedColumns()
		);
	}
}
