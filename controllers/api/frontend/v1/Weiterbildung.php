<?php

defined('BASEPATH') || exit('No direct script access allowed');


class Weiterbildung extends FHCAPI_Controller
{

	const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';
	// code igniter
	protected $CI;

	public function __construct()
	{

		parent::__construct(
			array(
				'index' => Self::DEFAULT_PERMISSION,
				'getAllByUID' => Self::DEFAULT_PERMISSION,
				'getWeiterbildungskategorienList' => Self::DEFAULT_PERMISSION,
				'getWeiterbildungskategorietypList' => Self::DEFAULT_PERMISSION,
				'upsertWeiterbildung' => Self::DEFAULT_PERMISSION,
				'deleteWeiterbildung' => Self::DEFAULT_PERMISSION,
				'updateDokumente' => Self::DEFAULT_PERMISSION,
				'loadDokumente' => Self::DEFAULT_PERMISSION,
			)
		);

		// Loads authentication library and starts authenticationfetc
		$this->load->library('AuthLib');

		$this->load->model('extensions/FHC-Core-Personalverwaltung/Weiterbildung_model', 'WeiterbildungModel');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/Weiterbildungskategorie_model', 'WeiterbildungskategorieModel');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/Weiterbildungskategorietyp_model', 'WeiterbildungskategorietypModel');
		$this->load->model('person/Person_model', 'PersonModel');
		$this->load->model('person/Benutzer_model', 'BenutzerModel');

		// get CI for transaction management
		$this->CI = &get_instance();

		// Load language phrases
		$this->loadPhrases([
			'ui'
		]);
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
		$result = $this->WeiterbildungModel->loadWhere(array('mitarbeiter_uid' => $mitarbeiter_uid));

