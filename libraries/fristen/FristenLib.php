<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');


class FristenLib
{
	private $_ci; // Code igniter instance
    private $_insertvon = 'system';
	
	public function __construct()
	{
		$this->_ci =& get_instance();
        $this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Frist_model', 'FristModel');
	}

    public function updateFristen()
    {
        $dvEndFrist = new DVEndFrist();
        $result = $dvEndFrist->getData();
        
        foreach ($result as $rowData) {
            
            if (!$dvEndFrist->exists($rowData)) {

                $fristEreignis = $dvEndFrist->generateFristEreignis($rowData);
                $fristEreignis['insertvon'] = $this->_insertvon;
                $result = $this->FristModel->insert($fristEreignis);
        
                if (isError($result))
                {
                    return error($result->msg, EXIT_ERROR);
                }
            }
        }
    }
}    