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
		
		$formdata->getDv()->validate();
		$dv = $formdata->getDv()->getDienstverhaeltnis();
		foreach( $vbs as $vbmapper )
		{
			$vb = $vbmapper->getVbsinstance();
			$this->checkIfContains($dv, $vb);
			$vbmapper->validate();
			if( $vbmapper->getHasGBS() )
			{
				$gbs = $vbmapper->getGbs();
				$this->sieveGBsByType($gbs);
				$this->checkSievedList($this->gbsbytype);
				foreach($gbs as $gbmapper) 
				{
					$gb = $gbmapper->getGbsInstance();
					$this->checkIfContains($vb, $gb);
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

	protected function checkForOverlap($a, $b)
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
			$a->addValidationError('Überlappt mit einem Bestandteil gleichen Typs.');
			$b->addValidationError('Überlappt mit einem Bestandteil gleichen Typs.');
		}
	}
	
	protected function checkListForOverlaps($listofsametype)
	{
		for($i=0; $i < (count($listofsametype)-1); $i++)
		{
			for($j=($i+1); $j < count($listofsametype); $j++)
			{
				$this->checkForOverlap($listofsametype[$i], $listofsametype[$j]);
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
