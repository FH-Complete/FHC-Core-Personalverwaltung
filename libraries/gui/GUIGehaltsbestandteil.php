<?php

use vertragsbestandteil\Gehaltsbestandteil;

require_once __DIR__ . "/AbstractBestandteil.php";
require_once __DIR__ . "/GUIGueltigkeit.php";

/**
 * {
 *   "type": "gehaltsbestandteil",
 *   "guioptions": {
 *     "id": "66246b54-9a42-43e8-b6d3-a541688ebb6e",
 *     "removeable": true
 *   },
 *   "data": {
 *     "gehaltstyp": "zulage",
 *     "betrag": "100",
 *     "gueltigkeit": {
 *       "guioptions": {
 *         "sharedstatemode": "reflect"
 *       },
 *       "data": {
 *         "gueltig_ab": "1.1.2011",
 *         "gueltig_bis": ""
 *       }
 *     },
 *     "valorisierung": ""
 * }
 */
class GUIGehaltsbestandteil extends AbstractBestandteil {

    const TYPE_STRING = "gehaltsbestandteil";

    /** @var GehaltsbestandteilLib */
    protected $gbsLib;

    public function __construct()
    {
        $this->gbsLib = new GehaltsbestandteilLib();
        $this->type = GUIVertragsbestandteilStunden::TYPE_STRING;
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => true];
        $this->data = [ "gehaltstyp" => "",
                        "betrag" => "",
                        "gueltigkeit" => [
                            "guioptions" => ["sharedstatemode" => "reflect"],
                            "data" =>       ["gueltig_ab"      => "", "gueltig_bis" => ""]
                        ],
                        "valorisierung" => true
                      ];
    }

    public function getTypeString(): string
    {
        return GUIGehaltsbestandteil::TYPE_STRING;
    }

    public function mapJSON(&$decoded)
    {
        //$decoded = json_decode($jsondata);
        $this->checkType($decoded);
        $this->mapGUIOptions($decoded);
        $this->mapData($decoded);
    }

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
        $this->getJSONData($this->guioptions, $decodedGUIOptions, 'removable');
    }

    private function mapData(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'data'))
        {
            throw new \Exception('missing data');
        }
        $this->getJSONData($this->data['id'], $decodedData, 'id');
        $this->getJSONData($this->data['gehaltstyp'], $decodedData, 'gehaltstyp');
        $this->getJSONDataInt($this->data['betrag'], $decodedData, 'betrag');
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
        $this->getJSONData($this->data['valorisierung'], $decodedData, 'valorisierung');
    }

    public function generateGehaltsbestandteil($id)
    {
        $gbs = null;
        if (isset($id) && $id > 0)
        {
            // load VBS            
            $gbs =  $this->gbsLib->fetchGehaltsbestandteil($id);
             // merge
            $gbs->setGehaltstyp_kurzbz($this->data['gehaltstyp_kurzbz']);
            $gbs->setGrundbetrag($this->data['grundbetrag']);
            $gbs->setBetrag_valorisiert($this->data['betrag_valorisiert']);
            $gbs->setValorisierungssperre($this->data['valorisierungssperre']);
            $gbs->setValorisierung($this->data['valorisierung']);            
            $gbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
            $gbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));
        } else {

            $data = new stdClass();
            $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
            $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
            
            $data->gehaltstyp_kurzbz = $this->data['gehaltstyp_kurzbz'];
            $data->grundbetrag = $this->data['grundbetrag'];
            $data->betrag_valorisiert = $this->data['betrag_valorisiert'];
            $data->valorisierungssperre = $this->data['valorisierungssperre'];
            $data->valorisierung = $this->data['valorisierung'];
            
            $gbs = new Gehaltsbestandteil();
            $gbs->hydrateByStdClass($data);
        }
        
        return $gbs;
    }

}