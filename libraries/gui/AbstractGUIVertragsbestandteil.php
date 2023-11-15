<?php

require_once __DIR__ . "/AbstractBestandteil.php";
    
/**
 * Wrapper for Vertragsbestandteil in JSON schema produced by the GUI.
 * Example:
 * ```{ "bb09324f-19f6-41d2-a371-388ef8fdb49e": {
 *      "type": "vertragsbestandteil",
 *      "guioptions": {
 *         "id": "bb09324f-19f6-41d2-a371-388ef8fdb49e",
 *         "infos": [
 *           "test info 1",
 *           "test info 2"
 *         ],
 *         "errors": [
 *           "test error 1",
 *           "test error 2"
 *         ]
 *       },
 *       "data": {
 *          "stunden": "38,5",
 *          "gueltigkeit": {
 *            "guioptions": {
 *              "sharedstatemode": "ignore"
 *            },
 *            "data": {
 *              "gueltig_ab": "1.1.2011",
 *              "gueltig_bis": "31.12.2014"
 *            }
 *          }
 *        },
 *       },
 *       "gbs": [
 *         {
 *           "type": "gehaltsbestandteil",
 *           "guioptions": {
 *             "infos": [
 *               "test info 1",
 *               "test info 2"
 *             ],
 *             "errors": [
 *               "test error 1",
 *               "test error 2"
 *             ]
 *           },
 *           "data": {
 *             "gehaltstyp": "",
 *             "betrag": "3333",
 *             "gueltigkeit": {
 *               "guioptions": {
 *                 "sharedstatemode": "ignore"
 *               },
 *               "data": {
 *                 "gueltig_ab": "1.1.2011",
 *                 "gueltig_bis": "31.12.2014"
 *               }
 *             },
 *             "valorisierung": ""
 *           }
 *         }
 *       ]
 * }```
 */
abstract class AbstractGUIVertragsbestandteil extends AbstractBestandteil
{

    /** @var string hashkey */
    protected $uuid;
    
    /** @var boolean does this vertragsbestandteil have a GBS array? */
    protected $hasGBS = false;
    /** @var array{GUIGehaltsbestandteil} gehaltsbestandteile connected to current vertragsbestandteil */
    protected $gbs;
	
	protected $vbsinstance;
	
    public function __construct()
    {
		$this->gbs = array();
    }

    abstract public function generateVBLibInstance();

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

    protected function mapGBS(&$decoded)
    {
		if( !$this->getHasGBS() )
		{
			return;
		}
		
        $decodedGbsList = [];
        if (!$this->getJSONData($decodedGbsList, $decoded, 'gbs'))
        {
            throw new \Exception('missing gbs');
        }
        $guiGBS = null;
        foreach ($decodedGbsList as $decodedGbs) {
            $guiGBS = new GUIGehaltsbestandteil();
            $guiGBS->mapJSON($decodedGbs);
			$guiGBS->generateGehaltsbestandteil();
			//$guiGBS->validate(); 2023-10-23 validate in Helper
            $this->gbs[] = $guiGBS;
        }
    }
	
    public function jsonSerialize() {
		$this->syncInstanceId();
		$this->updateGuiOptions();
        $json = [
            "type" => $this->type,
            "guioptions" => $this->guioptions,
            "data" => $this->data
		];
		if( $this->getHasGBS() ) 
		{
			$json["gbs"] = $this->gbs;
		}
		return $json;
    }
	
	public function getVbsinstance()
	{
		return $this->vbsinstance;
	}

	public function setVbsinstance($vbsinstance)
	{
		$this->vbsinstance = $vbsinstance;
		return $this;
	}
	
    /**
     * Get the value of uuid
     */
    public function getUuid()
    {
        return $this->uuid;
    }

    /**
     * Set the value of uuid
     */
    public function setUuid($uuid): self
    {
        $this->uuid = $uuid;

        return $this;
    }

    /**
     * Get the value of hasGBS
     */
    public function getHasGBS()
    {
        return $this->hasGBS;
    }

    /**
     * Set the value of hasGBS
     */
    public function setHasGBS($hasGBS): self
    {
        $this->hasGBS = $hasGBS;

        return $this;
    }

    /**
     * Get the value of gbs
     */
    public function getGbs()
    {
        return $this->gbs;
    }

    /**
     * Set the value of gbs
     */
    public function setGbs($gbs): self
    {
        $this->gbs = $gbs;

        return $this;
    }

	public function removeDeletedGbs() {
		$reindex = false;
		foreach( $this->gbs as $idx => $gb ) {
			if( $gb->hastoBeDeleted() ) {
				unset($this->gbs[$idx]);
				$reindex = true;
			}
		}
		if($reindex)
		{
			$this->gbs = array_values($this->gbs);
		}
	}
	
	public function validate()
	{
		if( !($this->vbsinstance instanceof vertragsbestandteil\IValidation) )
		{			
			return;
		}
		
		if( !$this->vbsinstance->validate() )
		{
			$this->addGUIError($this->vbsinstance->getValidationErrors());
		}
	}
	
	public function isValid()
	{
		$valid = !$this->hasErrors();
		foreach ($this->gbs as $gb)
		{
			$valid = (!$gb->isValid()) ? false : $valid;
		}
		return $valid;
	}
	
	protected function syncInstanceId()
	{
		if( !$this->vbsinstance ) 
		{
			return;
		}
		
		if( intval($this->vbsinstance->getVertragsbestandteil_id()) > 0 ) 
		{
			$this->data['id'] = $this->vbsinstance->getVertragsbestandteil_id();
		}
	}
}    