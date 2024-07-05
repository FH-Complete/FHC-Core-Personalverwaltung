<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class ValorisierungJob extends JOB_Controller
{

	private $_ci; // Code igniter instance

	public function __construct()
	{
		parent::__construct();

		$this->_ci =& get_instance();

		$this->load->helper('hlp_authentication_helper.php');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanz_model');
		$this->load->library('vertragsbestandteil/VertragsbestandteilLib', null, 'VertragsbestandteilLib');
	}


	public function do($valorisierung_kurzbz, $dienstverhaeltnis_id=null)
	{
		if( !$valorisierung_kurzbz )
		{
			die("missing parameter valorisierung_kurzbz\n");
		}

		echo "ValorisierungKurzbz: " . $valorisierung_kurzbz . "\n";
		echo "DienstverhaeltnisId: " . $dienstverhaeltnis_id . "\n";

		$this->load->library(
			'extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungLib',
			array('valorisierung_kurzbz' => $valorisierung_kurzbz),
			'ValorisierungLib'
		);

		$valinstanz = $this->ValorisierungInstanz_model->loadValorisierungInstanzByKurzbz($valorisierung_kurzbz);
		if( is_null($valinstanz) )
		{
			die('Valorisierung Instanz ' . $valorisierung_kurzbz . ' not found.' . "\n");
		}

		if (isset($dienstverhaeltnis_id))
		{
			$dienstverhaeltnis = $this->VertragsbestandteilLib->fetchDienstverhaeltnis($dienstverhaeltnis_id);
			$dv = new stdClass();
			$dv->dienstverhaeltnis_id = $dienstverhaeltnis->getDienstverhaeltnis_id();
			$this->ValorisierungLib->calculateValorisation($dv);
		}
		else
		{
			$this->ValorisierungLib->calculateAllValorisation();
		}

		$this->ValorisierungLib->displayCalculatedValorisation();
	}
}
