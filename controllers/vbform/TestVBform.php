<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Test VBform Vue Component
 */
class TestVBform extends Auth_Controller
{
        const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct(
			array(
				'index' => self::DEFAULT_PERMISSION
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
		$this->load->view('extensions/FHC-Core-Personalverwaltung/vbform/testVBform');
	}
}
