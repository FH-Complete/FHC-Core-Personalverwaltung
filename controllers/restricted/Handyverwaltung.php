<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Overview on cronjob logs
 */
class Handyverwaltung extends Auth_Controller
{
	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct(
			array(
				'index' => array('extension/pv21_handyverwaltung:rw', 'admin:rw')
			)
		);
	}

	// -----------------------------------------------------------------------------------------------------------------
	// Public methods

	/**
	 * Everything has a beginning
	 */
	public function index()
	{
		$this->load->view('extensions/FHC-Core-Personalverwaltung/restricted/handyverwaltung.php');
	}
}
