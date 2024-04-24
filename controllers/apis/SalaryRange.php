<?php

defined('BASEPATH') || exit('No direct script access allowed');


class SalaryRange extends Auth_Controller
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

    function index()
    {}

	/**
	 * query all salary range data for easy gui handling
	 */
    /*function getAll()
    {
        $this->SalaryRangeModel->resetQuery();
		$this->SalaryRangeModel->addSelect('gehaltsband_betrag_id,gehaltsband_kurzbz,bezeichnung,aktiv,sort,von,bis,betrag_von,betrag_bis');
		$this->SalaryRangeModel->addJoin('hr.tbl_gehaltsband_betrag', 'gehaltsband_kurzbz');
		$this->SalaryRangeModel->addOrder('sort', 'ASC');
		$rows = $this->SalaryRangeModel->loadWhere(array('aktiv' => true));
		if( hasData($rows) )
		{
			$this->outputJson($rows);
			return;
		}
		else
		{
			$this->outputJsonError('no salary ranges found');
			return;
		}
    }  */

	function getAll()
	{
        $rows = $this->SalaryRangeModel->getAll();
		if( hasData($rows) )
		{
			$this->outputJson($rows);
		}
		else
		{
			$this->outputJsonError('no salary ranges found');
		}
	}

	function getSalaryRangeList()
	{
		$this->SalaryRangeModel->resetQuery();
		$this->SalaryRangeModel->addSelect('gehaltsband_kurzbz,bezeichnung');
		$this->SalaryRangeModel->addOrder('sort', 'ASC');
		$rows = $this->SalaryRangeModel->loadWhere(array('aktiv' => true));
		if( hasData($rows) )
		{
			$this->outputJson($rows);
			return;
		}
		else
		{
			$this->outputJsonError('no salary ranges found');
			return;
		}
	}

	function deleteBetrag($betrag_id)
	{
		if($this->input->method() === 'post')
        {

            if (isset($betrag_id) && !is_numeric($betrag_id))
                show_error('betrag_id is not numeric!');

            $result = $this->SalaryRangeBetragModel->deleteSalaryRangeBetrag($betrag_id);

            if (isSuccess($result))
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when deleting salary range data');

        } else {
            $this->output->set_status_header('405');
        }
	}

	function upsertBetrag()
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
			    $this->outputJsonSuccess($result->retval);
		    else
			    $this->outputJsonError('Error when updating salary range');
        } else {
            $this->output->set_status_header('405');
        }
	}


	



}