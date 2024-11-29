<?php
/**
 * Library for managing valorisation calculations
 */
class ValorisierungLib
{
	private $_ci;

	private $_valorisierungInstanz = null;
	private $_dienstverhaeltnis = null;
	private $_gehaltsbestandteile = [];
	private $_vertragsbestandteile = [];
	private $_calculatedValorisation = [];

	public function __construct()
	{
		$this->_ci =& get_instance();

		$this->_ci->load->model('vertragsbestandteil/Gehaltsbestandteil_model', 'GehaltsbestandteilModel');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanz_model');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanzMethod_model');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungAPI_model');
		$this->_ci->load->library('vertragsbestandteil/VertragsbestandteilLib', null, 'VertragsbestandteilLib');
		$this->_ci->load->library('vertragsbestandteil/GehaltsbestandteilLib', null, 'GehaltsbestandteilLib');
		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisationFactory', null, 'ValorisationFactory');
	}

	/************************************************************* public methods *******************************************************************/

	/**
	* Initialize the lib with necessary params
	* @param $params
	*/
	public function initialize($params)
	{
		if(!isset($params['valorisierung_kurzbz']))
			throw new Exception("Valorisierung Kurzbezeichnung fehlt");

		$valorisierung_kurzbz = $params['valorisierung_kurzbz'];

		// load valorisation instance
		$valinstanz = $this->_ci->ValorisierungInstanz_model->loadValorisierungInstanzByKurzbz($valorisierung_kurzbz);
		if($valinstanz === null)
		{
			throw new Exception('Valorisierungsinstanz ' . $valorisierung_kurzbz . ' nicht gefunden');
		}

		// set instance and default values
		$this->_valorisierungInstanz = $valinstanz;
		$this->_dienstverhaeltnis = null;
		$this->_gehaltsbestandteile = [];
		$this->_vertragsbestandteile = [];
		$this->_calculatedValorisation = [];
	}

	/**
	* Calculate all valorisation applicable for the valorisation instance
	* @return Dienstverhaeltnis data after calculation
	*/
	public function calculateAllValorisation()
	{
		return $this->_doValorisationForAllDv();
	}

	/**
	* Calculate and finalize (save) all valorisation applicable for the valorisation instance
	* @return Dienstverhaeltnis data after calculation
	*/
	public function doAllValorisation()
	{
		return $this->_doValorisationForAllDv($storeCalculatedValorisation = true);
	}

	/**
	* Get all current Dvs
	* @return Dienstverhaeltnis data
	*/
	public function getDienstverhaeltnisse()
	{
		return $this->_getAllDvs();
	}

	/**
	* Calculate valorisation for a single Dienstverhältnis
	* @param $dienstverhaeltnis_id
	* @param $fetchData wether to automatically fetch data for the DV (Gehaltsbestandteile etc.)
	* @return the dv data after calculation
	*/
	public function calculateValorisationForDvId($dienstverhaeltnis_id, $fetchDvData = false)
	{
		if ($fetchDvData === true) $this->setDvDataForValorisation($this->fetchDvDataForValorisation($dienstverhaeltnis_id));
		$dvdata = new StdClass();
		$dvdata->dienstverhaeltnis_id = $dienstverhaeltnis_id;
		$this->_calculateValorisation($dvdata);
		return $dvdata;
	}

	/**
	* Reset and recalculate valorisation for a Dienstverhältnis.
	* @param $dienstverhaeltnis_id
	*/
	public function redoAllValorisationForDvId($dienstverhaeltnis_id)
	{
		// get all finalized valorisation instances applicable for a Dienstverhaeltnis
		$instanzen = $this->_ci->ValorisierungInstanz_model->getValorisierungInstanzenByDienstverhaeltnis($dienstverhaeltnis_id, $ausgewaehlt = true);

		if (!hasData($instanzen)) return;

		// recalculate and save Valorisation for each instance
		foreach (getData($instanzen) as $instanz)
		{
			$this->initialize(['valorisierung_kurzbz' => $instanz->valorisierung_kurzbz]);
			$this->calculateValorisationForDvId($dienstverhaeltnis_id, $fetchDvData = true);
			$this->_storeCalculatedValorisation($markSelected = false);
		}
	}

	/**
	* Set particular Dienstverhaeltnis data for calculation
	* @param $dvData
	*/
	public function setDvDataForValorisation($dvData)
	{
		if (!isset($dvData['dienstverhaeltnis']) || !isset($dvData['vertragsbestandteile']) || !isset($dvData['gehaltsbestandteile'])) return;

		$this->_dienstverhaeltnis = $dvData['dienstverhaeltnis'];
		$this->_vertragsbestandteile = $dvData['vertragsbestandteile'];
		$this->_gehaltsbestandteile = $dvData['gehaltsbestandteile'];
	}

	/**
	* Get Dienstverhältnis data needed for calculation
	* @param $dienstverhaeltnis_id
	* @param $date if no date defined by valorisation instance, this fallback date is used. If null, not date limitations.
	* @return the Dienstverhältnis data
	*/
	public function fetchDvDataForValorisation($dienstverhaeltnis_id, $date = null)
	{
		$dvData = [
			'dienverhaeltnis' => null,
			'vertragsbestandteile' => [],
			'gehaltsbestandteile' => []
		];

		$dvData['dienstverhaeltnis'] = $this->_ci->VertragsbestandteilLib->fetchDienstverhaeltnis($dienstverhaeltnis_id);
		$dvData['vertragsbestandteile'] = $this->_ci->VertragsbestandteilLib->fetchVertragsbestandteile(
			$dienstverhaeltnis_id,
			$this->_valorisierungInstanz->valorisierungsdatum ?? $date,
			false
		);

		$dvData['gehaltsbestandteile'] = $this->_ci->GehaltsbestandteilLib->fetchGehaltsbestandteile(
			$dienstverhaeltnis_id,
			$this->_valorisierungInstanz->valorisierungsdatum ?? $date,
			false
		);

		return $dvData;
	}

	/**
	 * Getter for calculated valorisation
	 */
	public function getCalculatedValorisation()
	{
		return $this->_calculatedValorisation;
	}

	/**
	 * Output calculated valorisation (on command line)
	 */
	public function displayCalculatedValorisation()
	{
		foreach ($this->_calculatedValorisation as $gehaltsbestandteil_id => $betrag_valorisiert)
		{
			echo "Gehaltsbestandteil Id: $gehaltsbestandteil_id; Betrag: ".number_format($betrag_valorisiert, 2, ',', '.')."\n";
		}
	}

	/************************************************************ private methods *******************************************************************/

	/**
	 * Checks if all parameters needed for calculation are present
	 */
	private function _checkParamsForValorisation()
	{
		$paramNames = ['valorisierungInstanz', 'dienstverhaeltnis', 'vertragsbestandteile', 'gehaltsbestandteile'];

		foreach ($paramNames as $paramName)
		{
			if (!isset($this->{'_'.$paramName})) throw new Exception("parameter missing: " . $paramName);
		}
	}

	/**
	* Executes valorisation
	* @param $storeCalculatedValorisation if true, selection of calculated valorisation amounts is stored in database
	*/
	private function _doValorisationForAllDv($storeCalculatedValorisation = false)
	{
		$dvsdata = [];

		// get all Dienstverhältnisse applicable for valorisation
		$result = $this->_ci->ValorisierungAPI_model->getDVsForValorisation(
			$this->_valorisierungInstanz->valorisierungsdatum,
			$this->_valorisierungInstanz->oe_kurzbz
		);

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
				$this->setDvDataForValorisation($this->fetchDvDataForValorisation($dvdata->dienstverhaeltnis_id));
				$this->_calculateValorisation($dvdata);
			}
		}

		// if necessary, store calculated valorisation as "final"
		if($storeCalculatedValorisation === true) $this->_storeCalculatedValorisation();

		return $dvsdata;
	}

	/**
	* Gets all current DVs
	*/
	private function _getAllDvs()
	{
		$dvsdata = [];
		$today = date('Y-m-d');

		// get all Dienstverhältnisse valid today
		$result = $this->_ci->ValorisierungAPI_model->getDVsForValorisation(
			$today
		);

		if(isError($result))
		{
			throw new Exception('Fehler beim Holen der Dienstverhältnisse');
		}

		if(hasData($result))
		{
			$noval = $this->_ci->ValorisationFactory->getValorisationMethod($this->_ci->ValorisationFactory::VALORISATION_KEINE);

			// calculate sum for each DV
			$dvsdata = getData($result);
			foreach($dvsdata as $dvdata)
			{
				$this->setDvDataForValorisation($this->fetchDvDataForValorisation($dvdata->dienstverhaeltnis_id, $today));
				$noval->initialize(
					$today,
					$this->_dienstverhaeltnis,
					$this->_vertragsbestandteile,
					$this->_gehaltsbestandteile,
					null
				);

				$dvdata->valorisierungmethode = null;
				$dvdata->sumsalarypreval = round($noval->calcSummeGehaltsbestandteile(), 2);
				$dvdata->sumsalarypostval = null;
			}
		}

		return $dvsdata;
	}

	/**
	* Calculate the valorisation for data of one Dienstverhältnis
	* @param object $dvdata
	*/
	private function _calculateValorisation(&$dvdata)
	{
		$this->_checkParamsForValorisation();

		// get all applicable valorisation instances
		$valinstanzmethoden = $this->_ci->ValorisierungInstanzMethod_model->loadValorisierungInstanzById(
			$this->_valorisierungInstanz->valorisierung_instanz_id
		);

		$applicableValorisationMethods = array();

		// for each instance
		foreach ($valinstanzmethoden as $valinstanzmethod)
		{
			// get the valorisation method
			$valorisationMethod = $this->_ci->ValorisationFactory->getValorisationMethod($valinstanzmethod->valorisierung_methode_kurzbz);
			$params = json_decode($valinstanzmethod->valorisierung_methode_parameter);
			$valorisationMethod->initialize(
				$this->_valorisierungInstanz->valorisierungsdatum,
				$this->_dienstverhaeltnis,
				$this->_vertragsbestandteile,
				$this->_gehaltsbestandteile,
				$params
			);
			$valorisationMethod->checkParams();

			// mark method as applicable
			if($valorisationMethod->checkIfApplicable())
			{
				$applicableValorisationMethods[] = array(
					'kurzbz' => $valinstanzmethod->valorisierung_methode_kurzbz,
					'method' => $valorisationMethod,
					'params' => $params,
					'description' => $valinstanzmethod->beschreibung
				);
			}
		}

		// there should always be only 1 method applicable
		if(count($applicableValorisationMethods) > 1)
		{
			throw new Exception('ERROR: more than one Valorisation Method applicable.');
		}

		if(count($applicableValorisationMethods) == 1)
		{
			// get the method and instance
			$valMethod = $applicableValorisationMethods[0];
			$usedvalinstanz = $valMethod['method'];

			// set the necessary valorisation method data
			$dvdata->valorisierungmethode = $valMethod['kurzbz'];
			$dvdata->valorisierung_methode_parameter = $valMethod['params'];
			$dvdata->valorisierung_methode_beschreibung = $valMethod['description'];

			// set salaray sum before and after calculation, perform valorisation calculation
			$dvdata->sumsalarypreval = round($usedvalinstanz->calcSummeGehaltsbestandteile(), 2);
			$usedvalinstanz->calculateValorisation();
			$dvdata->sumsalarypostval = round($usedvalinstanz->calcSummeGehaltsbestandteile(), 2);

			// store calculated valorisation to apply and finalize selected valorisation later
			$this->_calculatedValorisation += $usedvalinstanz->getBetraegeValorisiertForEachGehaltsbestandteil();
		}
		else
		{
			// less than 1 valorisation method applicable: using valorisation method with typ "no valorisation" (for correct display of sums)
			$noval = $this->_ci->ValorisationFactory->getValorisationMethod($this->_ci->ValorisationFactory::VALORISATION_KEINE);

			$noval->initialize(
				$this->_valorisierungInstanz->valorisierungsdatum,
				$this->_dienstverhaeltnis,
				$this->_vertragsbestandteile,
				$this->_gehaltsbestandteile,
				null
			);
			$dvdata->valorisierungmethode = 'keine Valorisierung';
			$dvdata->sumsalarypreval = round($noval->calcSummeGehaltsbestandteile(), 2);
			$dvdata->sumsalarypostval = $dvdata->sumsalarypreval;
		}
	}

	/**
	 * Store the calculate valorisation in the database
	 * @param $markSelected if true, valorisation is marked as "selected", i.e. finally applied.
	 */
	private function _storeCalculatedValorisation($markSelected = true)
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
				],
				$this->_ci->ValorisierungHistorie_model->getEncryptedColumns()
			);
		}

		// before commiting, checking if another valorisation is not applied already (e.g. by another thread)
		if(!hasData($this->_ci->ValorisierungInstanz_model->getNonSelectedValorisierungInstanzenForDate(
			$this->_valorisierungInstanz->valorisierungsdatum,
			$this->_valorisierungInstanz->oe_kurzbz
		)) && $markSelected === true) // only relevant if the newly calculated valorisation should be marked as finally applied
		{
			throw new Exception("Valorisation already applied");
		}

		// before commiting, checking that there are non-applied valorisation instances before the date of the current
		if(hasData($this->_ci->ValorisierungInstanz_model->getNonSelectedValorisierungInstanzenBeforeDate(
			$this->_valorisierungInstanz->valorisierungsdatum,
			$this->_valorisierungInstanz->oe_kurzbz
		)))
		{
			throw new Exception("There are previous, non-applied Valorisations");
		}

		if ($markSelected === true)
		{
			// mark Valorisierung Instanz as "selected"
			$this->_ci->ValorisierungInstanz_model->update(
				['valorisierung_instanz_id' => $this->_valorisierungInstanz->valorisierung_instanz_id],
				['ausgewaehlt' => true, 'updateamum' => 'NOW()', 'updatevon' => getAuthUID()]
			);
		}

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
}
