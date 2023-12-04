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


	public function do($dienstverhaeltnis_id=null)
	{
		if( !$dienstverhaeltnis_id ) 
		{
			echo "missing parameter dienstverhaeltnis_id\n";
		}
		
		$dienstverhaeltnis_id . "\n";
		
		$valinstanz = $this->ValorisierungInstanz_model->getValorisierungInstanzForDienstverhaeltnis($dienstverhaeltnis_id);
		print_r($valinstanz);
		
		$gehaltsbestandteile = $this->GehaltsbestandteilLib->fetchGehaltsbestandteile($dienstverhaeltnis_id, 
			$valinstanz->valorisierungsdatum, false);
		
		$valmethod = $this->ValorisationFactory->getValorisationMethod($valinstanz->valorisierung_methode_kurzbz);
		$params = json_decode($valinstanz->valorisierung_methode_parameter);
		$valmethod->doValorisation($gehaltsbestandteile, $params);
	}
}