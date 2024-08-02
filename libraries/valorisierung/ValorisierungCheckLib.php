<?php

class ValorisierungCheckLib
{
	private $_ci;

	public function __construct()
	{

		$this->_ci =& get_instance();

		$this->_ci->load->model('vertragsbestandteil/Gehaltsbestandteil_model', 'GehaltsbestandteilModel');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanz_model');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungHistorie_model', 'ValorisierunghistorieModel');
		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungLib', null, 'ValorisierungLib');
	}

	/************************************************************* public methods *******************************************************************/

	public function getValorisationDataForCheck($dienstverhaeltnisIdArr)
	{
;		$valorisationData = [];

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
			$prevBetraegeValorisiert = [];

			$first = true;
			foreach ($instanzenData as $instanz)
			{
				// library for the current Instanz
				$this->_ci->ValorisierungLib->initialize(
					['valorisierung_kurzbz' => $instanz->valorisierung_kurzbz]
				);

				// Dienstverhaeltnis data for valorisation
				$dvData = $this->_ci->ValorisierungLib->fetchDvDataForValorisation($dienstverhaeltnis_id);

				foreach ($dvData['gehaltsbestandteile'] as $gehaltsbestandteil)
				{
					$gehaltsbestandteil_id = $gehaltsbestandteil->getGehaltsbestandteil_id();

					// initialise
					$valorisationData[$gehaltsbestandteil_id]['valorisation_methods'][$instanz->valorisierungsdatum]['valorisierung_kurzbz']
						= $instanz->valorisierung_kurzbz;

					// first calculation
					if ($first)
					{
						// save previous betrag valorisiert for later comparison
						$valorisationData[$gehaltsbestandteil_id]['final_betrag_valorisiert']  = $gehaltsbestandteil->getBetrag_valorisiert();
						// start with Grundbetrag, not betrag valorisiert
						$gehaltsbestandteil->setBetrag_valorisiert($gehaltsbestandteil->getGrundbetrag());
					}
					else // all other calculations: set previously calculated betrag_valorisiert
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
					$valorisationData[$gehaltsbestandteil_id]['valorisation_methods'][$instanz->valorisierungsdatum]['valorisierung_kurzbz']
						= $instanz->valorisierung_kurzbz;
					$valorisationData[$gehaltsbestandteil_id]['valorisation_methods'][$instanz->valorisierungsdatum]['calculated_betrag_valorisiert']
						= $betrag_valorisiert;
				}
				$first = false;
			}

			// get history data
			$historieRes = $this->_ci->ValorisierunghistorieModel->getValorisierungHistorieByDv($dienstverhaeltnisIdArr);

			if (hasData($historieRes))
			{
				$historieData = getData($historieRes);
				foreach ($historieData as $hist)
				{
					$valorisationData[$hist->gehaltsbestandteil_id]['valorisation_methods'][$hist->valorisierungsdatum]['historie_betrag_valorisiert']
						= $hist->betr_valorisiert_decrypted;
				}
			}
		}

		error_log(print_r($valorisationData, true));
		return $valorisationData;
	}

	/**
	 *
	 * @param
	 * @return object success or error
	 */
	public function getDvGehaltData($dienstverhaeltnis_id)
	{
		$qry = '
			SELECT
				dv.dienstverhaeltnis_id, gehaltsbestandteil_id,
				grundbetrag AS "grund_betrag_decrypted", betrag_valorisiert AS "betr_valorisiert_decrypted",
				dv.von, va.bezeichnung AS "vertragsart",
				pers.vorname, pers.nachname, dv.mitarbeiter_uid, oe.bezeichnung AS "unternehmen",
				gb.von AS "gehaltsbestandteil_von", gt.bezeichnung AS "gehaltstyp"
			FROM
				hr.tbl_dienstverhaeltnis dv
				JOIN hr.tbl_vertragsart va USING (vertragsart_kurzbz)
				JOIN public.tbl_organisationseinheit oe USING (oe_kurzbz)
				JOIN public.tbl_benutzer ben ON dv.mitarbeiter_uid = ben.uid
				JOIN public.tbl_person pers USING (person_id)
				LEFT JOIN hr.tbl_gehaltsbestandteil gb ON dv.dienstverhaeltnis_id = gb.dienstverhaeltnis_id AND gb.valorisierung
				LEFT JOIN hr.tbl_gehaltstyp gt USING (gehaltstyp_kurzbz)
			WHERE
				dv.dienstverhaeltnis_id = ?
			ORDER BY
				gb.von DESC, gb.gehaltsbestandteil_id DESC';

		return $this->_ci->GehaltsbestandteilModel->execReadOnlyQuery(
			$qry,
			[$dienstverhaeltnis_id],
			$this->_ci->GehaltsbestandteilModel->getEncryptedColumns()
		);
	}

	/**
	 *
	 * @param
	 * @return object success or error
	 */
	public function getInvalidGehaltsbestandteile($dienstverhaeltnisIdArr)
	{
		return array_unique(array_merge(
			$this->getInvalidGehaltsbestandteileFromHistoryCheck($dienstverhaeltnisIdArr),
			$this->getInvalidGehaltsbestandteileFromBetragCheck($dienstverhaeltnisIdArr)
		));
	}

	/**
	 *
	 * @param
	 * @return object success or error
	 */
	public function getInvalidGehaltsbestandteileFromHistoryCheck($dienstverhaeltnisIdArr)
	{
		$invalidGehaltsbestandteile = [];
		$valorisationData = $this->getValorisationDataForCheck($dienstverhaeltnisIdArr);

		foreach ($valorisationData as $geh_id => $dataArr)
		{
			foreach ($dataArr['valorisation_methods'] as $valorisierungsdatum => $valorisierungsData)
			{
				// if there are differences between history and calculation
				if (!isset($valorisierungsData['valorisierung_kurzbz'])
					|| !isset($valorisierungsData['historie_betrag_valorisiert'])
					|| !isset($valorisierungsData['calculated_betrag_valorisiert'])
					|| $valorisierungsData['historie_betrag_valorisiert'] != $valorisierungsData['calculated_betrag_valorisiert'])
				{
					// write issue with data of gehaltsbestandteil
					$invalidGehaltsbestandteile[] = $geh_id;
					continue 2;
				}
			}
		}

		return $invalidGehaltsbestandteile;
	}

	/**
	 *
	 * @param
	 * @return object success or error
	 */
	public function getInvalidGehaltsbestandteileFromBetragCheck($dienstverhaeltnisIdArr)
	{
		$invalidGehaltsbestandteile = [];
		$valorisationData = $this->getValorisationDataForCheck($dienstverhaeltnisIdArr);


		foreach ($valorisationData as $geh_id => $dataArr)
		{
			$lastValorisierung = $dataArr['valorisation_methods'][max(array_keys($dataArr['valorisation_methods']))];
			if ($dataArr['final_betrag_valorisiert'] != $lastValorisierung['historie_betrag_valorisiert']
				|| $dataArr['final_betrag_valorisiert'] != $lastValorisierung['calculated_betrag_valorisiert'])
				$invalidGehaltsbestandteile[] = $geh_id;
		}

		return $invalidGehaltsbestandteile;
	}

	public function resetValorisation($dienstverhaeltnis_id)
	{
		// get all Instanzen applicable for the DV
		$instanzen = $this->_ci->ValorisierungInstanz_model->getValorisierungInstanzenByDienstverhaeltnis(
			$dienstverhaeltnis_id,
			$ausgewaehlt = true
		);

		$gehaltsbestandteil_id_arr = [];
		$errors = [];

		if (hasData($instanzen))
		{
			$instanzenData = getData($instanzen);

			// start transaction
			$this->_ci->db->trans_begin();

			foreach ($instanzenData as $instanz)
			{
				$this->_ci->ValorisierungLib->initialize(['valorisierung_kurzbz' => $instanz->valorisierung_kurzbz]);

				$dvData = $this->_ci->ValorisierungLib->fetchDvDataForValorisation($dienstverhaeltnis_id);

				// for each gehaltsbestandteil of the dv
				foreach ($dvData['gehaltsbestandteile'] as $gehaltsbestandteil)
				{
					$gehaltsbestandteil_id = $gehaltsbestandteil->getGehaltsbestandteil_id();
					// delete valorisation history
					$deleteRes = $this->_ci->ValorisierunghistorieModel->delete(
						['gehaltsbestandteil_id' => $gehaltsbestandteil_id],
						['valorisierungsdatum' => $instanz->valorisierungsdatum]
					);

					if (isError($deleteRes)) $errors[] = getError($deleteRes);

					if (!in_array($gehaltsbestandteil_id, $gehaltsbestandteil_id_arr)) $gehaltsbestandteil_id_arr[] = $gehaltsbestandteil_id;
				}

			}

			foreach ($gehaltsbestandteil_id_arr as $gehaltsbestandteil_id)
			{
				// reset Gehalt to Grundbetrag
				$updateRes = $this->_ci->GehaltsbestandteilModel->update(
					['gehaltsbestandteil_id' => $gehaltsbestandteil_id],
					['betrag_valorisiert' => $gehaltsbestandteil->getGrundbetrag()],
					$this->_ci->GehaltsbestandteilModel->getEncryptedColumns()
				);

				if (isError($updateRes)) $errors[] = getError($updateRes);
			}

			// Transaction complete!
			$this->_ci->db->trans_complete();

			// rollback if something failed
			if($this->_ci->db->trans_status() === false)
			{
				$this->_ci->db->trans_rollback();
				return error("Errors when resetting valorisation, aborting: ".implode('; ', $errors));
			}

			// commit transaction
			$this->_ci->db->trans_commit();
		}

		return success('Valorisierung erfolgreich rückgängig gemacht');
	}
}
