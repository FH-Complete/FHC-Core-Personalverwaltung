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
		$this->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanzMethod_model');
		$this->load->library('vertragsbestandteil/VertragsbestandteilLib', null, 'VertragsbestandteilLib');
		$this->load->library('vertragsbestandteil/GehaltsbestandteilLib', null, 'GehaltsbestandteilLib');
		$this->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisationFactory', null, 'ValorisationFactory');
	}


	public function do($valorisierung_kurzbz, $dienstverhaeltnis_id=null)
	{
		if( !$valorisierung_kurzbz )
		{
			echo "missing parameter valorisierung_kurzbz\n";
		}

		echo "ValorisierungKurzbz: " . $valorisierung_kurzbz . "\n";
		echo "DienstverhaeltnisId: " . $dienstverhaeltnis_id . "\n";

		$valinstanz = $this->ValorisierungInstanz_model->loadValorisierungInstanzByKurzbz($valorisierung_kurzbz);
		if( is_null($valinstanz) )
		{
			die('Valorisierung Instanz ' . $valorisierung_kurzbz . ' not found.' . "\n");
		}

		$dienstverhaeltnis = $this->VertragsbestandteilLib->fetchDienstverhaeltnis($dienstverhaeltnis_id);
		$vertragsbestandteile = $this->VertragsbestandteilLib->fetchVertragsbestandteile($dienstverhaeltnis_id,
			$valinstanz->valorisierungsdatum, false);
		$gehaltsbestandteile = $this->GehaltsbestandteilLib->fetchGehaltsbestandteile($dienstverhaeltnis_id,
			$valinstanz->valorisierungsdatum, false);

		$valinstanzmethoden = $this->ValorisierungInstanzMethod_model->loadValorisierungInstanzByKurzbz($valinstanz->valorisierung_instanz_id);

		$usedvalinstances = array();
		foreach ($valinstanzmethoden as $valinstanzmethod)
		{
			$valmethod = $this->ValorisationFactory->getValorisationMethod($valinstanzmethod->valorisierung_methode_kurzbz);
			$params = json_decode($valinstanzmethod->valorisierung_methode_parameter);
			$valmethod->initialize($dienstverhaeltnis, $vertragsbestandteile, $gehaltsbestandteile, $params);
			$valmethod->checkParams();
			if($valmethod->checkIfApplicable())
			{
				$usedvalinstances[] = $valmethod;
			}
		}

		if(count($usedvalinstances) > 1)
		{
			throw Exception('ERROR: more than one Valorisation Method applicable.');
		}

		if(count($usedvalinstances) == 1)
		{
			$usedvalinstanz = $usedvalinstances[0];
			$usedvalinstanz->doValorisation();
		}
	}
}
