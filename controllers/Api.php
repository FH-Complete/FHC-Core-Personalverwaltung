<?php
defined('BASEPATH') || exit('No direct script access allowed');


class Api extends FHC_Controller
{
    public function __construct() {
        parent::__construct();

		// Loads authentication library and starts authentication
		$this->load->library('AuthLib');

        $this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
        $this->load->model('person/Person_model','PersonModel');
        $this->load->model('person/Kontakt_model','KontaktModel');
        $this->load->model('person/Bankverbindung_model','BankverbindungModel');
        $this->load->model('codex/Nation_model', 'NationModel');
        $this->load->model('codex/Ausbildung_model', 'AusbildungModel');
        $this->load->model('person/kontakttyp_model', 'KontakttypModel');
        $this->load->model('system/sprache_model', 'SpracheModel');
        $this->load->model('ressource/ort_model', 'OrtModel');
        $this->load->model('ressource/Mitarbeiter_model', 'EmployeeModel');
        $this->load->model('person/Benutzer_model', 'BenutzerModel');

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

        $this->outputJsonSuccess($spracheRes);
    }

    function getNations()
    {
        $language = getUserLanguage();

		$nationTextFieldName = $language == 'German' ? 'langtext' : 'engltext';

        $this->NationModel->addSelect("nation_code, $nationTextFieldName AS nation_text");
		$this->NationModel->addOrder("nation_text");
		$nationRes = $this->NationModel->load();

		if (isError($nationRes))
		{
			$this->outputJsonError(getError($nationRes));
			exit;
		}

        $this->outputJsonSuccess($nationRes); 
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

        $this->outputJsonSuccess($result); 
    }

    function getStandorteIntern()
    {
        $data = $this->ApiModel->getStandorteIntern();
        $this->outputJsonSuccess($data); 
    }

    function getOrte()
    {
        $this->OrtModel->addOrder("ort_kurzbz");
        $data = $this->OrtModel->load();
        $this->outputJsonSuccess($data);
    }

    function getGemeinden()
    {
        $plz = $this->input->get('plz', TRUE);

        if (!is_numeric($plz))
			show_error("plz '$plz' is not numeric!'");

        $data = $this->ApiModel->getGemeinden($plz);
        $this->outputJsonSuccess($data); 
    }

    function getOrtschaften()
    {
        $plz = $this->input->get('plz', TRUE);

        if (!is_numeric($plz))
			show_error('plz is not numeric!');

        $data = $this->ApiModel->getOrtschaften($plz);
        $this->outputJsonSuccess($data); 
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
     * Get banking data of a person. 
     * Query parameter: person_id
     */
    function personBankData()
    {
        $person_id = $this->input->get('person_id', TRUE);

        if (!is_numeric($person_id))
			show_error('person id is not numeric!');

        $data = $this->BankverbindungModel->loadWhere(array('person_id' => $person_id));
        
        return $this->outputJson($data); 
    }

    /**
     * Update banking data of a person
     */
    function updatePersonBankData()
    {
        if($this->input->method() === 'post'){

            // TODO Permissions
            //if ($this->permissionlib->isBerechtigt(self::VERWALTEN_MITARBEITER, 'suid', null, $kostenstelle_id))
		    //{

            $inputJSON = file_get_contents('php://input');
            $payload = json_decode($inputJSON, TRUE); //convert JSON into array

            if (isset($payload['person_id']) && !is_numeric($payload['person_id']))
                show_error('person id is not numeric!');

            if (!isset($payload['iban']) || (isset($payload['iban']) && $payload['iban'] == ''))
                show_error('iban is empty!');            

            $result = $this->ApiModel->updatePersonBankData($payload);
            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when updating bank data');
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

            $inputJSON = file_get_contents('php://input');
            $payload = json_decode($inputJSON, TRUE); //convert JSON into array

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

            // TODO Permissions
            //if ($this->permissionlib->isBerechtigt(self::VERWALTEN_MITARBEITER, 'suid', null, $kostenstelle_id))
		    //{

            $inputJSON = file_get_contents('php://input');
            $payload = json_decode($inputJSON, TRUE); //convert JSON into array

            if (isset($payload['person_id']) && !is_numeric($payload['person_id']))
                show_error('person id is not numeric!'); 
                       

            $result = $this->ApiModel->updatePersonEmployeeData($payload);
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

            // TODO Permissions
            //if ($this->permissionlib->isBerechtigt(self::VERWALTEN_MITARBEITER, 'suid', null, $kostenstelle_id))
		    //{

            $inputJSON = file_get_contents('php://input');
            $payload = json_decode($inputJSON, TRUE); //convert JSON into array

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
            $inputJSON = file_get_contents('php://input');
            $payload = json_decode($inputJSON, TRUE); //convert JSON into array

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

            $data = $this->KontaktModel->getWholeKontakt(null, $person_id);
            $this->_remapData('kontakt_id',$data);

            if (isSuccess($data))
			    $this->outputJsonSuccess($data->retval);
		    else
			    $this->outputJsonError('Error when fetching contact data');

        } else {
            $this->output->set_status_header('405');
        }   
    }

    function upsertPersonContactData()
    {
        if($this->input->method() === 'post'){

            // TODO Permissions
            //if ($this->permissionlib->isBerechtigt(self::VERWALTEN_MITARBEITER, 'suid', null, $kostenstelle_id))
		    //{

            $inputJSON = file_get_contents('php://input');
            $payload = json_decode($inputJSON, TRUE); //convert JSON into array

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
            $inputJSON = file_get_contents('php://input');
            $payload = json_decode($inputJSON, TRUE); //convert JSON into array

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
        //$this->KontakttypModel->addSelect("nation_code, $nationTextFieldName AS nation_text");
		$this->NationModel->addOrder("kontakttyp");
		$result = $this->KontakttypModel->load();

		if (isError($result))
		{
			$this->outputJsonError(getError($result));
			exit;
		}

        $this->outputJsonSuccess($result); 
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

/*
       public function user_get(){
           $r = $this->user_model->read();
           $this->response($r); 
       }

       public function user_put(){
           $id = $this->uri->segment(3);
           $data = array('name' => $this->input->get('name'),
           'pass' => $this->input->get('pass'),
           'type' => $this->input->get('type')
           );
            $r = $this->user_model->update($id,$data);
               $this->response($r); 
       }

       public function user_post(){
           $data = array('name' => $this->input->post('name'),
           'pass' => $this->input->post('pass'),
           'type' => $this->input->post('type')
           );
           $r = $this->user_model->insert($data);
           $this->response($r); 
       }

       public function user_delete(){
           $id = $this->uri->segment(3);
           $r = $this->user_model->delete($id);
           $this->response($r); 
       }
  */  
}