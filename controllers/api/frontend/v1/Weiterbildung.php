<?php

defined('BASEPATH') || exit('No direct script access allowed');


class Weiterbildung extends FHCAPI_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';
    // code igniter
    protected $CI;

    public function __construct() {

        parent::__construct(
			array(
				'index' => Self::DEFAULT_PERMISSION,
				'getAllByUID' => Self::DEFAULT_PERMISSION,
				'getWeiterbildungskategorienList' => Self::DEFAULT_PERMISSION,
				'getWeiterbildungskategorietypList' => Self::DEFAULT_PERMISSION,
				'upsertWeiterbildung' => Self::DEFAULT_PERMISSION,
				'deleteWeiterbildung' => Self::DEFAULT_PERMISSION,
			)
		);

		// Loads authentication library and starts authenticationfetc
		$this->load->library('AuthLib');

        $this->load->model('extensions/FHC-Core-Personalverwaltung/Weiterbildung_model','WeiterbildungModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Weiterbildungskategorie_model','WeiterbildungskategorieModel');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/Weiterbildungskategorietyp_model','WeiterbildungskategorietypModel');
		$this->load->model('person/Person_model','PersonModel');
        $this->load->model('person/Benutzer_model', 'BenutzerModel');

        // get CI for transaction management
        $this->CI = &get_instance();
    }

    public function index()
    {
		$this->terminateWithSuccess('not implemented');
	}


	public function getAllByUID()
	{
		$mitarbeiter_uid = $this->input->get('uid', null);

		if ($mitarbeiter_uid === null) {
			$this->terminateWithError('missing uid parameter');
			return;
		}

		$this->WeiterbildungModel->resetQuery();
		//$this->WeiterbildungModel->addSelect('weiterbildung_hauptkategorie_id, bezeichnung, beschreibung');
		$this->WeiterbildungModel->addOrder('von', 'ASC');
		$rows = $this->WeiterbildungModel->loadWhere(array('mitarbeiter_uid' => $mitarbeiter_uid));
		
		if( !isError($rows) )
		{
			$this->terminateWithSuccess(getData($rows) ?? []);
		}
		else
		{
			$this->terminateWithError('no trainings found');
		}
	}

	public function getWeiterbildungskategorienList()
	{
		$this->WeiterbildungskategorieModel->resetQuery();
		$this->WeiterbildungskategorieModel->addSelect('weiterbildungskategorie_kurzbz, bezeichnung, beschreibung, weiterbildungskategorietyp_kurzbz');
		$this->WeiterbildungskategorieModel->addOrder('sort', 'ASC');
		$rows = $this->WeiterbildungskategorieModel->loadWhere(array('aktiv' => true));
		if( hasData($rows) )
		{
			$this->terminateWithSuccess(getData($rows) ?? []);
		}
		else
		{
			$this->terminateWithError('no categories found');
		}
	}

	public function getWeiterbildungskategorietypList()
	{
		$this->WeiterbildungskategorietypModel->resetQuery();
		$this->WeiterbildungskategorietypModel->addSelect('weiterbildungskategorietyp_kurzbz, bezeichnung');
		$this->WeiterbildungskategorietypModel->addOrder('sort', 'ASC');
		$rows = $this->WeiterbildungskategorietypModel->loadWhere(array('aktiv' => true));
		if( hasData($rows) )
		{
			$this->terminateWithSuccess(getData($rows) ?? []);
		}
		else
		{
			$this->terminateWithError('no types found');
		}
	}

	public function deleteWeiterbildung($weiterbildung_id)
	{
		if($this->input->method() === 'post')
        {

            if (isset($weiterbildung_id) && !is_numeric($weiterbildung_id))
                show_error('weiterbildung_id is not numeric!');

            $result = $this->WeiterbildungModel->deleteWeiterbildung($weiterbildung_id);

            if (isSuccess($result))
			    $this->terminateWithSuccess(getData($result));
		    else
			    $this->terminateWithError('Error when deleting employee training');

        } else {
            $this->terminateWithError('method not allowed',REST_Controller::HTTP_METHOD_NOT_ALLOWED);
        }
	}

	public function upsertWeiterbildung()
	{
		if($this->input->method() === 'post'){

            $payload = json_decode($this->input->raw_input_stream, TRUE);

			/* unset($payload['bezeichnung']);
			unset($payload['action']);
			unset($payload['aktiv']);
			unset($payload['sort']);            
 */
            if (isset($payload['hauptkategorie_id']) && !is_numeric($payload['hauptkategorie_id']))
                show_error('hauptkategorie_id is not numeric!');


            if (!isset($payload['weiterbildung_id']) || $payload['weiterbildung_id'] == 0)
            {
                $result = $this->WeiterbildungModel->insertWeiterbildung($payload);
            } else {
                $result = $this->WeiterbildungModel->updateWeiterbildung($payload);
            }

            if (isSuccess($result))
			    $this->terminateWithSuccess(getData($result));
		    else
			    $this->terminateWithError('Error when updating employee training');
        } else {
            $this->terminateWithError('method not allowed',REST_Controller::HTTP_METHOD_NOT_ALLOWED);
        }
	}


	



}