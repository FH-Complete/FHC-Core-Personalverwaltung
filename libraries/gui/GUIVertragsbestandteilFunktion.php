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
        $this->type = GUIVertragsbestandteilFunktion::TYPE_STRING;        
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => false];
        $this->data = [
                       "gueltigkeit" => [
                           "guioptions" => ["sharedstatemode" => "reflect"],
                           "data" =>       ["gueltig_ab"      => "", "gueltig_bis" => ""]
                       ]
                      ];
        $this->gbs = [];
    }

    public function getTypeString(): string
    {
        return GUIVertragsbestandteilFunktion::TYPE_STRING;
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
        $this->mapGBS($decoded);
    }

    /**
     * ["id" => null, 
     *  "infos" => [], 
     *  "errors" => [], 
     *  "removeable" => true
     * ]
     * @param mixed $decoded decoded JSON data (use associative array)
     */
    private function mapGUIOptions(&$decoded)
    {
        $decodedGUIOptions = null;
        if (!$this->getJSONData($decodedGUIOptions, $decoded, 'guioptions'))
        {
            throw new \Exception('missing guioptions');
        }
        $this->getJSONData($this->guioptions, $decodedGUIOptions, 'id');
        $this->getJSONData($this->guioptions, $decodedGUIOptions, 'infos');
        $this->getJSONData($this->guioptions, $decodedGUIOptions, 'errors');
        $this->getJSONDataBool($this->guioptions, $decodedGUIOptions, 'removable');
        $this->guioptions['canhavegehaltsbestandteile'] = $this->getHasGBS();
        $this->getJSONData($this->guioptions, $decodedGUIOptions, 'disabled');
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
    private function mapData(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'data'))
        {
            throw new \Exception('missing data');
        }
        $this->getJSONData($this->data['funktion'], $decodedData, 'funktion');
        $this->getJSONData($this->data['orget'], $decodedData, 'orget');
		$this->getJSONData($this->data['mitarbeiter_uid'], $decodedData, 'mitarbeiter_uid');
        $this->getJSONData($this->data['benutzerfunktionid'], $decodedData, 'benutzerfunktionid');
        
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
    }

    private function mapGBS(&$decoded)
    {
        //echo "gbs: ";var_dump($decoded);
        $decodedGbsList = [];
        if (!$this->getJSONData($decodedGbsList, $decoded, 'gbs'))
        {
            throw new \Exception('missing gbs');
        }
        $guiGBS = null;
        foreach ($decodedGbsList as $decodedGbs) {
            $guiGBS = new GUIGehaltsbestandteil();
            $guiGBS->mapJSON($decodedGbs);
            $this->gbs[] = $guiGBS;
        }
    }


    public function generateVertragsbestandteil($id) {
        /** @var vertragsbestandteil\VertragsbestandteilFunktion */
        $vbs = null;
        if (isset($id) && $id > 0)
        {
            // load VBS            
            $vbs =  $this->vbsLib->fetchVertragsbestandteil($id);
            // merge
			/**
			 * @todo refactor update
			 */
            $vbs->setFunktion($this->data['funktion']);
            $vbs->setOrget($this->data['orget']);
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
        
        return $vbs;
    }

    public function jsonSerialize() {
        return [
            "type" => $this->type,
            "guioptions" => $this->guioptions,
            "data" => $this->data,
            "gbs" => $this->gbs];
    }

}