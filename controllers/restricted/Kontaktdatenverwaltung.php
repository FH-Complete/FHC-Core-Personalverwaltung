<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

class Kontaktdatenverwaltung extends Auth_Controller
{
	public function __construct()
	{
		parent::__construct(
			array(
				'index' => array('extension/pv21_kontaktdatenver:r', 'basis/mitarbeiter:r')
			)
		);
	}

	public function index()
	{
		$this->load->view('extensions/FHC-Core-Personalverwaltung/restricted/kontaktdatenverwaltung.php');
	}
}
