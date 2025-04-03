<?php
/**
 * Valorisation method: fixed amount
 */
class ValorisierungFixBetrag extends AbstractValorisationMethod
{
	public function checkParams()
	{
		parent::checkParams();

		// Fixbetrag should be set
		if( !isset($this->params->valorisierung->fixbetrag) || !is_numeric($this->params->valorisierung->fixbetrag) )
		{
			throw new Exception('Parameter fixbetrag missing or not numeric');
		}
	}

	public function calculateValorisation()
	{
		// get sum of valorisation amounts of all applicable Gehaltsbestandteile
		$sumsalary = $this->calcSummeGehaltsbestandteile(AbstractValorisationMethod::NUR_ZU_VALORISIERENDE_UND_UNGESPERRTE_GBS);

		// for each applicable Gehaltsbestandsteil
		foreach ($this->getGehaltsbestandteileForValorisierung() as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;

			// get fraction to distribute Fixbetrag correctly for each Gehaltsbestandteil
			$fraction = $gehaltsbestandteil->getBetrag_valorisiert() / $sumsalary;

			// add fraction of Fixbetrag
			$betrag_valorisiert = $gehaltsbestandteil->getBetrag_valorisiert() + ($this->params->valorisierung->fixbetrag * $fraction);
			$gehaltsbestandteil->setBetrag_valorisiert(round($betrag_valorisiert, 2));
		}
	}
}
