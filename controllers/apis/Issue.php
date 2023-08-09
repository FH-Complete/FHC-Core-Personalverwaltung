<?php

defined('BASEPATH') || exit('No direct script access allowed');


class Issue extends Auth_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';
    // code igniter 
    protected $CI;

    public function __construct() {
        
        parent::__construct(
			array(
				'index' => Self::DEFAULT_PERMISSION,
				'byPerson' => Self::DEFAULT_PERMISSION
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
        $this->load->model('system/Fehler_model','FehlerModel');
        $this->load->model('system/Issue_model', 'IssueModel');
        $this->load->model('person/Benutzer_model', 'BenutzerModel');
        
        // get CI for transaction management
        $this->CI = &get_instance();
    }

    function index()
    {}

    function byPerson()
    {
        $person_id = $this->input->get('person_id', TRUE);

        if (!is_numeric($person_id))
			show_error('person id is not numeric!');

        $this->FehlerModel->addSelect("fehlercode");
        $fehlercodeRes = $this->FehlerModel->loadWhere(" app='personalverwaltung' ");

        if (isError($fehlercodeRes))
        {
            $this->outputJsonError(getError($fehlercodeRes));
            exit;
        }

        $fehlercodes = array();
        foreach ($fehlercodeRes->retval as $item) {
            $fehlercodes[] = $item->fehlercode;
        }

		$issueRes = $this->IssueModel->getOpenIssues($fehlercodes, $person_id);

		if (isError($issueRes))
		{
			$this->outputJsonError(getError($issueRes));
			exit;
		}

        $this->outputJson($issueRes);
    }



}