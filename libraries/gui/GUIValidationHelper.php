<?php
/**
 * Description of GUIValidationHelper
 *
 * @author bambi
 */
class GUIValidationHelper
{
	protected $CI;
	/**
	 * @var VertragsbestandteilTyp_model
	 */
	protected $VertragsbestandteilTypModel;
	/**
	 * @var VertragsbestandteilFreitexttyp_model
	 */
	protected $VertragsbestandteilFreitexttypModel;
	
	protected $vbsbytype;
	protected $vbfreitextbytype;
	protected $gbsbytype;
	
	public function __construct()
	{
		$this->CI = get_instance();
		$this->CI->load->model('vertragsbestandteil/Vertragsbestandteiltyp_model', 
			'VertragsbestandteilTypModel');
		$this->VertragsbestandteilTypModel = $this->CI->VertragsbestandteilTypModel;
		$this->CI->load->model('vertragsbestandteil/VertragsbestandteilFreitexttyp_model', 
			'VertragsbestandteilFreitexttypModel');
		$this->VertragsbestandteilFreitexttypModel = $this->CI->VertragsbestandteilFreitexttypModel;
				
		$this->initVBsByType();
		$this->initVBFreitextByType();
		$this->gbsbytype = array();
	}
	
	public function checkDVwithVBsAnbGBs(FormData $formdata) 
	{
		$vbs = $formdata->getVbs();
		$this->sieveVBsByType($vbs);
		$this->checkSievedList($this->vbsbytype);
		$this->checkSievedList($this->vbfreitextbytype);
		$this->checkHauptfunktionen($formdata);

		$formdata->getDv()->validate();
		$dv = $formdata->getDv()->getDienstverhaeltnis();
		foreach( $vbs as $vbmapper )
		{
			$vb = $vbmapper->getVbsinstance();
			if( !$vbmapper->hasToBeDeleted() )
			{
				$this->checkIfContains($dv, $vb);
			}			
			$vbmapper->validate();
			if( $vbmapper->getHasGBS() )
			{
				$gbs = $vbmapper->getGbs();
				$this->sieveGBsByType($gbs);
				$this->checkSievedList($this->gbsbytype);
				foreach($gbs as $gbmapper) 
				{
					$gb = $gbmapper->getGbsInstance();
					if( !$gbmapper->hasToBeDeleted() )
					{
						$this->checkIfContains($vb, $gb);
					}
					$gbmapper->validate();
				}
			}
		}
	}
	
	protected function checkIfContains($a, $b)
	{
		if( (!$a->getVon() && !$a->getBis())
			|| (!$b->getVon() && !$b->getBis()) )
		{
			return;
		}

		$a_von = new DateTime(($a->getVon() ?? '1970-01-01'));
		$b_von = new DateTime(($b->getVon() ?? '1970-01-01'));

		$a_bis = new DateTime(($a->getBis() ?? '2170-01-01'));
		$b_bis = new DateTime(($b->getBis() ?? '2170-01-01'));

		if( ($b_von < $a_von) || ($b_bis > $a_bis ) )
		{
			$b->addValidationError('Bestandteil liegt ausserhalb der Gültigkeit des übergeordneten Bestandteils');
		}
	}

	protected function checkForOverlap($a, $b,
		$errmsg = 'Überlappt mit einem Bestandteil gleichen Typs.')
	{
		if( (!$a->getVon() && !$a->getBis()) 
			|| (!$b->getVon() && !$b->getBis()) )
		{
			return;
		}
		
		$a_von = new DateTime(($a->getVon() ?? '1970-01-01'));
		$b_von = new DateTime(($b->getVon() ?? '1970-01-01'));
		
		$a_bis = new DateTime(($a->getBis() ?? '2170-01-01'));
		$b_bis = new DateTime(($b->getBis() ?? '2170-01-01'));
		
		if( ($a_von <= $b_bis) && ($a_bis >= $b_von ) )
		{
			$a->addValidationError($errmsg);
			$b->addValidationError($errmsg);
		}
	}
	
