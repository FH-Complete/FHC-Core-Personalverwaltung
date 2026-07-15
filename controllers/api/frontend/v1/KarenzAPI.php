<?php

defined('BASEPATH') || exit('No direct script access allowed');


class KarenzAPI extends FHCAPI_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:rw';

    public function __construct() {

        parent::__construct(
	    array(		
		'saveKarenz'  => Api::DEFAULT_PERMISSION,
	    )
	);

		$this->load->config('extensions/FHC-Core-Personalverwaltung/pvdefaults');
		// Loads authentication library and starts authenticationfetc
		$this->load->library('AuthLib');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
       
    }


    function saveKarenz()
    {
        $payload = json_decode($this->input->raw_input_stream);

        if (!is_numeric($payload->id))
        {
            $this->terminateWithError('invalid parameter vertragsbestandteil_id');
            return;
        }
		// TODO implement
/*
        $dv = $this->VertragsbestandteilLib->fetchDienstverhaeltnis(intval($payload->dienstverhaeltnisid));
        $ret = $this->VertragsbestandteilLib->endDienstverhaeltnis($dv, $payload->gueltigkeit->data->gueltig_bis);
*/
        if ( $ret !== TRUE) {
            return $this->terminateWithError($ret);
        }

        return $this->terminateWithSuccess('Karenz gespeichert');
    }

}