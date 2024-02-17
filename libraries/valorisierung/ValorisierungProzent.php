<?php
/**
 * Description of ValorisierungProzent
 *
 * @author bambi
 */
class ValorisierungProzent extends AbstractValorisationMethod
{
	public function checkIfApplicable()
	{
		$sumsalary = $this->calcSummeGehaltsbestandteile();
		if( $sumsalary <= $this->params->maxsalary )
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	public function checkParams()
	{
		if( !isset($this->params->prozent) || !is_numeric($this->params->prozent) )
		{
			throw new Exception('Parameter prozent missing or not numeric');
		}
		
		if( !isset($this->params->maxsalary) || !is_numeric($this->params->maxsalary) )
		{
			throw new Exception('Parameter maxsalary missing or not numeric');
		}
	}

	public function doValorisation()
	{		
		foreach ($this->gehaltsbestandteile as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;
			if( !$gehaltsbestandteil->getValorisierung() ) {
				echo "Gehaltsbestandteil wird nicht valorisiert.\n";
			}
			else
			{
				$betrag_valorisiert = $gehaltsbestandteil->getBetrag_valorisiert() * (1 + $this->params->prozent / 100);
				echo $gehaltsbestandteil->getBetrag_valorisiert() . ' wird valorisiert: ' . $betrag_valorisiert . "\n";
 			}
		}
	}
}
