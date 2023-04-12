<?php



require_once __DIR__ . "/AbstractGUIVertragsbestandteil.php";
require_once __DIR__ . "/GUIGehaltsbestandteil.php";
require_once __DIR__ . "/GUIGueltigkeit.php";
//require_once __DIR__ . "/../VertragsbestandteilFactory.php";
//require_once __DIR__ . "/../Vertragsbestandteil.php";
//require_once __DIR__ .'/../VertragsbestandteilStunden.php';


use vertragsbestandteil\VertragsbestandteilFactory;
use vertragsbestandteil\VertragsbestandteilStunden;


class GUIVertragsbestandteilStunden extends AbstractGUIVertragsbestandteil implements JsonSerializable
{    
    const TYPE_STRING = "vertragsbestandteilstunden";

    public function __construct()
    {                
        $this->type = GUIVertragsbestandteilStunden::TYPE_STRING;
        $this->hasGBS = true;
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => true];
        $this->data = ["stunden" => "",
                       "gueltigkeit" => [
                           "guioptions" => ["sharedstatemode" => "reflect"],
                           "data" =>       ["gueltig_ab"      => "", "gueltig_bis" => ""]
                       ]
                      ];
        $this->gbs = [];
    }

    public function getTypeString(): string
    {
        return GUIVertragsbestandteilStunden::TYPE_STRING;
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
    private function mapData(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'data'))
        {
            throw new \Exception('missing data');
        }
        $res = $this->getJSONDataFloat($this->data['stunden'], $decodedData, 'stunden');
        if ($res === false)
        {
            throw new \Exception('could not read stunden');
        }
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

    public function generateVertragsbestandteil($id)
    {
        $vbs = null;
        if (isset($id) && $id > 0)
        {
            // load VBS            
            $vbs =  $this->vbsLib->fetchVertragsbestandteil($id);
             // merge
            $vbs->setWochenstunden($this->data['stunden']);
            $vbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
            $vbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));
        } else {

            $data = new stdClass();
            $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
            $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
            
            $data->wochenstunden = $this->data['stunden'];
            $data->vertragsbestandteiltyp_kurzbz = VertragsbestandteilFactory::VERTRAGSBESTANDTEIL_STUNDEN;
            
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
