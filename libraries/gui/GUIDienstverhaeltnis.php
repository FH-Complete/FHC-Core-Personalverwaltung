<?php
require_once __DIR__ . "/AbstractBestandteil.php";

use vertragsbestandteil\Dienstverhaeltnis;

/**
 * "dv": {
 *	"type": "dienstverhaeltnis",
 *	  "data": {
 *		"dienstverhaeltnisid": null,
 *		"unternehmen": "gst",
 *		"vertragsart_kurzbz": "echterdv",
 *		"gueltigkeit": {
 *		  "guioptions": {
 *			"sharedstatemode": "set",
 *			"disabled": []
 *		  },
 *		  "data": {
 *			"gueltig_ab": "2023-09-01",
 *			"gueltig_bis": ""
 *		  }
 *		}
 *	  },
 *	  "guioptions": {
 *		"infos": [],
 *		"errors": []
 *	  }
 *	}
 */
class GUIDienstverhaeltnis extends AbstractBestandteil implements JsonSerializable
{    
    const TYPE_STRING = "dienstverhaeltnis";
	
	protected $dv;

	public function __construct()
    {
        parent::__construct();
        $this->type = self::TYPE_STRING;
        $this->hasGBS = false;
        $this-> guioptions = ["infos" => [], "errors" => []];
        $this->data = [
						"dienstverhaeltnisid" => "",
						"unternehmen" => "",
						"vertragsart_kurzbz" => "",
						"checkoverlap"=> "",
						"gueltigkeit" => [
							"guioptions" => ["sharedstatemode" => "set"],
							"data" =>       ["gueltig_ab"      => "", "gueltig_bis" => ""]
						]
                      ];        
    }

    /**
     * parse JSON into object
     * @param string $jsondata 
     */
    public function mapJSON(&$decoded)
    {
        $this->checkType($decoded);
        $this->mapGUIOptions($decoded);
        $this->mapData($decoded);
    }

    /**    
     */
    private function mapData(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'data'))
        {
            throw new \Exception('missing data');
        }
        
        $this->getJSONDataInt($this->data['dienstverhaeltnisid'], $decodedData, 'dienstverhaeltnisid');
        $this->getJSONData($this->data['unternehmen'], $decodedData, 'unternehmen');
        $this->getJSONData($this->data['vertragsart_kurzbz'], $decodedData, 'vertragsart_kurzbz');
	$this->getJSONData($this->data['dvendegrund_kurzbz'], $decodedData, 'dvendegrund_kurzbz');
	$this->getJSONData($this->data['dvendegrund_anmerkung'], $decodedData, 'dvendegrund_anmerkung');
	$this->getJSONDataBool($this->data['checkoverlap'], $decodedData, 'checkoverlap');
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
        //$this->getJSONData($this->data['gueltigkeit'], $decodedData, 'gueltigkeit');
    }


    public function generateVBLibInstance() {
		$handler = GUIHandler::getInstance();
		$employeeUID = $handler->getEmployeeUID(); 
		$editorUID = $handler->getEditorUID();
			
		$dienstverhaeltnisid = $this->data['dienstverhaeltnisid'];
		
        if (isset($dienstverhaeltnisid) && intval($dienstverhaeltnisid) > 0)
        {
			$this->dv = $handler->VertragsbestandteilLib->fetchDienstverhaeltnis(intval($dienstverhaeltnisid));
			$this->dv->setMitarbeiter_uid($employeeUID);
			// @TODO 2023-04-25 bh: gueltig_ab bei "normaler" Vertragsaenderung nicht ueberscheiben
			$this->dv->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
			$this->dv->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));
			$this->dv->setOe_kurzbz($this->data['unternehmen']);
			$this->dv->setVertragsart_kurzbz($this->data['vertragsart_kurzbz']);
			if( array_key_exists('dvendegrund_kurzbz', $this->data) )
			{			    
			    $this->dv->setDvendegrund_kurzbz($this->data['dvendegrund_kurzbz']);
			}
			if( array_key_exists('dvendegrund_anmerkung', $this->data) )
			{			    
			    $this->dv->setDvendegrund_anmerkung($this->data['dvendegrund_anmerkung']);
			}
			$this->dv->setCheckoverlap($this->data['checkoverlap']);
			$this->dv->setUpdatevon($editorUID);
		}
		else 
		{
			$data = new stdClass();
			$data->mitarbeiter_uid = $employeeUID;
			$now = new DateTime();
			$data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
			$data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
			$data->oe_kurzbz = $this->data['unternehmen'];
			$data->vertragsart_kurzbz = $this->data['vertragsart_kurzbz'];
			if( array_key_exists('dvendegrund_kurzbz', $this->data) )
			{			    
			    $data->dvendegrund_kurzbz = $this->data['dvendegrund_kurzbz'];
			}
			if( array_key_exists('dvendegrund_anmerkung', $this->data) )
			{			    
			    $data->dvendegrund_anmerkung = $this->data['dvendegrund_anmerkung'];
			}
			$data->checkoverlap = $this->data['checkoverlap'];
			$data->insertvon = $editorUID;
			$data->insertamum = $now->format(DateTime::ATOM);
			
			$this->dv = new Dienstverhaeltnis();
			$this->dv->hydrateByStdClass($data);
		}
    }

	public function getDienstverhaeltnis() 
	{
		return $this->dv;
	}
	
    public function jsonSerialize() {
		$this->syncInstanceId();
        return [
            "type" => $this->type,
            "guioptions" => $this->guioptions,
            "data" => $this->data
		];
    }
	
	public function validate()
	{
		if( !($this->dv instanceof vertragsbestandteil\IValidation) )
		{			
			return;
		}
		
		if( !$this->dv->validate() )
		{
			$this->addGUIError($this->dv->getValidationErrors());
		}
	}
	
	protected function syncInstanceId()
	{
		if( !$this->dv ) 
		{
			return;
		}
		
		if( intval($this->dv->getDienstverhaeltnis_id()) > 0 ) 
		{
			$this->data['dienstverhaeltnisid'] = $this->dv->getDienstverhaeltnis_id();
		}
	}
}