	/**
	 * Per employment (Dienstverhältnis), at most one function
	 * may be marked as the main function (Hauptfunktion) at any point in time.
	 * The check covers
	 *  1. the functions submitted with the form, and
	 *  2. the saved functions of the employment relationship that are not part of the form
	 *     (VBs contained in the form are compared with their new status).
	 */
	protected function checkHauptfunktionen(FormData $formdata)
	{
		$hauptfunktionen = array();
		$vbidsInForm = array();

		foreach( $formdata->getVbs() as $vbmapper )
		{
			$vb = $vbmapper->getVbsinstance();
			if( $vb->getVertragsbestandteiltyp_kurzbz()
				!== vertragsbestandteil\VertragsbestandteilFactory::VERTRAGSBESTANDTEIL_FUNKTION )
			{
				continue;
			}

			if( intval($vb->getVertragsbestandteil_id()) > 0 )
			{
				$vbidsInForm[] = intval($vb->getVertragsbestandteil_id());
			}

			if( $vbmapper->hasToBeDeleted() || $vb->getHauptfunktion() !== true )
			{
				continue;
			}
			$hauptfunktionen[] = $vb;
		}

		if( count($hauptfunktionen) === 0 )
		{
			return;
		}

		// check overlap (form only)
		$errmsg = 'Pro Dienstverhältnis darf es zu jedem Zeitpunkt nur eine Hauptfunktion geben.';
		$this->checkListForOverlaps($hauptfunktionen, $errmsg);

		// check overlap against existing data
		$dvid = intval($formdata->getDv()->getDienstverhaeltnis()->getDienstverhaeltnis_id());
		if( $dvid < 1 )
		{
			return;
		}

		$this->CI->load->model('vertragsbestandteil/VertragsbestandteilFunktion_model',
			'VertragsbestandteilFunktionModel');

		foreach( $hauptfunktionen as $vb )
		{
			$overlapping = $this->CI->VertragsbestandteilFunktionModel->getOverlappingHauptfunktionen(
				$dvid, $vb->getVon(), $vb->getBis(), $vbidsInForm);

			foreach( $overlapping as $other )
			{
				$vb->addValidationError('Überschneidet sich mit einer bestehenden Hauptfunktion ('
					. $this->formatPeriod($other->von, $other->bis) . '). '
					. $errmsg);
			}
		}
	}

	protected function formatPeriod($von, $bis)
	{
		$fmt = function($d) {
			return $d ? date('d.m.Y', strtotime($d)) : 'offen';
		};
		return $fmt($von) . ' - ' . $fmt($bis);
	}

	protected function checkListForOverlaps($listofsametype,
		$errmsg = 'Überlappt mit einem Bestandteil gleichen Typs.')
	{
		for($i=0; $i < (count($listofsametype)-1); $i++)
		{
			for($j=($i+1); $j < count($listofsametype); $j++)
			{
				$this->checkForOverlap($listofsametype[$i], $listofsametype[$j], $errmsg);
			}
		}
	}
	
	protected function checkSievedList($sievedlist)
	{
		foreach ($sievedlist as $vbsofsametype)
		{
			if( count($vbsofsametype) > 1 )
			{
				$this->checkListForOverlaps($vbsofsametype);
			}
		}
	}
	
	protected function sieveVBsByType($vbs)
	{
		foreach($vbs as $vbmapper) 
		{
			if( $vbmapper->hasToBeDeleted() )
			{
				continue;
			}
			$vb = $vbmapper->getVbsinstance();
			$vb instanceof vertragsbestandteil\Vertragsbestandteil;
			if( $vb->getVertragsbestandteiltyp_kurzbz() === 'freitext' )
			{
				$vb instanceof \vertragsbestandteil\VertragsbestandteilFreitext;
				if( isset($this->vbfreitextbytype[$vb->getFreitexttypKurzbz()]) ) 
				{
					$this->vbfreitextbytype[$vb->getFreitexttypKurzbz()][] = $vb;
				}
			} 
			else 
			{
				if( isset($this->vbsbytype[$vb->getVertragsbestandteiltyp_kurzbz()]) )
				{
					$this->vbsbytype[$vb->getVertragsbestandteiltyp_kurzbz()][] = $vb;
				}
			}
		}
	}

	protected function sieveGBsByType($gbs)
	{
		$this->gbsbytype = array();
		foreach($gbs as $gbmapper) 
		{
			if( $gbmapper->hasToBeDeleted() )
			{
				continue;
			}
			$gb = $gbmapper->getGbsInstance();
			$gb instanceof vertragsbestandteil\Gehaltsbestandteil;
			if( !isset($this->gbsbytype[$gb->getGehaltstyp_kurzbz()]) )
			{
				$this->gbsbytype[$gb->getGehaltstyp_kurzbz()] = array();
			}
			$this->gbsbytype[$gb->getGehaltstyp_kurzbz()][] = $gb;
		}
	}
	
	protected function initVBsByType()
	{
		$result = $this->VertragsbestandteilTypModel->loadWhere(array('ueberlappend' => false));
		if( !hasData($result) )
		{
			return;
		}
		$vbs = getData($result);
		foreach ($vbs as $vb) 
		{
			$this->vbsbytype[$vb->vertragsbestandteiltyp_kurzbz] = array();
		}
	}
	
	protected function initVBFreitextByType()
	{
		$result = $this->VertragsbestandteilFreitexttypModel->loadWhere(array('ueberlappend' => false));
		if( !hasData($result) )
		{
			return;
		}
		$vbs = getData($result);
		foreach ($vbs as $vb) 
		{
			$this->vbfreitextbytype[$vb->freitexttyp_kurzbz] = array();
		}
	}
}
