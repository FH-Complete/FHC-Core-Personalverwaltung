<?php
require_once __DIR__ . "/AbstractGUIVertragsbestandteil.php";
require_once __DIR__ . "/GUIGehaltsbestandteil.php";
require_once __DIR__ . "/GUIGueltigkeit.php";

use vertragsbestandteil\VertragsbestandteilFactory;
use vertragsbestandteil\VertragsbestandteilKarenz;

class GUIVertragsbestandteilKarenz extends AbstractGUIVertragsbestandteil
{    
    const TYPE_STRING = "vertragsbestandteilkarenz";

    public function __construct()
    {                
		parent::__construct();
        $this->type = self::TYPE_STRING;
        $this->hasGBS = true;
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => true];
        $this->data = ["id" => null, "karenztyp_kurzbz" => "", "geplanter_geburtstermin" => "", 
                       "tatsaechlicher_geburtstermin" => "",
                       "gueltigkeit" => [
                           "guioptions" => ["sharedstatemode" => "reflect"],
                           "data" =>       ["gueltig_ab"      => "", "gueltig_bis" => ""]
                       ]
                      ];
        $this->gbs = [];
    }

    protected function mapData(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'data'))
        {
            throw new \Exception('missing data');
        }
		$this->getJSONDataInt($this->data['id'], $decodedData, 'id');
        $this->getJSONDataString($this->data['karenztyp_kurzbz'], $decodedData, 'karenztyp_kurzbz');
        $this->getJSONData($this->data['geplanter_geburtstermin'], $decodedData, 'geplanter_geburtstermin');
        $this->getJSONData($this->data['tatsaechlicher_geburtstermin'], $decodedData, 'tatsaechlicher_geburtstermin');
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
            $vbs->setKarenztypKurzbz($this->data['karenztyp_kurzbz']);
            $vbs->setGeburtstermin(string2Date($this->data['tatsaechlicher_geburtstermin']));
            $vbs->setGeburtsterminGeplant(string2Date($this->data['geplanter_geburtstermin']));            
            $vbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
            $vbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));
        } else {

            $data = new stdClass();
            $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
            $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
            
            $data->karenztyp_kurzbz = $this->data['karenztyp_kurzbz'];
            $data->geplanter_geburtstermin = $this->data['geplanter_geburtstermin'];
            $data->tatsaechlicher_geburtstermin = $this->data['tatsaechlicher_geburtstermin'];
            $data->vertragsbestandteiltyp_kurzbz = VertragsbestandteilFactory::VERTRAGSBESTANDTEIL_KARENZ;
            
            $vbs = VertragsbestandteilFactory::getVertragsbestandteil($data);            
        }
        
        $this->setVbsinstance($vbs);
    }
}
