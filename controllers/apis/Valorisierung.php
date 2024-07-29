<?php

defined('BASEPATH') || exit('No direct script access allowed');


class Valorisierung extends FHCAPI_Controller
{
	const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';

	public function __construct() {
		parent::__construct(
			array(
				'index' => self::DEFAULT_PERMISSION,
				'calculateValorisation' => self::DEFAULT_PERMISSION,
				'doValorisation' => self::DEFAULT_PERMISSION.'w',
				'getValorisierungsInstanzen' => self::DEFAULT_PERMISSION,
				'getValorisationInfo' => self::DEFAULT_PERMISSION
			)
		);

		$this->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanz_model');
		$this->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungLib', null, 'ValorisierungLib');
	}

	public function index()
	{
		$this->terminateWithSuccess('not implemented');
	}

	public function getValorisierungsInstanzen()
	{
		$valinstanzen = $this->ValorisierungInstanz_model->getAllNonSelectedValorisierungInstanzen();
		if( isError($valinstanzen) )
		{
			$this->terminateWithError('Fehler beim Laden der ValorisierungsInstanzen');
		}
		else
		{
			$this->terminateWithSuccess(getData($valinstanzen) ?? []);
		}
	}

	public function calculateValorisation()
	{
		$data = json_decode($this->input->raw_input_stream, true);

		$this->ValorisierungLib->initialize(['valorisierung_kurzbz' => $data['valorisierunginstanz_kurzbz']]);

		$this->terminateWithSuccess($this->ValorisierungLib->calculateAllValorisation());
	}

	public function doValorisation()
	{
		$data = json_decode($this->input->raw_input_stream, true);

		$this->ValorisierungLib->initialize(['valorisierung_kurzbz' => $data['valorisierunginstanz_kurzbz']]);

		$this->terminateWithSuccess($this->ValorisierungLib->doAllValorisation());
	}

	/**
	 *
	 * @param
	 * @return object success or error
	 */
	public function getValorisationInfo()
	{
		$valorisierung_kurzbz = $this->input->get('valorisierunginstanz_kurzbz');

		if (!isset($valorisierung_kurzbz)) $this->terminateWithError('Parameter Valorisierunginstanz Kurzbz fehlt');

		$valInstanzInfo = $this->ValorisierungInstanz_model->getValorsierungInstanzInfo($valorisierung_kurzbz);
		if( isError($valInstanzInfo) )
		{
			$this->terminateWithError('Fehler beim Laden der ValorisierungsInstanzinfo');
		}
		else
		{
			$this->terminateWithSuccess(getData($valInstanzInfo) ?? []);
		}
	}
}
