<?php


require_once __DIR__ . '/FormData.php';
require_once __DIR__ . '/GUIHandlerFactory.php';
//require_once __DIR__ . '/../../../models/vertragsbestandteil/Dienstverhaeltnis_model.php';
//require_once __DIR__ . '/../../libraries/vertragsbestandteil/VertragsbestandteilLib.php';
require_once __DIR__ . '/util.php';

use vertragsbestandteil\Dienstverhaeltnis;

/**
 * GUIHandler takes JSON from GUI and manages the process of
 * storing the data to the database
 */
class GUIHandler
{

    protected $employeeUID;
    protected $userUID;
    protected $CI;

	protected $formDataMapper;
	protected $dv;
	protected $vbs;
	
	protected $validationFailed;
	
    public function __construct($employeeUID, $userUID)
    {
        $this->employeeUID = $employeeUID;
        $this->userUID = $userUID;
        $this->CI = get_instance();
        $this->CI->load->model('vertragsbestandteil/Dienstverhaeltnis_model',
			'Dienstverhaeltnis_model');
        $this->CI->load->library('vertragsbestandteil/VertragsbestandteilLib', 
            null, 'VertragsbestandteilLib');
    }

    /**
     * main entry (called from VetragsbestandteilLib)
     * @param string $guidata JSON submitted by editor
     * @param string $employeeUID uid of the employee
     * @param string $userUID  uid of the user currently editing the employee data
     * @return string JSON for GUI client
     */
    public function handle($guidata)
    {
		$this->formDataMapper = new FormData();
		$this->dv = null;
		$this->vbs = array();
		$this->validationFailed = false;
		
		$this->parse($guidata);
		
		if ($this->validationFailed)
		{
			$errormsg = 'Validation error while saving Vertragsbestandteile';
			log_message('error', $errormsg);
			$this->formDataMapper->addGUIError('Dienstverhältnis konnte nicht gespeichert werden');
		}
		else
		{
			//$this->store();
		}
		return $this->formDataMapper->generateJSON();
	}

	protected function parse($guidata)
	{
		$decoded = json_decode($guidata, true);
		$this->formDataMapper->mapJSON($decoded);
		// DV
		$this->parseDV();
		
		// VBS
		$vbsList = $this->formDataMapper->getVbs();

		foreach ($vbsList as $vbsID => $vbs) {
			$this->vbs[$vbsID] = $this->parseVB($vbs);

			if ($this->vbs[$vbsID]->hasErrors()) {
				$this->validationFailed = true;
			}
		}
		$this->formDataMapper->setVbs($this->vbs);
	}
	
	protected function parseDV()
	{        
        $dvData = $this->formDataMapper->getDv();
        $dvMapper = new GUIDienstverhaeltnis();
		$dvMapper->mapJSON($dvData);
		$dvMapper->generateDienstverhaeltnis($this->employeeUID, $this->userUID);
		$this->formDataMapper->setDv($dvMapper);
	}
	
	protected function parseVB($vbs) 
	{
        /**  @var AbstractGUIVertragsbestandteil */
        $vbsMapper = GUIHandlerFactory::getGUIHandler($vbs['type']);
		$vbsMapper->mapJSON($vbs);
		$vbsData = $vbsMapper->getData();

		// merge GUI-Data with DB-Data
		$vbsInstance = $vbsMapper->generateVertragsbestandteil(isset($vbsData['id'])?$vbsData['id']:null);
		$vbsMapper->setVbsinstance($vbsInstance);
		if ($vbsInstance->getDienstverhaeltnis_id() === null) 
		{
			$vbsInstance->setDienstverhaeltnis_id($dienstverhaeltnis_id);
			$vbsInstance->setInsertvon($this->userUID);
			$vbsInstance->setInsertamum((new DateTime())->format("Y-m-d h:m:s"));
		} else {
			$vbsInstance->setUpdatevon($this->userUID);
			$vbsInstance->setUpdateamum((new DateTime())->format("Y-m-d h:m:s"));
		}

		$gbsList = $vbsMapper->getGbs();
		foreach ($gbsList as $gbsMapper) {
			$gbsData = $gbsMapper->getData();
			$gbsInstance = $gbsMapper->generateGehaltsbestandteil(isset($gbsData['id'])?$gbsData['id']:null);
			$gbsvalid = $gbsInstance->validate();
			if(!$gbsvalid) 
			{
				$gbsMapper->addGUIError($gbsInstance->getValidationErrors());
			}
			$vbsInstance->addGehaltsbestandteil($gbsInstance);
		}
		// TODO Validate?
		$valid = $vbsInstance->validate();

		if (!$valid)
		{
			// write guioptions
			$vbsMapper->addGUIError($vbsInstance->getValidationErrors());
		}

        return $vbsMapper;
	}
	
