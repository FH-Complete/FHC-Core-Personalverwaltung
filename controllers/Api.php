<?php

use phpDocumentor\Reflection\Types\Boolean;

defined('BASEPATH') || exit('No direct script access allowed');

require_once dirname(__DIR__) . '/libraries/gui/GUIHandler.php';


class Api extends Auth_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';
    // code igniter 
    protected $CI;

    public function __construct() {
        
        parent::__construct(
			array(
				'index' => Api::DEFAULT_PERMISSION,
				'getSprache' => Api::DEFAULT_PERMISSION,
				'getSachaufwandtyp' => Api::DEFAULT_PERMISSION,
				'getNations' => Api::DEFAULT_PERMISSION,
				'getAusbildung' => Api::DEFAULT_PERMISSION,
				'getStandorteIntern' => Api::DEFAULT_PERMISSION,
                'getOrte' => Api::DEFAULT_PERMISSION,
                'getGemeinden' => Api::DEFAULT_PERMISSION,
                'getOrtschaften' => Api::DEFAULT_PERMISSION,
                'personMaterialExpenses' => Api::DEFAULT_PERMISSION,
                'upsertPersonMaterialExpenses' => Api::DEFAULT_PERMISSION,
                'deletePersonMaterialExpenses' => Api::DEFAULT_PERMISSION,
                'getVertragsartAll' => Api::DEFAULT_PERMISSION,
                'getOrgHeads' => Api::DEFAULT_PERMISSION,
                'getOrgStructure' => Api::DEFAULT_PERMISSION,
                'getOrgPersonen' => Api::DEFAULT_PERMISSION,
                'getContractExpire' => Api::DEFAULT_PERMISSION,
                'getContractNew' => Api::DEFAULT_PERMISSION,
                'getBirthdays' => Api::DEFAULT_PERMISSION,
                'getCovidState' => Api::DEFAULT_PERMISSION,
                'getCurrentDV' => Api::DEFAULT_PERMISSION,
                'getCourseHours' => Api::DEFAULT_PERMISSION,
                'getReportData' => Api::DEFAULT_PERMISSION,
                'personHeaderData' => Api::DEFAULT_PERMISSION,
                'personAbteilung' => Api::DEFAULT_PERMISSION,
                'uploadPersonEmployeeFoto' => Api::DEFAULT_PERMISSION,
                'deletePersonEmployeeFoto' => Api::DEFAULT_PERMISSION,
                'personBankData' => Api::DEFAULT_PERMISSION,
                'upsertPersonBankData' => Api::DEFAULT_PERMISSION,
                'deletePersonBankData' => Api::DEFAULT_PERMISSION,
                'personBaseData' => Api::DEFAULT_PERMISSION,
                'updatePersonBaseData' => Api::DEFAULT_PERMISSION,
                'personEmployeeData' => Api::DEFAULT_PERMISSION,
                'updatePersonEmployeeData' => Api::DEFAULT_PERMISSION,
                'personAddressData' => Api::DEFAULT_PERMISSION,
                'upsertPersonAddressData' => Api::DEFAULT_PERMISSION,
                'deletePersonAddressData' => Api::DEFAULT_PERMISSION,
                'personContactData' => Api::DEFAULT_PERMISSION,
                'upsertPersonContactData' => Api::DEFAULT_PERMISSION,
                'deletePersonContactData' => Api::DEFAULT_PERMISSION,
                'getKontakttyp' => Api::DEFAULT_PERMISSION,
                'foto' => Api::DEFAULT_PERMISSION,
                'uidByPerson' => Api::DEFAULT_PERMISSION,
                'getAdressentyp' => Api::DEFAULT_PERMISSION,
                'dvByPerson' => Api::DEFAULT_PERMISSION,
                'vertragByDV' => Api::DEFAULT_PERMISSION,
				'getOrgetsForCompany' => Api::DEFAULT_PERMISSION,
				'getContractFunctions' => Api::DEFAULT_PERMISSION,
				'getCurrentFunctions' => Api::DEFAULT_PERMISSION,
				'saveVertrag' => Api::DEFAULT_PERMISSION,
				'getCurrentVBs' => Api::DEFAULT_PERMISSION,
				'getCurrentAndFutureVBs' => Api::DEFAULT_PERMISSION,
				'getAllVBs' => Api::DEFAULT_PERMISSION,
				'storeToTmpStore' => Api::DEFAULT_PERMISSION,
				'listTmpStoreForMA' => Api::DEFAULT_PERMISSION,
				'getTmpStoreById' => Api::DEFAULT_PERMISSION,
				'deleteFromTmpStore' => Api::DEFAULT_PERMISSION,
				'getUnternehmen' => Api::DEFAULT_PERMISSION,
				'getVertragsarten' => Api::DEFAULT_PERMISSION,
                'filterPerson' => Api::DEFAULT_PERMISSION,
                'createEmployee' => Api::DEFAULT_PERMISSION,
                'gbtByDV'  => Api::DEFAULT_PERMISSION,
                'deleteDV'  => Api::DEFAULT_PERMISSION,
                'gbtChartDataByDV' => Api::DEFAULT_PERMISSION,
				'endDV'  => Api::DEFAULT_PERMISSION,
				'saveKarenz'  => Api::DEFAULT_PERMISSION,
				'getKarenztypen' => Api::DEFAULT_PERMISSION,
				'getTeilzeittypen' => Api::DEFAULT_PERMISSION,
				'getFreitexttypen' => Api::DEFAULT_PERMISSION
			)
		);


		// Loads authentication library and starts authenticationfetc
		$this->load->library('AuthLib');
        $this->load->library('vertragsbestandteil/VertragsbestandteilLib',
			null, 'VertragsbestandteilLib');
        $this->load->library('vertragsbestandteil/GehaltsbestandteilLib',
			null, 'GehaltsbestandteilLib');


        $this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
        $this->load->model('person/Person_model','PersonModel');
        $this->load->model('person/Kontakt_model','KontaktModel');
        $this->load->model('person/Bankverbindung_model','BankverbindungModel');
        $this->load->model('codex/Nation_model', 'NationModel');
        $this->load->model('codex/Ausbildung_model', 'AusbildungModel');
        $this->load->model('person/kontakttyp_model', 'KontakttypModel');
        $this->load->model('person/Adressentyp_model', 'AdressentypModel');
        $this->load->model('system/sprache_model', 'SpracheModel');
        $this->load->model('ressource/ort_model', 'OrtModel');
        $this->load->model('ressource/Mitarbeiter_model', 'EmployeeModel');
        $this->load->model('person/Benutzer_model', 'BenutzerModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Organisationseinheit_model', 'OrganisationseinheitModel');
        $this->load->model('codex/bisverwendung_model', 'BisverwendungModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Statistik_model', 'StatistikModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Sachaufwandtyp_model', 'SachaufwandtypModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Sachaufwand_model', 'SachaufwandModel');
        $this->load->model('vertragsbestandteil/Dienstverhaeltnis_model', 'DVModel');
        $this->load->model('vertragsbestandteil/Gehaltsbestandteil_model', 'GBTModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/LVA_model', 'LVAModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Vertragsart_model', 'VertragsartModel');
		$this->load->model('ressource/Funktion_model', 'FunktionModel');
        $this->load->model('person/Benutzerfunktion_model', 'BenutzerfunktionModel');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/TmpStore_model', 'TmpStoreModel');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/Karenztyp_model', 'KarenztypModel');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/Teilzeittyp_model', 'TeilzeittypModel');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/Freitexttyp_model', 'FreitexttypModel');
        // get CI for transaction management
        $this->CI = &get_instance();
    }

    function index()
    {
        $data = $this->ApiModel->fetch_all();
        $this->outputJsonSuccess($data->result_array());       
    }

    function getSprache()
    {
        //$this->SpracheModel->addOrder("sprache");
		$spracheRes = $this->SpracheModel->load();

		if (isError($spracheRes))
		{
			$this->outputJsonError(getError($spracheRes));
			exit;
		}

        $this->outputJson($spracheRes);
    }


    function getSachaufwandtyp()
    {    
        $this->SachaufwandtypModel->addSelect("sachaufwandtyp_kurzbz, bezeichnung, sort, aktiv");
		$this->SachaufwandtypModel->addOrder("bezeichnung");
		$sachaufwandTypRes = $this->SachaufwandtypModel->load();

		if (isError($sachaufwandTypRes))
		{
			$this->outputJsonError(getError($sachaufwandTypRes));
			exit;
		}

        $this->outputJson($sachaufwandTypRes); 
    }

    function getNations()
    {
        $language = getUserLanguage();

		$nationTextFieldName = $language == 'German' ? 'langtext' : 'engltext';

        $this->NationModel->addSelect("nation_code, $nationTextFieldName AS nation_text, sperre");
		$this->NationModel->addOrder("nation_text");
		$nationRes = $this->NationModel->load();

		if (isError($nationRes))
		{
			$this->outputJsonError(getError($nationRes));
			exit;
		}

        $this->outputJson($nationRes); 
    }

    function getAusbildung()
    {
        $this->AusbildungModel->addOrder("ausbildungcode");
		$result = $this->AusbildungModel->load();

		if (isError($result))
		{
			$this->outputJsonError(getError($result));
			exit;
		}

        $this->outputJson($result); 
    }

    function getStandorteIntern()
    {
        $data = $this->ApiModel->getStandorteIntern();
        $this->outputJson($data); 
    }

    function getOrte()
    {
        $this->OrtModel->addOrder("ort_kurzbz");
        $data = $this->OrtModel->load();
        $this->outputJson($data);
    }

    function getGemeinden()
    {
        $plz = $this->input->get('plz', TRUE);

        if (!is_numeric($plz))
        {
            $this->outputJsonError("plz '$plz' is not numeric!'");            
        } else {
            $data = $this->ApiModel->getGemeinden($plz);
            $this->outputJson($data); 
        }
    }

    function getOrtschaften()
    {
        $plz = $this->input->get('plz', TRUE);

        if (!is_numeric($plz))
            $this->outputJsonError("plz '$plz' is not numeric!'");     

        $data = $this->ApiModel->getOrtschaften($plz);
        $this->outputJson($data); 
    }

    // ---------------------------------------
    // material expenses (=Sachaufwand)
    // ---------------------------------------

    function personMaterialExpenses()
    {
        $person_id = $this->input->get('person_id', TRUE);

        if (!is_numeric($person_id))
			show_error('person id is not numeric!');

        $data = $this->SachaufwandModel->getByPersonID($person_id);
        $this->_remapData('sachaufwand_id',$data);
        return $this->outputJson($data); 
    }

    function upsertPersonMaterialExpenses()
    {
        if($this->input->method() === 'post'){

            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['sachaufwand_id']) && !is_numeric($payload['sachaufwand_id']))
                show_error('sachaufwand_id is not numeric!');

            if (!isset($payload['sachaufwandtyp_kurzbz']) || (isset($payload['sachaufwandtyp_kurzbz']) && $payload['sachaufwandtyp_kurzbz'] == ''))
                show_error('sachaufwandtyp_kurzbz is empty!');   
            
            if (!isset($payload['mitarbeiter_uid']) || (isset($payload['mitarbeiter_uid']) && $payload['mitarbeiter_uid'] == ''))
                show_error('mitarbeiter_uid is empty!');    

            if ($payload['sachaufwand_id'] == 0)
            {
                $result = $this->SachaufwandModel->insertPersonSachaufwand($payload);
            } else {
                $result = $this->SachaufwandModel->updatePersonSachaufwand($payload);
            }
            
            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when updating material expenses');
        } else {
            $this->output->set_status_header('405');
        }
    }

    function deletePersonMaterialExpenses()
    {
        if($this->input->method() === 'post')
        {
            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['sachaufwand_id']) && !is_numeric($payload['sachaufwand_id']))
                show_error('sachaufwand_id is not numeric!');

            $result = $this->SachaufwandModel->deletePersonSachaufwand($payload['sachaufwand_id']);

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when deleting bank data');

        } else {
            $this->output->set_status_header('405');
        }        

    }

    // ----------------------------
    // Vertragart
    // ----------------------------
    function getVertragsartAll()
    {
        $this->VertragsartModel->addOrder("sort");
        $data = $this->VertragsartModel->load();
        $this->outputJson($data);
    }

    // -----------------------------
    // Organisation
    // -----------------------------

    function getOrgHeads()
    {
        $data = $this->OrganisationseinheitModel->getHeads();
        return $this->outputJson($data); 
    }

    function getOrgStructure()
    {
        $oe = $this->input->get('oe', TRUE);

        $data = $this->OrganisationseinheitModel->getOrgStructure($oe);
        return $this->outputJson($data); 
    }

    function getOrgPersonen()
    {
        $oe = $this->input->get('oe', TRUE);

        $data = $this->OrganisationseinheitModel->getPersonen($oe);
        return $this->outputJson($data); 
    }
    
    // -----------------------------------------
    // contracts about to expire (bisverwendung)
    // -----------------------------------------
    function getContractExpire()
    {
        $year = $this->input->get('year', TRUE);

        if (!is_numeric($year))
			show_error('year is not numeric!');

        $month = $this->input->get('month', TRUE);

        if (!is_numeric($month))
			show_error('month is not numeric!');

        $data = $this->ApiModel->getContractExpire($year, $month);
        $this->outputJson($data); 
    }

    function getContractNew()
    {        
        $year = $this->input->get('year', TRUE);

        if (!is_numeric($year))
			show_error('year is not numeric!');

        $month = $this->input->get('month', TRUE);

        if (!is_numeric($month))
			show_error('month is not numeric!');

        $data = $this->ApiModel->getContractNew($year, $month);
        $this->outputJson($data);
    }

    function getBirthdays()
    {
        $date = $this->input->get('date', TRUE);
        $data = $this->ApiModel->getBirthdays($date);
        $this->outputJson($data);
    }

    function getCovidState()
    {
        $person_id = $this->input->get('person_id', TRUE);

        if (!is_numeric($person_id))
        {
            $this->outputJsonError("person_id is not numeric!'");
            return;
        }

        $date = $this->input->get('d', TRUE);

        if ($date== null)
        {
            $date = time();
        }


        $data = $this->ApiModel->getCovidDate($person_id, $date);
        $this->outputJson($data);

    }

    /** 
     * Delete contract (DV). For testing only. Do not use in production!
     * */
    function deleteDV()
    {
        $dv_id = $this->input->get('dv_id', TRUE);
        $stichtag = null;

        if (!is_numeric($dv_id))
        {
            $this->outputJsonError('invalid parameter dv_id');
            exit;
        }

        $dv = $this->VertragsbestandteilLib->fetchDienstverhaeltnis(intval($dv_id));
        $ret = $this->VertragsbestandteilLib->deleteDienstverhaeltnis($dv);

        if ( $ret !== TRUE) {
            return $this->outputJsonError($ret);
        }
        
        return $this->outputJsonSuccess(TRUE);
        
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
                    $this->outputJsonError("Error when getting salary");
                }
            }
            
            $this->outputJson($data);
        } else {
            $this->outputJsonError("Error when getting current DV");
        }
        

    }

    function gbtByDV()
    {
        $dv_id = $this->input->get('dv_id', TRUE);

        if (!is_numeric($dv_id))
        {
            $this->outputJsonError("dv_id is not numeric!'");
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
            $this->outputJson($gbt_data->retval);
        } else {
            $this->outputJsonError("Error when getting salary");
        }
        
    }

    function gbtChartDataByDV()
    {
        $dv_id = $this->input->get('dv_id', TRUE);

        if (!is_numeric($dv_id))
        {
            $this->outputJsonError("dv_id is not numeric!'");
            return;
        }

        /*$gbtModel = $this->GBTModel;
        $gbt_data = $gbtModel->getGBTChartDataByDV($dv_id);*/

        $data = array();
        $gbtList = $this->GehaltsbestandteilLib->fetchGehaltsbestandteile($dv_id, null, false);

        $hasFutureDate = false;

        $now = new DateTime();
		if( version_compare(phpversion(), '7.1.0', 'lt') ) 
		{
			$now->setTime(0,0,0);
		}
		else 
		{
			$now->setTime(0,0,0,0);
		}

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
        
        $this->outputJson($data);       
        
    }
    

    function getCourseHours()
    {
        $uid = $this->input->get('uid', TRUE);
        $semester = $this->input->get('semester', TRUE);

        if ($uid == '')
        {
            $this->outputJsonError("uid is missing!'");
            return;
        }
        
        if ($semester == '')
        {
            $this->outputJsonError("semester is missing!'");
            return;
        }

        $data = $this->LVAModel->getCourseHours($uid, $semester);
        $this->outputJson($data);

    }

    // --------------------------------------
    // Report
    // --------------------------------------

    /**
     * execute statistik report
     * expects a payload like this:
     * {
     *  "report":"HomeofficetageMitarbeiterInnen",
     *  "filter":[{"name":"DatumVon","value":"2022-05-01"},{"name":"DatumBis","value":"2022-05-31"}]
     * }
     */
    function getReportData()
    {
        if($this->input->method() === 'post'){
            $payload = json_decode($this->input->raw_input_stream, TRUE);

            // TODO validate param

            $result = $this->StatistikModel->load($payload['report']);
            $this->outputJson($this->ApiModel->runReport($result->retval[0]->sql, $payload['filter']));
        }  else {
            $this->output->set_status_header('405');
        }
    }


    /**
     * get basic data of a person (name, foto, job, ...)
     */
    function personHeaderData()
    {
        $person_id = $this->input->get('person_id', TRUE);

        if (!is_numeric($person_id))
			show_error('person id is not numeric!');

        $data = $this->ApiModel->getPersonHeaderData($person_id);
        return $this->outputJson($data); 
    }

    /**
     * get disciplinary 'Abteilung' of a person
     */
    function personAbteilung()
    {
        $uid = $this->input->get('uid', TRUE);

        $data = $this->ApiModel->getPersonAbteilung($uid);

        // a single uid can be linked with departments in different orgs
        // -> loop all departments and get superviser
        foreach ($data->retval as $row) {
            $dataSupervisor = $this->ApiModel->getLeitungOrg($row->oe_kurzbz);

            // get supervisor if there is one (some departments do not have any)
            if (count($dataSupervisor->retval)>0)
            {
                $row->supervisor = $dataSupervisor->retval[0];
            }
            
        }
        
        return $this->outputJson($data);
    }

    function uploadPersonEmployeeFoto()
    {
        if($this->input->method() === 'post'){

            $payload = json_decode($this->input->raw_input_stream, TRUE);
            $image = $payload['imagedata'];
            $person_id = $payload['person_id'];

            if (!is_numeric($person_id))
			    show_error("person_id is not numeric!'");

            // scale image to maxsize (and convert to jpg)

            $meta = getimagesize($image);
            $src_width = $meta[0];
            $src_height = $meta[1];

            switch ($meta['mime']) {
                case 'image/jpeg':
                case 'image/jpg':
                  $imagecreated = imagecreatefromjpeg($image);
                  break;
                case 'image/png':
                  $imagecreated = imagecreatefrompng($image);
                  break;
                case 'image/gif':
                  $imagecreated = imagecreatefromgif($image);
                  break;
                default:
                  return null;
              }

              // max image size
              $maxwidth = 101;
              $maxheight = 130;
              $quality = 90;
              // ratio
              $src_aspect_ratio = $src_width / $src_height;
              $thu_aspect_ratio = $maxwidth / $maxheight;

              // calc image dimensions
              if ($src_width <= $maxwidth && $src_height <= $maxheight) 
              {
                  $thu_width  = $src_width;
                  $thu_height = $src_height;
              } elseif ($thu_aspect_ratio > $src_aspect_ratio) {
                  $thu_width  = (int) ($maxheight * $src_aspect_ratio);
                  $thu_height = $maxheight;
              } else {
                  $thu_width = $maxwidth;
                  $thu_height = (int) ($maxwidth / $src_aspect_ratio);
              }

              $imageScaled        =   ImageCreateTrueColor($thu_width,$thu_height);
              imagecopyresampled($imageScaled,$imagecreated,0,0,0,0,$thu_width,$thu_height,$src_width,$src_height); 


              //if (!empty($imagecreated) && $imageScaled = imagescale($imagecreated, $thu_width, $thu_height)) 
              if (!empty($imageScaled))
              {
                ob_start();
                
                imagejpeg($imageScaled, NULL, $quality);
                
                $image = ob_get_contents();
                ob_end_clean();
                imagedestroy($imagecreated);
                imagedestroy($imageScaled);
                
                if (!empty($image))
                {
                    $scaledBase64 = base64_encode($image);
                    $this->ApiModel->updateFoto($person_id, $scaledBase64);

                    $this->outputJsonSuccess(true);
                } else {
                    $this->outputJsonError(false);
                }

              }
                                        
        }  else {
            $this->output->set_status_header('405');
        }
    }

    function deletePersonEmployeeFoto()
    {
        if($this->input->method() === 'post'){

            $payload = json_decode($this->input->raw_input_stream, TRUE);
            $person_id = $payload['person_id'];

            if (!is_numeric($person_id))
                $this->outputJsonError("person_id is not numeric!'");

            $result = $this->ApiModel->deleteFoto($person_id);

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when deleting foto');

        }  else {
            $this->output->set_status_header('405');
        }
    }

    /**
     * Get banking data of a person. 
     * Query parameter: person_id
     */
    function personBankData()
    {
        $person_id = $this->input->get('person_id', TRUE);

        if (!is_numeric($person_id))
			show_error('person id is not numeric!');

        $data = $this->BankverbindungModel->loadWhere(array('person_id' => $person_id));
        $this->_remapData('bankverbindung_id',$data);
        
        return $this->outputJson($data); 
    }

    /**
     * Update/Insert banking data of a person
     */
    function upsertPersonBankData()
    {
        if($this->input->method() === 'post'){

            // TODO Permissions
            //if ($this->permissionlib->isBerechtigt(self::VERWALTEN_MITARBEITER, 'suid', null, $kostenstelle_id))
		    //{

            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['person_id']) && !is_numeric($payload['person_id']))
                show_error('person id is not numeric!');

            if (!isset($payload['iban']) || (isset($payload['iban']) && $payload['iban'] == ''))
                show_error('iban is empty!');            

            if ($payload['bankverbindung_id'] == 0)
            {
                $result = $this->ApiModel->insertPersonBankData($payload);
            } else {
                $result = $this->ApiModel->updatePersonBankData($payload);
            }
            
            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when updating bank data');
        } else {
            $this->output->set_status_header('405');
        }
    }

    function deletePersonBankData()
    {
        if($this->input->method() === 'post')
        {
            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['bankverbindung_id']) && !is_numeric($payload['bankverbindung_id']))
                show_error('bankverbindung_id is not numeric!');

            $result = $this->ApiModel->deletePersonBankData($payload['bankverbindung_id']);

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when deleting bank data');

        } else {
            $this->output->set_status_header('405');
        }        

    }

    /** helper to sanitize and validate a string (string length must be >0)
     * @return false if validation fails
    */
    private function validateJSONDataString(&$target, &$decoded, $attributeName)
    {
        if (isset($decoded[$attributeName]))
        {
            $target = filter_var($decoded[$attributeName], FILTER_SANITIZE_STRING);
            if ($target == '') return false;
            return true;
        }
        return false;
    }

    /**
     * validate and sanitize
     */
    private function validateEmployeeQuickPayload(&$payload) : bool
    {
        $attributeList = ['vorname', 'nachname', 'email', 'gebdatum', 'geschlecht', 'staatsbuergerschaft'];

        foreach ($attributeList as $key) {
            if (!$this->validateJSONDataString($payload[$key], $payload, $key))
                {
                    $this->outputJsonError($key.' is empty!');
                    return false;
                }
        }
        
        return true;
    }

    /**
     * validate payload for converting person to employee
     */
    private function validateEmployeeTakePayload(&$payload) : bool
    {
        if (!isset($payload['person_id']) || (isset($payload['person_id']) && !is_int($payload['person_id'])))
            {
                $this->outputJsonError('missing person_id');
                return false;
            }

        if (!$this->validateJSONDataString($payload['uid'], $payload, 'uid'))
            {
                $this->outputJsonError('uid is empty!');
                return false;
            }
        return true;
    }



    // get person data
    function personBaseData()
    {
        if($this->input->get()){
            $person_id = $this->input->get('person_id', TRUE);

            if (!is_numeric($person_id))
                show_error('person id is not numeric!');

            $data = $this->ApiModel->getPersonBaseData($person_id);
            $this->outputJson($data); 
        } else {
            $this->output->set_status_header('405');
        }
    }

    

    // update person data
    function updatePersonBaseData()
    {
        if($this->input->method() === 'post'){

            // TODO Permissions
            //if ($this->permissionlib->isBerechtigt(self::VERWALTEN_MITARBEITER, 'suid', null, $kostenstelle_id))
		    //{

            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['person_id']) && !is_numeric($payload['person_id']))
                show_error('person id is not numeric!');

            if (!isset($payload['nachname']) || (isset($payload['nachname']) && $payload['nachname'] == ''))
                show_error('nachname is empty!');            

            $result = $this->ApiModel->updatePersonBaseData($payload);
            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when updating person base data');
        } else {
            $this->output->set_status_header('405');
        }
    }

    // get employee data
    function personEmployeeData()
    {
        if($this->input->get()){
            $person_id = $this->input->get('person_id', TRUE);

            if (!is_numeric($person_id))
                show_error('person id is not numeric!');

            $data = $this->ApiModel->getPersonEmployeeData($person_id);
            $this->outputJson($data); 
        } else {
            $this->output->set_status_header('405');
        }
    }

    function updatePersonEmployeeData()
    {
        if($this->input->method() === 'post'){

            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['person_id']) && !is_numeric($payload['person_id']))
            {
                $this->outputJsonError('person id is not numeric!'); 
                exit();
            }
                       
            //$result = $this->ApiModel->updatePersonEmployeeData($payload);

            $payload['updatevon'] = getAuthUID();
            $payload['updateamum'] = 'NOW()';

            $alias = $payload['alias'];
            unset($payload['alias']);
            $aktiv = $payload['aktiv'];
            unset($payload['aktiv']);
            $person_id = $payload['person_id'];
            unset($payload['person_id']);

            if ($payload['standort_id'] == 0)
            {
                $payload['standort_id'] = null;
            }

            $result = $this->EmployeeModel->update($payload['mitarbeiter_uid'], $payload);

            if (isError($result))
            {
                return error($result->msg, EXIT_ERROR);
            }

            // update alias and aktiv flag
            // TODO check for alias duplicates!!! (are we allowed to change the alias here?)
            $result = $this->BenutzerModel->loadWhere(array('uid' => $payload['mitarbeiter_uid']));

            if (isError($result))
            {
                return error($result->msg, EXIT_ERROR);
            }

            $userData = $result->retval[0];
            $userData->alias = $alias;
            $userData->aktiv = $aktiv;
            $userData->updatevon = getAuthUID();
            $userData->updateamum = 'NOW()';
            $this->BenutzerModel->update(array($payload['mitarbeiter_uid']), $userData);

            $result = $this->ApiModel->getPersonEmployeeData($person_id);


            if (isSuccess($result))
            {                
			    $this->outputJsonSuccess($result->retval);
            } else
			    $this->outputJsonError('Error when updating employee data');
        } else {
            $this->output->set_status_header('405');
        }
    }

    function personAddressData()
    {
        if($this->input->get()){
            $person_id = $this->input->get('person_id', TRUE);

            if (!is_numeric($person_id))
                show_error('person id is not numeric!');

            $data = $this->ApiModel->getPersonAddressData($person_id);
            $this->_remapData('adresse_id',$data);
            $this->outputJson($data); 
        } else if ($this->input->post()) {
        
        } else {
            $this->output->set_status_header('405');
        }
    }

    function upsertPersonAddressData()
    {
        if($this->input->method() === 'post'){

            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['person_id']) && !is_numeric($payload['person_id']))
                show_error('person id is not numeric!');

            if (!isset($payload['plz']) || (isset($payload['plz']) && $payload['plz'] == ''))
                show_error('plz is empty!');  
                
            if ($payload['adresse_id'] == 0)
            {
                $result = $this->ApiModel->insertPersonAddressData($payload);
            } else {
                $result = $this->ApiModel->updatePersonAddressData($payload);
            }

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when updating address data');
        } else {
            $this->output->set_status_header('405');
        }
        
    }

    function deletePersonAddressData()
    {
        if($this->input->method() === 'post')
        {
            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['adresse_id']) && !is_numeric($payload['adresse_id']))
                show_error('adresse_id is not numeric!');

            $result = $this->ApiModel->deletePersonAddressData($payload['adresse_id']);

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when deleting address data');

        } else {
            $this->output->set_status_header('405');
        }        

    }

    // -------------------------------------------------
    // contact data
    // -------------------------------------------------

    function personContactData()
    {
        if($this->input->get())
        {
            $person_id = $this->input->get('person_id', TRUE);

            if (!is_numeric($person_id))
                show_error('person id is not numeric!');

		    $this->KontaktModel->addOrder("kontakt_id");
		    $data = $this->KontaktModel->loadWhere(array('person_id'=>$person_id, 'kontakttyp !=' => 'hidden'));
           
            if (isSuccess($data))
            {
                $this->_remapData('kontakt_id',$data);
			    $this->outputJsonSuccess($data->retval);
            } else
			    $this->outputJsonError('Error when fetching contact data');

        } else {
            $this->output->set_status_header('405');
        }   
    }

    function upsertPersonContactData()
    {
        if($this->input->method() === 'post'){

            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['person_id']) && !is_numeric($payload['person_id']))
                show_error('person id is not numeric!');

            if (!isset($payload['kontakt']) || (isset($payload['kontakt']) && $payload['kontakt'] == ''))
                show_error('kontakt is empty!');  
                
            if ($payload['kontakt_id'] == 0)
            {
                $result = $this->ApiModel->insertPersonContactData($payload);
            } else {
                $result = $this->ApiModel->updatePersonContactData($payload);
            }

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when updating contact data');
        } else {
            $this->output->set_status_header('405');
        }
        
    }

    function deletePersonContactData()
    {
        if($this->input->method() === 'post')
        {
            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['kontakt_id']) && !is_numeric($payload['kontakt_id']))
                show_error('kontakt_id is not numeric!');

            $result = $this->ApiModel->deletePersonContactData($payload['kontakt_id']);

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when deleting contact data');

        } else {
            $this->output->set_status_header('405');
        }        

    }

    //  ------------------------------------------
    // Kontakttyp
    // -------------------------------------------

    function getKontakttyp()
    {
		$result = $this->KontakttypModel->loadWhere('kontakttyp != \'hidden\'');

		if (isError($result))
		{
			$this->outputJsonError(getError($result));
			exit;
		}

        $this->outputJson($result); 
    }

    //  ------------------------------------------
    // Adressentyp
    // -------------------------------------------

    function getAdressentyp()
    {
		$this->AdressentypModel->addOrder("sort");
		$result = $this->AdressentypModel->load();

		if (isError($result))
		{
			$this->outputJsonError(getError($result));
			exit;
		}

        $this->outputJson($result); 
    }
    

    private function _remapData($attribute, &$data) {
        $mappedData = new stdClass();
        foreach ($data->retval as $record) {
            $key = $record->$attribute;
            $mappedData->$key = $record;
        }
        $data->retval = $mappedData;
    }

    /**
     * Search for employees. Used by employee chooser component.
     */
    function filter()
    {
        $searchString = $this->input->get('search', TRUE);
        $data = $this->ApiModel->filter($searchString);
        return $this->outputJson($data);
    }

    function filterPerson()
    {

        if($this->input->method() === 'post')
        {
            $payload = json_decode($this->input->raw_input_stream, TRUE);

            $surnameString = $payload['surname'];
            $birthdateString = $payload['birthdate'];
            $result = $this->ApiModel->filterPerson($surnameString, $birthdateString);

            if (isSuccess($result))
			    $this->outputJson($result);
		    else
			    $this->outputJsonError('Error when searching for person');

        } else {
            $this->output->set_status_header('405');
        }
        
    }


    function foto()
    {
        $person_id = $this->input->get('person_id', TRUE);

        if (!is_numeric($person_id))
			show_error('person id is not numeric!');

        $data = $this->ApiModel->getFoto($person_id);
        
        if ($data->retval[0]->foto == null)
            return $this->output->set_content_type('gif')->set_output(base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'));
            //$this->output->set_status_header('404');

        return $this->output->set_content_type('jpeg')->set_output(base64_decode($data->retval[0]->foto));            
    }

    /**
     * get uid by person_id
     */
    function uidByPerson()
    {
        $person_id = $this->input->get('person_id', TRUE);

        if (!is_numeric($person_id))
			show_error('person id is not numeric!');

        $data = $this->ApiModel->getUID($person_id);
        
        return $this->outputJson($data);                   
    }

    /**
     * get list of Dienstverhaeltnis by uid
     */
    function dvByPerson()
    {
        $person_uid = $this->input->get('uid', TRUE);

        if (!$person_uid)
        {
            $this->outputJsonError('invalid parameter person_uid');
            exit;
        }

        $data = $this->DVModel->getDVByPersonUID($person_uid);
        
        return $this->outputJson($data);   
    }

    function vertragByDV()
    {
        $dv_id = $this->input->get('dv_id', TRUE);

        if (!is_numeric($dv_id))
        {
            $this->outputJsonError('invalid parameter dv_id');
            exit;
        }

        $stichtag = $this->input->get('d', TRUE);

        if ($stichtag== null)
        {
            $stichtag = time();
        }

        $date = DateTime::createFromFormat( 'U', $stichtag );
        $datestring = $date->format("Y-m-d");

        $data = $this->VertragsbestandteilLib->fetchVertragsbestandteile(
			intval($dv_id), $datestring);

        
        return $this->outputJson($data);
    }

    // ----------------------------------------
    // Employee
    // ----------------------------------------

    function createEmployee()
    {
        if($this->input->method() === 'post')
        {
            /* example of submitted json:
            {"action":"quick",
             "payload":{"vorname":"Werner","vornamen":"","nachname":"Masik","gebdatum":"2023-05-12","email":"werner.masik@radiotechnikum.at","svnr":"","geschlecht":"w","staatsbuergerschaft":"A","anmerkung":""}}
             */
            $json = json_decode($this->input->raw_input_stream, TRUE);
            $action = $json['action'];
            $payload = $json['payload'];

            // wrap in transaction
            $this->CI->db->trans_begin();
            try
		    {

                // init
                $person_id = null;

                if ($action == 'quick')
                {

                    if (!$this->validateEmployeeQuickPayload($payload))
                    {
                        $this->CI->db->trans_rollback();
                        $this->outputJsonError('validation error');
                        return;
                    }

                    // create person
                    $personJson = array_merge([], $payload);
                    unset($personJson['email']);
                    $result = $this->ApiModel->insertPersonBaseData($personJson);
                    

                    if (isError($result))
                    {
                        $this->CI->db->trans_rollback();
                        $this->outputJsonError('error creating person base data');
                        return;
                    }
                    $person_id = $result->retval;

                    // create contact email
                    $contactJson = [
                        'person_id' => $person_id,
                        'kontakttyp' => 'email',
                        'kontakt' => $payload['email'],
                        'zustellung' => true];
                    $result = $this->ApiModel->insertPersonContactData($contactJson);

                    if (isError($result))
                    {
                        $this->CI->db->trans_rollback();
                        $this->outputJsonError('error creating email for person');
                        return;
                    }


                } elseif ($action == 'take') {

                    // validate
                    if (!$this->validateEmployeeTakePayload($payload))
                    {
                        $this->CI->db->trans_rollback();
                        $this->outputJsonError('validation error');
                        return;
                    }
                        
                    $person_id = $payload['person_id'];

                }
            

                // generate UID and Personalnummer
                $personalnummer = $this->ApiModel->generatePersonalnummer();
                $uid = sprintf('ma%05d',  $personalnummer - 10000);

                // create benutzer
                $result = $this->ApiModel->insertUser([ 'uid' => $uid, 'person_id' => $person_id ]);
                if (isError($result)) 
                {
                    $this->CI->db->trans_rollback();
                    $this->outputJsonError('error creating user for person');
                    return;
                }
                $uid = $result->retval;

                // create employee
                $employeeJson = [ 'mitarbeiter_uid' => $uid, 'personalnummer' => $personalnummer];
                $result = $this->ApiModel->insertEmployee($employeeJson);
                if (isError($result)) 
                {
                    $this->CI->db->trans_rollback();
                    $this->outputJsonError('error creating employee');
                    return;
                }

                // commit transaction
                $this->CI->db->trans_commit();

            }
            catch (Exception $ex)
            {
                log_message('debug', "Transaction rolled back. " . $ex->getMessage());
                $this->CI->db->trans_rollback();
                $this->outputJsonError('Creating Employee failed.');
                return;
            }	

            
            // return person_id and uid
            $this->outputJsonSuccess(['person_id' => $person_id, 'uid' => $uid]);

        } else {
            $this->output->set_status_header('405');
        }  
    }


    /**
     * create employment and contract details
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
        
            return $this->outputJson($data);   

        } else {
            $this->output->set_status_header('405'); 
        }
    }
   
	/*
	 * return list of child orgets for a given company orget_kurzbz
	 * as key value list to be used in select or autocomplete
	 */
	public function getOrgetsForCompany($companyOrgetkurzbz=null) 
	{
		if( empty($companyOrgetkurzbz) ) 
		{
			$this->outputJsonError('Missing Parameter <companyOrgetkurzbz>');
			return;
		}
		
		$sql = <<<EOSQL
			SELECT oe.oe_kurzbz AS value, '[' || oet.bezeichnung || '] ' || oe.bezeichnung AS label 
			FROM (
					WITH RECURSIVE oes(oe_kurzbz, oe_parent_kurzbz) as
					(
						SELECT oe_kurzbz, oe_parent_kurzbz FROM public.tbl_organisationseinheit
						WHERE oe_kurzbz=?
						UNION ALL
						SELECT o.oe_kurzbz, o.oe_parent_kurzbz FROM public.tbl_organisationseinheit o, oes
						WHERE o.oe_parent_kurzbz=oes.oe_kurzbz
					)
					SELECT oe_kurzbz
					FROM oes
					GROUP BY oe_kurzbz
			) c 
			JOIN public.tbl_organisationseinheit oe ON oe.oe_kurzbz = c.oe_kurzbz 
			JOIN public.tbl_organisationseinheittyp oet ON oe.organisationseinheittyp_kurzbz = oet.organisationseinheittyp_kurzbz 
			ORDER BY oet.bezeichnung ASC, oe.bezeichnung ASC
		
EOSQL;
			
		$childorgets = $this->OrganisationseinheitModel->execReadOnlyQuery($sql, array($companyOrgetkurzbz));
		if( hasData($childorgets) ) 
		{
			$this->outputJson($childorgets);
			return;
		}
		else
		{
			$this->outputJsonError('no orgets found for parent oe_kurzbz ' . $companyOrgetkurzbz );
			return;
		}
	}

	/*
	 * return list of contract relevant functions
	 * as key value list to be used in select or autocomplete
	 */	
	public function getContractFunctions() 
	{
		$sql = <<<EOSQL
			SELECT 
				funktion_kurzbz AS value, beschreibung AS label 
			FROM 
				public.tbl_funktion 
			WHERE 
				aktiv = true AND vertragsrelevant = true 
			ORDER BY beschreibung ASC
EOSQL;
		
		$fkts = $this->FunktionModel->execReadOnlyQuery($sql);
		if( hasData($fkts) ) 
		{
			$this->outputJson($fkts);
			return;
		}
		else
		{
			$this->outputJsonError('no contract relevant funktionen found');
			return;
		}		
	}
	
	/*
	 * return list of child orgets for a given company orget_kurzbz
	 * as key value list to be used in select or autocomplete
	 */
	public function getCurrentFunctions($uid, $companyOrgetkurzbz) 
	{
		if( empty($uid) )
		{
			$this->outputJsonError('Missing Parameter <uid>');
		}
		
		if( empty($companyOrgetkurzbz) )
		{
			$this->outputJsonError('Missing Parameter <companyOrgetkurzbz>');
		}
		
		$sql = <<<EOSQL
			SELECT bf.benutzerfunktion_id AS value, f.beschreibung || ', ' || oe.bezeichnung || ' [' || oet.bezeichnung || '], ' || COALESCE(to_char(bf.datum_von, 'dd.mm.YYYY'), 'n/a') || ' - ' || COALESCE(to_char(bf.datum_bis, 'dd.mm.YYYY'), 'n/a') AS label 
			FROM (
					WITH RECURSIVE oes(oe_kurzbz, oe_parent_kurzbz) as
					(
						SELECT oe_kurzbz, oe_parent_kurzbz FROM public.tbl_organisationseinheit
						WHERE oe_kurzbz = ? 
						UNION ALL
						SELECT o.oe_kurzbz, o.oe_parent_kurzbz FROM public.tbl_organisationseinheit o, oes
						WHERE o.oe_parent_kurzbz=oes.oe_kurzbz
					)
					SELECT oe_kurzbz
					FROM oes
					GROUP BY oe_kurzbz
			) c 
			JOIN public.tbl_organisationseinheit oe ON oe.oe_kurzbz = c.oe_kurzbz 
			JOIN public.tbl_organisationseinheittyp oet ON oe.organisationseinheittyp_kurzbz = oet.organisationseinheittyp_kurzbz 
			JOIN public.tbl_benutzerfunktion bf ON bf.oe_kurzbz = oe.oe_kurzbz
                        JOIN public.tbl_funktion f ON f.funktion_kurzbz = bf.funktion_kurzbz
                        WHERE bf.uid = ? 
                        ORDER BY f.beschreibung ASC
		
EOSQL;
			
		$benutzerfunktionen = $this->BenutzerfunktionModel->execReadOnlyQuery($sql, array($companyOrgetkurzbz, $uid));
		if( hasData($benutzerfunktionen) ) 
		{
			$this->outputJson($benutzerfunktionen);
			return;
		}
		else
		{
			$this->outputJsonError('no benutzerfunktionen found for uid ' . $uid . ' and oe_kurzbz ' . $companyOrgetkurzbz );
			return;
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
		
		$this->outputJson(
			array(
				'data' => json_decode($ret), 
				'meta' => array(
					'mitarbeiter_uid' => $mitarbeiter_uid, 
					'payload' => json_decode($payload)
				)
			)
		);
		return;
	}
	
	public function getCurrentVBs($dvid) 
	{
		$today = new DateTime('now', new DateTimeZone('Europe/Vienna'));
		$vbs = $this->VertragsbestandteilLib->fetchVertragsbestandteile(
			$dvid, 
			$today->format('Y-m-d'), 
			$this->VertragsbestandteilLib::DO_NOT_INCLUDE_FUTURE);
		
		$this->outputJson(
			array(
				'data' => $vbs,
				'meta' => array()
			)
		);
		return;
	}
	
	public function getCurrentAndFutureVBs($dvid, $typ=null) 
	{
		$today = new DateTime('now', new DateTimeZone('Europe/Vienna'));
		$vbs = $this->VertragsbestandteilLib->fetchVertragsbestandteile(
			$dvid, 
			$today->format('Y-m-d'), 
			$this->VertragsbestandteilLib::INCLUDE_FUTURE);
		
		$this->outputJson(
			array(
				'data' => $vbs,
				'meta' => array()
			)
		);
		return;
	}

	public function getAllVBs($dvid) 
	{
		$vbs = $this->VertragsbestandteilLib->fetchVertragsbestandteile($dvid);
		
		$this->outputJson(
			array(
				'data' => $vbs,
				'meta' => array()
			)
		);
		return;
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
		
		$this->outputJson(
			array(
				'data' => $payload, 
				'meta' => array(
					'tmpstoreid' => $tmpstoreid,
					'ret' => $ret
				)
			)
		);
		return;
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
		
		$this->outputJson(
			array(
				'data' => $data, 
				'meta' => array()
			)
		);
		return;
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
		
		$this->outputJson(
			array(
				'data' => $data, 
				'meta' => array()
			)
		);
		return;
	}

	public function deleteFromTmpStore($tmpstoreid) 
	{
		$result = $this->TmpStoreModel->delete($tmpstoreid);
		
		$this->outputJson(
			array(
				'data' => $result, 
				'meta' => array()
			)
		);
		return;
	}
	
	public function getUnternehmen()
	{
		$this->OrganisationseinheitModel->resetQuery();
		$this->OrganisationseinheitModel->addSelect('oe_kurzbz AS value, bezeichnung AS label, \'false\'::boolean AS disabled');
		$this->OrganisationseinheitModel->addOrder('bezeichnung', 'ASC');
		$unternehmen = $this->OrganisationseinheitModel->loadWhere('oe_parent_kurzbz IS NULL');
		if( hasData($unternehmen) ) 
		{
			$this->outputJson($unternehmen);
			return;
		}
		else
		{
			$this->outputJsonError('no companies (orgets with parent NULL) found');
			return;
		}
	}
	
	public function getVertragsarten()
	{		
		$this->VertragsartModel->resetQuery();
		$this->VertragsartModel->addSelect('vertragsart_kurzbz AS value, bezeichnung AS label, \'false\'::boolean AS disabled');
		$this->VertragsartModel->addOrder('sort', 'ASC');
		$unternehmen = $this->VertragsartModel->loadWhere('dienstverhaeltnis = true');
		if( hasData($unternehmen) ) 
		{
			$this->outputJson($unternehmen);
			return;
		}
		else
		{
			$this->outputJsonError('no contract types found');
			return;
		}
	}
	
    function endDV()
    {
        $payload = json_decode($this->input->raw_input_stream);

        if (!is_numeric($payload->dienstverhaeltnisid))
        {
            $this->outputJsonError('invalid parameter dienstverhaeltnisid');
            return;
        }

		if( !$payload->gueltigkeit->data->gueltig_bis ) 
		{
			$this->outputJsonError('Bitte ein gültiges Endedatum angeben.');
            return;
		}
		
        $dv = $this->VertragsbestandteilLib->fetchDienstverhaeltnis(intval($payload->dienstverhaeltnisid));
        $ret = $this->VertragsbestandteilLib->endDienstverhaeltnis($dv, $payload->gueltigkeit->data->gueltig_bis);

        if ( $ret !== TRUE) {
            return $this->outputJsonError($ret);
        }
        
        return $this->outputJsonSuccess('Dienstverhaeltnis beendet');
        
    }
	
	
    function saveKarenz()
    {
        $payload = json_decode($this->input->raw_input_stream);

        if (!is_numeric($payload->id))
        {
            $this->outputJsonError('invalid parameter vertragsbestandteil_id');
            return;
        }
		// TODO implement
/*		
        $dv = $this->VertragsbestandteilLib->fetchDienstverhaeltnis(intval($payload->dienstverhaeltnisid));
        $ret = $this->VertragsbestandteilLib->endDienstverhaeltnis($dv, $payload->gueltigkeit->data->gueltig_bis);
*/
        if ( $ret !== TRUE) {
            return $this->outputJsonError($ret);
        }
        
        return $this->outputJsonSuccess('Karenz gespeichert');
    }
	
	public function getKarenztypen()
	{		
		$this->KarenztypModel->resetQuery();
		$this->KarenztypModel->addSelect('karenztyp_kurzbz AS value, bezeichnung AS label, \'false\'::boolean AS disabled');
		$this->KarenztypModel->addOrder('bezeichnung', 'ASC');
		$rows = $this->KarenztypModel->load();
		if( hasData($rows) ) 
		{
			$this->outputJson($rows);
			return;
		}
		else
		{
			$this->outputJsonError('no karenz types found');
			return;
		}
	}
	
	public function getTeilzeittypen()
	{		
		$this->TeilzeittypModel->resetQuery();
		$this->TeilzeittypModel->addSelect('teilzeittyp_kurzbz AS value, bezeichnung AS label, \'false\'::boolean AS disabled');
		$this->TeilzeittypModel->addOrder('bezeichnung', 'ASC');
		$rows = $this->TeilzeittypModel->load();
		if( hasData($rows) ) 
		{
			$this->outputJson($rows);
			return;
		}
		else
		{
			$this->outputJsonError('no teilzeit types found');
			return;
		}
	}
	
	public function getFreitexttypen()
	{		
		$this->FreitexttypModel->resetQuery();
		$this->FreitexttypModel->addSelect('freitexttyp_kurzbz AS value, bezeichnung AS label, \'false\'::boolean AS disabled');
		$this->FreitexttypModel->addOrder('bezeichnung', 'ASC');
		$rows = $this->FreitexttypModel->load();
		if( hasData($rows) ) 
		{
			$this->outputJson($rows);
			return;
		}
		else
		{
			$this->outputJsonError('no freitext types found');
			return;
		}
	}
}
