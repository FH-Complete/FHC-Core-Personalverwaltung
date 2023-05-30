<?php
require_once __DIR__ . '/GUIHandlerFactory.php';
//require_once __DIR__ . '/../../../models/vertragsbestandteil/Dienstverhaeltnis_model.php';
//require_once __DIR__ . '/../../libraries/vertragsbestandteil/VertragsbestandteilLib.php';
require_once __DIR__ . '/util.php';

/**
 * GUIHandler takes JSON from GUI and manages the process of
 * storing the data to the database
 */
class GUIHandler
{
    protected $employeeUID;
    protected $editorUID;
	
    protected $CI;
	public $VertragsbestandteilLib;
	public $GehaltsbestandteilLib;

	protected $DataMapper;
	
	protected static $instance = null;
	
    private function __construct()
    {
        $this->employeeUID	= null;
        $this->editorUID	= null;
		
        $this->CI = get_instance();
        $this->CI->load->model('vertragsbestandteil/Dienstverhaeltnis_model',
			'Dienstverhaeltnis_model'); // TODO remove
        $this->CI->load->library('vertragsbestandteil/VertragsbestandteilLib', 
            null, 'VertragsbestandteilLib');
		$this->VertragsbestandteilLib = $this->CI->VertragsbestandteilLib;
		$this->CI->load->library('vertragsbestandteil/GehaltsbestandteilLib', 
            null, 'GehaltsbestandteilLib');
		$this->GehaltsbestandteilLib = $this->CI->GehaltsbestandteilLib;
    }

	public static function getInstance() {
		if( self::$instance === null )
		{
			self::$instance = new GUIHandler();
		}
		return self::$instance;
	}
	
	public function getEmployeeUID()
	{
		return $this->employeeUID;
	}

	public function getEditorUID()
	{
		return $this->editorUID;
	}

	public function setEmployeeUID($employeeUID)
	{
		$this->employeeUID = $employeeUID;
		return $this;
	}

	public function setEditorUID($editorUID)
	{
		$this->editorUID = $editorUID;
		return $this;
	}
	
	private function __clone() 
	{ 
		
	}
	
    /**
     * main entry (called from VetragsbestandteilLib)
     * @param string $guidata JSON submitted by editor
     * @param string $employeeUID uid of the employee
     * @param string $userUID  uid of the user currently editing the employee data
     * @return string JSON for GUI client
     */
    public function handle($guidata, $onlyvalidate=false)
    {
		$decoded = json_decode($guidata, true);
		$this->DataMapper = GUIHandlerFactory::getGUIHandler($decoded['type']);
		$this->DataMapper->mapJSON($decoded);
		
		if( $this->DataMapper->isValid() )
		{
			if( $onlyvalidate ) 
			{
				$this->DataMapper->addGUIInfo('Dienstverhältnis kann gespeichert werden.');
			}
			else
			{
				$this->store();	
			}			
		}
		else
		{
			$errormsg = 'Validation error while saving Vertragsbestandteile';
			log_message('error', $errormsg);
			$this->DataMapper->addGUIError('Dienstverhältnis kann nicht gespeichert werden.');
		}
		
		$json = json_encode($this->DataMapper);
		return $json;
	}
	
	protected function store() 
	{
        $this->CI->db->trans_begin();

        try {
			$dv = $this->DataMapper->getDv()->getDienstverhaeltnis(); 
			$this->VertragsbestandteilLib->storeDienstverhaeltnis($dv);
            
			$vbs = $this->DataMapper->getVbs();
			foreach($vbs as $vbmapper) 
			{
				$vb = $vbmapper->getVbsinstance();
				$vb->setDienstverhaeltnis_id($dv->getDienstverhaeltnis_id());
				
				$gbs = $vbmapper->getGbs();
				foreach($gbs as $gbmapper) 
				{
					$gb = $gbmapper->getGbsInstance();
					if( $gbmapper->hasToBeDeleted() ) 
					{
						$this->GehaltsbestandteilLib->deleteGehaltsbestandteil($gb);
					}
					else 
					{
						$vb->addGehaltsbestandteil($gb);
					}
				}
				if( $vbmapper->hasToBeDeleted() )
				{
					$this->VertragsbestandteilLib->deleteVertragsbestandteil($vb);
				}
				else 
				{
				  $this->VertragsbestandteilLib->storeVertragsbestandteil($vb);
				}
			}

            $this->CI->db->trans_commit();
			
			foreach($vbs as $vbmapper) 
			{
				$vbmapper->removeDeletedGBs();
			}
			
			$this->DataMapper->removeDeletedVBs();
			
            $this->DataMapper->addGUIInfo('Dienstverhältnis gespeichert');

        } catch(Exception $ex) {
            // TODO write error message to guioptions errors array
            log_message('error','Transaction failed');
            $this->CI->db->trans_rollback();
            $this->DataMapper->addGUIError('Dienstverhältnis konnte nicht gespeichert werden');
        }
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