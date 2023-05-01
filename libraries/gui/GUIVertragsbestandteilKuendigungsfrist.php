<?php

require_once __DIR__ . "/AbstractGUIVertragsbestandteil.php";

use vertragsbestandteil\VertragsbestandteilFactory;

/**
  *   "type": "vertragsbestandteilkuendigungsfrist",
  *   "guioptions": {
  *     "id": "c71a803d-b8be-4fbc-82f1-381e1d01df2e",
  *     "removeable": true
  *   },
  *   "data": {
  *     "arbeitgeber_frist": "8",
  *     "arbeitnehmer_frist": "4",
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
class GUIVertragsbestandteilKuendigungsfrist extends AbstractGUIVertragsbestandteil implements JsonSerializable
{    
    const TYPE_STRING = "vertragsbestandteilkuendigungsfrist";

    public function __construct()
    {
        parent::__construct();
        $this->type = self::TYPE_STRING;
        $this->hasGBS = false;
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => true];
        $this->data = ["arbeitnehmer_frist" => "",
                       "arbeitgeber_frist" => "",
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
        $this->getJSONDataInt($this->data['arbeitnehmer_frist'], $decodedData, 'arbeitnehmer_frist');
        $this->getJSONDataInt($this->data['arbeitgeber_frist'], $decodedData, 'arbeitgeber_frist');
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
    }


    public function generateVBLibInstance() {
		$handler = GUIHandler::getInstance();
        /** @var vertragsbestandteil\VertragsbestandteilKuendigungsfrist */
        $vbs = null;
		$id = isset($this->data['id']) ? inval($this->data['id']) : 0;
        if ($id > 0)
         {
             // load VBS            
             $vbs =  $handler->VertragsbestandteilLib->fetchVertragsbestandteil($id);
             // merge
             $vbs->setArbeitgeberFrist($this->data['arbeitgeber_frist']);
             $vbs->setArbeitnehmerFrist($this->data['arbeitnehmer_frist']);
             $vbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
             $vbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));

         } else {
 
             $data = new stdClass();
             $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
             $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
             
             $data->arbeitgeber_frist = $this->data['arbeitgeber_frist'];
             $data->arbeitnehmer_frist = $this->data['arbeitnehmer_frist'];
             $data->vertragsbestandteiltyp_kurzbz = VertragsbestandteilFactory::VERTRAGSBESTANDTEIL_KUENDIGUNGSFRIST;
             
             $vbs = VertragsbestandteilFactory::getVertragsbestandteil($data);
 
         }
         
         $this->setVbsinstance($vbs);
    }
}