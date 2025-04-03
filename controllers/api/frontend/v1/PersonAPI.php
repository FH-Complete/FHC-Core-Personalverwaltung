<?php

use phpDocumentor\Reflection\Types\Boolean;

defined('BASEPATH') || exit('No direct script access allowed');

require_once DOC_ROOT . '/include/' . EXT_FKT_PATH . '/generateuid.inc.php';

class PersonAPI extends Auth_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:rw';
    const HANDYVERWALTUNG_PERMISSION = 'extension/pv21_handyverwaltung:rw';

    // code igniter
    protected $CI;

    public function __construct() {
        parent::__construct(array(
            'headerData' => [PersonAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
            'personAbteilung' => [PersonAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
            'uidByPerson' => [PersonAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
            'filterPerson' => PersonAPI::DEFAULT_PERMISSION,
            'createEmployee' => PersonAPI::DEFAULT_PERMISSION,
            // base data (Stammdaten)
            'personBaseData' => [PersonAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
            'updatePersonBaseData' => PersonAPI::DEFAULT_PERMISSION,
            // foto
            'foto' => PersonAPI::DEFAULT_PERMISSION,
            'uploadPersonEmployeeFoto' => PersonAPI::DEFAULT_PERMISSION,
            'deletePersonEmployeeFoto' => PersonAPI::DEFAULT_PERMISSION,
            // employee data (MA-Daten)
            'personEmployeeKurzbzExists' => PersonAPI::DEFAULT_PERMISSION,
            'personEmployeeData' => PersonAPI::DEFAULT_PERMISSION,
            'updatePersonEmployeeData' => PersonAPI::DEFAULT_PERMISSION,
            // address
            'personAddressData' => PersonAPI::DEFAULT_PERMISSION,
            'upsertPersonAddressData' => PersonAPI::DEFAULT_PERMISSION,
            'deletePersonAddressData' => PersonAPI::DEFAULT_PERMISSION,
            // contact
            'personContactData' => [PersonAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
            'upsertPersonContactData' => [PersonAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
            'deletePersonContactData' => [PersonAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION],
            // material expenses (Sachaufwand)
            'personMaterialExpenses' => PersonAPI::DEFAULT_PERMISSION,
            'upsertPersonMaterialExpenses' => PersonAPI::DEFAULT_PERMISSION,
            'deletePersonMaterialExpenses' => PersonAPI::DEFAULT_PERMISSION,
            // job function
            'upsertPersonJobFunction'  => PersonAPI::DEFAULT_PERMISSION,
            'deletePersonJobFunction'  => PersonAPI::DEFAULT_PERMISSION,
            // bank data
            'personBankData' => PersonAPI::DEFAULT_PERMISSION,
            'upsertPersonBankData' => PersonAPI::DEFAULT_PERMISSION,
            'deletePersonBankData' => PersonAPI::DEFAULT_PERMISSION,
            // hourly rate (Stundensatzy)
            'getStundensaetze' => PersonAPI::DEFAULT_PERMISSION,
            'updateStundensatz' => PersonAPI::DEFAULT_PERMISSION,
		    'deleteStundensatz' => PersonAPI::DEFAULT_PERMISSION,
            // time recording
            'offTimeByPerson' => PersonAPI::DEFAULT_PERMISSION,
            'timeRecordingByPerson' => PersonAPI::DEFAULT_PERMISSION,

            )
        );
        $this->load->library('AuthLib');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
        $this->load->model('person/Adresse_model','AdresseModel');
        $this->load->model('person/Kontakt_model','KontaktModel');
        $this->load->model('person/Person_model','PersonModel');
        $this->load->model('ressource/Mitarbeiter_model', 'EmployeeModel');
        $this->load->model('person/Benutzer_model', 'BenutzerModel');
        $this->load->model('person/Bankverbindung_model','BankverbindungModel');
        $this->load->model('person/Benutzerfunktion_model', 'BenutzerfunktionModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Sachaufwand_model', 'SachaufwandModel');
        $this->load->model('ressource/Stundensatz_model', 'StundensatzModel');
        $this->load->model('ressource/Zeitaufzeichnung_model', 'ZeitaufzeichnungModel');

         // get CI for transaction management
         $this->CI = &get_instance();
    }

    /**
     * get basic data of a person (name, foto, job, ...)
     */
    function headerData()
    {
        $person_id = $this->input->get('person_id', TRUE);

        if (!is_numeric($person_id))
            $this->outputJsonError('person id is not numeric!');

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

    function filterPerson()
    {

        if($this->input->method() === 'post')
        {
            $payload = json_decode($this->input->raw_input_stream, TRUE);

			$nachnameString = null;
			$vornameString = null;
			$filterUnruly = null;
			$birthdateString = null;
			if(array_key_exists( 'surname', $payload)) {
				$nachnameString = $payload['surname'];
			} else if (array_key_exists( 'nachname', $payload) ) {
				$nachnameString = $payload['nachname'];
			}

			if(array_key_exists('vorname', $payload)) {
				$vornameString = $payload['vorname'];
			}

			if(array_key_exists('unruly', $payload)){
				$filterUnruly = $payload['unruly'];
			}

			if(array_key_exists('birthdate', $payload)) {
				$birthdateString = $payload['birthdate'];
			} else if (array_key_exists('gebdatum', $payload)) {
				// TODO: enable if gebdatum filter for unrulys is desired
//				$birthdateString = $payload['gebdatum'];
			}
            $result = $this->ApiModel->filterPerson($nachnameString, $vornameString, $birthdateString, $filterUnruly);

            if (isSuccess($result))
			    $this->outputJson($result);
		    else
			    $this->outputJsonError('Error when searching for person');

        } else {
            $this->output->set_status_header('405');
        }

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
                //$uid = sprintf('ma%05d',  $personalnummer - 10000);
				$uid = generateMitarbeiterUID($payload['vorname'], $payload['nachname'],
					false, true, $personalnummer);

                if ($uid === false)
                {
                    $this->CI->db->trans_rollback();
                    $this->outputJsonError('error generating UID for person');
                    return;
                }

                // create benutzer
                $result = $this->ApiModel->insertUser([ 'uid' => $uid, 'person_id' => $person_id ]);
                if (isError($result))
                {
                    $this->CI->db->trans_rollback();
                    $this->outputJsonError('error creating user for person');
                    return;
                }
                $uid = $result->retval;

				if (!defined('GENERATE_ALIAS_MITARBEITERIN') || GENERATE_ALIAS_MITARBEITERIN )
				{
					$aliasres = $this->BenutzerModel->generateAlias($uid);
					if( hasData($aliasres) )
					{
						$alias = getData($aliasres);
						if($alias !== '')
						{
							$aliasupdres = $this->BenutzerModel->update(
								array('uid' => $uid),
								array('alias' => $alias)
							);
							if (isError($aliasupdres))
							{
								$this->CI->db->trans_rollback();
								$this->outputJsonError('error setting alias for benutzer');
								return;
							}
						}
					}
				}


                $employeeJson = [ 'mitarbeiter_uid' => $uid, 'personalnummer' => $personalnummer];

                // generate abbreviated designation
                $kurzbzRes = $this->EmployeeModel->generateKurzbzHelper($payload['vorname'], $payload['nachname']);
		$defaultstandort = $this->config->item('PV_DEFAULT_STANDORT_ID');
		if($defaultstandort !== null)
		{
		    $employeeJson['standort_id'] = $defaultstandort;
		}
                if (!isError($kurzbzRes))
                {
                    $genKurzbz = getData($kurzbzRes);
                    if (!isEmptyString($genKurzbz))
                    {
                        $employeeJson['kurzbz'] = $genKurzbz;
                    }
                } else {
                    $this->CI->db->trans_rollback();
                    $this->outputJsonError('error creating employee: duplicate kurzbz');
                    return;
                }

                // create employee
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

    // ---------------------------------------
    // foto
    // ---------------------------------------

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



    // ---------------------------------------
    // base data (Stammdaten)
    // ---------------------------------------


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



    function personEmployeeKurzbzExists()
    {
        if($this->input->get()){
            $uid = $this->input->get('uid', '');
            $kurzbz = $this->input->get('kurzbz', '');

            if ($uid == '')
                show_error('parameter uid missing');

            $kurzbzexists = $this->EmployeeModel->kurzbzExists($kurzbz, $uid);

            if (isError($kurzbzexists))
            {
                $this->outputJsonError($kurzbzexists->msg, EXIT_ERROR);
            }

            if (hasData($kurzbzexists) && getData($kurzbzexists)[0])
                $this->outputJsonSuccess(true);
            else
                $this->outputJsonSuccess(false);
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
            $userData->alias = ($alias !== '') ? $alias : NULL;
			if($userData->aktiv != $aktiv)
			{
				$userData->aktiv = $aktiv;
				$userData->updateaktivvon = getAuthUID();
				$userData->updateaktivam = 'NOW()';
			}
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

    // ---------------------------------------
    // address
    // ---------------------------------------

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
			{
                $this->outputJsonError('sachaufwand_id is not numeric!');
				exit();
			}

            if (!isset($payload['sachaufwandtyp_kurzbz']) || (isset($payload['sachaufwandtyp_kurzbz']) && $payload['sachaufwandtyp_kurzbz'] == ''))
			{
                $this->outputJsonError('sachaufwandtyp_kurzbz is empty!');
				exit();
			}

            if (!isset($payload['mitarbeiter_uid']) || (isset($payload['mitarbeiter_uid']) && $payload['mitarbeiter_uid'] == ''))
			{
                $this->outputJsonError('mitarbeiter_uid is empty!');
				exit();
			}

            if (isEmptyString($payload['betrag']))
				$payload['betrag']=null; 

			if( $payload['betrag'] !== null && !is_numeric($payload['betrag']) )
			{
				$this->outputJsonError('betrag is not numeric!');
				exit();
			}

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


    // ---------------------------------------
    // job function (=Benutzerfunktion)
    // ---------------------------------------

    function upsertPersonJobFunction()
    {
        if($this->input->method() === 'post'){

            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['benutzerfunktion_id']) && !is_numeric($payload['benutzerfunktion_id']))
                show_error('benutzerfunktion_id is not numeric!');

            if (!isset($payload['oe_kurzbz']) || (isset($payload['oe_kurzbz']) && $payload['oe_kurzbz'] == ''))
                show_error('oe_kurzbz is empty!');

            if (!isset($payload['funktion_kurzbz']) || (isset($payload['funktion_kurzbz']) && $payload['funktion_kurzbz'] == ''))
                show_error('funktion_kurzbz is empty!');

            if (!isset($payload['uid']) || (isset($payload['uid']) && $payload['uid'] == ''))
                show_error('uid is empty!');

            if ($payload['benutzerfunktion_id'] == 0)
            {
                $result = $this->BenutzerfunktionModel->insertBenutzerfunktion($payload);
            } else {
                $result = $this->BenutzerfunktionModel->updateBenutzerfunktion($payload);
            }

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when updating job function');
        } else {
            $this->output->set_status_header('405');
        }
    }

    function deletePersonJobFunction()
    {
        if($this->input->method() === 'post')
        {
            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['benutzerfunktion_id']) && !is_numeric($payload['benutzerfunktion_id']))
                show_error('benutzerfunktion_id is not numeric!');

            $result = $this->BenutzerfunktionModel->deleteBenutzerfunktion($payload['benutzerfunktion_id']);

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when deleting bank data');

        } else {
            $this->output->set_status_header('405');
        }

    }

    // ---------------------------------------------------
    // bank data
    // ---------------------------------------------------

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

    // ----------------------------------------------
    // Stundensätze
    // ----------------------------------------------

    public function getStundensaetze($uid = null)
	{
		$qry = "SELECT hr.tbl_stundensatz.*, hr.tbl_stundensatztyp.bezeichnung
				FROM hr.tbl_stundensatz
				JOIN hr.tbl_stundensatztyp USING (stundensatztyp)
				WHERE uid = ?
				ORDER BY gueltig_bis DESC NULLS LAST, gueltig_von DESC NULLS LAST";

		$data = $this->StundensatzModel->execReadOnlyQuery($qry, array($uid));
		$this->_remapData('stundensatz_id',$data);
		return $this->outputJson($data);
	}

    public function updateStundensatz()
	{

		$data = json_decode($this->input->raw_input_stream, true);

		if ($data['stundensatz_id'] === 0)
		{
			if (isEmptyString($data['gueltig_bis']))
				unset($data['gueltig_bis']);
			unset($data['stundensatz_id']);
			$data['insertamum'] = 'NOW()';
			$data['insertvon'] = getAuthUID();

			$result = $this->StundensatzModel->insert($data);
		}
		else
		{
			if (isEmptyString($data['gueltig_bis']))
				$data['gueltig_bis'] = null;
			unset($data['bezeichnung']);
			unset($data['aktiv']);


			$stundensatz_id = $data['stundensatz_id'];
			unset($data['stundensatz_id']);


			$data['updateamum'] = 'NOW()';
			$data['updatevon'] = getAuthUID();
			$result = $this->StundensatzModel->update(
				$stundensatz_id,
				$data
			);
		}

		if (isError($result))
			return $this->outputJsonError('Fehler beim Speichern des Stundensatzes');

		$stundensatz = $this->StundensatzModel->load($result->retval);

		if (hasData($stundensatz))
			$this->outputJsonSuccess($stundensatz->retval);
	}

	public function deleteStundensatz()
	{
		$data = json_decode($this->input->raw_input_stream, true);

		$stundensatz = $this->StundensatzModel->load($data['stundensatz_id']);
		if (hasData($stundensatz))
		{
			$result = $this->StundensatzModel->delete($data['stundensatz_id']);

			if (isError($result))
				return $this->outputJsonError('Fehler beim Löschen des Stundensatzes');

			return $this->outputJsonSuccess($result);
		}
	}

    // -------------------------------------
    // time recording
    // -------------------------------------

    /**
     * get off time list of employee by uid
     */
    function offTimeByPerson()
    {
        $person_uid = $this->input->get('uid', TRUE);

        if (!$person_uid)
        {
            $this->outputJsonError('invalid parameter person_uid');
            exit;
        }

        // optional filter by year
        $year = $this->input->get('year', null);

        if (!is_numeric($year))
        {
            // no filter
            $data = $this->ApiModel->getOffTimeList($person_uid);
        } else {
            // filter by year
            $data = $this->ApiModel->getOffTimeList($person_uid, $year);
        }

        return $this->outputJson($data);
    }

    function timeRecordingByPerson()
    {
        $person_uid = $this->input->get('uid', TRUE);
        $year = $this->input->get('year', TRUE);
        $week = $this->input->get('week', TRUE);

        if (!$person_uid)
        {
            $this->outputJsonError('invalid parameter person_uid');
            exit;
        }

        if (!is_numeric($year))
        {
            $this->outputJsonError('invalid parameter year');
            exit;
        }

        if (!is_numeric($week))
        {
            $this->outputJsonError('invalid parameter week');
            exit;
        }

        $week_start = new DateTime();
        $week_start->setISODate($year,$week);
        $fromDate = $week_start->format('Y-m-d');
        $toDate = $week_start->add(new DateInterval( "P6D" ))->format('Y-m-d');
        $data = $this->ZeitaufzeichnungModel->getFullInterval($person_uid, $fromDate, $toDate);

        return $this->outputJson($data);
    }



    // helper to create map with ID-attribute as index key
    private function _remapData($attribute, &$data) {
        $mappedData = new stdClass();
        foreach ($data->retval as $record) {
            $key = $record->$attribute;
            $mappedData->$key = $record;
        }
        $data->retval = $mappedData;
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

    /**
     * Search for employees. Used by employee chooser component.
     * @deprecated
     */
    function filter()
    {
        $searchString = $this->input->get('search', TRUE);
        $data = $this->ApiModel->filter($searchString);
        return $this->outputJson($data);
    }

}
