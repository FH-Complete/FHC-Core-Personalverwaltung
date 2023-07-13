<?php
require_once __DIR__ . "/AbstractGUIVertragsbestandteil.php";
require_once __DIR__ . "/GUIGehaltsbestandteil.php";
require_once __DIR__ . "/GUIGueltigkeit.php";
//require_once __DIR__ . "/../VertragsbestandteilFactory.php";
//require_once __DIR__ . "/../Vertragsbestandteil.php";
//require_once __DIR__ .'/../VertragsbestandteilStunden.php';


use vertragsbestandteil\VertragsbestandteilFactory;
use vertragsbestandteil\VertragsbestandteilStunden;


class GUIVertragsbestandteilStunden extends AbstractGUIVertragsbestandteil
{    
    const TYPE_STRING = "vertragsbestandteilstunden";

    public function __construct()
    {                
		parent::__construct();
        $this->type = self::TYPE_STRING;
        $this->hasGBS = true;
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => true];
        $this->data = ["id" => null, "stunden" => "",
                       "gueltigkeit" => [
                           "guioptions" => ["sharedstatemode" => "reflect"],
                           "data" =>       ["gueltig_ab"      => "", "gueltig_bis" => ""]
                       ]
                      ];
        $this->gbs = [];
    }

    /**
     * {
     *   "stunden": "38,5",
     *   "gueltigkeit": {
     *     "guioptions": {
     *       "sharedstatemode": "reflect"
     *     },
     *     "data": {
     *       "gueltig_ab": "1.1.2011",
     *       "gueltig_bis": ""
     *     }
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
        $this->getJSONDataFloat($this->data['stunden'], $decodedData, 'stunden');
		$this->getJSONDataString($this->data['teilzeittyp_kurzbz'], $decodedData, 'teilzeittyp_kurzbz');

        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
		$this->getJSONDataBool($this->data['db_delete'], $decodedData, 'db_delete');
    }

    public function generateVBLibInstance()
    {
		$handler = GUIHandler::getInstance();
        $vbs = null;
		$id = isset($this->data['id']) ? intval($this->data['id']) : 0;
        if ($id > 0)
        {
            // load VBS            
            $vbs =  $handler->VertragsbestandteilLib->fetchVertragsbestandteil($id);
             // merge
            $vbs->setWochenstunden($this->data['stunden']);
			$vbs->setTeilzeittyp_kurzbz($this->data['teilzeittyp_kurzbz']);
            $vbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
            $vbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));
        } else {

            $data = new stdClass();
            $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
            $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
            
            $data->wochenstunden = $this->data['stunden'];
			$data->teilzeittyp_kurzbz = $this->data['teilzeittyp_kurzbz'];
            $data->vertragsbestandteiltyp_kurzbz = VertragsbestandteilFactory::VERTRAGSBESTANDTEIL_STUNDEN;
            
            $vbs = VertragsbestandteilFactory::getVertragsbestandteil($data);            
        }
        
        $this->setVbsinstance($vbs);
    }
}
