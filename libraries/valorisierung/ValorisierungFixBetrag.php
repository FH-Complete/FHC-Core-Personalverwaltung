<?php
/**
 * Description of ValorisierungFixBetrag
 *
 * @author bambi
 */
class ValorisierungFixBetrag extends AbstractValorisationMethod
{
	public function checkIfApplicable()
	{
		$sumsalary = $this->calcSummeGehaltsbestandteile();
		
		if( $sumsalary > $this->params->minsalary )
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
		if( !isset($this->params->fixbetrag) || !is_numeric($this->params->fixbetrag) )
		{
			throw new Exception('Parameter fixbetrag missing or not numeric');
		}
		
		if( !isset($this->params->minsalary) || !is_numeric($this->params->minsalary) )
		{
			throw new Exception('Parameter minsalary missing or not numeric');
		}
	}

	public function doValorisation()
	{
		echo 'Using ValorisationMethod: ' . __CLASS__ . "\n";
		print_r($this->params);
		$sumsalary = $this->calcSummeGehaltsbestandteile(AbstractValorisationMethod::NUR_ZU_VALORISIERENDE_GBS);
		foreach ($this->gehaltsbestandteile as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;
			if( !$gehaltsbestandteil->getValorisierung() ) {
				echo "Gehaltsbestandteil wird nicht valorisiert.\n";
			}
			else
			{
				$fraction = $gehaltsbestandteil->getBetrag_valorisiert() / $sumsalary;
				$betrag_valorisiert = $gehaltsbestandteil->getBetrag_valorisiert() + ($this->params->fixbetrag * $fraction);
				echo $gehaltsbestandteil->getBetrag_valorisiert() . ' wird valorisiert: ' . round($betrag_valorisiert, 2) . "\n";
 			}
		}
	}
}
