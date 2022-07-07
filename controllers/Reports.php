<?php
if (! defined('BASEPATH')) exit('No direct script access allowed');

class Reports extends Auth_Controller
{

	private const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct(array(
			'index'=>Reports::DEFAULT_PERMISSION
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
		$this->load->view('extensions/FHC-Core-Personalverwaltung/reports/home');
	}
}

