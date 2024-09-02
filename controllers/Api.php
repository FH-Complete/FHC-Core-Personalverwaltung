<?php

use phpDocumentor\Reflection\Types\Boolean;

defined('BASEPATH') || exit('No direct script access allowed');

require_once dirname(__DIR__) . '/libraries/gui/GUIHandler.php';
require_once DOC_ROOT . '/include/' . EXT_FKT_PATH . '/generateuid.inc.php';

class Api extends Auth_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:rw';
    const HANDYVERWALTUNG_PERMISSION = 'extension/pv21_handyverwaltung:rw';
    

    public function __construct() {

        parent::__construct(
	    array(
		'index' => Api::DEFAULT_PERMISSION,	
		'saveKarenz'  => Api::DEFAULT_PERMISSION,
	    )
	);

		$this->load->config('extensions/FHC-Core-Personalverwaltung/pvdefaults');
		// Loads authentication library and starts authenticationfetc
		$this->load->library('AuthLib');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
       
    }

    function index()
    {
        $data = $this->ApiModel->fetch_all();
        $this->outputJsonSuccess($data->result_array());
    }


    /**
     * Search for employees. Used by employee chooser component.
     */
    function filter()
    {
        $searchString = $this->input->get('search', TRUE);
        $data = $this->ApiModel->filter($searchString);
        return $this->outputJson($data);
    }

    
    function saveKarenz()
    {
        $payload = json_decode($this->input->raw_input_stream);

        if (!is_numeric($payload->id))
        {
            $this->outputJsonError('invalid parameter vertragsbestandteil_id');
            return;
        }
		// TODO implement
/*
        $dv = $this->VertragsbestandteilLib->fetchDienstverhaeltnis(intval($payload->dienstverhaeltnisid));
        $ret = $this->VertragsbestandteilLib->endDienstverhaeltnis($dv, $payload->gueltigkeit->data->gueltig_bis);
*/
        if ( $ret !== TRUE) {
            return $this->outputJsonError($ret);
        }

        return $this->outputJsonSuccess('Karenz gespeichert');
    }
    

   

	


}
