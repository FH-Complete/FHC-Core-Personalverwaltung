<?php

use phpDocumentor\Reflection\Types\Boolean;

defined('BASEPATH') || exit('No direct script access allowed');


require_once dirname(dirname(dirname(dirname(__DIR__)))) . '/libraries/gui/GUIHandler.php';
require_once DOC_ROOT . '/include/' . EXT_FKT_PATH . '/generateuid.inc.php';

class DVAPI extends FHCAPI_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:rw';
    const READ_ONLY_PERMISSION = 'basis/mitarbeiter:r';
    const HANDYVERWALTUNG_PERMISSION = 'extension/pv21_handyverwaltung:rw';
	const DV_CREATE_EDIT_PERMISSION = 'extension/pv21_dv:rw';
	const DV_CORRECTION_PERMISSION = 'extension/pv21_dv_korr:rw';

    public function __construct() {
        parent::__construct(array(
            'getCurrentDV' => DVAPI::DEFAULT_PERMISSION,
            'dvByPerson' => [DVAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
            'dvByID'=> DVAPI::DEFAULT_PERMISSION,
            'dvInfoByPerson' => [DVAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
            'createDV'  => self::DV_CREATE_EDIT_PERMISSION,
            'deleteDV'  => self::DV_CREATE_EDIT_PERMISSION,
            'endDV'  => self::DV_CREATE_EDIT_PERMISSION,
            'deactivateDV'  => self::DV_CREATE_EDIT_PERMISSION,
            'vertragByDV' => [DVAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
            'saveVertrag' => [self::DV_CREATE_EDIT_PERMISSION, self::DV_CORRECTION_PERMISSION],
            // 
            'getCurrentVBs' => [DVAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
		    'getCurrentAndFutureVBs' => DVAPI::DEFAULT_PERMISSION,
		    'getAllVBs' => DVAPI::DEFAULT_PERMISSION,
            //
		    'storeToTmpStore' => DVAPI::DEFAULT_PERMISSION,
		    'listTmpStoreForMA' => DVAPI::DEFAULT_PERMISSION,
		    'getTmpStoreById' => DVAPI::DEFAULT_PERMISSION,
		    'deleteFromTmpStore' => DVAPI::DEFAULT_PERMISSION,
            //
            'getVB' => DVAPI::DEFAULT_PERMISSION,
            'getGB' => DVAPI::DEFAULT_PERMISSION,
            //
            'gbtByDV'  => DVAPI::DEFAULT_PERMISSION,
            'gbtChartDataByDV' => DVAPI::DEFAULT_PERMISSION,
            //
            'getEmployeesWithoutContract' => DVAPI::DEFAULT_PERMISSION,
            //
            'getDvEndeGruende' => DVAPI::READ_ONLY_PERMISSION
                
            )
        );
        $this->load->library('AuthLib');
        $this->load->library('vertragsbestandteil/VertragsbestandteilLib',
            null, 'VertragsbestandteilLib');
        $this->load->library('vertragsbestandteil/GehaltsbestandteilLib',
			null, 'GehaltsbestandteilLib');
        $this->load->library('extensions/FHC-Core-Personalverwaltung/abrechnung/GehaltsLib',
			null, 'GehaltsabrechnungLib');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
        $this->load->model('vertragsbestandteil/Dienstverhaeltnis_model', 'DVModel');
        $this->load->model('vertragsbestandteil/Gehaltsbestandteil_model', 'GBTModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/TmpStore_model', 'TmpStoreModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Vertragsbestandteiltyp_model', 'VertragsbestandteiltypModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/DvEndeGrund_model', 'DvEndeGrundModel');
    }
    

    /**
     * get a list of currently active contracts (DV)
     */
    function getCurrentDV()
    {
        $uid = $this->input->get('uid', TRUE);

        if ($uid == '')
        {
            $this->outputJsonError("uid is missing!'");
            return;
        }

        $date = $this->input->get('d', TRUE);

        if ($date== null)
        {
            $date = time();
        }

        $data = $this->DVModel->getCurrentDVByPersonUID($uid, $date);

        if (isSuccess($data))
        {
            /**
             * @var Gehaltsbestandteil_model
             */
            $gbtModel = $this->GBTModel;
            foreach ($data->retval as $dv) {
                $gbt_data = $gbtModel->getCurrentGBTByDV($dv->dienstverhaeltnis_id, time());

                if (isSuccess($gbt_data))
                {
                    $dv->gehaltsbestandteile = $gbt_data->retval;
                } else {
                    $this->terminateWithError("Error when getting salary");
                }
            }

            $this->terminateWithSuccess(getData($data));
        } else {
            $this->terminateWithError("Error when getting current DV");
        }
    }

    /**
     * get list of Dienstverhaeltnis by uid
     */
    function dvByPerson()
    {
        $person_uid = $this->input->get('uid', TRUE);

        if (!$person_uid)
        {
            $this->terminateWithError('invalid parameter person_uid');
            exit;
        }

        $data = $this->DVModel->getDVByPersonUID($person_uid);

        return $this->terminateWithSuccess(getData($data));
    }

    function dvByID($dvid)
    {

        if (!is_numeric($dvid))
        {
            $this->terminateWithError('invalid parameter dvid');
            exit;
        }

        $result = $this->DVModel->getDVByID($dvid);

        if (isSuccess($result))
			$this->terminateWithSuccess($result->retval[0]);
		else
			$this->terminateWithError('Error fetching DV');

    }

    // DV short info
    function dvInfoByPerson()
    {
        $person_uid = $this->input->get('uid', TRUE);

        if (!$person_uid)
        {
            $this->terminateWithError('invalid parameter person_uid');
            exit;
        }

        //$date = DateTime::createFromFormat( 'U', $stichtag);
        $date = new DateTimeImmutable( 'now', new DateTimeZone('Europe/Vienna'));
		//$date->setTimezone(new DateTimeZone('Europe/Vienna'));
        $datestring = $date->format("Y-m-d");

        $dvData = $this->DVModel->getDVByPersonUID($person_uid, null, $datestring);

        if (isError($dvData)) {
            $this->terminateWithError('error fetching dv: '.$dvData->retval);
            return;
        }
        
        
        $dvList = array();
        if (is_array($dvData->retval) && count($dvData->retval) > 0) {
            $dvList = $dvData->retval;
        } else {
            $this->terminateWithError('no DV found');
            return;
        }

        $retval = array();
        foreach ($dvList as $value) {
            $dbData = $this->VertragsbestandteilLib->fetchVertragsbestandteile(
                intval($value->dienstverhaeltnis_id), $datestring);
    
            // remove secret data
            $dbDataFiltered = array_values(array_filter($dbData, function($v) {
                return $v->getVertragsbestandteiltyp_kurzbz() == 'stunden' ||
                    $v->getVertragsbestandteiltyp_kurzbz() == 'karenz';
            }));

            $retval[] = array('dv' => $value, 'vb' => $dbDataFiltered);            
        }          

        return $this->terminateWithSuccess(array("dvList" => $retval ));
    }

    /**
     * Delete contract (DV). For testing only. Do not use in production!
     * */
    function deleteDV()
    {
        $payload = json_decode($this->input->raw_input_stream, TRUE);
		$dv_id = isset($payload['dv_id']) ? $payload['dv_id'] : false;

        if (!is_numeric($dv_id))
        {
            $this->terminateWithError('invalid parameter dv_id');
            exit;
        }

        $dv = $this->VertragsbestandteilLib->fetchDienstverhaeltnis(intval($dv_id));
        $ret = $this->VertragsbestandteilLib->deleteDienstverhaeltnis($dv);

        if ( $ret !== TRUE) {
            return $this->terminateWithError($ret);
        }

        return $this->terminateWithSuccess(TRUE);
    }

    function endDV()
    {
        $payload = json_decode($this->input->raw_input_stream);

        if (!is_numeric($payload->dienstverhaeltnisid))
        {
            $this->terminateWithError('invalid parameter dienstverhaeltnisid');
            return;
        }

        if (empty($payload->dvendegrund_kurzbz))
        {
            $this->terminateWithError('Bitte einen Beendigungsgrund auswählen.');
            return;
        }

        if ($payload->dvendegrund_kurzbz === 'sonstige' && empty($payload->dvendegrund_anmerkung))
        {
            $this->terminateWithError('Bitte beim Beendigungsgrund "Sonstige" eine Anmerkung eingeben.');
            return;
        }

	if( !$payload->gueltigkeit->data->gueltig_bis )
	{
	    $this->terminateWithError('Bitte ein gültiges Endedatum angeben.');
            return;
	}

        $dv = $this->VertragsbestandteilLib->fetchDienstverhaeltnis(intval($payload->dienstverhaeltnisid));
        $ret = $this->VertragsbestandteilLib->endDienstverhaeltnis($dv, $payload->gueltigkeit->data->gueltig_bis,
	    $payload->dvendegrund_kurzbz, $payload->dvendegrund_anmerkung);

        if ( $ret !== TRUE) {
            return $this->terminateWithError($ret);
        }

        return $this->terminateWithSuccess('Dienstverhaeltnis beendet');

    }

    /**
     * same as endDV but also sets aktiv flag of benutzer to false
     */
    function deactivateDV()
    {
        $payload = json_decode($this->input->raw_input_stream);

        if (!is_numeric($payload->dienstverhaeltnis_id))
        {
            $this->terminateWithError('invalid parameter dienstverhaeltnis_id');
            return;
        }

		if( !$payload->gueltig_bis )
		{
			$this->terminateWithError('Bitte ein gültiges Endedatum angeben.');
            return;
		}

        $dv = $this->VertragsbestandteilLib->fetchDienstverhaeltnis(intval($payload->dienstverhaeltnis_id));
        $ret = $this->VertragsbestandteilLib->deactivateDienstverhaeltnis($dv, $payload->gueltig_bis, true);

        if (!$ret) {
            return $this->terminateWithError($ret);
        }

        return $this->terminateWithSuccess('Dienstverhaeltnis beendet');
    }

    function vertragByDV()
    {
        $dv_id = $this->input->get('dv_id', TRUE);

        if (!is_numeric($dv_id))
        {
            $this->terminateWithError('invalid parameter dv_id');
            exit;
        }

        $stichtag = $this->input->get('d', TRUE);

        if ($stichtag== null)
        {
            $stichtag = time();
        }

        $date = DateTime::createFromFormat( 'U', $stichtag);
		$date->setTimezone(new DateTimeZone('Europe/Vienna'));
        $datestring = $date->format("Y-m-d");

        $data = $this->VertragsbestandteilLib->fetchVertragsbestandteile(
			intval($dv_id), $datestring);


        return $this->terminateWithSuccess($data);
    }

    /**
     * create employment and contract details
     * not used?
     */
    function createDV()
    {
        if($this->input->method() === 'post'){

            $dvJson = json_decode($this->input->raw_input_stream, TRUE);
            /* payload:
                {
                    "mitarbeiterUID": "aburaiaa",
                    "von": "2023-01-01",
                    "bis": null,
                    "befristet": false,
                    "vertragsartKurzbz": "Werkvertrag",
                    "unternehmenID": "gst",
                    "stunden": null,
                    "gehalt": null,
                    "kuendigungsfrist": null,
                    "urlaubsanspruch": null
                }
            */

                // init DV
                unset($dvJson['updateamum']);
                unset($dvJson['updatevon']);
                // set empty values to null
                if ($dvJson['hauptberufcode'] == '')
                {
                    $dvJson['hauptberufcode'] = null;
                }
                if ($dvJson['probezeit'] == '')
                {
                    $dvJson['probezeit'] = null;
                }
                if ($dvJson['bis'] == '')
                {
                    $dvJson['bis'] = null;
                }

                $this->apiModel->insertDV($dvJson);

                if (isError($result))
                {
                    return error($result->msg, EXIT_ERROR);
                }

                $data = $this->DVModel->getDVByPersonUID($person_uid);

            return $this->terminateWithSuccess($data);

        } else {
            $this->output->set_status_header('405');
        }
    }


	public function saveVertrag($mitarbeiter_uid, $dryrun=null)
	{
		$payload = $this->input->raw_input_stream;
		$editor = getAuthUID();

		$onlyvalidate = (strtolower($dryrun) === 'dryrun') ? true : false;

		$guihandler = GUIHandler::getInstance();
		$guihandler->setEmployeeUID($mitarbeiter_uid)
			->setEditorUID($editor);
		$ret = $guihandler->handle($payload, $onlyvalidate);

        $this->addMeta('mitarbeiter_uid', $mitarbeiter_uid);
        $this->addMeta('payload', json_decode($payload));
		$this->terminateWithSuccess(json_decode($ret));
			
	}

    public function getCurrentVBs($dvid)
	{
		$today = new DateTime('now', new DateTimeZone('Europe/Vienna'));
		$vbs = $this->VertragsbestandteilLib->fetchVertragsbestandteile(
			$dvid,
			$today->format('Y-m-d'),
			$this->VertragsbestandteilLib::DO_NOT_INCLUDE_FUTURE);

		$this->terminateWithSuccess($vbs);
	}

	public function getCurrentAndFutureVBs($dvid, $typ=null)
	{
		$today = new DateTime('now', new DateTimeZone('Europe/Vienna'));
		$vbs = $this->VertragsbestandteilLib->fetchVertragsbestandteile(
			$dvid,
			$today->format('Y-m-d'),
			$this->VertragsbestandteilLib::INCLUDE_FUTURE,
			$this->VertragsbestandteilLib::NOT_WITH_VALORISATION_HISTORY
		);

		$this->terminateWithSuccess($vbs);
	}

	public function getAllVBs($dvid)
	{
		$vbs = $this->VertragsbestandteilLib->fetchVertragsbestandteile($dvid);

		$this->terminateWithSuccess($vbs);
	}

	public function storeToTmpStore($tmpstoreid=null)
	{
		$payload = json_decode($this->input->raw_input_stream);
		$editor = getAuthUID();

		$ret = null;
		if( intval($tmpstoreid) > 0 )
		{
			$ret = $this->TmpStoreModel->update($tmpstoreid,
				array(
					'typ' => $payload->typ,
					'mitarbeiter_uid' => $payload->mitarbeiter_uid,
					'formdata' => json_encode($payload->formdata),
					'updatevon' => $editor,
					'updateamum' => strftime('%Y-%m-%d %H:%M')
				)
			);
		}
		else
		{
			$ret = $this->TmpStoreModel->insert(
				array(
					'typ' => $payload->typ,
					'mitarbeiter_uid' => $payload->mitarbeiter_uid,
					'formdata' => json_encode($payload->formdata),
					'insertvon' => $editor,
					'insertamum' => strftime('%Y-%m-%d %H:%M')
				)
			);
			$tmpstoreid = getData($ret);
			$payload->tmpStoreId = $tmpstoreid;
		}

        $this->addMeta('tmpstoreid', $tmpstoreid);
        $this->addMeta('ret', $ret);
        $this->terminateWithSuccess($payload);
			
	}

	public function listTmpStoreForMA($mitarbeiteruid)
	{
		$storedentries = $this->TmpStoreModel->listTmpStoreForUid($mitarbeiteruid);
		$data = array(
			'aenderung' => array(),
			'neuanlage' => array(),
			'korrektur' => array()
		);

		if( hasData($storedentries) )
		{
			foreach (getData($storedentries) as $storedentry)
			{
				$data[$storedentry->typ][$storedentry->tmp_store_id] = $storedentry;
			}
		}

		$this->terminateWithSuccess($data);
	}

	public function getTmpStoreById($tmpstoreid)
	{
		$tmpstore = $this->TmpStoreModel->load($tmpstoreid);

		$data = array();
		if( hasData($tmpstore) )
		{
			$data = getData($tmpstore)[0];
			$data->formdata = json_decode($data->formdata);
		}

		$this->terminateWithSuccess($data);
	}

	public function deleteFromTmpStore($tmpstoreid)
	{
		$result = $this->TmpStoreModel->delete($tmpstoreid);

		$this->terminateWithSuccess($result);
	}

    function getVB($vertragsbestandteil_id)
    {

        if (!is_numeric($vertragsbestandteil_id))
        {
            $this->terminateWithError('invalid parameter vbid');
            exit;
        }

        $data = $this->VertragsbestandteilLib->fetchVertragsbestandteil(
			intval($vertragsbestandteil_id));


        return $this->terminateWithSuccess($data);
    }

    function getGB($gehaltsbestandteil_id)
    {

        if (!is_numeric($gehaltsbestandteil_id))
        {
            $this->terminateWithError('invalid parameter vbid');
            exit;
        }

        $data = $this->GehaltsbestandteilLib->fetchGehaltsbestandteil(
			intval($gehaltsbestandteil_id));


        return $this->terminateWithSuccess($data);
    }




    function gbtByDV()
    {
        $dv_id = $this->input->get('dv_id', TRUE);

        if (!is_numeric($dv_id))
        {
            $this->terminateWithError("dv_id is not numeric!'");
            return;
        }

        $date = $this->input->get('d', TRUE);

        if ($date== null)
        {
            $date = time();
        }

        // TODO add date filter
        $gbtModel = $this->GBTModel;
        $gbt_data = $gbtModel->getCurrentGBTByDV($dv_id, $date);

        if (isSuccess($gbt_data))
        {
            $this->terminateWithSuccess($gbt_data->retval);
        } else {
            $this->terminateWithError("Error when getting salary");
        }

    }


    function gbtChartDataByDV()
    {
        $dv_id = $this->input->get('dv_id', TRUE);

        if (!is_numeric($dv_id))
        {
            $this->terminateWithError("dv_id is not numeric!'");
            return;
        }

        /*$gbtModel = $this->GBTModel;
        $gbt_data = $gbtModel->getGBTChartDataByDV($dv_id);*/

        $now = new DateTime();
	if( version_compare(phpversion(), '7.1.0', 'lt') )
	{
	    $now->setTime(0,0,0);
	}
	else
	{
	    $now->setTime(0,0,0,0);
	}

        // fetch Gesamtgehalt
        $data = $this->gbtChartDataGesamt($now, $dv_id);

        // fetch Gesamtgehalt valorisiert
        $dataValorisiert = $this->gbtChartDataGesamtValorisiert($now, $dv_id);


        // loop dates and fetch
        $keys = array_keys($data);
        $from_date = $keys[0];
        $to_date = end($keys);

        $abgerechnet_data = $this->gbtChartDataAbgerechnet($from_date, $to_date, $dv_id);

        if(isError($abgerechnet_data))
	{
	    $this->terminateWithError("error getting chart data");
            return;
	}

        $this->terminateWithSuccess(array('valorisiert' => $dataValorisiert, 'gesamt' => $data, 'abgerechnet' => $abgerechnet_data->retval));

    }


    private function gbtChartDataAbgerechnet($from_date, $to_date, $dv_id)
    {
        $gbtList = $this->GehaltsabrechnungLib->fetchAbgerechnet($dv_id, $from_date, $to_date);

        return $gbtList;
    }

    /**
     * fetch data for Gesamtgehalt (loan without valorisation)
     */
    private function gbtChartDataGesamt($now, $dv_id)
    {
        $gbtList = $this->GehaltsbestandteilLib->fetchGehaltsbestandteile($dv_id, null, false);

        $hasFutureDate = false;
        $data = array();

        foreach ($gbtList as $value) {

            if (!isset($data[$value->getVon()])) {
                $data[$value->getVon()] = 0;

                if ($now < $value->getBisDateTime()) {
                    $hasFutureDate = true;
                }
            }
            if ($value->getBis() != null) {

                $bisDatum = $value->getBisDateTime()->add(new DateInterval("P1D"));

                if (!isset($data[$bisDatum->format("Y-m-d")])) {
                    $data[$bisDatum->format("Y-m-d")] = 0;

                    if ($now < $value->getBisDateTime()) {
                        $hasFutureDate = true;
                    }
                }
            }
        }

        if (!$hasFutureDate) {
            $dv = $this->VertragsbestandteilLib->fetchDienstverhaeltnis($dv_id);

            if ($dv->getBis() != null) {
                $dvBis = new DateTime($dv->getBis());
                if (!isset($data[$dvBis->format("Y-m-d")])) {
                    $data[$dvBis->format("Y-m-d")] = 0;
                }
            } else {
                if (!isset($data[$now->format("Y-m-d")])) {
                    $data[$now->format("Y-m-d")] = 0;
                }
            }
        }

        foreach ($data as $datum => $summe) {
            $datumDateTime = new DateTimeImmutable($datum);

            foreach ($gbtList as $gbt) {

                if ($gbt->getVonDateTime() <= $datumDateTime
                    && ($gbt->getBisDateTime() == null || $gbt->getBisDateTime()>=$datumDateTime)) {
                        $data[$datum] += $gbt->getGrundbetrag();
                }
            }
        }

        ksort($data);

        return $data;
    }

    /**
     * fetch data for Gesamtgehalt valorisiert (loan valorized)
     */
    private function gbtChartDataGesamtValorisiert($now, $dv_id)
    {
        $gbtList = $this->GehaltsbestandteilLib->fetchGehaltsbestandteileValorisiertForChart($dv_id, null, false);

        $hasFutureDate = false;
        $data = array();

        foreach ($gbtList as $value) {

            if (!isset($data[$value->getVon()])) {
                $data[$value->getVon()] = 0;

                if ($now < $value->getBisDateTime()) {
                    $hasFutureDate = true;
                }
            }
            if ($value->getBis() != null) {

                $bisDatum = $value->getBisDateTime()->add(new DateInterval("P1D"));

                if (!isset($data[$bisDatum->format("Y-m-d")])) {
                    $data[$bisDatum->format("Y-m-d")] = 0;

                    if ($now < $value->getBisDateTime()) {
                        $hasFutureDate = true;
                    }
                }
            }
        }

        if (!$hasFutureDate) {
            $dv = $this->VertragsbestandteilLib->fetchDienstverhaeltnis($dv_id);

            if ($dv->getBis() != null) {
                $dvBis = new DateTime($dv->getBis());
                if (!isset($data[$dvBis->format("Y-m-d")])) {
                    $data[$dvBis->format("Y-m-d")] = 0;
                }
            } else {
                if (!isset($data[$now->format("Y-m-d")])) {
                    $data[$now->format("Y-m-d")] = 0;
                }
            }
        }

        foreach ($data as $datum => $summe) {
            $datumDateTime = new DateTimeImmutable($datum);

            foreach ($gbtList as $gbt) {

                if ($gbt->getVonDateTime() <= $datumDateTime
                    && ($gbt->getBisDateTime() == null || $gbt->getBisDateTime()>=$datumDateTime)) {

                        $data[$datum] += $gbt->getGrundbetrag();
                        /* if ($gbt->getBetrag_valorisiert() != null) {
                            $data[$datum] += $gbt->getBetrag_valorisiert();
                        } else {
                            $data[$datum] += $gbt->getGrundbetrag();
                        } */
                        
                }
            }
        }

        ksort($data);

        return $data;
    }


    /**
     *  get employees without a contract during the last 3 semesters
     */
    public function getEmployeesWithoutContract()
    {
        $data = $this->ApiModel->getEmployeesWithoutContract();
        $this->terminateWithSuccess(getData($data));
    }

    function getDvEndeGruende()
    {
        $this->DvEndeGrundModel->resetQuery();
        $this->DvEndeGrundModel->addSelect('dvendegrund_kurzbz AS value, bezeichnung AS label, NOT(aktiv) AS disabled');
        $this->DvEndeGrundModel->addOrder('sort, bezeichnung', 'ASC');
        $dvendegruende = $this->DvEndeGrundModel->load();
        if( hasData($dvendegruende) )
        {
            $this->terminateWithSuccess(getData($dvendegruende));
            return;
        }
        else
        {
            $this->terminateWithError('no contract types found');
            return;
        }
    }

}
