<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class WeiterbildungJob extends JOB_Controller
{
	
	private $_ci; // Code igniter instance
	const INSERT_VON = 'weiterbildungjob';
	
	public function __construct()
	{
		parent::__construct();
		$this->_ci =& get_instance();
		$this->load->library('extensions/FHC-Core-Personalverwaltung/weiterbildung/WeiterbildungMessageLib');
	}

	public function sendMessages($days = 30)
	{
		$this->logInfo("Start Weiterbildung Job für den Zeitraum $days Tage");
		$count = $this->_ci->weiterbildungmessagelib->sendMessages(self::INSERT_VON, $days);
		$this->logInfo('End Weiterbildung Job', array('Number of Messages sent ' => $count));
	}

	public function sendAllMessages()
	{
		$this->logInfo('Start Weiterbildung Job für alle Benachrichtigungszeiträume');
		$count = $this->_ci->weiterbildungmessagelib->sendAllMessages(self::INSERT_VON);
		$this->logInfo('End Weiterbildung Job', array('Number of Messages sent ' => $count));
	}
	
	
	
}