<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

class Schluesselverwaltung extends Auth_Controller
{
	public function __construct()
	{
		parent::__construct(
			array(
				'index' => array('extension/pv21_schluesselver:r', 'basis/mitarbeiter:r')
			)
		);
	}

	public function index()
	{
		$this->load->view('extensions/FHC-Core-Personalverwaltung/restricted/schluesselverwaltung.php', ['betriebsmittelTypes' => ['Schluessel'], 'filterByProvidedTypes' => true]);
	}
}
