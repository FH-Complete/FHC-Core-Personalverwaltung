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
		$this->load->library('vertragsbestandteil/GehaltsbestandteilLib', null, 'GehaltsbestandteilLib');
		$this->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisationFactory', null, 'ValorisationFactory');
	}


	public function do($valorisierungsdatum, $dienstverhaeltnis_id=null)
	{
		if( !$valorisierungsdatum ) 
		{
			echo "missing parameter valorisierungsdatum\n";
		}
		
		$valorisierungsdatum . "\n";
		$dienstverhaeltnis_id . "\n";
		
		$valinstanzen = $this->ValorisierungInstanz_model->getValorisierungInstanzForDatum($valorisierungsdatum);
		
		$gehaltsbestandteile = $this->GehaltsbestandteilLib->fetchGehaltsbestandteile($dienstverhaeltnis_id, 
			$valorisierungsdatum, false);
		
		$usedvalinstances = array();
		foreach ($valinstanzen as $valinstanz)
		{
			$valmethod = $this->ValorisationFactory->getValorisationMethod($valinstanz->valorisierung_methode_kurzbz);
			$params = json_decode($valinstanz->valorisierung_methode_parameter);
			$valmethod->initialize($gehaltsbestandteile, $params);
			$valmethod->checkParams();
			if($valmethod->checkIfApplicable())
			{
				$usedvalinstances[] = $valmethod;
			}
		}

		if(count($usedvalinstances) < 1) 
		{
			throw Exception('ERROR: no Valorisation Method applicable.');
		}
		
		if(count($usedvalinstances) > 1) 
		{
			throw Exception('ERROR: more than one Valorisation Method applicable.');
		}
		
		$usedvalinstanz = $usedvalinstances[0];
		$usedvalinstanz->doValorisation();
	}
}