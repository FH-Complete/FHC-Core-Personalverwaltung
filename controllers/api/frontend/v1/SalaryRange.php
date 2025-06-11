<?php

defined('BASEPATH') || exit('No direct script access allowed');


class SalaryRange extends FHCAPI_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';
    // code igniter
    protected $CI;

    public function __construct() {

        parent::__construct(
			array(
				'index' => Self::DEFAULT_PERMISSION,
				'getAll' => Self::DEFAULT_PERMISSION,
				'getSalaryRangeList' => Self::DEFAULT_PERMISSION,
				'upsertBetrag' => Self::DEFAULT_PERMISSION,
				'deleteBetrag' => Self::DEFAULT_PERMISSION,
			)
		);

		// Loads authentication library and starts authenticationfetc
		$this->load->library('AuthLib');

        $this->load->model('extensions/FHC-Core-Personalverwaltung/SalaryRange_model','SalaryRangeModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/SalaryRangeBetrag_model','SalaryRangeBetragModel');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/SalaryRangeFunktion_model','SalaryRangeFunktionModel');
		$this->load->model('person/Person_model','PersonModel');
        $this->load->model('person/Benutzer_model', 'BenutzerModel');

        // get CI for transaction management
        $this->CI = &get_instance();
    }

    public function index()
    {
		$this->terminateWithSuccess('not implemented');
	}


	public function getAll()
	{
		$von = $this->input->get('von', null);
		$bis = $this->input->get('bis', null);
		if ($von == null || $bis == null) {
        	$rows = $this->SalaryRangeModel->getAll();
		} else {
			$rows = $this->SalaryRangeModel->getAllByDateRange($von, $bis);
		}
		if( !isError($rows) )
		{
			$this->terminateWithSuccess(getData($rows) ?? []);
		}
		else
		{
			$this->terminateWithError('no salary ranges found');
		}
	}

	public function getSalaryRangeList()
	{
		$this->SalaryRangeModel->resetQuery();
		$this->SalaryRangeModel->addSelect('gehaltsband_kurzbz,bezeichnung');
		$this->SalaryRangeModel->addOrder('sort', 'ASC');
		$rows = $this->SalaryRangeModel->loadWhere(array('aktiv' => true));
		if( hasData($rows) )
		{
			$this->terminateWithSuccess(getData($rows) ?? []);
		}
		else
		{
			$this->terminateWithError('no salary ranges found');
		}
	}

	public function deleteBetrag($betrag_id)
	{
		if($this->input->method() === 'post')
        {

            if (isset($betrag_id) && !is_numeric($betrag_id))
                show_error('betrag_id is not numeric!');

            $result = $this->SalaryRangeBetragModel->deleteSalaryRangeBetrag($betrag_id);

            if (isSuccess($result))
			    $this->terminateWithSuccess(getData($result));
		    else
			    $this->terminateWithError('Error when deleting salary range data');

        } else {
            $this->terminateWithError('method not allowed',REST_Controller::HTTP_METHOD_NOT_ALLOWED);
        }
	}

	public function upsertBetrag()
	{
		if($this->input->method() === 'post'){

            $payload = json_decode($this->input->raw_input_stream, TRUE);

			unset($payload['bezeichnung']);
			unset($payload['action']);
			unset($payload['aktiv']);
			unset($payload['sort']);

            if (isset($payload['gehaltsband_betrag_id']) && !is_numeric($payload['gehaltsband_betrag_id']))
                show_error('gehaltsband_betrag_id is not numeric!');

            if (!isset($payload['gehaltsband_kurzbz']) || (isset($payload['gehaltsband_kurzbz']) && $payload['gehaltsband_kurzbz'] == ''))
                show_error('gehaltsband_kurzbz is empty!');

            if ($payload['gehaltsband_betrag_id'] == 0)
            {
                $result = $this->SalaryRangeBetragModel->insertSalaryRangeBetrag($payload);
            } else {
                $result = $this->SalaryRangeBetragModel->updateSalaryRangeBetrag($payload);
            }

            if (isSuccess($result))
			    $this->terminateWithSuccess(getData($result));
		    else
			    $this->terminateWithError('Error when updating salary range');
        } else {
            $this->terminateWithError('method not allowed',REST_Controller::HTTP_METHOD_NOT_ALLOWED);
        }
	}


	



}