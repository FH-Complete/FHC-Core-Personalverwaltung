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
	}

	public function checkIfApplicable()
	{
		return true;
	}

	public function checkParams()
	{
		if( !isset($this->params->steps) || !is_array($this->params->steps) )
		{
			throw new Exception('Parameter steps missing or not an array');
		}
	}

	public function doValorisation()
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
		if( floatval($this->wochenstunden) < floatval('38.5') )
		{
			$this->sumvalsalaryfte = $this->sumvalsalary / floatval($this->wochenstunden) * floatval('38.5');
		}
		else 
		{
			$this->sumvalsalaryfte = $this->sumvalsalary;
		}
	}
	
	protected function valoriseSteps()
	{
		$scalefactor_fte2pt = 1;
		if( $this->wochenstunden < floatval('38.5') )
		{
			$scalefactor_fte2pt = 1 / floatval('38.5') * floatval($this->wochenstunden);
		}
		
		$this->valorisation = 0;
		foreach($this->params->steps as $idx => $step) 
		{
			if( $this->sumvalsalaryfte > $step->lowerbound )
			{
				if( $step->upperbound !== NULL && $this->sumvalsalaryfte > $step->upperbound )
				{
					$stepsum = $step->upperbound - $step->lowerbound;
				}
				else
				{
					$stepsum = $this->sumvalsalaryfte - $step->lowerbound;
				}
				
				$valstep = $stepsum * ($step->percent / 100);
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
				$betrag_valorisiert = $this->anteile[$gehaltsbestandteil->getGehaltsbestandteil_id()] * $this->valorisation + $gehaltsbestandteil->getBetrag_valorisiert();
				$gehaltsbestandteil->setBetrag_valorisiert(round($betrag_valorisiert, 2)); 
 			}
		}
	}
}
