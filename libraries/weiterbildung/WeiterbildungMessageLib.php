<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');


class WeiterbildungMessageLib
{
	private $_ci; // Code igniter instance
	
	public function __construct()
	{
		$this->_ci =& get_instance();
		$this->_ci->load->config('extensions/FHC-Core-Personalverwaltung/pvdefaults');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Weiterbildung_model', 'WeiterbildungModel');
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/WeiterbildungMsgLog_model', 'WeiterbildungMsgLogModel');
		$this->_ci->load->model('ressource/Mitarbeiter_model', 'MitarbeiterModel');
    }

	/**
	 * send notification message of one person for training certificates that expire within 
	 * a date specified in param intervalConfig
	 */
	public function sendMessagesMA($uid, $insertvon, $intervalConfig)
	{		
		$dt = new DateTime();
		$dt->modify($intervalConfig['interval']);

		$result = $this->_ci->WeiterbildungModel->getExpiresUntilDateByUID($uid, $dt, $intervalConfig['template']);
		
		if (isError($result))
		{
			log_message('error',getError($result));
		}

		$count = 0;

		if (!hasData($result))
		{
			log_message('info',"Keine Weiterbildungszertifikate für '$uid' gefunden die ablaufen!");
		}
		else
		{
			$weiterbildungListe = getData($result);
			$count = $this->sendmailLoop($weiterbildungListe, $insertvon, $dt, $intervalConfig['template']);
		}
		
		return $count;
	}

	/**
	 * send notification messages for all intervals as defined in the config (parameter PV_WEITERBILDUNG_REMINDER).
	 */
	public function sendAllMessagesMA($uid, $insertvon)
	{
		$intervalList = $this->_ci->config->item('PV_WEITERBILDUNG_REMINDER');

		if (!is_array($intervalList))
		{
			log_message('error', 'PV_WEITERBILDUNG_REMINDER not defined or does not contain a valid array');
			return -1;
		}

		// asort($intervalList);
		$count = 0;

		foreach ($intervalList as $intervalConfig) {
			$count += $this->sendMessagesMA($uid, $insertvon, $intervalConfig);
		}

		return $count;
	}

	public function sendAllMessages($insertvon)
	{
		$intervalList = $this->_ci->config->item('PV_WEITERBILDUNG_REMINDER');

		if (!is_array($intervalList))
		{
			log_message('error', 'PV_WEITERBILDUNG_REMINDER not defined or does not contain a valid array');
			return -1;
		}

		asort($intervalList);
		$count = 0;

		foreach ($intervalList as $intervalConfig) {
			$count += $this->sendMessages($insertvon, $intervalConfig);
		}

		return $count;
	}


	/**
	 * send notification message for training certificates that expire within $days
	 */
	public function sendMessages($insertvon, $intervalConfig)
	{		
		$dt = new DateTime();
		$dt->modify($intervalConfig['interval']);

		$result = $this->_ci->WeiterbildungModel->getExpiresUntilDate($dt);
		
		if (isError($result))
		{
			log_message('error',getError($result));
		}

		$count = 0;

		if (!hasData($result))
		{
			log_message('info',"Keine Weiterbildungszertifikate gefunden die ablaufen!");
		}
		else
		{
			$weiterbildungListe = getData($result);
			$count = $this->sendmailLoop($weiterbildungListe, $insertvon, $dt, $intervalConfig['template']);
		}
		
		return $count;
	}

	private function sendmailLoop($weiterbildungListe, $insertvon, $deadline, $template)
	{
		$count = 0;
		$dt = new DateTimeImmutable();

		foreach ($weiterbildungListe as $wb)
		{
			log_message('info',"versende Nachricht [weiterbildung_id=".$wb->weiterbildung_id.", template='$template', deadline=".$deadline->format("Y-m-d")."]");

			$result = $this->_ci->WeiterbildungMsgLogModel->insert(
				array('weiterbildung_id' => $wb->weiterbildung_id, 'ablaufdatum' => $wb->ablaufdatum, 'template' => $template, 'insertamum' => $dt->format('Y-m-d H:i'), 'insertvon' => $insertvon)
			);

			if (isError($result))
				log_message('error',getError($result));
			else
			{
				$this->generateMail($wb, $template);
				$count++;
			}
				
		}
		return $count;
	}

	private function generateMail($weiterbildung, $template)
	{
		// var_dump($this->_ci->config);
		if($this->_ci->config->item('PV_SEND_WEITERBILDUNG_EXPIRE_MAILS') !== true)
		{
			log_message('error','Sending mails is disabled. Set PV_SEND_WEITERBILDUNG_EXPIRE_MAILS = true to enable it.');
			return;
		}

		$this->_ci->load->helper('hlp_sancho_helper');
		$email = $weiterbildung->mitarbeiter_uid . "@" . DOMAIN;


		/* function languageQuery($language)
		{
			return "select index from public.tbl_sprache where sprache = '" . $language . "'";
		}
 */
		
		$href = $this->_ci->config->item('cis_base_url') . $this->_ci->config->item('cis_index_page') . '/Cis/Training';
		$subject = "Weiterbildung '$weiterbildung->bezeichnung' läuft aus";
		$mail_res = sendSanchoMail(
			$template,
			['weiterbildung' => $weiterbildung->bezeichnung,
			 'expire_date' => date_format(date_create($weiterbildung->ablaufdatum), 'd.m.Y'),
			 'href' => $href],
			 $email,
			 $subject);
		if (!$mail_res) {
			log_message('error',"could not send weiterbildung mail");
		} else {
			log_message('info',"weiterbildung expire mail sent");
		}
	}

}