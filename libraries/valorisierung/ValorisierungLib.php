<?php
/**
 * Description of ValorisierungLib
 *
 * @author bambi
 */
class ValorisierungLib
{
	private $_ci;
	private $_valorisierungInstanz = null;
	private $_calculatedValorisation = [];

	public function __construct($params)
	{
		if(!isset($params['valorisierung_kurzbz']))
			throw new Exception("Valorisierung Kurzbezeichnung fehlt");

		$this->_ci =& get_instance();

		$this->_ci->load->model('vertragsbestandteil/Gehaltsbestandteil_model', null, 'GehaltsbestandteilModel');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanz_model');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanzMethod_model');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungAPI_model');
		$this->_ci->load->library('vertragsbestandteil/VertragsbestandteilLib', null, 'VertragsbestandteilLib');
		$this->_ci->load->library('vertragsbestandteil/GehaltsbestandteilLib', null, 'GehaltsbestandteilLib');
		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisationFactory', null, 'ValorisationFactory');

		$this->_initialize($params['valorisierung_kurzbz']);
	}

	/************************************************************* public methods *******************************************************************/

	public function calculateAllValorisation()
	{
		return $this->_doValorisationForAllDv();
	}

	public function doAllValorisation()
	{
		return $this->_doValorisationForAllDv($storeCalculatedValorisation = true);
	}

	public function calculateValorisation(&$dvdata)
	{
		$dienstverhaeltnis = $this->_ci->VertragsbestandteilLib->fetchDienstverhaeltnis($dvdata->dienstverhaeltnis_id);
		$vertragsbestandteile = $this->_ci->VertragsbestandteilLib->fetchVertragsbestandteile(
			$dvdata->dienstverhaeltnis_id,
			$this->_valorisierungInstanz->valorisierungsdatum,
			false
		);
		$gehaltsbestandteile = $this->_ci->GehaltsbestandteilLib->fetchGehaltsbestandteile(
			$dvdata->dienstverhaeltnis_id,
			$this->_valorisierungInstanz->valorisierungsdatum,
			false
		);

		$valinstanzmethoden = $this->_ci->ValorisierungInstanzMethod_model->loadValorisierungInstanzByKurzbz(
			$this->_valorisierungInstanz->valorisierung_instanz_id
		);

		$applicableValorisationMethods = array();
		foreach ($valinstanzmethoden as $valinstanzmethod)
		{
			$valorisationMethod = $this->_ci->ValorisationFactory->getValorisationMethod($valinstanzmethod->valorisierung_methode_kurzbz);
			$params = json_decode($valinstanzmethod->valorisierung_methode_parameter);
			$valorisationMethod->initialize($dienstverhaeltnis, $vertragsbestandteile, $gehaltsbestandteile, $params);
			$valorisationMethod->checkParams();

			if($valorisationMethod->checkIfApplicable())
			{
				$applicableValorisationMethods[] = array(
					'kurzbz' => $valinstanzmethod->valorisierung_methode_kurzbz,
					'method' => $valorisationMethod
				);
			}
		}

		if(count($applicableValorisationMethods) > 1)
		{
			throw new Exception('ERROR: more than one Valorisation Method applicable.');
		}

		if(count($applicableValorisationMethods) == 1)
		{
			$usedvalinstanz = $applicableValorisationMethods[0]['method'];
			$dvdata->valorisierungmethode = $applicableValorisationMethods[0]['kurzbz'];
			$dvdata->sumsalarypreval = round($usedvalinstanz->calcSummeGehaltsbestandteile(), 2);
			$usedvalinstanz->calculateValorisation();
			$dvdata->sumsalarypostval = round($usedvalinstanz->calcSummeGehaltsbestandteile(), 2);

			// store calculated valorisation to apply and finalize selected valorisation later
			$this->_calculatedValorisation += $usedvalinstanz->getBetraegeValorisiertForEachGehaltsbestandteil();
		}
	}

	/**
	 *
	 * @param
	 * @return object success or error
	 */
	public function storeCalculatedValorisation()
	{
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungHistorie_model');

		// start transaction
		$this->_ci->db->trans_begin();

		foreach ($this->_calculatedValorisation as $gehaltsbestandteil_id => $betrag_valorisiert)
		{
			// update the Gehaltsbestandteil with valorised amount
			$this->_ci->GehaltsbestandteilModel->update(
				['gehaltsbestandteil_id' => $gehaltsbestandteil_id],
				['betrag_valorisiert' => $betrag_valorisiert, 'updateamum' => 'NOW()', 'updatevon' => getAuthUID()],
				$this->_ci->GehaltsbestandteilModel->getEncryptedColumns()
			);

			// write Valorisierung history
			$this->_ci->ValorisierungHistorie_model->insert(
				[
					'gehaltsbestandteil_id' => $gehaltsbestandteil_id,
					'valorisierungsdatum' => $this->_valorisierungInstanz->valorisierungsdatum,
					'betrag_valorisiert' => $betrag_valorisiert,
					'insertvon' => getAuthUID()
				]
			);
		}

		// before commiting, checking if another Valorisierung is not applied already (e.g. by another thread)
		$this->_ci->ValorisierungInstanz_model->addSelect('1');
		if(hasData($this->_ci->ValorisierungInstanz_model->loadWhere(
			['valorisierungsdatum' => $this->_valorisierungInstanz->valorisierungsdatum, 'ausgewaehlt' => true]
		)))
		{
			throw new Exception("Valorisation already applied");
		}

		// mark Valorisierung Instanz as "selected" with valorised amount
		$this->_ci->ValorisierungInstanz_model->update(
			['valorisierung_instanz_id' => $this->_valorisierungInstanz->valorisierung_instanz_id],
			['ausgewaehlt' => true, 'updateamum' => 'NOW()', 'updatevon' => getAuthUID()]
		);

		// Transaction complete!
		$this->_ci->db->trans_complete();

		// rollback if something failed
		if($this->_ci->db->trans_status() === false)
		{
			$this->_ci->db->trans_rollback();
			throw new Exception("Valorisation transaction failed");
		}

		// commit transaction
		$this->_ci->db->trans_commit();
	}

	/**
	 *
	 * @param
	 * @return object success or error
	 */
	public function displayCalculatedValorisation()
	{
		foreach ($this->_calculatedValorisation as $gehaltsbestandteil_id => $betrag_valorisiert)
		{
			echo "Gehaltsbestandteil Id: $gehaltsbestandteil_id; Betrag: ".number_format($betrag_valorisiert, 2, ',', '.')."\n";
		}
	}

	/************************************************************ private methods *******************************************************************/

	private function _initialize($valorisierung_kurzbz)
	{
		$valinstanz = $this->_ci->ValorisierungInstanz_model->loadValorisierungInstanzByKurzbz($valorisierung_kurzbz);
		if($valinstanz === null)
		{
			throw new Exception('Valorisierungsinstanz ' . $valorisierung_kurzbz . ' nicht gefunden');
		}
		$this->_valorisierungInstanz = $valinstanz;
	}

	private function _doValorisationForAllDv($storeCalculatedValorisation = false)
	{
		$dvsdata = [];

		// get all Dienstverhältnisse applicable for valorisation
		$result = $this->_ci->ValorisierungAPI_model->getDVsForValorisation($this->_valorisierungInstanz->valorisierungsdatum);

		if(isError($result))
		{
			throw new Exception('Fehler beim Holen der Dienstverhältnisse');
		}

		if(hasData($result))
		{
			// calculate valorisation for each DV
			$dvsdata = getData($result);
			foreach($dvsdata as $dvdata)
			{
				$this->calculateValorisation($dvdata);
			}
		}

		// if necessary, store calculated valorisation as "final"
		if($storeCalculatedValorisation === true) $this->storeCalculatedValorisation();

		return $dvsdata;
	}
}
