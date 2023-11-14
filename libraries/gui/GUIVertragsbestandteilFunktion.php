<?php

require_once __DIR__ . "/AbstractGUIVertragsbestandteil.php";
require_once __DIR__ . "/GUIGehaltsbestandteil.php";
require_once __DIR__ . "/GUIGueltigkeit.php";

use GUIVertragsbestandteilFunktion as GlobalGUIVertragsbestandteilFunktion;
use vertragsbestandteil\VertragsbestandteilFactory;

class GUIVertragsbestandteilFunktion extends AbstractGUIVertragsbestandteil  implements JsonSerializable
{    
    const TYPE_STRING = "vertragsbestandteilfunktion";

    const FACHZUORDNUNG_JOB_TYPE = 'fachzuordnung';
    const OE_ZUORDNUNG_JOB_TYPE = 'oezuordnung';
    const KSTZUORDNUNG_JOB_TYPE = 'kstzuordnung';
    // job types that can not be linked to salary (canhavegehaltsbestandteil)
    const NOGBS_JOB_TYPES = [
        GUIVertragsbestandteilFunktion::FACHZUORDNUNG_JOB_TYPE,
        GUIVertragsbestandteilFunktion::OE_ZUORDNUNG_JOB_TYPE,
        GUIVertragsbestandteilFunktion::KSTZUORDNUNG_JOB_TYPE];

    public function __construct()
    {
		parent::__construct();
        $this->type = self::TYPE_STRING;        
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => false];
        $this->data = [
                       "gueltigkeit" => [
                           "guioptions" => ["sharedstatemode" => "reflect"],
                           "data" =>       ["gueltig_ab"      => "", "gueltig_bis" => ""]
                       ]
                      ];
        $this->gbs = [];
    }

    /**
     * ["id" => null, 
     *  "infos" => [], 
     *  "errors" => [], 
     *  "removeable" => true
     * ]
     * @param mixed $decoded decoded JSON data (use associative array)
     */
    protected function mapGUIOptions(&$decoded)
    {
        parent::mapGUIOptions($decoded);
        $this->guioptions['canhavegehaltsbestandteile'] = $this->getHasGBS();
    }

    /**
     * Override
     * Gehaltsbestanddteile depends on type of employee job:
     *  - Standardkostenstelle: hasGBS == false
     *  - diszPl. Zuordnung: hasGBS == false
     *  - fachliche Zuordnung: hasGBS == false
     *  - everything else: hasGBS == true
     */
    public function getHasGBS()
    {
        if (isset($this->data['funktion'])
            && in_array($this->data['funktion'], GlobalGUIVertragsbestandteilFunktion::NOGBS_JOB_TYPES))
        {
            return false;
        }
        return true;
    }

    /**
     * {
     *  "funktion": "Leitung",
     *    "orget": "sdf",
     *    "gueltigkeit": {
     *      "guioptions": {
     *        "sharedstatemode": "reflect"
     *      },
     *      "data": {
     *        "gueltig_ab": "",
     *        "gueltig_bis": ""
     *      }
     *    }
     * }
     */
    protected function mapData(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'data'))
        {
            throw new \Exception('missing data');
        }
		$this->getJSONDataInt($this->data['id'], $decodedData, 'id');
        $this->getJSONData($this->data['funktion'], $decodedData, 'funktion');
        $this->getJSONData($this->data['orget'], $decodedData, 'orget');
		$this->getJSONData($this->data['mitarbeiter_uid'], $decodedData, 'mitarbeiter_uid');
        $this->getJSONData($this->data['benutzerfunktionid'], $decodedData, 'benutzerfunktionid');
		$this->getJSONData($this->data['mode'], $decodedData, 'mode');
        
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
		$this->getJSONDataBool($this->data['db_delete'], $decodedData, 'db_delete');
    }

    public function generateVBLibInstance() {
		$handler = GUIHandler::getInstance();
        /** @var vertragsbestandteil\VertragsbestandteilFunktion */
        $vbs = null;
		$id = isset($this->data['id']) ? intval($this->data['id']) : 0;
        if ($id > 0)
        {
            // load VBS            
            $vbs =  $handler->VertragsbestandteilLib->fetchVertragsbestandteil($id);
            // merge
			/**
			 * @todo refactor update
			 */
            $vbs->setBenutzerfunktion_id($this->data['benutzerfunktionid']);
            $vbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
            $vbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));
        } else {

            $data = new stdClass();
            $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
            $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
            
            $data->funktion = $this->data['funktion'];
            $data->orget = $this->data['orget'];
			$data->mitarbeiter_uid = $this->data['mitarbeiter_uid'];
            $data->benutzerfunktionid = $this->data['benutzerfunktionid'];
            $data->vertragsbestandteiltyp_kurzbz = VertragsbestandteilFactory::VERTRAGSBESTANDTEIL_FUNKTION;
            
            $vbs = VertragsbestandteilFactory::getVertragsbestandteil($data);
        }
        
        $this->setVbsinstance($vbs);
    }
	protected function syncInstanceId()
	{
		parent::syncInstanceId();
		if( !$this->vbsinstance ) 
		{
			return;
		}
		
		if( intval($this->vbsinstance->getVertragsbestandteil_id()) > 0 ) 
		{
			$this->data['benutzerfunktionid'] = $this->vbsinstance->getBenutzerfunktion_id();
		}
	}
}