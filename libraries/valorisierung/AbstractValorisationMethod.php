<?php
/**
 * Description of AbstractValorisationMethod
 *
 * @author bambi
 */
abstract class AbstractValorisationMethod implements IValorisationMethod
{
	const ALLE_GBS = false;
	const NUR_ZU_VALORISIERENDE_GBS = false;
	const NUR_UNGESPERRTE_GBS = false;
	const NUR_ZU_VALORISIERENDE_UND_UNGESPERRTE_GBS = true;

	protected $ci; // code igniter instance
	protected $dienstverhaeltnis;
	protected $vertragsbestandteile;
	protected $gehaltsbestandteile;
	protected $params;

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

	public function initialize($valorisierungsdatum, $dienstverhaeltnis, $vertragsbestandteile, $gehaltsbestandteile, $params)
	{
		$this->valorisierungsdatum = $valorisierungsdatum;
		$this->dienstverhaeltnis = $dienstverhaeltnis;
		$this->vertragsbestandteile = $vertragsbestandteile;
		$this->gehaltsbestandteile = $gehaltsbestandteile;
		$this->params = $params;
	}

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
	 *
	 * @param
	 * @return object success or error
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
			if ($mode == self::ALLE_GBS
				|| ($mode == self::NUR_ZU_VALORISIERENDE_GBS && $zuValorisieren)
				|| ($mode == self::NUR_UNGESPERRTE_GBS && !$gesperrt)
				|| ($mode == self::NUR_ZU_VALORISIERENDE_UND_UNGESPERRTE_GBS && $zuValorisieren && !$gesperrt))
			{
				$gehaltsbestandteile[] = $gehaltsbestandteil;
			}
		}
		return $gehaltsbestandteile;
	}
}
