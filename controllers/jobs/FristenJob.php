<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class FristenJob extends JOB_Controller
{
	
	private $_ci; // Code igniter instance
	
	public function __construct()
	{
		parent::__construct();

		$this->_ci =& get_instance();

		$this->load->library('extensions/FHC-Core-Personalverwaltung/abrechnung/GehaltsLib');
	}

	private function getDVList(int $months, bool $qryBis = true)
	{
		
		$this->_db->execReadOnlyQuery($qry, $params);
	}


	public function addFristen($date = null, $user = null, $oe_kurzbz = null)
	{
		$this->logInfo('Start Fristen Job');
		
		$result = $this->_ci->gehaltslib->getBestandteile($date, $user, $oe_kurzbz);
		
		if (isError($result))
		{
			$this->logError(getError($result));
		}

		$count = 0;

		if (!hasData($result))
		{
			$this->logInfo("Keine Gehaltsbestandteile gefunden!");
		}
		else
		{
			$bestandteile = getData($result);
			foreach ($bestandteile as $bestandteil)
			{
				$abrechnung = $this->_ci->gehaltslib->existsFristen($bestandteil, $date);
				if (!hasData($abrechnung))
				{
					$result = $this->_ci->gehaltslib->addHistorie($bestandteil, $date);
					
					if (isError($result))
					{
						$this->logError(getError($result));
						break;
					}
					else
						$count++;
				}
			}
		}
		
		$this->logInfo('End Fristen Job', array('Number of Abrechnungen added ' => $count));
	}
	
	
}