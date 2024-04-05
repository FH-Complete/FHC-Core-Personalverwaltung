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
	
    public function doValorisation($valorisationInstanzKurzbz=null)
    {
	$sumsalaryprevaloesi	= round(random_int(250000, 500000) / 100, 2);
	$sumsalarypostvaloesi	= round($sumsalaryprevaloesi * (1 + (random_int(2, 9)/100)), 2);
	$sumsalaryprevalma0080	= round(random_int(250000, 500000) / 100, 2);
	$sumsalarypostvalma0080 = round($sumsalaryprevalma0080 * (1 + (random_int(2, 9)/100)), 2);
	
	$data = array(
	    array(
		"mitarbeiter" => "Andreas Österreicher",
		"vertragsart" => "Echter DV",
		"sumsalarypreval" => $sumsalaryprevaloesi,
		"sumsalarypostval" => $sumsalarypostvaloesi,
		"valorisierungmethode" => "ValorisierungFixbetrag",
		"stdkst" => "Core-Entwicklung",
		"diszplzuordnung" => "Systemmanagement",
		"dvvon" => "2004-04-01",
		"dvbis" => null,
		"dienstverhaeltnis_id" => 137
	    ),
	    array(
		"mitarbeiter" => "Bamberger Harald",
		"vertragsart" => "Echter DV",
		"sumsalarypreval" => $sumsalaryprevalma0080,
		"sumsalarypostval" => $sumsalarypostvalma0080,
		"valorisierungmethode" => "ValorisierungGestaffelt",
		"stdkst" => "Web/App-Entwicklung",
		"diszplzuordnung" => "Systemmanagement",
		"dvvon" => "2021-05-17",
		"dvbis" => null,
		"dienstverhaeltnis_id" => 154
	    )
	);
	$this->terminateWithSuccess($data);
/*	
	try
	{
	    $valinstanz = $this->ValorisierungLib->findValorisierungInstanz($valorisationInstanzKurzbz);
	    $this->terminateWithSuccess($valinstanz);
	}
	catch (Exception $ex)
	{
	    $this->terminateWithError($ex->getMessage());
	}
 */	
    }
}