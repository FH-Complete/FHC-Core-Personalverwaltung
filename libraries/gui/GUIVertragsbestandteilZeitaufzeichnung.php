<?php

require_once __DIR__ . "/AbstractGUIVertragsbestandteil.php";
require_once __DIR__ . "/GUIGehaltsbestandteil.php";
require_once __DIR__ . "/GUIGueltigkeit.php";

use vertragsbestandteil\VertragsbestandteilFactory;

/**
 * ```
 * "type": "vertragsbestandteilzeitaufzeichnung",
 * "guioptions": {
 *   "id": "484f7166-7792-4cc7-b906-0db09c65bbf4",
 *   "removeable": true
 * },
 * "data": {
 *   "zeitaufzeichnung": true,
 *   "azgrelevant": false,
 *   "homeoffice": true,
 *   "gueltigkeit": {
 *     "guioptions": {
 *       "sharedstatemode": "reflect"
 *     },
 *     "data": {
 *       "gueltig_ab": "1.1.2010",
 *       "gueltig_bis": ""
 *     }
 *   }
 * }
 */
class GUIVertragsbestandteilZeitaufzeichnung extends AbstractGUIVertragsbestandteil implements JsonSerializable
{    
    const TYPE_STRING = "vertragsbestandteilzeitaufzeichnung";

    public function __construct()
    {
		parent::__construct();
        $this->type = self::TYPE_STRING;
        $this->hasGBS = false;
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => true];
        $this->data = null;
    }

    protected function mapData(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'data'))
        {
            throw new \Exception('missing data');
        }
        $this->getJSONDataBool($this->data['zeitaufzeichnung'], $decodedData, 'zeitaufzeichnung');
        $this->getJSONDataBool($this->data['azgrelevant'], $decodedData, 'azgrelevant');
        $this->getJSONDataBool($this->data['homeoffice'], $decodedData, 'homeoffice');
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
    }

    public function generateVBLibInstance() {
		$handler = GUIHandler::getInstance();
        /** @var vertragsbestandteil\VertragsbestandteilZeitaufzeichnung */
        $vbs = null;
		$id = isset($this->data['id']) ? inval($this->data['id']) : 0;
        if ($id > 0)
        {
            // load VBS            
            $vbs =  $handler->VertragsbestandteilLib->fetchVertragsbestandteil($id);
            // merge
            $vbs->setZeitaufzeichnung($this->data['zeitaufzeichnung']);
            $vbs->setAzgrelevant($this->data['azgrelevant']);
            $vbs->setHomeoffice($this->data['homeoffice']);
            $vbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
            $vbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));
        } else {

            $data = new stdClass();
            $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
            $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
            
            $data->zeitaufzeichnung = $this->data['zeitaufzeichnung'];
            $data->azgrelevant = $this->data['azgrelevant'];
            $data->homeoffice = $this->data['homeoffice'];
            $data->vertragsbestandteiltyp_kurzbz = VertragsbestandteilFactory::VERTRAGSBESTANDTEIL_ZEITAUFZEICHNUNG;
            
            $vbs = VertragsbestandteilFactory::getVertragsbestandteil($data);

        }
        
        $this->setVbsinstance($vbs);
    }
}