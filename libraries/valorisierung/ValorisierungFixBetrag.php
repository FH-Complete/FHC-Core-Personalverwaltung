<?php
/**
 * Description of ValorisierungFixBetrag
 *
 * @author bambi
 */
class ValorisierungFixBetrag extends AbstractValorisationMethod
{
	public function checkParams()
	{
		if( !isset($this->params->valorisierung->fixbetrag) || !is_numeric($this->params->valorisierung->fixbetrag) )
		{
			throw new Exception('Parameter fixbetrag missing or not numeric');
		}
	}

	public function calculateValorisation()
	{
		$sumsalary = $this->calcSummeGehaltsbestandteile(AbstractValorisationMethod::NUR_ZU_VALORISIERENDE_GBS);
		foreach ($this->gehaltsbestandteile as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;
			if( $gehaltsbestandteil->getValorisierung() )
			{
				$fraction = $gehaltsbestandteil->getBetrag_valorisiert() / $sumsalary;
				$betrag_valorisiert = $gehaltsbestandteil->getBetrag_valorisiert() + ($this->params->valorisierung->fixbetrag * $fraction);
				$gehaltsbestandteil->setBetrag_valorisiert(round($betrag_valorisiert, 2));
 			}
		}
	}
}
