<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');


class GehaltsLib
{
	private $_ci; // Code igniter instance
	
	public function __construct()
	{
		$this->_ci =& get_instance();

		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Gehaltshistorie_model', 'GehaltshistorieModel');
		$this->_ci->load->model('vertragsbestandteil/Gehaltsbestandteil_model', 'GehaltsbestandteilModel');
		// Loads the DB config to encrypt/decrypt data
		$this->_ci->GehaltshistorieModel->config->load('db_crypt');
	}

	public function getBestandteile($date = null, $user = null, $oe_kurzbz = null)
	{
		$this->_ci->GehaltsbestandteilModel->addSelect('tbl_gehaltsbestandteil.*, dienstverhaeltnis.mitarbeiter_uid');
		$this->_ci->GehaltsbestandteilModel->addJoin('hr.tbl_dienstverhaeltnis dienstverhaeltnis', 'dienstverhaeltnis_id');
		$this->_ci->GehaltsbestandteilModel->addJoin('public.tbl_mitarbeiter mitarbeiter', 'mitarbeiter_uid');
		$this->_ci->GehaltsbestandteilModel->addJoin('public.tbl_benutzer benutzer', 'mitarbeiter.mitarbeiter_uid = benutzer.uid');

		$date = $this->getDate($date);
		$where = "
				(((EXTRACT(MONTH FROM tbl_gehaltsbestandteil.bis) >= ". $this->_ci->db->escape($date['month']) .")
					AND (EXTRACT(YEAR FROM tbl_gehaltsbestandteil.bis) >= ". $this->_ci->db->escape($date['year']) ."))
					OR tbl_gehaltsbestandteil.bis IS NULL)
				AND
				(((EXTRACT(MONTH FROM tbl_gehaltsbestandteil.von) <= ". $this->_ci->db->escape($date['month']) .")
					AND (EXTRACT(YEAR FROM tbl_gehaltsbestandteil.von) <= ". $this->_ci->db->escape($date['year']) ."))
					OR tbl_gehaltsbestandteil.von IS NULL)
		";

		if (is_null($user) || strtolower($user) === "null")
			$where .= ' AND benutzer.aktiv';
		else
			$where .= ' AND dienstverhaeltnis.mitarbeiter_uid =' . $this->_ci->db->escape($user);

		if (!is_null($oe_kurzbz) && strtolower($oe_kurzbz) !== "null")
			$where .= ' AND dienstverhaeltnis.oe_kurzbz =' . $this->_ci->db->escape($oe_kurzbz);

		$result = $this->_ci->GehaltsbestandteilModel->loadWhere($where, $this->_ci->GehaltsbestandteilModel->getEncryptedColumns());

		if (isError($result)) return $result;

		if (!hasData($result)) return error("Keine Gehaltsbestandteile gefunden!");

		return $result;
	}

	/**
	 * fetch sum of Abgerechnet between $from and $to
	 */
	public function fetchAbgerechnet($dv_id, $from, $to)
	{
		/*
		$this->_ci->GehaltshistorieModel->addSelect('sum(betrag)');
		$this->_ci->GehaltshistorieModel->addJoin('hr.tbl_gehaltsbestandteil', 'gehaltsbestandteil_id');

		$date = $this->getDate($date);
		$where .= 'hr.tbl_gehaltsbestandteil.dienstverhaeltnis_id =' . $this->_ci->db->escape($dv_id);
		$where .= "
				AND (((EXTRACT(MONTH FROM tbl_gehaltshistorie.datum) = ". $this->_ci->db->escape($date['month']) .")
					AND (EXTRACT(YEAR FROM tbl_gehaltshistorie.datum) = ". $this->_ci->db->escape($date['year']) .")))
		";
				

		$result = $this->_ci->GehaltshistorieModel->loadWhere($where, 
			$this->_ci->GehaltshistorieModel->getEncryptedColumns());

		if (isError($result)) return $result;

		if (!hasData($result)) return error("Keine Gehaltshistorie gefunden!");


 	 $result = $this->execQuery($qry,
			array($dv_id, $month, $year),
			$this->getEncryptedColumns()); */
		// ---------------------

		$from_date = $this->getDate($from);
		$to_date = $this->getDate($to);

		$qry = "
        SELECT
            sum(betrag),tbl_gehaltshistorie.datum
        FROM hr.tbl_gehaltshistorie JOIN hr.tbl_gehaltsbestandteil USING(gehaltsbestandteil_id)
        WHERE hr.tbl_gehaltsbestandteil.dienstverhaeltnis_id = ?
		AND tbl_gehaltshistorie.datum BETWEEN ? AND ?
		GROUP BY tbl_gehaltshistorie.datum
		ORDER BY tbl_gehaltshistorie.datum
        
        ";		

		$result = $this->_ci->GehaltshistorieModel->execReadOnlyQuery(
			$qry,
			array($dv_id, $from, $to),
			$this->_ci->GehaltshistorieModel->getEncryptedColumns());
		
		return $result;
	}

	public function existsGehaltshistorie($bestandteil, $date)
	{
		$this->_ci->GehaltshistorieModel->addSelect('EXTRACT(MONTH FROM hr.tbl_gehaltshistorie.datum) as month');

		$date = $this->getDate($date);

		$where = "EXTRACT(MONTH FROM hr.tbl_gehaltshistorie.datum) = ". $this->_ci->db->escape($date['month']);
		$where .= " AND EXTRACT(YEAR FROM hr.tbl_gehaltshistorie.datum) = ". $this->_ci->db->escape($date['year']);
		$where .= " AND betrag = " . $this->_ci->db->escape($bestandteil->betrag_valorisiert);
		$where .= " AND gehaltsbestandteil_id = " . $this->_ci->db->escape($bestandteil->gehaltsbestandteil_id);

		$result = $this->_ci->GehaltshistorieModel->loadWhere($where, $this->_ci->GehaltshistorieModel->getEncryptedColumns());

		if (isError($result)) return $result;

		return $result;
	}
	
	public function addHistorie($bestandteil, $date)
	{
		
		if (is_null($date) || strtolower($date) === 'null')
		{
			$date = date("Y-m-t");
		}
		else
		{
			$date = date("Y-m-t", strtotime($date));
		}
		
		$result = $this->_ci->GehaltshistorieModel->insert(
			array(
				'datum' => $date,
				'betrag' => $bestandteil->betrag_valorisiert,
				'gehaltsbestandteil_id' => $bestandteil->gehaltsbestandteil_id,
				'mitarbeiter_uid' => $bestandteil->mitarbeiter_uid
			),
			$this->_ci->GehaltshistorieModel->getEncryptedColumns()
		);

		if (isError($result)) return $result;

		return $result;
	}

	public function deleteAbrechnung($bestandteil)
	{
		$ret = $this->_ci->GehaltshistorieModel->deleteByGehaltsbestandteilID(
			$bestandteil->getGehaltsbestandteil_id());

		if (isError($ret))
		{
			throw new Exception('error deleting Gehaltshistorie');
		}

		return	$ret;
	}
	
	private function getDate($date)
	{
		if (is_null($date) || strtolower($date) === 'null')
		{
			$month = date('n');
			$year = date('Y');
		}
		else
		{
			$month = date("n", strtotime($date));
			$year = date("Y", strtotime($date));
		}
		return array('month' => $month, 'year' => $year);
	}
}
