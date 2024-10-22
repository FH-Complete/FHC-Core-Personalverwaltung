<?php

defined('BASEPATH') || exit('No direct script access allowed');

class FristenAPI extends Auth_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:rw';
    const HANDYVERWALTUNG_PERMISSION = 'extension/pv21_handyverwaltung:rw';

    public function __construct() {
        parent::__construct(array(
            'getFristenListe' => FristenAPI::DEFAULT_PERMISSION,
            'getPersonFristenListe' => FristenAPI::DEFAULT_PERMISSION,
            'updateFristenListe' => FristenAPI::DEFAULT_PERMISSION,
            'getFristenStatus' => FristenAPI::DEFAULT_PERMISSION,
            'getFristenEreignisse' => FristenAPI::DEFAULT_PERMISSION,
            'updateFristStatus' => FristenAPI::DEFAULT_PERMISSION,
            'deleteFrist' => FristenAPI::DEFAULT_PERMISSION,
            'upsertFrist' => FristenAPI::DEFAULT_PERMISSION,
            'batchUpdateFristStatus' => FristenAPI::DEFAULT_PERMISSION
                
            )
        );
        $this->load->library('AuthLib');
        $this->load->library('extensions/FHC-Core-Personalverwaltung/fristen/FristenLib',
            null, 'FristenLib');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
        $this->load->model('ressource/Frist_model', 'FristModel');
        
    }

    public function getFristenListe()
    {
        $result = $this->FristenLib->getFristenListe();
        return $this->outputJson($result);
    }

    public function getPersonFristenListe($uid)
    {
	$all = filter_var($this->input->get('all'), FILTER_VALIDATE_BOOLEAN);
        $result = $this->FristenLib->getFristenListe($uid, $all);
        return $this->outputJson($result);
    }

    public function updateFristenListe()
    {
		$d = new DateTime();
		$result = $this->FristenLib->updateFristen($d);
        return $this->outputJson($result);
    }

    public function updateFristStatus()
    {
        $data = json_decode($this->input->raw_input_stream, true);

        $data['updateamum'] = 'NOW()';
		$data['updatevon'] = getAuthUID();
        $frist_id = $data['frist_id'];
		unset($data['frist_id']);
        unset($data['datum']);
        unset($data['ereignis_kurzbz']);
    	$result = $this->FristModel->update(
    		$frist_id,
    		$data
    	);

		if (isError($result))
			return $this->outputJsonError('Fehler beim Speichern von Friststatus');

		$frist = $this->FristModel->load($result->retval);

		if (hasData($frist))
			$this->outputJsonSuccess($frist->retval);
    }


    /**
     * update multiple deadlines at once
     */
    public function batchUpdateFristStatus()
    {
        if($this->input->method() === 'post')
        {
            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['fristen']) && !is_array($payload['fristen']))
                show_error('fristen does not seem to be an array!');

            $result = $this->FristModel->batchUpdateStatus($payload['fristen'], $payload['status_kurzbz'], getAuthUID());

            if ($result === true)
                $this->outputJsonSuccess($result);
            else
                $this->outputJsonError('Error when updating deadlines');

        } else {
            $this->output->set_status_header('405');
        }

    }

    public function upsertFrist()
    {
        if($this->input->method() === 'post'){

            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['frist_id']) && !is_numeric($payload['frist_id']))
                show_error('frist_id is not numeric!');

            if (!isset($payload['status_kurzbz']) || (isset($payload['status_kurzbz']) && $payload['status_kurzbz'] == ''))
                show_error('status_kurzbz is empty!');

            if (!isset($payload['ereignis_kurzbz']) || (isset($payload['ereignis_kurzbz']) && $payload['ereignis_kurzbz'] == ''))
                show_error('status_kurzbz is empty!');

            if (!isset($payload['mitarbeiter_uid']) || (isset($payload['mitarbeiter_uid']) && $payload['mitarbeiter_uid'] == ''))
                show_error('mitarbeiter_uid is empty!');

            if ($payload['frist_id'] == 0)
            {
                $payload['insertvon'] = getAuthUID();
                $payload['parameter'] = '{}';
                unset($payload['frist_id']);
                $result = $this->FristModel->insert($payload);
            } else {
                $payload['updateamum'] = 'NOW()';
		        $payload['updatevon'] = getAuthUID();
                unset($payload['insertamum']);
                unset($payload['insertvon']);
                $result = $this->FristModel->update($payload['frist_id'], $payload);
            }

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when updating deadline');
        } else {
            $this->output->set_status_header('405');
        }
    }





    public function getFristenStatus()
	{
		$result = $this->FristenLib->getFristenStatus();
		return $this->outputJson($result);
	}

    public function getFristenEreignisse()
	{
        $manuell = $this->input->get('manuell', FALSE);
		$result = $this->FristenLib->getFristenEreignis($manuell);
		return $this->outputJson($result);
	}

    public function deleteFrist()
    {
        if($this->input->method() === 'post')
        {
            $payload = json_decode($this->input->raw_input_stream, TRUE);

            if (isset($payload['frist_id']) && !is_numeric($payload['frist_id']))
                show_error('frist_id is not numeric!');

            $result = $this->FristModel->delete($payload['frist_id']);

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when deleting frist');

        } else {
            $this->output->set_status_header('405');
        }
    }

}