	protected function store() 
	{
        $this->CI->db->trans_begin();

        try {


            

            if ($res === false)
            {
                // TODO remove
                //log_message('error','Transaction failed');
                //$this->CI->db->trans_rollback();
            } else {

		        // VBS
		        $vbsList = $formDataMapper->getVbs();

                $handledVBs = array();
                $validationFailed = false;

                foreach ($vbsList as $vbsID => $vbs) {
                    $handledVBs[$vbsID] = $this->handleVBS($dvData['dienstverhaeltnisid'], $vbs);

                    if ($handledVBs[$vbsID]->hasErrors()) {
                        $validationFailed = true;
                    }
                }
                $formDataMapper->setVbs($handledVBs);

                if ($validationFailed)
                {
                    $errormsg = 'Validation error while saving Vertragsbestandteile';
                    log_message('error', $errormsg);
                    throw new Exception($errormsg);
                }
            }

            $this->CI->db->trans_commit();
            $formDataMapper->addGUIInfo('Dienstverhältnis gespeichert');

        } catch(Exception $ex) {
            // TODO write error message to guioptions errors array
            log_message('error','Transaction failed');
            $this->CI->db->trans_rollback();
            $formDataMapper->addGUIError('Dienstverhältnis konnte nicht gespeichert werden');
        }        

        return $formDataMapper->generateJSON();
    }

    /**
     * dienstverhaeltnisid
     * unternehmen
     * vertragsart_kurzbz
     * gueltigkeit
     */
    private function handleDV(&$dv)
    {
        $dienstverhaeltnisid = $dv['dienstverhaeltnisid'];
    
        if (isset($dienstverhaeltnisid) && intval($dienstverhaeltnisid > 0))
        {
            // DV exists
            $res = $this->updateDV($dv);
            if (isSuccess($res))
            {
                return true;
            }
        } else {            
            // DV is new
            $res = $this->insertDV($dv);
            if (isSuccess($res))
            {
                // write back new id
                $dv['dienstverhaeltnisid'] = $res->retval[0]->dienstverhaeltnis_id;
                return true;
            } 
            
        }

        throw new Exception('saving DV failed');

        return false;
        
    }
	
