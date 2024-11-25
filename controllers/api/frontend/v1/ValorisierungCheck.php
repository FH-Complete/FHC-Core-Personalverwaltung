<?php

defined('BASEPATH') || exit('No direct script access allowed');


class ValorisierungCheck extends FHCAPI_Controller
{
	const DEFAULT_PERMISSION = 'extension/pv21_valorisierung:r';

	public function __construct() {
		parent::__construct(
			array(
				'index' => self::DEFAULT_PERMISSION,
				'getDvData' => self::DEFAULT_PERMISSION,
				'getValorisierungCheckData' => self::DEFAULT_PERMISSION,
				'checkValorisationValidityOfDv' => self::DEFAULT_PERMISSION,
				'redoValorisation' => self::DEFAULT_PERMISSION.'w'
			)
		);

		$this->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungLib', null, 'ValorisierungLib');
		$this->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungCheckLib', null, 'ValorisierungCheckLib');
	}

	public function index()
	{
		$this->terminateWithSuccess('not implemented');
	}

	/**
	 * Get Dienstverhaeltnis data for a Dienstverhaeltnis
	 */
	public function getDvData()
	{
		$dienstverhaeltnis_id = $this->input->get('dienstverhaeltnis_id');

		if (!isset($dienstverhaeltnis_id)) $this->terminateWithError('Dienstverhältnis Id fehlt');

		$dvRes = $this->ValorisierungCheckLib->getDvData($dienstverhaeltnis_id);

		if (isError($dvRes)) $this->terminateWithError(getError($dvRes));

		$this->terminateWithSuccess(hasData($dvRes) ? getData($dvRes) : []);
	}

	/**
	 * Get data of a Dienstverhaeltnis needed for valorisation check
	 */
	public function getValorisierungCheckData()
	{
		$dienstverhaeltnis_id = $this->input->get('dienstverhaeltnis_id');

		if (!isset($dienstverhaeltnis_id)) $this->terminateWithError('Dienstverhältnis Id fehlt');

		$valorisationData = $this->ValorisierungCheckLib->getValorisationDataForCheck([$dienstverhaeltnis_id]);
		if( !is_array($valorisationData) )
		{
			$this->terminateWithError('Fehler beim Laden der Valorisierungsdaten');
		}
		else
		{
			$this->terminateWithSuccess($valorisationData ?? []);
		}
	}

	/**
	 * Check if a Dienstverhaeltnis has invalid GEhaltsbestandteile
	 */
	public function checkValorisationValidityOfDv()
	{
		$dienstverhaeltnis_id = $this->input->get('dienstverhaeltnis_id');

		if (!isset($dienstverhaeltnis_id)) $this->terminateWithError('Dienstverhältnis Id fehlt');

		$valorisationData = $this->ValorisierungCheckLib->getInvalidGehaltsbestandteile([$dienstverhaeltnis_id]);
		if( !isset($valorisationData) && !is_array($valorisationData) )
		{
			$this->terminateWithError('Fehler beim Validieren der Valorisierung');
		}
		else
		{
			$this->terminateWithSuccess(isEmptyArray($valorisationData));
		}
	}

	/**
	 * Initiates revalisation for a certain Dienstverhaeltnis
	 */
	public function redoValorisation()
	{
		$data = json_decode($this->input->raw_input_stream, true);

		$dienstverhaeltnis_id = $data['dienstverhaeltnis_id'];

		$resetRes = $this->ValorisierungCheckLib->resetValorisation($dienstverhaeltnis_id);
		if (isError($resetRes)) $this->terminateWithError(getError($resetRes));

		$valRes = $this->ValorisierungLib->redoAllValorisationForDvId($dienstverhaeltnis_id);

		$this->terminateWithSuccess("Valorisierung erfolgreich durchgeführt");
	}
}
