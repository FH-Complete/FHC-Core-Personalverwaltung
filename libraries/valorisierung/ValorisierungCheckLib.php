<?php

class ValorisierungCheckLib
{
	private $_ci;

	public function __construct()
	{

		$this->_ci =& get_instance();

		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanz_model');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungHistorie_model', 'ValorisierunghistorieModel');
		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungLib', null, 'ValorisierungLib');
	}

	/************************************************************* public methods *******************************************************************/

	public function getValorisationDataForCheck($dienstverhaeltnisIdArr)
	{

		$historie = [];
		$calculatedValorisations = [];

		// get history data
		$historieRes = $this->_ci->ValorisierunghistorieModel->getValorisierungHistorieByDv($dienstverhaeltnisIdArr);

		if (hasData($historieRes))
		{
			$historieData = getData($historieRes);
			foreach ($historieData as $hist)
			{
				$historie[$hist->gehaltsbestandteil_id][$hist->valorisierungsdatum] = $hist->betr_valorisiert_decrypted;
			}
		}

		// calculate Valorisierung data
		foreach ($dienstverhaeltnisIdArr as $dienstverhaeltnis_id)
		{
			$calculatedValorisation = [];

			// get all Instanzen applicable for the DV
			$instanzen = $this->_ci->ValorisierungInstanz_model->getValorisierungInstanzenByDienstverhaeltnis(
				$dienstverhaeltnis_id,
				$ausgewaehlt = true
			);

			if (!hasData($instanzen)) continue;

			$instanzenData = getData($instanzen);

			$first = true;
			foreach ($instanzenData as $instanz)
			{
				// library for the current Instanz
				$this->_ci->ValorisierungLib->initialize(
					['valorisierung_kurzbz' => $instanz->valorisierung_kurzbz]
				);

				// Dienstverhaeltnis data for valorisation
				$dvData = $this->_ci->ValorisierungLib->fetchDvDataForValorisation($dienstverhaeltnis_id);

				// first calculation: start with Grundbetrag, not betragvalorisiert
				if ($first)
				{
					foreach ($dvData['gehaltsbestandteile'] as $gehaltsbestandteil)
					{
						$gehaltsbestandteil->setBetrag_valorisiert($gehaltsbestandteil->getGrundbetrag());
					}
				}
				else // all other calculations: set previously calculated betrag_valorisiert
				{
					foreach ($dvData['gehaltsbestandteile'] as $gehaltsbestandteil)
					{
						if (isset($calculatedValorisation[$gehaltsbestandteil_id]))
							$gehaltsbestandteil->setBetrag_valorisiert($calculatedValorisation[$gehaltsbestandteil_id]);
					}
				}

				// set the modified DV data
				$this->_ci->ValorisierungLib->setDvDataForValorisation($dvData);

				// execute calculations
				$this->_ci->ValorisierungLib->calculateValorisationForDvId($dienstverhaeltnis_id);
				$calculatedValorisation = $this->_ci->ValorisierungLib->getCalculatedValorisation();

				// store the calculated amounts
				foreach ($calculatedValorisation as $gehaltsbestandteil_id => $betrag_valorisiert)
				{
					$calculatedValorisations[$gehaltsbestandteil_id][$instanz->valorisierungsdatum] = $betrag_valorisiert;
				}
				$first = false;
			}
		}

		//~ error_log(print_r($historie, true));
		//~ error_log(print_r($calculatedValorisations, true));
		return ['historie' => $historie, 'calculated' => $calculatedValorisations];

	}
}
