<?php

/**
 * Valorisation method: percent, but use Sockelbetrag if the calculated percent are lower
 */
class ValorisierungProzentSockelbetrag extends AbstractValorisationMethod
{
	const DEBUG = false;

	protected $wochenstunden;
	protected $fulltimehours;

	protected $scalefactor_fte2pt;

	public function __construct()
	{
		parent::__construct();
	}

	public function checkParams()
	{
		parent::checkParams();

		// prozent parameter has to be set
		if( !isset($this->params->valorisierung->prozent) || !is_numeric($this->params->valorisierung->prozent) )
		{
			throw new Exception('Parameter prozent missing or not numeric');
		}

		// Sockelbetrag should be set
		if( !isset($this->params->valorisierung->sockelbetrag) || !is_numeric($this->params->valorisierung->sockelbetrag) )
		{
			throw new Exception('Parameter sockelbetrag missing or not numeric');
		}
	}

	public function calculateValorisation()
	{
		$this->fetchWochenstunden();
		$this->calcScaleFactor_FTE2PT();
		$this->calcValorisationForGehaltsbestandteile();
	}

	protected function calcValorisationForGehaltsbestandteile()
	{
		// get scaled threshold amount
		$sockelbetrag_scaled = $this->params->valorisierung->sockelbetrag * $this->scalefactor_fte2pt;

		// get sum of valorisation amounts of all applicable Gehaltsbestandteile
		$sumsalary = $this->calcSummeGehaltsbestandteile(AbstractValorisationMethod::NUR_ZU_VALORISIERENDE_UND_UNGESPERRTE_GBS);

		// calculate percent amount for sum
		$betrag_prozent = $sumsalary * $this->params->valorisierung->prozent / 100;

		// if percent amount is lower than threshold, use threshold
		$useThreshold = $betrag_prozent < $sockelbetrag_scaled;

		// for each applicable Gehaltsbestandsteil
		foreach ($this->getGehaltsbestandteileForValorisierung() as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;

			if ($useThreshold)
			{
				// get fraction to distribute Betrag correctly for each Gehaltsbestandteil
				$fraction = $gehaltsbestandteil->getBetrag_valorisiert() / $sumsalary;

				// add fraction of Betrag
				$betrag_valorisiert = $gehaltsbestandteil->getBetrag_valorisiert() + ($sockelbetrag_scaled * $fraction);
			}
			else
			{
				// add percent
				$betrag_valorisiert = $gehaltsbestandteil->getBetrag_valorisiert() * (1 + $this->params->valorisierung->prozent / 100);
			}

			$gehaltsbestandteil->setBetrag_valorisiert(round($betrag_valorisiert, 2));
		}

		if(self::DEBUG)
		{
			echo "Valorisierung Betrag: " . $valorisierung_betrag . PHP_EOL;
		}
	}
}