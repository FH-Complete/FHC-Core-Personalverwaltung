<?php
/**
 * Description of ValorisierungProzent
 *
 * @author bambi
 */
class ValorisierungProzent implements IValorisationMethod
{
	public function doValorisation($gehaltsbestandteile, $params)
	{
		print_r($gehaltsbestandteile);
		print_r($params);
		
		foreach ($gehaltsbestandteile as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;
			if( !$gehaltsbestandteil->getValorisierung() ) {
				echo "Gehaltsbestandteil wird nicht valorisiert.\n";
			}
			else
			{
				$betrag_valorisiert = $gehaltsbestandteil->getBetrag_valorisiert() * (1 + $params->prozent / 100);
				echo $gehaltsbestandteil->getBetrag_valorisiert() . ' wird valorisiert: ' . $betrag_valorisiert . "\n";
 			}
		}
	}
}
