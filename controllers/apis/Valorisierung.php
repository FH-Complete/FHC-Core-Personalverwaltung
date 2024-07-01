<?php

defined('BASEPATH') || exit('No direct script access allowed');


class Valorisierung extends FHCAPI_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';

    public function __construct() {
		parent::__construct(
			array(
			'index' => self::DEFAULT_PERMISSION,
			'doValorisation' => self::DEFAULT_PERMISSION,
			'getValorisierungsInstanzen' => self::DEFAULT_PERMISSION
			)
		);

		$this->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungAPI_model');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanz_model');
		$this->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungLib', null, 'ValorisierungLib');
    }

    public function index()
    {
		$this->terminateWithSuccess('not implemented');
    }

    public function getValorisierungsInstanzen()
    {
		$valinstanzen = $this->ValorisierungInstanz_model->getAllValorisierungInstanzen();
		if( isError($valinstanzen) )
		{
			$this->terminateWithError('Fehler beim Laden der ValorisierungsInstanzen');
		}
		else
		{

			$this->terminateWithSuccess(getData($valinstanzen));
		}
    }

    public function doValorisation($valorisationInstanzKurzbz)
    {
		try
		{
			$valinstanz = $this->ValorisierungLib->findValorisierungInstanz($valorisationInstanzKurzbz);
		}
		catch (Exception $ex)
		{
			$this->terminateWithError('ValorisierungsInstanz ' . $valorisationInstanzKurzbz . ' nicht gefunden.');
		}
		$result = $this->ValorisierungAPI_model->getDVsForValorisation($valinstanz->valorisierungsdatum);
		if( hasData($result) )
		{
			$dvsdata = getData($result);
			foreach($dvsdata as &$dvdata)
			{
			$this->ValorisierungLib->doValorisation($valinstanz, $dvdata);
			}
			$this->terminateWithSuccess($dvsdata);
		}
		else
		{
			$this->terminateWithError('Fehler beim Laden der zu valorisierenden Dientsverhältnisse.');
		}
    }
}
