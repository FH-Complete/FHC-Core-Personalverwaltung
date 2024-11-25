<?php
/**
 * Generic valorisation method, contains logic used for all valorisation methods
 */
abstract class AbstractValorisationMethod implements IValorisationMethod
{
	// constants for mode (which Gehaltsbestandteile are applicable?)
	const ALLE_GBS = 0; // all Gehaltsbestandteile
	const NUR_ZU_VALORISIERENDE_GBS = 1; // only Gehaltsbestandteile with valorisaiton = true
	const NUR_UNGESPERRTE_GBS = 2; // only Gehaltsbestandteile which have no Valorisierungssperre
	const NUR_ZU_VALORISIERENDE_UND_UNGESPERRTE_GBS = 3; // valorisation = true and no Valorisierungssperre

	protected $ci; // code igniter instance
	protected $dienstverhaeltnis; // the DV for which Valorisation is calculated
	protected $vertragsbestandteile; // Vertragsbestandteile of the DV
	protected $gehaltsbestandteile; // Gehaltsbestandteile of the DV
	protected $params; // parameter passed to valorisation method

	public function __construct()
	{
		// get ci instance
		$this->ci =& get_instance();

		// load config
		$this->ci->load->config('extensions/FHC-Core-Personalverwaltung/valorisierung');

		$this->valorisierungsdatum = null;
		$this->dienstverhaeltnis = null;
		$this->vertragsbestandteile = null;
		$this->gehaltsbestandteile = null;
		$this->params = null;
	}

	/**
	 * Check structure of passed params
	 */
	public function checkParams()
	{
		if (!isset($this->params->kriterien) || !is_object($this->params->kriterien))
		{
			throw new Exception('Kriterien parameter missing or wrong type');
		}

		if (!isset($this->params->valorisierung) || !is_object($this->params->valorisierung))
		{
			throw new Exception('Valorisierung parameter missing or wrong type');
		}
	}

	/**
	* Initialize the valorisation method, set params needed for valorisation calculation
	*/
	public function initialize($valorisierungsdatum, $dienstverhaeltnis, $vertragsbestandteile, $gehaltsbestandteile, $params)
	{
		$this->valorisierungsdatum = $valorisierungsdatum;
		$this->dienstverhaeltnis = $dienstverhaeltnis;
		$this->vertragsbestandteile = $vertragsbestandteile;
		$this->gehaltsbestandteile = $gehaltsbestandteile;
		$this->params = $params;
	}

	/**
	* Checks if a valorisation method is applicable
	* @return bool true if applicable, false if not
	*/
	public function checkIfApplicable()
	{
		$sumsalary = $this->calcSummeGehaltsbestandteile();

		$kriterien = $this->params->kriterien;

		if( isset($kriterien->mingehalt) && $sumsalary < $kriterien->mingehalt )
		{
			return false;
		}

		if( isset($kriterien->maxgehalt) && $sumsalary > $kriterien->maxgehalt )
		{
			return false;
		}

		if( isset($kriterien->stichtag) && new DateTime($this->dienstverhaeltnis->getVon()) > new DateTime($kriterien->stichtag) )
		{
			return false;
		}

		return true;
	}

	/**
	 * Calculates sum of all Valorisation amounts (for all applicable Gehaltsbestandteile)
	 * @param $mode which Gehaltsbestandteile should be taken into account?
	 * @return valorisation amount sum
	 */
	public function calcSummeGehaltsbestandteile($mode=self::ALLE_GBS)
	{
		$sumsalary = 0;
		foreach( $this->getGehaltsbestandteileForValorisierung($mode) as $gehaltsbestandteil )
		{
			$sumsalary += $gehaltsbestandteil->getBetrag_valorisiert();
		}
		return $sumsalary;
	}

	/**
	 * Get all Valorisation amounts (for all applicable Gehaltsbestandteile)
	 * @return array with all amounts
	 */
	public function getBetraegeValorisiertForEachGehaltsbestandteil()
	{
		$betraege = [];
		foreach( $this->getGehaltsbestandteileForValorisierung() as $gehaltsbestandteil )
		{
			$betraege[$gehaltsbestandteil->getGehaltsbestandteil_id()] = $gehaltsbestandteil->getBetrag_valorisiert();
		}
		return $betraege;
	}

	/**
	 *
	 * Gets all Gehaltsbestandteile applicable for a valorisation.
	 * @param $mode name of mode for setting which Dienstverhälnisse should be retrieved
	 * @return array with Gehaltsbestandteile
	 */
	public function getGehaltsbestandteileForValorisierung($mode=self::NUR_ZU_VALORISIERENDE_UND_UNGESPERRTE_GBS)
	{
		$gehaltsbestandteile = [];
		foreach ($this->gehaltsbestandteile as $gehaltsbestandteil)
		{
			// valorisation flag
			$zuValorisieren = $gehaltsbestandteil->getValorisierung();

			// valorisation lock
			$sperrDatum = $gehaltsbestandteil->getValorisierungssperre();
			$gesperrt = isset($sperrDatum) && new DateTime($sperrDatum) >= new DateTime($this->valorisierungsdatum);

			// add Gehaltsbestandteil if applicable
			if ($mode === self::ALLE_GBS
				|| ($mode === self::NUR_ZU_VALORISIERENDE_GBS && $zuValorisieren)
				|| ($mode === self::NUR_UNGESPERRTE_GBS && !$gesperrt)
				|| ($mode === self::NUR_ZU_VALORISIERENDE_UND_UNGESPERRTE_GBS && $zuValorisieren && !$gesperrt))
			{
				$gehaltsbestandteile[] = $gehaltsbestandteil;
			}
		}
		return $gehaltsbestandteile;
	}
}
