<?php
if (! defined('BASEPATH')) exit('No direct script access allowed');

class Employees extends Auth_Controller
{

	const DEFAULT_PERMISSION = 'assistenz:r';

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct(array(
			'index'=> Self::DEFAULT_PERMISSION	)
		);
		$this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
		
		// Loads WidgetLib
		$this->load->library('WidgetLib');

		// Loads phrases system
		$this->loadPhrases(
			array(
				'global',
				'ui',
				'filter'
			)
		);
	}

	/**
	 * Index Controller
	 * @return void
	 */
	public function index()
	{
		$this->load->library('WidgetLib');
		$this->load->view('extensions/FHC-Core-Personalverwaltung/employees/home');
	}
	
}

