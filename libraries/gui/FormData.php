<?php

require_once __DIR__ . "/AbstractBestandteil.php";
require_once __DIR__ . "/GUIGueltigkeit.php";

class FormData extends AbstractBestandteil {

    const TYPE_STRING = "formdata";

    /** @var array GUI data */
    protected $children;
	/** @var GUIDienstverhaeltnis */
	protected $dv;
    /** @var array */
    protected $vbs = [];

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


    public function jsonSerialize()
    {
        return [
            "type"			=> $this->getTypeString(),
            "guioptions"	=> $this->guioptions,
            "children"		=> $this->children,
            "dv"			=> $this->dv,
            "vbs"			=> $this->vbs
        ];
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
        if (!$this->getJSONData($decodedData, $decoded, 'dv'))
        {
            throw new \Exception('missing dv');
        }
        $this->dv = new GUIDienstverhaeltnis();
		$this->dv->mapJSON($decodedData);		
		$this->dv->generateVBLibInstance();
		$this->dv->validate();
    }

    private function mapVbs(&$decoded)
    {
		$decodedData = array();
        if (!$this->getJSONData($decodedData, $decoded, 'vbs'))
        {
            throw new \Exception('missing vbs');
        }
        
		foreach ($decodedData as $vbid => $vbs)
		{
		    $vbsMapper = GUIHandlerFactory::getGUIHandler($vbs['type']);
			$vbsMapper->mapJSON($vbs);
			$vbsMapper->generateVBLibInstance();
			$vbsMapper->validate();
			$this->vbs[$vbid] = $vbsMapper;
		}
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
	
	public function isValid()
	{
		$valid = $this->dv->isValid();
		foreach ($this->vbs as $vb)
		{
			$valid = (!$vb->isValid()) ? false : $valid;
		}
		return $valid;
	}
	
	public function validate()
	{
		return;
	}
}