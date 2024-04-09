<?php
if (! defined('BASEPATH')) exit('No direct script access allowed');

class Bulk extends Auth_Controller
{

	const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct(array(
			'index'=> Bulk::DEFAULT_PERMISSION
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
		$this->load->view('extensions/FHC-Core-Personalverwaltung/bulk/home');
	}
}

