<?php
/**
 * Valorisation method: percentage increase
 */
class ValorisierungProzent extends AbstractValorisationMethod
{
	public function checkParams()
	{
		parent::checkParams();

		// prozent parameter has to be set
		if( !isset($this->params->valorisierung->prozent) || !is_numeric($this->params->valorisierung->prozent) )
		{
			throw new Exception('Parameter prozent missing or not numeric');
		}
	}

	public function calculateValorisation()
	{
		// for each applicable Gehaltsbestandsteil
		foreach ($this->getGehaltsbestandteileForValorisierung() as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;

			// add valorisation percent
			$betrag_valorisiert = $gehaltsbestandteil->getBetrag_valorisiert() * (1 + $this->params->valorisierung->prozent / 100);

			// set increased amount
			$gehaltsbestandteil->setBetrag_valorisiert(round($betrag_valorisiert, 2));
		}
	}
}
