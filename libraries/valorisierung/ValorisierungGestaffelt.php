<?php
/**
 * Valorisation method: valorisation increase in steps ("gestaffelt"), e.g. first 1000 7%, second 1500 5%, rest 2%
 */
class ValorisierungGestaffelt extends AbstractValorisationMethod
{
	protected $anteile;
	protected $wochenstunden;
	protected $sumvalsalary;
	protected $sumvalsalaryfte;
	protected $valorisation;

	public function __construct()
	{
		parent::__construct();
		$this->anteile = array();
		$this->wochenstunden = null;
		$this->sumvalsalary = null;
		$this->sumvalsalaryfte = null;
		$this->fulltimehours = $this->ci->config->item('VAL_FULLTIME_HOURS');
	}

	public function checkParams()
	{
		parent::checkParams();
		if( !isset($this->params->valorisierung->stufen) || !is_array($this->params->valorisierung->stufen) )
		{
			throw new Exception('Parameter stufen missing or not an array');
		}
	}

	public function calculateValorisation()
	{
		$this->fetchWochenstunden();
		$this->scaleSumsalaryToFTE();

		$this->calcGehaltsbestandteilAnteile();

		$this->valoriseSteps();

		$this->distributeValorisationToGehaltsbestandteile();
	}

	protected function fetchWochenstunden()
	{
		foreach($this->vertragsbestandteile as $vb)
		{
			if( $vb->getVertragsbestandteiltyp_kurzbz() === 'stunden' )
			{
				$this->wochenstunden = $vb->getWochenstunden();
			}
		}
	}

	protected function calcGehaltsbestandteilAnteile()
	{
		// get valorisation sum for all applicable Gehaltsbestandteile
		$sumvalsalary = $this->calcSummeGehaltsbestandteile(self::NUR_ZU_VALORISIERENDE_UND_UNGESPERRTE_GBS);

		// for each applicable Gehaltsbestandteil
		foreach ($this->getGehaltsbestandteileForValorisierung() as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;

			// save fraction of valorisation amount (avoid division by 0)
			$this->anteile[$gehaltsbestandteil->getGehaltsbestandteil_id()] =
				$sumvalsalary == 0 ? 0 : $gehaltsbestandteil->getBetrag_valorisiert() / $sumvalsalary;
		}
	}

	protected function scaleSumsalaryToFTE()
	{
		// get valorisation sum for all applicable Gehaltsbestandteile
		$this->sumvalsalary = $this->calcSummeGehaltsbestandteile(self::NUR_ZU_VALORISIERENDE_UND_UNGESPERRTE_GBS);

		// if week hours are under full time hours
		if( floatval($this->wochenstunden) < floatval($this->fulltimehours) && $this->wochenstunden > 0 && floatval($this->fulltimehours) > 0 )
		{
			// scale sum up to full time hours
			$this->sumvalsalaryfte = $this->sumvalsalary / floatval($this->wochenstunden) * floatval($this->fulltimehours);
		}
		else
		{
			// otherwise just take sum amount
			$this->sumvalsalaryfte = $this->sumvalsalary;
		}
	}

	protected function valoriseSteps()
	{
		$scalefactor_fte2pt = 1;
		if( $this->wochenstunden < floatval($this->fulltimehours) && $this->wochenstunden > 0 && floatval($this->fulltimehours) > 0 )
		{
			// get scale factor if week hours are under fulltime hours
			$scalefactor_fte2pt = 1 / floatval($this->fulltimehours) * floatval($this->wochenstunden);
		}

		$this->valorisation = 0;

		// for each valorisation step
		foreach($this->params->valorisierung->stufen as $idx => $step)
		{
			// if sum (over all Gehaltsbestandteile) of salary falls into step margin
			if( $this->sumvalsalaryfte > $step->untergrenze )
			{
				if( $step->obergrenze !== NULL && $this->sumvalsalaryfte > $step->obergrenze )
				{
					// add amount falling into margin
					$stepsum = $step->obergrenze - $step->untergrenze;
				}
				else
				{
					// if last entry, add remaining amount
					$stepsum = $this->sumvalsalaryfte - $step->untergrenze;
				}

				// calculate percent for the step
				$valstep = $stepsum * ($step->prozent / 100);

				// scale down to week hours
				$valscaled = $valstep * $scalefactor_fte2pt;
				//echo "Step " . $idx . ": valfte: " . $valstep . " valtz: " . $valscaled . "\n";

				// add valorisation
				$this->valorisation += $valscaled;
			}
		}
	}

	protected function distributeValorisationToGehaltsbestandteile()
	{
		// for each applicable Gehaltsbestandteil
		foreach ($this->getGehaltsbestandteileForValorisierung() as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;

			// add valorisation part to valorisaiton amount
			$betrag_valorisiert =
				$this->anteile[$gehaltsbestandteil->getGehaltsbestandteil_id()] * $this->valorisation
				+ $gehaltsbestandteil->getBetrag_valorisiert();

			$gehaltsbestandteil->setBetrag_valorisiert(round($betrag_valorisiert, 2));
		}
	}
}
