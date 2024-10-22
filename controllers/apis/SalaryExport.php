<?php

defined('BASEPATH') || exit('No direct script access allowed');


class SalaryExport extends Auth_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';
    // code igniter
    protected $_ci;

    public function __construct() {

        parent::__construct(
			array(
				'index' => Self::DEFAULT_PERMISSION,
				'getAll' => Self::DEFAULT_PERMISSION,
			)
		);

		// Loads authentication library and starts authenticationfetc
		$this->load->library('AuthLib');

		$this->load->model('person/Person_model','PersonModel');
        $this->load->model('person/Benutzer_model', 'BenutzerModel');

        // get CI 
        $this->_ci = &get_instance();
		$this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Gehaltshistorie_model', 'GehaltshistorieModel');
		$this->_ci->load->model('vertragsbestandteil/Gehaltsbestandteil_model', 'GehaltsbestandteilModel');
		// Loads the DB config to encrypt/decrypt data
		$this->_ci->GehaltshistorieModel->config->load('db_crypt');
    }

    function index()
    {}
	
	
	public function getAll()
	{
		$export = $this->input->get('export') == 'true';

		$von = $this->input->get('von', null);
		$bis = $this->input->get('bis', null);
		$person = $this->input->get('filterPerson', null);

		// validate 
		$date_von = DateTime::createFromFormat( 'Y-m-d', $von );
		$date_bis = DateTime::createFromFormat( 'Y-m-d', $bis );

		if ($date_von === false || $date_bis === false) {
			$this->outputJsonError('no date range selected');
			return;
		}

        $von_datestring = $date_von->format("Y-m-d");
		$bis_datestring = $date_bis->format("Y-m-d");

		$this->_ci->GehaltsbestandteilModel->addSelect('tbl_gehaltsbestandteil.*, dienstverhaeltnis.von as dv_von, dienstverhaeltnis.bis as dv_bis, gehaltstyp.bezeichnung as gehaltstyp_bezeichnung, dienstverhaeltnis.von, dienstverhaeltnis.bis, vertragsart.bezeichnung as vertragsart_bezeichnung,dienstverhaeltnis.mitarbeiter_uid, mitarbeiter.personalnummer,person.vorname || \' \' || person.nachname as name_gesamt,person.svnr');
		$this->_ci->GehaltsbestandteilModel->addJoin('hr.tbl_dienstverhaeltnis dienstverhaeltnis', 'dienstverhaeltnis_id');
		$this->_ci->GehaltsbestandteilModel->addJoin('hr.tbl_gehaltstyp gehaltstyp', 'gehaltstyp_kurzbz');
		$this->_ci->GehaltsbestandteilModel->addJoin('hr.tbl_vertragsart vertragsart', 'vertragsart_kurzbz');
		$this->_ci->GehaltsbestandteilModel->addJoin('public.tbl_mitarbeiter mitarbeiter', 'mitarbeiter_uid');
		$this->_ci->GehaltsbestandteilModel->addJoin('public.tbl_benutzer benutzer', 'mitarbeiter.mitarbeiter_uid = benutzer.uid');
		$this->_ci->GehaltsbestandteilModel->addJoin('public.tbl_person person', 'benutzer.person_id = person.person_id');

		$where = "
				((tbl_gehaltsbestandteil.bis >= ". $this->_ci->db->escape($von_datestring) .")
					OR tbl_gehaltsbestandteil.bis IS NULL)
				AND
				((tbl_gehaltsbestandteil.von <= ". $this->_ci->db->escape($bis_datestring) .")
					OR tbl_gehaltsbestandteil.von IS NULL)
		";

		if ($person != null && $person !== '') {
			if (!is_numeric($person)) {
				$where .= " AND (nachname ~* ".$this->_ci->db->escape($person). ") ";
			} else {
				$where .= " AND (mitarbeiter.personalnummer = ".$this->_ci->db->escape($person). ") ";
			}
		}

		$result = $this->_ci->GehaltsbestandteilModel->loadWhere($where, $this->_ci->GehaltsbestandteilModel->getEncryptedColumns());

		//var_dump($result);
		
		if (isError($result)) {
			$this->outputJsonError('query failed');
			return;
		}

		if (!hasData($result)) return error("Keine Gehaltsbestandteile gefunden!");

		if (!$export) {
			return $this->outputJson($result);
		}

		return $this->export2csv($result->retval);
	}

	private function export2csv($data)
	{
		$header = array("Personalnummer", "Name", "SVNR", "Vertragsart", "DV von", "DV bis", "Gehaltstyp",
			"Von", "Bis", "Betrag");
		$delimiter = ";";

		if (count($data) > 0) {
			header('Content-Type: application/csv; charset=utf-8');
			header('Content-Disposition: attachment; filename="gehaltsliste.csv",');
			ob_start();
			// prepare the file
			$fp = fopen('php://output', 'w'); 

			// Save header
			fputcsv($fp, $header, $delimiter);

			// Save data
			foreach ($data as $element) {
				fputcsv($fp, array($element->personalnummer, $element->name_gesamt, 
					$element->svnr, $element->vertragsart_bezeichnung, $element->dv_von, $element->dv_bis, $element->gehaltstyp_bezeichnung, 
					$element->von, $element->bis, $element->betrag_valorisiert), $delimiter);
			}
			fclose($fp);
		}

		return $fp;
	}

	


}