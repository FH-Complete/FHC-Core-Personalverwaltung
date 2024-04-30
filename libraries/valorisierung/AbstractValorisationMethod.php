<?php
/**
 * Description of AbstractValorisationMethod
 *
 * @author bambi
 */
abstract class AbstractValorisationMethod implements IValorisationMethod
{
	const ALLE_GBS = false;
	const NUR_ZU_VALORISIERENDE_GBS = true;
	
	protected $dienstverhaeltnis;
	protected $vertragsbestandteile;
	protected $gehaltsbestandteile;
	protected $params;
	
	public function __construct()
	{
		$this->dienstverhaeltnis = null;
		$this->vertragsbestandteile = null;
		$this->gehaltsbestandteile = null;
		$this->params = null;
	}
	
	public function initialize($dienstverhaeltnis, $vertragsbestandteile, $gehaltsbestandteile, $params)
	{
		$this->dienstverhaeltnis = $dienstverhaeltnis;
		$this->vertragsbestandteile = $vertragsbestandteile;
		$this->gehaltsbestandteile = $gehaltsbestandteile;
		$this->params = $params;
	}
	
	protected function calcSummeGehaltsbestandteile($mode=self::ALLE_GBS)
	{
		$sumsalary = 0;
		foreach( $this->gehaltsbestandteile as $gehaltsbestandteil ) 
		{
			if( ($mode === self::NUR_ZU_VALORISIERENDE_GBS) 
				&& !$gehaltsbestandteil->getValorisierung() )
			{
				continue;
			}
			$sumsalary += $gehaltsbestandteil->getBetrag_valorisiert();
		}
		return $sumsalary;
	}
}