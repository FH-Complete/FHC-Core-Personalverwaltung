<?php

require_once __DIR__ . "/AbstractGUIVertragsbestandteil.php";
require_once __DIR__ . "/GUIGehaltsbestandteil.php";
require_once __DIR__ . "/GUIGueltigkeit.php";

use vertragsbestandteil\VertragsbestandteilFactory;

/**
 * ```
 * "type": "vertragsbestandteilfreitext",
 * "guioptions": {
 *   "id": "b168a3bb-d0e2-407f-8192-525a5ab59b22",
 *   "removeable": true
 * },
 * "data": {
 *   "freitexttyp": "allin",
 *   "titel": "Lorem ipsum ",
 *   "freitext": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. \nAt vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. ",
 *   "gueltigkeit": {
 *     "guioptions": {
 *       "sharedstatemode": "reflect"
 *     },
 *     "data": {
 *       "gueltig_ab": "1.1.2010",
 *       "gueltig_bis": ""
 *     }
 *   }
 * },
 * "gbs": []```
 */
class GUIVertragsbestandteilFreitext extends AbstractGUIVertragsbestandteil implements JsonSerializable
{
    const TYPE_STRING = "vertragsbestandteilfreitext";

    public function __construct()
    {
        $this->type = GUIVertragsbestandteilFreitext::TYPE_STRING;
        $this->hasGBS = true;
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => true];
        $this->data = null;
        $this->gbs = [];
    }

    public function getTypeString(): string
    {
        return GUIVertragsbestandteilFreitext::TYPE_STRING;
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
    }

    /**
     * {
     *   "freitexttyp": "allin",
     *   "titel": "Lorem ipsum ",
     *   "freitext": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. \nAt vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. ",
     *   "kuendigungsrelevant": "",
     *   "gueltigkeit": {
     *     "guioptions": {
     *       "sharedstatemode": "reflect"
     *     },
     *     "data": {
     *       "gueltig_ab": "1.1.2010",
     *       "gueltig_bis": ""
     *     }
     */
    private function mapData(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'data'))
        {
            throw new \Exception('missing data');
        }
        $this->getJSONDataString($this->data['freitexttyp'], $decodedData, 'freitexttyp');
        $this->getJSONDataString($this->data['titel'], $decodedData, 'titel');
        $this->getJSONDataString($this->data['freitext'], $decodedData, 'freitext');
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
    }

    private function mapGBS(&$decoded)
    {
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
        /** @var vertragsbestandteil\VertragsbestandteilFreitext */
        $vbs = null;
         
        if (isset($id) && $id > 0)
        {
            // load VBS            
            $vbs =  $this->vbsLib->fetchVertragsbestandteil($vbsData['id']);
            // merge
            $vbs->setFreitexttyp($this->data['freitexttyp']);
            $vbs->setTitel($this->data['titel']);
            $vbs->setFreitext($this->data['freitext']);
            $vbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
            $vbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));

        } else {

            $data = new stdClass();
            $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
            $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
            
            $data->freitexttyp = $this->data['freitexttyp'];
            $data->titel = $this->data['titel'];
            $data->freitext = $this->data['freitext'];
            $data->vertragsbestandteiltyp_kurzbz = VertragsbestandteilFactory::VERTRAGSBESTANDTEIL_FREITEXT;
            
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