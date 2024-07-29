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
	private $_dienstverhaeltnis = null;
	private $_gehaltsbestandteile = [];
	private $_vertragsbestandteile = [];
	private $_calculatedValorisation = [];

	public function __construct()
	{
		$this->_ci =& get_instance();

		$this->_ci->load->model('vertragsbestandteil/Gehaltsbestandteil_model', null, 'GehaltsbestandteilModel');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanz_model');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanzMethod_model');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungAPI_model');
		$this->_ci->load->library('vertragsbestandteil/VertragsbestandteilLib', null, 'VertragsbestandteilLib');
		$this->_ci->load->library('vertragsbestandteil/GehaltsbestandteilLib', null, 'GehaltsbestandteilLib');
		$this->_ci->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisationFactory', null, 'ValorisationFactory');
	}

	/************************************************************* public methods *******************************************************************/

	public function initialize($params)
	{
		if(!isset($params['valorisierung_kurzbz']))
			throw new Exception("Valorisierung Kurzbezeichnung fehlt");

		$valorisierung_kurzbz = $params['valorisierung_kurzbz'];

		$valinstanz = $this->_ci->ValorisierungInstanz_model->loadValorisierungInstanzByKurzbz($valorisierung_kurzbz);
		if($valinstanz === null)
		{
			throw new Exception('Valorisierungsinstanz ' . $valorisierung_kurzbz . ' nicht gefunden');
		}

		$this->_valorisierungInstanz = $valinstanz;
		$this->_dienstverhaeltnis = null;
		$this->_gehaltsbestandteile = [];
		$this->_vertragsbestandteile = [];
		$this->_calculatedValorisation = [];
	}

	public function calculateAllValorisation()
	{
		return $this->_doValorisationForAllDv();
	}

	public function doAllValorisation()
	{
		return $this->_doValorisationForAllDv($storeCalculatedValorisation = true);
	}

	public function calculateValorisationForDvId($dienstverhaeltnis_id)
	{
		$dvdata = new StdClass();
		$dvdata->dienstverhaeltnis_id = $dienstverhaeltnis_id;
		$this->_calculateValorisation($dvdata);
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
				],
				$this->_ci->ValorisierungHistorie_model->getEncryptedColumns()
			);
		}

		// before commiting, checking if another Valorisierung is not applied already (e.g. by another thread)
		if(!hasData($this->_ci->ValorisierungInstanz_model->getNonSelectedValorisierungInstanzen(
			$this->_valorisierungInstanz->valorisierungsdatum,
			$this->_valorisierungInstanz->oe_kurzbz
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

	public function setDvDataForValorisation($dvData)
	{
		if (!isset($dvData['dienstverhaeltnis']) || !isset($dvData['vertragsbestandteile']) || !isset($dvData['gehaltsbestandteile'])) return;

		$this->_dienstverhaeltnis = $dvData['dienstverhaeltnis'];
		$this->_vertragsbestandteile = $dvData['vertragsbestandteile'];
		$this->_gehaltsbestandteile = $dvData['gehaltsbestandteile'];
	}

	public function fetchDvDataForValorisation($dienstverhaeltnis_id)
	{
		$dvData = [
			'dienverhaeltnis' => null,
			'vertragsbestandteile' => [],
			'gehaltsbestandteile' => []
		];

		$dvData['dienstverhaeltnis'] = $this->_ci->VertragsbestandteilLib->fetchDienstverhaeltnis($dienstverhaeltnis_id);
		$dvData['vertragsbestandteile'] = $this->_ci->VertragsbestandteilLib->fetchVertragsbestandteile(
			$dienstverhaeltnis_id,
			$this->_valorisierungInstanz->valorisierungsdatum,
			false
		);

		$dvData['gehaltsbestandteile'] = $this->_ci->GehaltsbestandteilLib->fetchGehaltsbestandteile(
			$dienstverhaeltnis_id,
			$this->_valorisierungInstanz->valorisierungsdatum,
			false
		);

		return $dvData;
	}

	public function getCalculatedValorisation()
	{
		return $this->_calculatedValorisation;
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

	private function _checkParamsForValorisation()
	{
		$paramNames = ['valorisierungInstanz', 'dienstverhaeltnis', 'vertragsbestandteile', 'gehaltsbestandteile'];

		foreach ($paramNames as $paramName)
		{
			if (!isset($this->{'_'.$paramName})) throw new Exception("parameter missing: " . $paramName);
		}
	}

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
		if($storeCalculatedValorisation === true) $this->storeCalculatedValorisation();

		return $dvsdata;
	}

	private function _calculateValorisation(&$dvdata)
	{
		$this->_checkParamsForValorisation();

		$valinstanzmethoden = $this->_ci->ValorisierungInstanzMethod_model->loadValorisierungInstanzByKurzbz(
			$this->_valorisierungInstanz->valorisierung_instanz_id
		);

		$applicableValorisationMethods = array();
		foreach ($valinstanzmethoden as $valinstanzmethod)
		{
			$valorisationMethod = $this->_ci->ValorisationFactory->getValorisationMethod($valinstanzmethod->valorisierung_methode_kurzbz);
			$params = json_decode($valinstanzmethod->valorisierung_methode_parameter);
			$valorisationMethod->initialize($this->_dienstverhaeltnis, $this->_vertragsbestandteile, $this->_gehaltsbestandteile, $params);
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
		else
		{
		    $noval = $this->_ci->ValorisationFactory->getValorisationMethod($this->_ci->ValorisationFactory::VALORISATION_KEINE);
		    $noval->initialize($dienstverhaeltnis, $vertragsbestandteile, $gehaltsbestandteile, null);
		    $dvdata->valorisierungmethode = 'keine Valorisierung';
		    $dvdata->sumsalarypreval = round($noval->calcSummeGehaltsbestandteile(), 2);
		    $dvdata->sumsalarypostval = $dvdata->sumsalarypreval;
		}
	}
}
