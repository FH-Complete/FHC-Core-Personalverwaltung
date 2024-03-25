<?php

defined('BASEPATH') || exit('No direct script access allowed');


class Valorisierung extends FHCAPI_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';

    public function __construct() {        
        parent::__construct(
	    array(
		'index' => self::DEFAULT_PERMISSION,
		'doValorisation' => self::DEFAULT_PERMISSION
	    )
	);
	
	$this->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungLib', null, 'ValorisierungLib');
    }

    public function index()
    {
	$this->terminateWithSuccess('not implemented');
    }
	
    public function doValorisation($valorisationInstanzKurzbz)
    {
	try
	{
	    $valinstanz = $this->ValorisierungLib->findValorisierungInstanz($valorisationInstanzKurzbz);
	    $this->terminateWithSuccess($valinstanz);
	}
	catch (Exception $ex)
	{
	    $this->terminateWithError($ex->getMessage());
	}	
    }
}