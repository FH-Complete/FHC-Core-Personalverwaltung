<?php

require_once __DIR__ . "/AbstractGUIVertragsbestandteil.php";

use vertragsbestandteil\VertragsbestandteilFactory;

/**
  *   "type": "vertragsbestandteillohnguide",
  *   "guioptions": {
  *     "id": "c71a803d-b8be-4fbc-82f1-381e1d01df2e",
  *     "removeable": true
  *   },
  *   "data": {
  *     "stellenbezeichnung": "Studienassistent",
  *     "fachrichtung_kurzbz": "FA01",
  *     "modellstelle_kurzbz": "211",
  *     "kommentar_person": "Kommentar zur Person",
  *     "kommentar_modellstelle": "Kommentar zur Modellstelle",
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
class GUIVertragsbestandteilLohnguide extends AbstractGUIVertragsbestandteil implements JsonSerializable
{    
    const TYPE_STRING = "vertragsbestandteillohnguide";

    public function __construct()
    {
        parent::__construct();
        $this->type = self::TYPE_STRING;
        $this->hasGBS = false;
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => true];
        $this->data = ["stellenbezeichnung" => "",
                       "vordienstzeit" => null,
                       "fachrichtung_kurzbz" => "",
                       "modellstelle_kurzbz" => "",
                       "kommentar_person" => "",
                       "kommentar_modellstelle" => "",
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
        $this->getJSONDataString($this->data['stellenbezeichnung'], $decodedData, 'stellenbezeichnung');
        $this->getJSONDataInt($this->data['vordienstzeit'], $decodedData, 'vordienstzeit');
        $this->getJSONDataString($this->data['fachrichtung_kurzbz'], $decodedData, 'fachrichtung_kurzbz');
        $this->getJSONDataString($this->data['modellstelle_kurzbz'], $decodedData, 'modellstelle_kurzbz');
        $this->getJSONDataString($this->data['kommentar_person'], $decodedData, 'kommentar_person');
        $this->getJSONDataString($this->data['kommentar_modellstelle'], $decodedData, 'kommentar_modellstelle');
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
		$this->getJSONDataBool($this->data['db_delete'], $decodedData, 'db_delete');
    }


    public function generateVBLibInstance() {
		$handler = GUIHandler::getInstance();
        /** @var vertragsbestandteil\VertragsbestandteilLohnguide */
        $vbs = null;
		$id = isset($this->data['id']) ? intval($this->data['id']) : 0;
        if ($id > 0)
         {
             // load VBS
             $vbs =  $handler->VertragsbestandteilLib->fetchVertragsbestandteil($id);
             // merge
             $vbs->setStellenbezeichnung($this->data['stellenbezeichnung']);
             $vbs->setVordienstzeit($this->data['vordienstzeit']);
             $vbs->setFachrichtung_kurzbz($this->data['fachrichtung_kurzbz']);
             $vbs->setModellstelle_kurzbz($this->data['modellstelle_kurzbz']);
             $vbs->setKommentar_person($this->data['kommentar_person']);
             $vbs->setKommentar_modellstelle($this->data['kommentar_modellstelle']);
             $vbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
             $vbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));

         } else {
 
             $data = new stdClass();
             $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
             $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
             
             $data->stellenbezeichnung = $this->data['stellenbezeichnung'];
             $data->vordienstzeit = $this->data['vordienstzeit'];
             $data->fachrichtung_kurzbz = $this->data['fachrichtung_kurzbz'];
             $data->modellstelle_kurzbz = $this->data['modellstelle_kurzbz'];
             $data->kommentar_person = $this->data['kommentar_person'];
             $data->kommentar_modellstelle = $this->data['kommentar_modellstelle'];
             $data->vertragsbestandteiltyp_kurzbz = VertragsbestandteilFactory::VERTRAGSBESTANDTEIL_LOHNGUIDE;
             
             $vbs = VertragsbestandteilFactory::getVertragsbestandteil($data);
 
         }
         
         $this->setVbsinstance($vbs);
    }
}