    private function handleVBS($dienstverhaeltnis_id, $vbs)
    {
        /**  @var AbstractGUIVertragsbestandteil */
        $vbsMapper = GUIHandlerFactory::getGUIHandler($vbs['type']);
        try {
		    $vbsMapper->mapJSON($vbs);
		    $vbsData = $vbsMapper->getData();

            // merge GUI-Data with DB-Data
            $vbsInstance = $vbsMapper->generateVertragsbestandteil(isset($vbsData['id'])?$vbsData['id']:null);
            if ($vbsInstance->getDienstverhaeltnis_id() === null) 
            {
                $vbsInstance->setDienstverhaeltnis_id($dienstverhaeltnis_id);
                $vbsInstance->setInsertvon($this->userUID);
                $vbsInstance->setInsertamum((new DateTime())->format("Y-m-d h:m:s"));
            } else {
                $vbsInstance->setUpdatevon($this->userUID);
                $vbsInstance->setUpdateamum((new DateTime())->format("Y-m-d h:m:s"));
            }

            $gbsList = $vbsMapper->getGbs();
            foreach ($gbsList as $gbs) {
                $gbsData = $gbs->getData();
                $gbsInstance = $gbs->generateGehaltsbestandteil(isset($gbsData['id'])?$gbsData['id']:null);
                $vbsInstance->addGehaltsbestandteil($gbsInstance);
            }
            // TODO Validate?
            $valid = $vbsInstance->validate();

            // store
            if ($valid)
            {
                $this->CI->VertragsbestandteilLib->storeVertragsbestandteil($vbsInstance);
            } else {
                // write guioptions
                $vbsMapper->addGUIError($vbsInstance->getValidationErrors());
            }

        } catch (Exception $ex) {
            log_message('error','saving Vertragsbestandteil failed');
            throw new Exception($ex->getMessage());
        }

        return $vbsMapper;
		// GBS
        /*
		foreach ($vbsMapper->getGbs() as $gbs)
		{
			$gbsData = $gbs->getData();
            $this->handleGBS($gbsData);
		}*/
    }


    // GBS without connection to VBS
    private static function handleGBS($gbs)
    {
        // TODO
    }


    // ------------------------------------
    // DV does not have a dedicated handler
    private function insertDV($dvJSON)
    {
        $dvJSON['mitarbeiter_uid'] = $this->employeeUID;
        $now = new DateTime();
        $dvJSON['von'] = string2Date($dvJSON['gueltigkeit']->getData()['gueltig_ab']);
        $dvJSON['bis'] = string2Date($dvJSON['gueltigkeit']->getData()['gueltig_bis']);
        $dvJSON['oe_kurzbz'] = $dvJSON['unternehmen'];
        $dvJSON['insertvon'] = $this->userUID;
        $dvJSON['insertamum'] = $now->format(DateTime::ATOM);

        unset($dvJSON['dienstverhaeltnisid']);
        unset($dvJSON['children']);
        unset($dvJSON['gueltigkeit']);
        unset($dvJSON['unternehmen']);

        $result = $this->CI->Dienstverhaeltnis_model->insert($dvJSON);

        if (isError($result))
        {
            throw new Exception($result->msg);
        }

        $record = $this->CI->Dienstverhaeltnis_model->load($result->retval);

        return $record;
    }

    private function updateDV($dvJSON)
    {
        $dvJSON['mitarbeiter_uid'] = $this->employeeUID;
        $dvJSON['von'] = string2Date($dvJSON['gueltigkeit']->getData()['gueltig_ab']);
        $dvJSON['bis'] = string2Date($dvJSON['gueltigkeit']->getData()['gueltig_bis']);
        $dvJSON['oe_kurzbz'] = $dvJSON['unternehmen'];
        $now = new DateTime();
        $dvJSON['updatevon'] = $this->userUID;
        $dvJSON['updateamum'] = $now->format(DateTime::ATOM);
        $dvJSON['dienstverhaeltnis_id'] = $dvJSON['dienstverhaeltnisid'];

        unset($dvJSON['insertamum']);
        unset($dvJSON['insertvon']);
        unset($dvJSON['dienstverhaeltnisid']);
        unset($dvJSON['children']);
        unset($dvJSON['gueltigkeit']);
        unset($dvJSON['unternehmen']);
        
        $result = $this->CI->Dienstverhaeltnis_model->update($dvJSON);
        //$result = $this->CI->Dienstverhaeltnis_model->update($dvJSON['kontakt_id'], $dvJSON);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $record = $this->CI->Dienstverhaeltnis_model->load($result->retval);

        return $record;
    }

    private function deleteDV($dv_id)
    {
        $result = $this->CI->Dienstverhaeltnis_model->delete($dv_id);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($dv_id);
    }

}