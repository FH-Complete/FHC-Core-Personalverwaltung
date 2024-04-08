<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class FristenJob extends JOB_Controller
{
	
	private $_ci; // Code igniter instance
	
	public function __construct()
	{
		parent::__construct();

		$this->_ci =& get_instance();

		$this->load->library('extensions/FHC-Core-Personalverwaltung/fristen/FristenLib');
	}

	private function getDVList(int $months, bool $qryBis = true)
	{
		
		$this->_db->execReadOnlyQuery($qry, $params);
	}


	public function addFristen($date = null)
	{
		$this->logInfo('Start Fristen Job');
		echo "start Fristen Job\n";

		try {

			if ($date == null)
			{
				$d = new DateTime();
			} else {
				$d = DateTime::createFromFormat( 'Y-m-d', $date );
			}

			$this->logInfo("Fristen Job Datum=",$d->format("Y-m-d"));
			$result = $this->_ci->fristenlib->updateFristen($d);

			if ($result !== false)
			{
				$this->logInfo('End Fristen Job');
			} else {
				$this->logInfo('Fristen job failed');
			}

		} catch(\Exception $e) {
			$this->logInfo('Fristen job failed');
			echo $e->getMessage();
		}
		
	}
	
	
}