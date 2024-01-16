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

	protected $gbsInstance;
	
    public function __construct()
    {
        $this->type = self::TYPE_STRING;
        $this-> guioptions = ["id" => null, "infos" => [], "errors" => [], "removeable" => true];
        $this->data = [ 
						"id" => null,
						"gehaltstyp" => "",
                        "betrag" => "",
                        "gueltigkeit" => [
                            "guioptions" => ["sharedstatemode" => "reflect"],
                            "data" =>       ["gueltig_ab"      => "", "gueltig_bis" => ""]
                        ],
                        "valorisierung" => true
                      ];
    }

	public function getGbsInstance()
	{
		return $this->gbsInstance;
	}

	public function setGbsInstance($gbsInstance)
	{
		$this->gbsInstance = $gbsInstance;
		return $this;
	}

    public function mapJSON(&$decoded)
    {
        //$decoded = json_decode($jsondata);
        $this->checkType($decoded);
        $this->mapGUIOptions($decoded);
        $this->mapData($decoded);
    }

    private function mapData(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'data'))
        {
            throw new \Exception('missing data');
        }
        $this->getJSONDataInt($this->data['id'], $decodedData, 'id');
        $this->getJSONData($this->data['gehaltstyp'], $decodedData, 'gehaltstyp');
        $this->getJSONDataFloat($this->data['betrag'], $decodedData, 'betrag');
        $gueltigkeit = new GUIGueltigkeit();
        $gueltigkeit->mapJSON($decodedData['gueltigkeit']);
        $this->data['gueltigkeit'] = $gueltigkeit;
        $this->getJSONData($this->data['valorisierung'], $decodedData, 'valorisierung');
		$this->getJSONDataBool($this->data['db_delete'], $decodedData, 'db_delete');
		$this->getJSONData($this->data['valorisierungssperre'], $decodedData, 'valorisierungssperre');
		$this->getJSONDataInt($this->data['auszahlungen'], $decodedData, 'auszahlungen');
    }

    public function generateGehaltsbestandteil()
    {
		$handler = GUIHandler::getInstance();
        $gbs = null;
		$id = isset($this->data['id']) ? intval($this->data['id']) : 0;
        if ($id > 0)
        {
            // load VBS            
            $gbs =  $handler->GehaltsbestandteilLib->fetchGehaltsbestandteil($id);
             // merge
            $gbs->setGehaltstyp_kurzbz($this->data['gehaltstyp']);
            $gbs->setGrundbetrag($this->data['betrag']);
			// TODO take a look
            $gbs->setBetrag_valorisiert($this->data['betrag']);
            $gbs->setAuszahlungen($this->data['auszahlungen']);
			$gbs->setValorisierungssperre($this->data['valorisierungssperre']);
            $gbs->setValorisierung($this->data['valorisierung']);
            $gbs->setVon(string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']));
            $gbs->setBis(string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']));
        } else {

            $data = new stdClass();
            $data->von = string2Date($this->data['gueltigkeit']->getData()['gueltig_ab']);
            $data->bis = string2Date($this->data['gueltigkeit']->getData()['gueltig_bis']);
            
            $data->gehaltstyp_kurzbz = $this->data['gehaltstyp'];
            $data->grundbetrag = $this->data['betrag'];
			// TODO take a look
            $data->betrag_valorisiert = $this->data['betrag'];
			$data->auszahlungen = $this->data['auszahlungen'];			
            $data->valorisierungssperre = $this->data['valorisierungssperre'];
            $data->valorisierung = $this->data['valorisierung'];
            
            $gbs = new Gehaltsbestandteil();
            $gbs->hydrateByStdClass($data);
        }
        
        $this->setGbsInstance($gbs);
    }

	public function validate()
	{
		if( !($this->gbsInstance instanceof vertragsbestandteil\IValidation) )
		{			
			return;
		}
		
		if( !$this->gbsInstance->validate() )
		{
			$this->addGUIError($this->gbsInstance->getValidationErrors());
		}
	}
	
	public function jsonSerialize()
	{
		$this->syncInstanceId();
		return parent::jsonSerialize();
	}
	
	protected function syncInstanceId()
	{
		if( !$this->gbsInstance ) 
		{
			return;
		}
		
		if( intval($this->gbsInstance->getGehaltsbestandteil_id()) > 0 ) 
		{
			$this->data['id'] = $this->gbsInstance->getGehaltsbestandteil_id();
		}
	}
}