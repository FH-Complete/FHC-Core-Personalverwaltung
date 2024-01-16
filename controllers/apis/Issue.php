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
				'byPerson' => Self::DEFAULT_PERMISSION,
				'PersonenMitOffenenIssues' => self::DEFAULT_PERMISSION
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


	public function PersonenMitOffenenIssues()
	{
		$sql = <<<EOSQL
SELECT

		person_id, uid, vorname, nachname, count(*) AS openissues ,
		(select count(*) anz_aktiv 
		 from hr.tbl_dienstverhaeltnis dv 
		 where dv.mitarbeiter_uid=uid and dv.von<=now() and 
		       (dv.bis is null OR dv.bis>=now())
		) aktiv
FROM 
		system.tbl_issue 
JOIN 
		system.tbl_fehler USING (fehlercode) 
JOIN 
		public.tbl_person USING (person_id) 
JOIN 
		public.tbl_benutzer USING (person_id) 
JOIN 
		public.tbl_mitarbeiter ON uid = mitarbeiter_uid                         
WHERE 
		app = 'personalverwaltung' AND verarbeitetamum IS NULL 
GROUP BY 
		person_id, uid, vorname, nachname 
HAVING 
		count(*) > 0 
ORDER BY 
		count(*) DESC;
			
EOSQL;
		
		$personenmitissues = $this->IssueModel->execReadOnlyQuery($sql);
		if( hasData($personenmitissues) ) 
		{
			$this->outputJson($personenmitissues);
			return;
		}
		else
		{
			$this->outputJsonSuccess(array());
			return;
		}
	}
}