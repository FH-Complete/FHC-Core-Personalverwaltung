<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class GehaltshistorieJob extends JOB_Controller
{
	
	private $_ci; // Code igniter instance
	
	public function __construct()
	{
		parent::__construct();

		$this->_ci =& get_instance();

		$this->load->library('extensions/FHC-Core-Personalverwaltung/abrechnung/GehaltsLib');
	}


	public function addGehaltshistorie($date = null, $user = null, $oe_kurzbz = null)
	{
		$this->logInfo('Start Gehaltshistorie Job');
		
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
				$abrechnung = $this->_ci->gehaltslib->existsGehaltshistorie($bestandteil, $date);
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
		
		$this->logInfo('End Gehaltshistorie Job', array('Number of Abrechnungen added ' => $count));
	}
	
	
}