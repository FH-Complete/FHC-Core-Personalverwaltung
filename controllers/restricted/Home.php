<?php
if (! defined('BASEPATH')) exit('No direct script access allowed');

class Home extends Auth_Controller
{

	const DEFAULT_PERMISSION = 'assistenz:r';

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct(array(
			'index'=> Home::DEFAULT_PERMISSION
			)
		);

		$this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
	}

	/**
	 * Index Controller
	 * @return void
	 */
	public function index()
	{
		$this->load->library('WidgetLib');
		$this->load->view('extensions/FHC-Core-Personalverwaltung/restricted/home');
	}
}

