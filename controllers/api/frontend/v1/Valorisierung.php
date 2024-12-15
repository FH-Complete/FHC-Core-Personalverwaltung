<?php

defined('BASEPATH') || exit('No direct script access allowed');


class Valorisierung extends FHCAPI_Controller
{
	const DEFAULT_PERMISSION = 'extension/pv21_valorisierung:r';

	public function __construct() {
		parent::__construct(
			array(
				'index' => self::DEFAULT_PERMISSION,
				'calculateValorisation' => self::DEFAULT_PERMISSION,
				'doValorisation' => self::DEFAULT_PERMISSION.'w',
				'getValorisierungsInstanzen' => self::DEFAULT_PERMISSION,
				'getGehaelter' => self::DEFAULT_PERMISSION,
				'getValorisationInfo' => self::DEFAULT_PERMISSION,
				'getAllUnternehmen' => self::DEFAULT_PERMISSION
			)
		);

		$this->load->model('organisation/Organisationseinheit_model', 'OrganisationseinheitModel');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanz_model');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungAPI_model');
		$this->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungLib', null, 'ValorisierungLib');
	}

	public function index()
	{
		$this->terminateWithSuccess('not implemented');
	}

	/**
	 * Get all valorisation instances which are not yet selected, i.e. valorisation has not yet been completed.
	 */
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

	/**
	 * Calculate all valorisation for a valorisation instance
	 */
	public function calculateValorisation()
	{
		$data = json_decode($this->input->raw_input_stream, true);

		$this->ValorisierungLib->initialize(['valorisierung_kurzbz' => $data['valorisierunginstanz_kurzbz']]);

		$this->terminateWithSuccess($this->ValorisierungLib->calculateAllValorisation());
	}

	/**
	 * Get Gehaelter (no valorisation) for given parameters
	 */
	public function getGehaelter()
	{
		$gehaelter_stichtag = $this->input->get('gehaelter_stichtag');

		if (!isset($gehaelter_stichtag) || isEmptyString($gehaelter_stichtag)) $this->terminateWithError('Parameter Gehälter Stichtag fehlt');

		$gehaelter_oe_kurzbz = $this->input->get('gehaelter_oe_kurzbz');

		$this->terminateWithSuccess($this->ValorisierungLib->getGehaelter($gehaelter_stichtag, $gehaelter_oe_kurzbz));
	}

	/**
	 * Initiates valorisation for a Valorisierung Kurzbezeichnung
	 */
	public function doValorisation()
	{
		$data = json_decode($this->input->raw_input_stream, true);

		$this->ValorisierungLib->initialize(['valorisierung_kurzbz' => $data['valorisierunginstanz_kurzbz']]);

		$this->terminateWithSuccess($this->ValorisierungLib->doAllValorisation());
	}

	/**
	 * Get the information for a valorisation instance
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

	/**
	 * Get all Unternehmen
	 */
	public function getAllUnternehmen()
	{
		$this->OrganisationseinheitModel->addSelect('oe_kurzbz, bezeichnung');
		$this->OrganisationseinheitModel->addOrder('bezeichnung');
		$this->OrganisationseinheitModel->addOrder('oe_kurzbz');
		$oeRes = $this->OrganisationseinheitModel->loadWhere(['oe_parent_kurzbz' => NULL]);
		if( isError($oeRes) )
		{
			$this->terminateWithError('Fehler beim Laden der Unternehmen');
		}
		else
		{
			$this->terminateWithSuccess(getData($oeRes) ?? []);
		}
	}
}
