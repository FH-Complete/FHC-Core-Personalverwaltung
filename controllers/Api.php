<?php
defined('BASEPATH') || exit('No direct script access allowed');

class Api extends Auth_Controller
{
    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';

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
			)
		);


		// Loads authentication library and starts authentication
		$this->load->library('AuthLib');

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
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Dienstverhaeltnis_model', 'DVModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Vertrag_model', 'VertragModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/LVA_model', 'LVAModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Gehaltsbestandteil_model', 'GBTModel');
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
            $this->outputJsonSuccess($data); 
        }
    }

    function getOrtschaften()
    {
        $plz = $this->input->get('plz', TRUE);

        if (!is_numeric($plz))
            $this->outputJsonError("plz '$plz' is not numeric!'");     

        $data = $this->ApiModel->getOrtschaften($plz);
        $this->outputJsonSuccess($data); 
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

        $data = $this->ApiModel->getCovidDate($person_id);
        $this->outputJson($data);

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

        $data = $this->DVModel->getCurrentDVByPersonUID($uid);

        if (isSuccess($data))
        {
            foreach ($data->retval as $dv) {
                $gbt_data = $this->GBTModel->getCurrentGBTByDV($dv->dienstverhaeltnis_id);

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

        $dataSupervisor = $this->ApiModel->getLeitungOrg($data->retval[0]->oe_kurzbz);

        if ($dataSupervisor->retval[0]->uid == $uid)
        {
            $dataSupervisor = $this->ApiModel->getLeitungOrg($data->retval[0]->oe_kurzbz);
        }

        $data->retval[0]->supervisor = $dataSupervisor->retval[0];
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

        $data = $this->VertragModel->getVertragByDV($dv_id);
        
        return $this->outputJson($data);   
    }

}
