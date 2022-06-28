<?php
if (! defined('BASEPATH')) exit('No direct script access allowed');

class Home extends Auth_Controller
{
	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct(array(
			'index'=>'admin:rw'
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
		//$cList = $this->ApiModel->getContractExpireIn30Days();

		$this->load->library('WidgetLib');
		$this->load->view('extensions/FHC-Core-Personalverwaltung/home'/*, array('contracts' => $cList->retval)*/);
	}
}