		if (!isError($result)) 
		{
			$rows = getData($result) ?? [];
			// load m:n data
			foreach ($rows as $row) 
			{
				$katList = $this->getKategorien($row->weiterbildung_id);
				$row->kategorien = array_map(function($val) { return $val->weiterbildungskategorie_kurzbz; }, $katList);
				$dokList = $this->WeiterbildungModel->getDokumente($row->weiterbildung_id);
				if (isError($dokList)) 
				{
					$this->terminateWithError('failed to get documents');
				}
				$row->dokumente = getData($dokList) ?? [];
			}
			$this->terminateWithSuccess($rows);
		} else {
			$this->terminateWithError('no trainings found for this employee');
		}
	}

	public function getWeiterbildungskategorienList()
	{
		$this->WeiterbildungskategorieModel->resetQuery();
		$this->WeiterbildungskategorieModel->addSelect('weiterbildungskategorie_kurzbz, bezeichnung, beschreibung, weiterbildungskategorietyp_kurzbz');
		$this->WeiterbildungskategorieModel->addOrder('sort', 'ASC');
		$rows = $this->WeiterbildungskategorieModel->loadWhere(array('aktiv' => true));
		if (hasData($rows)) {
			$this->terminateWithSuccess(getData($rows) ?? []);
		} else {
			$this->terminateWithError('no categories found');
		}
	}

	public function getWeiterbildungskategorietypList()
	{
		$this->WeiterbildungskategorietypModel->resetQuery();
		$this->WeiterbildungskategorietypModel->addSelect('weiterbildungskategorietyp_kurzbz, bezeichnung');
		$this->WeiterbildungskategorietypModel->addOrder('sort', 'ASC');
		$rows = $this->WeiterbildungskategorietypModel->loadWhere(array('aktiv' => true));
		if (hasData($rows)) {
			$this->terminateWithSuccess(getData($rows) ?? []);
		} else {
			$this->terminateWithError('no types found');
		}
	}

	public function deleteWeiterbildung($weiterbildung_id)
	{
		if ($this->input->method() === 'post') {

			if (isset($weiterbildung_id) && !is_numeric($weiterbildung_id))
				show_error('weiterbildung_id is not numeric!');

			$result = $this->WeiterbildungModel->deleteWeiterbildung($weiterbildung_id);

			if (isSuccess($result))
				$this->terminateWithSuccess(getData($result));
			else
				$this->terminateWithError('Error when deleting employee training');
		} else {
			$this->terminateWithError('method not allowed', REST_Controller::HTTP_METHOD_NOT_ALLOWED);
		}
	}

	public function upsertWeiterbildung()
	{
		if ($this->input->method() === 'post') {

			$payload = json_decode($this->input->raw_input_stream, TRUE);

			/* unset($payload['bezeichnung']);
			unset($payload['action']);
			unset($payload['aktiv']);
			unset($payload['sort']);            
 */

			unset($payload['dokumente']);

			if (isset($payload['kategorien']) && !is_array($payload['kategorien']))
				show_error('kategorien is not an array!');

			// Start DB transaction
			$this->db->trans_start();

			$kategorien = $payload['kategorien'];
			unset($payload['kategorien']);
			$result = null;
			if (!isset($payload['weiterbildung_id']) || $payload['weiterbildung_id'] == 0) 
			{
				$resultW = $this->WeiterbildungModel->insertWeiterbildung($payload);
				if (isSuccess($resultW))
					$result = $this->WeiterbildungModel->syncKategorien($resultW->retval[0]->weiterbildung_id, $kategorien);
			} else {
				$resultW = $this->WeiterbildungModel->updateWeiterbildung($payload);
				if (isSuccess($resultW))
					$result = $this->WeiterbildungModel->syncKategorien($payload['weiterbildung_id'], $kategorien);
			}

			if (isError($result))
			{
				$this->db->trans_rollback();
				$this->terminateWithError(getError($result), self::ERROR_TYPE_GENERAL);
			} else {
				// commit changes
				$this->db->trans_commit();
				// get m:n relation data and return
				$katList = $this->getKategorien($resultW->retval[0]->weiterbildung_id);
				$resultW->retval[0]->kategorien = array_map(function($val) { return $val->weiterbildungskategorie_kurzbz; }, $katList);
				$dokList = $this->WeiterbildungModel->getDokumente($resultW->retval[0]->weiterbildung_id);
				if (isError($dokList)) 
				{
					$this->terminateWithError('failed to get documents');
				}
				$resultW->retval[0]->dokumente = getData($dokList) ?? [];
				$this->terminateWithSuccess(getData($resultW));
			}
		} else {
			$this->terminateWithError('method not allowed', REST_Controller::HTTP_METHOD_NOT_ALLOWED);
		}
	}

	public function getKategorien($weiterbildung_id)
    {
        $this->db->select('hr.tbl_weiterbildung_kategorie_rel.weiterbildungskategorie_kurzbz')
                 ->from('hr.tbl_weiterbildung_kategorie_rel ')
                 ->where('hr.tbl_weiterbildung_kategorie_rel.weiterbildung_id', $weiterbildung_id);

        return $this->db->get()->result();
    }	

	public function updateDokumente($weiterbildung_id)
	{
		$this->load->library('form_validation');
		$this->load->library('DmsLib');

		$uid = getAuthUID();

		if (isset($_POST['data']))
		{
			$data = json_decode($_POST['data']);
			unset($_POST['data']);
			foreach ($data as $k => $v) {
				$_POST[$k] = $v;
			}
		}

		if(!$weiterbildung_id)
		{
			$this->terminateWithError($this->p->t('ui','error_missingId',['id'=>'weiterbildung_id']), self::ERROR_TYPE_GENERAL);
		}

		//update(1) loading all dms-entries with this weiterbildung_id
		$dms_id_arr = [];
		$this->load->model('extensions/FHC-Core-Personalverwaltung/Weiterbildungdokument_model', 'WeiterbildungdokumentModel');
		$this->WeiterbildungdokumentModel->addJoin('campus.tbl_dms_version', 'dms_id');

		$result = $this->WeiterbildungdokumentModel->loadWhere(array('weiterbildung_id' => $weiterbildung_id));
		$result = $this->getDataOrTerminateWithError($result);
		foreach ($result as $doc) {
			$dms_id_arr[$doc->dms_id] = array(
				'name' => $doc->name,
				'dms_id' => $doc->dms_id
			);
		}

		$files = $_FILES['files'];
		$file_count = count($files['name']);

		for ($i = 0; $i < $file_count; $i++) {
			$_FILES['files']['name'] = $files['name'][$i];
			$_FILES['files']['type'] = $files['type'][$i];
			$_FILES['files']['tmp_name'] = $files['tmp_name'][$i];
			$_FILES['files']['error'] = $files['error'][$i];
			$_FILES['files']['size'] = $files['size'][$i];

			$dms = [
				"kategorie_kurzbz" => "weiterbildung",
				"version" => 0,
				"name" => $_FILES['files']['name'],
				"mimetype" => $_FILES['files']['type'],
				"beschreibung" => $uid . " Weiterbildung",
				"insertvon" => $uid,
				"insertamum" => "NOW()",
			];

			$tmp_res = $this->dmslib->upload($dms, 'files', array('*'));

			$result = $this->getDataOrTerminateWithError($tmp_res);
			$dms_id = $result['dms_id'];

			$result = $this->WeiterbildungdokumentModel->insert(array('weiterbildung_id' => $weiterbildung_id, 'dms_id' => $dms_id));

			$this->getDataOrTerminateWithError($result);
			
		}

		//update(3) check if all files have been deleted
		foreach ($dms_id_arr as $file)
		{
			$result = $this->dmslib->removeAll($file['dms_id']);

			$this->getDataOrTerminateWithError($result);
		}

		return $this->terminateWithSuccess($result);
	}

}
