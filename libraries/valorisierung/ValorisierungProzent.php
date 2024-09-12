<?php
/**
 * Description of ValorisierungProzent
 *
 * @author bambi
 */
class ValorisierungProzent extends AbstractValorisationMethod
{
	public function checkParams()
	{
		parent::checkParams();
		if( !isset($this->params->valorisierung->prozent) || !is_numeric($this->params->valorisierung->prozent) )
		{
			throw new Exception('Parameter prozent missing or not numeric');
		}
	}

	public function calculateValorisation()
	{
		foreach ($this->getGehaltsbestandteileForValorisierung() as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;
			$betrag_valorisiert = $gehaltsbestandteil->getBetrag_valorisiert() * (1 + $this->params->valorisierung->prozent / 100);
			$gehaltsbestandteil->setBetrag_valorisiert(round($betrag_valorisiert, 2));
		}
	}
}
