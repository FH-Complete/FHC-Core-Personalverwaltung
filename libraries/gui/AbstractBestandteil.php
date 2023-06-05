<?php

require_once  __DIR__.'/JSONData.php';

abstract class AbstractBestandteil implements JsonSerializable {

    use JSONData;

    /** @var string type of vertragsbestandteil (i.e. vertragsbestandteilstunden) */
    protected $type;
    /**
     * @var object might contain id and some data needed by the GUI (Error-Messages).
     * Contents depend heavily on type of vertragsbestandteil */
    protected $guioptions;
    /** @var object container for the real data */
    protected $data;

	public function __construct()
	{
		$this->type = '';
		$this->guioptions = array();
		$this->data = array();
	}

	
	public function getTypeString(): string
    {
        return static::TYPE_STRING;
    }
	
	public function jsonSerialize() {
        return [
            "type" => $this->type,
            "guioptions" => $this->guioptions,
            "data" => $this->data
		];
    }
	
	public function isValid() {
		return !$this->hasErrors();
	}
	
	abstract public function validate();
    abstract public function mapJSON(&$decoded);
	
    protected function mapGUIOptions(&$decoded)
    {
        $decodedGUIOptions = null;
        if (!$this->getJSONData($decodedGUIOptions, $decoded, 'guioptions'))
        {
            throw new \Exception('missing guioptions');
        }
		
        $this->guioptions = $decodedGUIOptions;
		$this->resetInfosAndErrors();
    }

	protected function resetInfosAndErrors() 
	{
		if( isset($this->guioptions['infos']) ) {
			$this->guioptions['infos'] = array();
		}
		
		if( isset($this->guioptions['errors']) ) {
			$this->guioptions['errors'] = array();
		}
	}
	
    public function addGUIInfo($infos)
    {
        if (!isset($this->guioptions['infos']))
        {
            $this->guioptions['infos'] = array();
        }
        if (is_array($infos))
        {
            $this->guioptions['infos'] = array_merge($this->guioptions['infos'], $infos);
        } else {
            $this->guioptions['infos'][] = $infos;
        }
    }
    
    public function addGUIError($errors)
    {
        if (!isset($this->guioptions['errors']))
        {
            $this->guioptions['errors'] = array();
        }
        if (is_array($errors))
        {
            $this->guioptions['errors'] = array_merge($this->guioptions['errors'], $errors);
        } else {
            $this->guioptions['errors'][] = $errors;
        }
    }

    /**
     * convenience method
     * @return boolean  true if there are validation error messages
     */
    public function hasErrors()
    {
        if (isset($this->guioptions['errors']) && count($this->guioptions['errors']) > 0)
        {
            return true;
        }
        return false;
    }

    /**
     * check type string ('vertragsbestandteilstunden', etc.)
     */
    public function checkType(&$decoded)
    {
        //var_dump($decoded['type']);
        if (!isset($decoded['type']) || (isset($decoded['type']) && $decoded['type'] !== $this->getTypeString()))
        {
            throw new \Exception('wrong type string: "'.$decoded['type'].'" should be "'.$this->getTypeString().'"');
        }
    }   

    /**
     * Get the value of type
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set the value of type
     */
    public function setType($type): self
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get the value of guioptions
     */
    public function getGuioptions()
    {
        return $this->guioptions;
    }

    /**
     * Set the value of guioptions
     */
    public function setGuioptions($guioptions): self
    {
        $this->guioptions = $guioptions;

        return $this;
    }

    /**
     * Get the value of data
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Set the value of data
     */
    public function setData($data): self
    {
        $this->data = $data;

        return $this;
    }
	
	public function hasToBeDeleted() {
		$toBeDeleted = (isset($this->data['db_delete'])) ? $this->data['db_delete'] :false;
		return $toBeDeleted;
	}
}