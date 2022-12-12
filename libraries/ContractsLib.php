<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class ContractsLib 
{

    private $_ci; // Code igniter instance

	/**
	 * init
	 */
	public function __construct()
	{
		$this->_ci =& get_instance(); // get code igniter instance

        // Loads DienstverhaeltnisModel
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Dienstverhaeltnis_model', 'DienstverhaeltnisModel');
        // Loads VertragsbestandteilModel
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Vertragsbestandteil_model', 'VertragsbestandteilModel');
        // Loads VertragsbestandteilStundenModel
        $this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Vertragsbestandteil_stunden_model', 'VertragsbestandteilStundenModel');
        // Loads GehaltsbestandteilModel
        $this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Gehaltsbestandteil_model', 'GehaltsbestandteilModel');
        

    }



}