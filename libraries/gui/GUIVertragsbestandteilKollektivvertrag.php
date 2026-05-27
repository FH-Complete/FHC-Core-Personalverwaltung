<?php

require_once __DIR__ . "/AbstractGUIVertragsbestandteil.php";

use vertragsbestandteil\VertragsbestandteilFactory;

/**
  *   "type": "vertragsbestandteilkollektivvertrag",
  *   "guioptions": {
  *     "id": "c71a803d-b8be-4fbc-82f1-381e1d01df2e",
  *     "removeable": true
  *   },
  *   "data": {
  *     "kollektivvertrag_kurzbz": "IT",
  *     "verwendungsgruppe_kurzbz": "VGI",
  *     "kv_jahre": "2",
  *     "kommentar": "Kommentar zur Einstufung der Person",
  *     "gueltigkeit": {
  *       "guioptions": {
  *         "sharedstatemode": "reflect"
  *       },
  *       "data": {
  *         "gueltig_ab": "1.1.2011",
  *         "gueltig_bis": ""
  *       }
  *     }
 */
class GUIVertragsbestandteilKollektivvertrag extends AbstractGUIVertragsbestandteil implements JsonSerializable
{    
    const TYPE_STRING = "vertragsbestandteilkollektivvertrag";

    public function __construct()
    {
        parent::__construct();
        $this->type = self::TYPE_STRING;
        $this->hasGBS = false;
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => true];
        $this->data = ["kollektivvertrag_kurzbz" => "IT",
                       "verwendungsgruppe_kurzbz" => "",
                       "kv_jahre" => "",
                       "kommentar" => "",
                       "gueltigkeit" => [
                           "guioptions" => ["sharedstatemode" => "reflect"],
                           "data" =>       ["gueltig_ab"      => "", "gueltig_bis" => ""]
                       ]
                      ];
    }

    /**    
     */
    protected function mapData(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'data'))
        {
            throw new \Exception('missing data');
        }
		$this->getJSONDataInt($this->data['id'], $decodedData, 'id');        
        $this->getJSONDataString($this->data['verwendungsgruppe_kurzbz'], $decodedData, 'verwendungsgruppe_kurzbz');
        $this->getJSONDataInt($this->data['kv_jahre'], $decodedData, 'kv_jahre');
        $this->getJSONDataString($this->data['kommentar'], $decodedData, 'kommentar');
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
		$this->getJSONDataBool($this->data['db_delete'], $decodedData, 'db_delete');
    }


    public function generateVBLibInstance() {
		$handler = GUIHandler::getInstance();
        /** @var vertragsbestandteil\VertragsbestandteilKollektivvertrag */
        $vbs = null;
		$id = isset($this->data['id']) ? intval($this->data['id']) : 0;
        if ($id > 0)
         {
             // load VBS
             $vbs =  $handler->VertragsbestandteilLib->fetchVertragsbestandteil($id);
             // merge
             $vbs->setKv_jahre($this->data['kv_jahre']);
             $vbs->setVerwendungsgruppe_kurzbz($this->data['verwendungsgruppe_kurzbz']);
             $vbs->setKommentar($this->data['kommentar']);
             $vbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
             $vbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));

         } else {
 
             $data = new stdClass();
             $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
             $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
             $data->kv_jahre = $this->data['kv_jahre'];
             $data->verwendungsgruppe_kurzbz = $this->data['verwendungsgruppe_kurzbz'];
             $data->kommentar = $this->data['kommentar'];
             $data->vertragsbestandteiltyp_kurzbz = VertragsbestandteilFactory::VERTRAGSBESTANDTEIL_KOLLEKTIVVERTRAG;
             
             $vbs = VertragsbestandteilFactory::getVertragsbestandteil($data);
 
         }
         
         $this->setVbsinstance($vbs);
    }
}