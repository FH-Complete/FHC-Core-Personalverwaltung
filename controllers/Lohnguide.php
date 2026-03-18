<?php
if (! defined('BASEPATH')) exit('No direct script access allowed');

class Lohnguide extends Auth_Controller
{

	const DEFAULT_PERMISSION = 'basis/gehaelter:r';
	private $_ci; // Code igniter instance

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct(array(
			'index'=> Lohnguide::DEFAULT_PERMISSION
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
		$this->load->view('extensions/FHC-Core-Personalverwaltung/lohnguide/home');
	}


	
}

