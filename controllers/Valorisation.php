<?php
if (! defined('BASEPATH')) exit('No direct script access allowed');

class Valorisation extends Auth_Controller
{

	const DEFAULT_PERMISSION = 'extension/pv21_valorisierung:r';

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct(array(
			'index'=> self::DEFAULT_PERMISSION
			)
		);
	}

	/**
	 * Index Controller
	 * @return void
	 */
	public function index()
	{
		$this->load->view('extensions/FHC-Core-Personalverwaltung/bulk/valorisation');
	}
}

