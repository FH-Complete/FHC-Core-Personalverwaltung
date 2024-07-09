<?php
/**
 * Description of ValorisierungGestaffelt
 *
 * @author bambi
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
		$sumvalsalary = $this->calcSummeGehaltsbestandteile(self::NUR_ZU_VALORISIERENDE_GBS);
		foreach ($this->gehaltsbestandteile as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;
			if( $gehaltsbestandteil->getValorisierung() )
			{
				$this->anteile[$gehaltsbestandteil->getGehaltsbestandteil_id()] = $gehaltsbestandteil->getBetrag_valorisiert() / $sumvalsalary;
 			}
		}
	}

	protected function scaleSumsalaryToFTE()
	{
		$this->sumvalsalary = $this->calcSummeGehaltsbestandteile(self::NUR_ZU_VALORISIERENDE_GBS);
		if( floatval($this->wochenstunden) < floatval($this->fulltimehours) && $this->wochenstunden > 0 && floatval($this->fulltimehours) > 0 )
		{
			$this->sumvalsalaryfte = $this->sumvalsalary / floatval($this->wochenstunden) * floatval($this->fulltimehours);
		}
		else
		{
			$this->sumvalsalaryfte = $this->sumvalsalary;
		}
	}

	protected function valoriseSteps()
	{
		$scalefactor_fte2pt = 1;
		if( $this->wochenstunden < floatval($this->fulltimehours) && $this->wochenstunden > 0 && floatval($this->fulltimehours) > 0 )
		{
			$scalefactor_fte2pt = 1 / floatval($this->fulltimehours) * floatval($this->wochenstunden);
		}

		$this->valorisation = 0;
		foreach($this->params->valorisierung->stufen as $idx => $step)
		{
			if( $this->sumvalsalaryfte > $step->untergrenze )
			{
				if( $step->obergrenze !== NULL && $this->sumvalsalaryfte > $step->obergrenze )
				{
					$stepsum = $step->obergrenze - $step->untergrenze;
				}
				else
				{
					$stepsum = $this->sumvalsalaryfte - $step->untergrenze;
				}

				$valstep = $stepsum * ($step->prozent / 100);
				$valscaled = $valstep * $scalefactor_fte2pt;
				echo "Step " . $idx . ": valfte: " . $valstep . " valtz: " . $valscaled . "\n";
				$this->valorisation += $valscaled;
			}
		}
	}

	protected function distributeValorisationToGehaltsbestandteile()
	{
		foreach ($this->gehaltsbestandteile as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;
			if( $gehaltsbestandteil->getValorisierung() )
			{
				$betrag_valorisiert =
					$this->anteile[$gehaltsbestandteil->getGehaltsbestandteil_id()] * $this->valorisation
					+ $gehaltsbestandteil->getBetrag_valorisiert();
				$gehaltsbestandteil->setBetrag_valorisiert(round($betrag_valorisiert, 2));
 			}
		}
	}
}
