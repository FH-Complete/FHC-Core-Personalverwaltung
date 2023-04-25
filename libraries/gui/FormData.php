<?php

require_once __DIR__ . "/AbstractBestandteil.php";
require_once __DIR__ . "/GUIGueltigkeit.php";

class FormData extends AbstractBestandteil {

    const TYPE_STRING = "formdata";

    /** @var array GUI data */
    protected $children;
	/** @var array */
	protected $dv;
    /** @var array */
    protected $vbs = [];

    public function getTypeString(): string
    {
        return FormData::TYPE_STRING;
    }

    /**
     * read JSON and turn it into data structure
     */
    public function mapJSON(&$decoded)
    {
        $this->checkType($decoded);
        // preserve guioptions (only infos and errors can change)
        $this->mapGUIOptions($decoded);
        // preserve gui data
        $this->mapChildren($decoded);
        // data contains DV
        $this->mapDv($decoded);
        // vbs array
        $this->mapVbs($decoded);
    }


    public function generateJSON()
    {
        $json = json_encode([
            "type" => FormData::TYPE_STRING,
            "guioptions" => $this->guioptions,
            "children" => $this->children,
            "dv" => $this->dv,
            "vbs" => $this->vbs
        ]);
        return $json;
    }

    private function mapChildren(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($decodedData, $decoded, 'children'))
        {
            throw new \Exception('missing children');
        }
        $this->children = $decodedData;
    }

    private function mapDv(&$decoded)
    {
        $decodedData = null;
        if (!$this->getJSONData($this->dv, $decoded, 'dv'))
        {
            throw new \Exception('missing dv');
        }
    }

    private function mapVbs(&$decoded)
    {
        if (!$this->getJSONData($this->vbs, $decoded, 'vbs'))
        {
            throw new \Exception('missing vbs');
        }
        //$this->getJSONData($this->vbs, $decodedData, 'vbs');
    }


    /**
     * Get the value of children
     */
    public function getChildren()
    {
        return $this->children;
    }

	public function getDv() 
	{
		return $this->dv;
	}

    /**
     * Get the value of vbs
     */
    public function getVbs()
    {
        return $this->vbs;
    }

	public function setDv($dv)
	{
		$this->dv = $dv;
		
		return $this;
	}
	
    /**
     * Set the value of vbs
     */
    public function setVbs($vbs): self
    {
        $this->vbs = $vbs;

        return $this;
    }
}