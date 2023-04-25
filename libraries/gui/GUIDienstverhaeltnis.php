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
						"gueltigkeit" => [
							"guioptions" => ["sharedstatemode" => "set"],
							"data" =>       ["gueltig_ab"      => "", "gueltig_bis" => ""]
						]
                      ];        
    }

    public function getTypeString(): string
    {
        return self::TYPE_STRING;
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
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
        //$this->getJSONData($this->data['gueltigkeit'], $decodedData, 'gueltigkeit');
    }


    public function generateDienstverhaeltnis($employeeUID, $userUID) {
		$dienstverhaeltnisid = $this->data['dienstverhaeltnisid'];
		
        if (isset($dienstverhaeltnisid) && intval($dienstverhaeltnisid) > 0)
        {
			$this->dv = $this->CI->VertragsbestandteilLib->fetchDienstverhaeltnis(intval($dienstverhaeltnisid));
			$this->dv->setMitarbeiter_uid($employeeUID);
			// @TODO 2023-04-25 bh: gueltig_ab bei "normaler" Vertragsaenderung nicht ueberscheiben
			$this->dv->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
			$this->dv->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));
			$this->dv->setOe_kurzbz($this->data['unternehmen']);
			$this->dv->setUpdatevon($userUID);
		}
		else 
		{
			$data = new stdClass();
			$data->mitarbeiter_uid = $employeeUID;
			$now = new DateTime();
			$data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
			$data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
			$data->oe_kurzbz = $this->data['unternehmen'];
			$data->insertvon = $userUID;
			$data->insertamum = $now->format(DateTime::ATOM);
			
			$this->dv = new Dienstverhaeltnis();
			$this->dv->hydrateByStdClass($data);
		}
		
		if( !$this->dv->validate() )
		{
			$this->addGUIError($this->dv->getValidationErrors());
		}
    }

	public function getDienstverhaeltnis() 
	{
		return $this->dv;
	}
	
    public function jsonSerialize() {
        return [
            "type" => $this->type,
            "guioptions" => $this->guioptions,
            "data" => $this->data
		];
    }

}