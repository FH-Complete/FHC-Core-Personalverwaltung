<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');


class GehaltsLib
{
	private $_ci; // Code igniter instance
	
	public function __construct()
	{
		$this->_ci =& get_instance();

		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Gehaltsabrechnung_model', 'GehaltsabrechnungModel');
		$this->_ci->load->model('vertragsbestandteil/Gehaltsbestandteil_model', 'GehaltsbestandteilModel');
	}

	public function getBestandteile($date = null, $user = null)
	{
		$this->_ci->GehaltsbestandteilModel->addSelect('tbl_gehaltsbestandteil.*');
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

		if (is_null($user))
			$where .= ' AND benutzer.aktiv';
		else
			$where .= ' AND dienstverhaeltnis.mitarbeiter_uid =' . $this->_ci->db->escape($user);

		$result = $this->_ci->GehaltsbestandteilModel->loadWhere($where, 
			$this->_ci->GehaltsbestandteilModel->getEncryptedColumns());

		if (isError($result)) return $result;

		if (!hasData($result)) return error("Keine Gehaltsbestandteile gefunden!");

		return $result;
	}

	public function existsAbrechnung($bestandteil, $date)
	{
		$this->_ci->GehaltsabrechnungModel->addSelect('EXTRACT(MONTH FROM hr.tbl_gehaltsabrechnung.datum) as month');

		$date = $this->getDate($date);

		$where = "EXTRACT(MONTH FROM hr.tbl_gehaltsabrechnung.datum) = ". $this->_ci->db->escape($date['month']);
		$where .= " AND EXTRACT(YEAR FROM hr.tbl_gehaltsabrechnung.datum) = ". $this->_ci->db->escape($date['year']);
		$where .= " AND betrag = " . $this->_ci->db->escape($bestandteil->betrag_valorisiert);

		$result = $this->_ci->GehaltsabrechnungModel->loadWhere($where, 
			$this->_ci->GehaltsabrechnungModel->getEncryptedColumns());

		if (isError($result)) return $result;

		return $result;
	}
	
	public function addAbrechnung($bestandteil, $date)
	{
		if (is_null($date))
		{
			$date = date("Y-m-t");
		}
		else
		{
			$date = date("Y-m-t", strtotime($date));
		}

		$result = $this->_ci->GehaltsabrechnungModel->insert(
			array(
				'datum' => $date,
				'betrag' => $bestandteil->betrag_valorisiert,
				'gehaltsbestandteil_id' => $bestandteil->gehaltsbestandteil_id
			), 
			$this->_ci->GehaltsabrechnungModel->getEncryptedColumns()
		);

		if (isError($result)) return $result;

		return $result;
	}
	
	private function getDate($date)
	{
		if (is_null($date))
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
