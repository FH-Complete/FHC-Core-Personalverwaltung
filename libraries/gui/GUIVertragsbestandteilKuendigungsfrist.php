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
        $this->type = GUIVertragsbestandteilKuendigungsfrist::TYPE_STRING;
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

    public function getTypeString(): string
    {
        return GUIVertragsbestandteilKuendigungsfrist::TYPE_STRING;
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
        $this->getJSONDataInt($this->data['arbeitnehmer_frist'], $decodedData, 'arbeitnehmer_frist');
        $this->getJSONDataInt($this->data['arbeitgeber_frist'], $decodedData, 'arbeitgeber_frist');
        $this->getJSONData($this->data['gueltigkeit'], $decodedData, 'gueltigkeit');
    }


    public function generateVertragsbestandteil($id) {
         /** @var vertragsbestandteil\VertragsbestandteilKuendigungsfrist */
         $vbs = null;
         
         if (isset($vbsData['id']) && $vbsData['id'] > 0)
         {
             // load VBS            
             $vbs =  $this->vbsLib->fetchVertragsbestandteil($vbsData['id']);
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
         
         return $vbs;
    }

    public function jsonSerialize() {
        return [
            "type" => $this->type,
            "guioptions" => $this->guioptions,
            "data" => $this->data];
    }

}