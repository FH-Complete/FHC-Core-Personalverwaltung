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
		$valorisationData = [];

		// calculate Valorisierung data
		foreach ($dienstverhaeltnisIdArr as $dienstverhaeltnis_id)
		{
			$calculatedValorisation = [];

			// get all Gehaltsbestandteile of DV
			$gehaltsbestandteilData = [];
			$ghRes = $this->getGehaltsbestandteilData($dienstverhaeltnis_id);

			if (hasData($ghRes))
			{
				foreach (getData($ghRes) as $gh)
				{
					$valorisationData[$gh->gehaltsbestandteil_id]['gehaltstyp'] = $gh->gehaltstyp_bezeichnung;
					$valorisationData[$gh->gehaltsbestandteil_id]['von'] = $gh->von;
					$valorisationData[$gh->gehaltsbestandteil_id]['bis'] = $gh->bis;
					$valorisationData[$gh->gehaltsbestandteil_id]['grundbetrag'] = $gh->grund_betrag_decrypted;
					$valorisationData[$gh->gehaltsbestandteil_id]['final_betrag_valorisiert']  = $gh->betr_valorisiert_decrypted;
					$valorisationData[$gh->gehaltsbestandteil_id]['valorisierung']  = $gh->valorisierung;
				}
			}

			// get all Instanzen applicable for the DV
			$instanzen = $this->_ci->ValorisierungInstanz_model->getValorisierungInstanzenByDienstverhaeltnis(
				$dienstverhaeltnis_id,
				$ausgewaehlt = true
			);

			if (!hasData($instanzen)) continue;

			$instanzenData = getData($instanzen);

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

					// first calculation
					if (!isset($valorisationData[$gehaltsbestandteil_id]['valorisation_methods']))
					{
						// start with Grundbetrag, not betrag valorisiert
						$grundbetrag = $gehaltsbestandteil->getGrundbetrag();
						$gehaltsbestandteil->setBetrag_valorisiert($grundbetrag);

						// initialise valorisation methods
						$valorisationData[$gehaltsbestandteil_id]['valorisation_methods'] = null;
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
				$dvdata = $this->_ci->ValorisierungLib->calculateValorisationForDvId($dienstverhaeltnis_id);

				$calculatedValorisation = $this->_ci->ValorisierungLib->getCalculatedValorisation();

				// store the calculated amounts and valorisation method data
				foreach ($calculatedValorisation as $gehaltsbestandteil_id => $betrag_valorisiert)
				{
					$valorisationData[$gehaltsbestandteil_id]['valorisation_methods'][$instanz->valorisierungsdatum]['valorisierung_kurzbz']
						= $instanz->valorisierung_kurzbz;
					$valorisationData[$gehaltsbestandteil_id]['valorisation_methods'][$instanz->valorisierungsdatum]['valorisierung_methode_kurzbz']
						= $dvdata->valorisierungmethode;
					$valorisationData[$gehaltsbestandteil_id]['valorisation_methods'][$instanz->valorisierungsdatum]['valorisierung_methode_parameter']
						= $dvdata->valorisierung_methode_parameter;
					$valorisationData[$gehaltsbestandteil_id]['valorisation_methods'][$instanz->valorisierungsdatum]['valorisierung_methode_beschreibung']
						= $dvdata->valorisierung_methode_beschreibung;
					$valorisationData[$gehaltsbestandteil_id]['valorisation_methods'][$instanz->valorisierungsdatum]['calculated_betrag_valorisiert']
						= $betrag_valorisiert;
				}
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

		return $valorisationData;
	}

	/**
	 *
	 * @param
	 * @return object success or error
	 */
	public function getDvData($dienstverhaeltnis_id)
	{
		$qry = '
			SELECT
				dv.dienstverhaeltnis_id, dv.von, va.bezeichnung AS "vertragsart",
				pers.vorname, pers.nachname, dv.mitarbeiter_uid, oe.bezeichnung AS "unternehmen"
			FROM
				hr.tbl_dienstverhaeltnis dv
				JOIN hr.tbl_vertragsart va USING (vertragsart_kurzbz)
				JOIN public.tbl_organisationseinheit oe USING (oe_kurzbz)
				JOIN public.tbl_benutzer ben ON dv.mitarbeiter_uid = ben.uid
				JOIN public.tbl_person pers USING (person_id)
			WHERE
				dv.dienstverhaeltnis_id = ?';

		return $this->_ci->GehaltsbestandteilModel->execReadOnlyQuery(
			$qry,
			[$dienstverhaeltnis_id]
		);
	}

	public function getGehaltsbestandteilData($dienstverhaeltnis_id)
	{
		$qry = '
			SELECT
				gh.gehaltsbestandteil_id, gh.gehaltstyp_kurzbz, gh.von, gh.bis, typ.bezeichnung AS gehaltstyp_bezeichnung,
				grundbetrag AS grund_betrag_decrypted, betrag_valorisiert AS betr_valorisiert_decrypted, gh.valorisierung
			FROM
				hr.tbl_gehaltsbestandteil gh
				JOIN hr.tbl_gehaltstyp typ USING (gehaltstyp_kurzbz)
			WHERE
				gh.dienstverhaeltnis_id = ?
			ORDER BY
				CASE WHEN gh.valorisierung THEN 0 ELSE 1 END, gh.von, gh.bis NULLS LAST, gh.gehaltsbestandteil_id';

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
			if (!isset($dataArr['valorisation_methods']) || isEmptyArray($dataArr['valorisation_methods'])) continue;

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
			if (!isset($dataArr['valorisation_methods']) || isEmptyArray($dataArr['valorisation_methods']))
			{
				if ($dataArr['final_betrag_valorisiert'] != $dataArr['grundbetrag']) $invalidGehaltsbestandteile[] = $geh_id;
				continue;
			}

			$lastValorisierung = $dataArr['valorisation_methods'][max(array_keys($dataArr['valorisation_methods']))];

			if ((isset($dataArr['final_betrag_valorisiert'])
					&& (!isset($lastValorisierung['calculated_betrag_valorisiert']) || !isset($lastValorisierung['historie_betrag_valorisiert'])))
				|| $dataArr['final_betrag_valorisiert'] != $lastValorisierung['historie_betrag_valorisiert']
				|| $dataArr['final_betrag_valorisiert'] != $lastValorisierung['calculated_betrag_valorisiert'])
				$invalidGehaltsbestandteile[] = $geh_id;
		}

		return $invalidGehaltsbestandteile;
	}

	public function resetValorisation($dienstverhaeltnis_id)
	{
		$gehaltsbestandteilArr = [];
		$errors = [];

		// start transaction
		$this->_ci->db->trans_begin();

		$gehaltsbestandteileRes = $this->getGehaltsbestandteilData($dienstverhaeltnis_id);
		if (isError($gehaltsbestandteileRes)) $errors[] = getError($deleteRes);

		if (hasData($gehaltsbestandteileRes))
		{
			$gehaltsbestandteile = getData($gehaltsbestandteileRes);

			// for each gehaltsbestandteil of the dv
			foreach ($gehaltsbestandteile as $gehaltsbestandteil)
			{
				$gehaltsbestandteil_id = $gehaltsbestandteil->gehaltsbestandteil_id;

				// delete valorisation history
				$deleteRes = $this->_ci->ValorisierunghistorieModel->delete(
					['gehaltsbestandteil_id' => $gehaltsbestandteil_id]
				);

				if (isError($deleteRes)) $errors[] = getError($deleteRes);

				$gehaltsbestandteilArr[$gehaltsbestandteil_id] = $gehaltsbestandteil->grund_betrag_decrypted;
			}

			foreach ($gehaltsbestandteilArr as $gehaltsbestandteil_id => $grundbetrag)
			{
				// reset Gehalt to Grundbetrag
				$updateRes = $this->_ci->GehaltsbestandteilModel->update(
					['gehaltsbestandteil_id' => $gehaltsbestandteil_id],
					['betrag_valorisiert' => $grundbetrag],
					$this->_ci->GehaltsbestandteilModel->getEncryptedColumns()
				);

				if (isError($updateRes)) $errors[] = getError($updateRes);
			}
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

		return success('Valorisierung erfolgreich rückgängig gemacht');
	}
}
