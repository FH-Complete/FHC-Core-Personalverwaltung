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
				'existsAnyGehaltshistorie' => Self::DEFAULT_PERMISSION,
				'runGehaltshistorieJob' => Self::DEFAULT_PERMISSION,
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
		$this->load->library('extensions/FHC-Core-Personalverwaltung/abrechnung/GehaltsLib');
		// Loads the DB config to encrypt/decrypt data
		$this->_ci->GehaltshistorieModel->config->load('db_crypt');
    }

    function index()
    {}
	

	public function existsAnyGehaltshistorie()
	{
		$date = $this->input->get('date', null);

		if ($date === null) {
			$this->outputJsonError('missing date parameter');
			return;
		}

		$result = $this->_ci->gehaltslib->existsAnyGehaltshistorie($date);
		
		if (isError($result))
		{
			$this->logError(getError($result));
			$this->outputJsonError(getError($result));
			return;
		}

		return $this->outputJson($result);

	}

	public function runGehaltshistorieJob()
	{
		$date = $this->input->get('date', null);	

		if ($date === null) {
			$this->outputJsonError('missing date parameter');
			return;
		}

		// check for existing data to avoid unwanted modification
		$result = $this->_ci->gehaltslib->existsAnyGehaltshistorie($date);
		
		if (isError($result))
		{
			$this->outputJsonError(getError($result));
			return;
		} elseif (hasData($result))
		{
			$this->outputJsonError(getError($result));
			return;
		}

		// code copied from GehaltshistorieJob
		$result = $this->_ci->gehaltslib->getBestandteile($date);
		
		if (isError($result))
		{
			$this->outputJsonError(getError($result));
			return;
		}

		$count = 0;

		if (!hasData($result))
		{
			// nothing to do
		}
		else
		{
			$bestandteile = getData($result);
			foreach ($bestandteile as $bestandteil)
			{
				$abrechnung = $this->_ci->gehaltslib->existsGehaltshistorie($bestandteil, $date);
				if (!hasData($abrechnung))
				{
					$result = $this->_ci->gehaltslib->addHistorie($bestandteil, $date);
					
					if (isError($result))
					{
						$this->outputJsonError(getError($result));
						return;
					}
					else
						$count++;
				}
			}
		}
	

		return $this->outputJson(array("count" => $count));
	}
	
	public function getAll()
	{
		$export = $this->input->get('export') == 'true';

		$von = $this->input->get('von', null);
		$bis = $this->input->get('bis', null);
		$orgID = $this->input->get('orgID', null);
		$listType = $this->input->get('listType', 'live');
		$person = $this->input->get('filterPerson', null);

		// validate 
		$date_von = DateTime::createFromFormat( 'Y-m-d', $von );
		$date_bis = DateTime::createFromFormat( 'Y-m-d', $bis );

		if ($date_von === false || $date_bis === false) {
			$this->outputJsonError('no date range selected');
			return;
		}

		if ($orgID === null) {
			$this->outputJsonError('no organisation selected');
			return;
		}

        $von_datestring = $date_von->format("Y-m-d");
		$bis_datestring = $date_bis->format("Y-m-d");

		$vbs_where = 'AND ((vertragsbestandteil.bis >= '. $this->_ci->db->escape($von_datestring) .')
							OR vertragsbestandteil.bis IS NULL)
						AND
						((vertragsbestandteil.von <= '. $this->_ci->db->escape($bis_datestring) .')
							OR vertragsbestandteil.von IS NULL)';

		$qry_live = '
			SELECT
				gehaltsbestandteil.gehaltsbestandteil_id,gehaltsbestandteil.von, gehaltsbestandteil.bis, 
				grundbetrag as grundbetr_decrypted, betrag_valorisiert as betr_valorisiert_decrypted,
				dienstverhaeltnis.von as dv_von, dienstverhaeltnis.bis as dv_bis, 
				gehaltstyp.gehaltstyp_kurzbz, gehaltstyp.bezeichnung as gehaltstyp_bezeichnung, 
				vertragsart.bezeichnung as vertragsart_bezeichnung,dienstverhaeltnis.mitarbeiter_uid, 
				mitarbeiter.personalnummer,person.vorname || \' \' || person.nachname as name_gesamt,person.svnr,
				person.nachname,person.vorname,
				vertragsbestandteil_freitext.freitexttyp_kurzbz,vertragsbestandteil_freitext.titel freitext_titel, vertragsbestandteil_freitext.anmerkung as freitext_anmerkung,
				vertragsbestandteil_karenz.von as karenz_von, vertragsbestandteil_karenz.bis as karenz_bis, vertragsbestandteil_karenz.karenztyp_kurzbz, vertragsbestandteil_karenz.bezeichnung karenztyp_bezeichnung,
				vertragsbestandteil_stunden.von as stunden_von, vertragsbestandteil_stunden.bis as stunden_bis, vertragsbestandteil_stunden.wochenstunden, vertragsbestandteil_stunden.bezeichnung as teilzeittyp,
				ksttypbezeichnung, kstorgbezeichnung
			FROM

				hr.tbl_dienstverhaeltnis dienstverhaeltnis 
				JOIN hr.tbl_gehaltsbestandteil gehaltsbestandteil using (dienstverhaeltnis_id)
				JOIN hr.tbl_gehaltstyp gehaltstyp using (gehaltstyp_kurzbz)
				JOIN hr.tbl_vertragsart vertragsart using(vertragsart_kurzbz)
				JOIN public.tbl_mitarbeiter mitarbeiter using(mitarbeiter_uid)
				JOIN public.tbl_benutzer benutzer on (mitarbeiter.mitarbeiter_uid = benutzer.uid)
				JOIN public.tbl_person person on (benutzer.person_id = person.person_id)
				LEFT JOIN (
					SELECT
						dienstverhaeltnis_id,vertragsbestandteil_id,freitexttyp_kurzbz, freitext.titel, freitext.anmerkung
					FROM hr.tbl_vertragsbestandteil vertragsbestandteil
					JOIN hr.tbl_vertragsbestandteil_freitext freitext using(vertragsbestandteil_id)
					WHERE 
						vertragsbestandteiltyp_kurzbz=\'freitext\'
						'.$vbs_where.'	
				) as vertragsbestandteil_freitext 
				 	ON(dienstverhaeltnis.dienstverhaeltnis_id=vertragsbestandteil_freitext.dienstverhaeltnis_id 
            			AND gehaltsbestandteil.vertragsbestandteil_id=vertragsbestandteil_freitext.vertragsbestandteil_id)

				LEFT JOIN (
					SELECT
						dienstverhaeltnis_id,vertragsbestandteil_id,von,bis,karenztyp_kurzbz, hr.tbl_karenztyp.bezeichnung
					FROM hr.tbl_vertragsbestandteil vertragsbestandteil
					JOIN hr.tbl_vertragsbestandteil_karenz vb_karenztyp using(vertragsbestandteil_id)
					JOIN hr.tbl_karenztyp using(karenztyp_kurzbz)
					WHERE 
						vertragsbestandteiltyp_kurzbz=\'karenz\'
						'.$vbs_where.'	
					) as vertragsbestandteil_karenz ON(dienstverhaeltnis.dienstverhaeltnis_id=vertragsbestandteil_karenz.dienstverhaeltnis_id)
				LEFT JOIN (
					SELECT
						dienstverhaeltnis_id,vertragsbestandteil_id,von,bis,wochenstunden,teilzeittyp_kurzbz, hr.tbl_teilzeittyp.bezeichnung 
					FROM hr.tbl_vertragsbestandteil vertragsbestandteil
						JOIN hr.tbl_vertragsbestandteil_stunden USING(vertragsbestandteil_id)
						LEFT JOIN hr.tbl_teilzeittyp USING(teilzeittyp_kurzbz)
					WHERE 
						vertragsbestandteiltyp_kurzbz=\'stunden\'
						'.$vbs_where.'
						
					) as vertragsbestandteil_stunden ON(dienstverhaeltnis.dienstverhaeltnis_id=vertragsbestandteil_stunden.dienstverhaeltnis_id
					 AND gehaltsbestandteil.vertragsbestandteil_id=vertragsbestandteil_stunden.vertragsbestandteil_id)
				 
				LEFT JOIN (
					SELECT 
						bf.uid,oe_kurzbz,public.tbl_organisationseinheit.bezeichnung kstorgbezeichnung, kstt.bezeichnung AS ksttypbezeichnung, 
						vertragsbestandteil.dienstverhaeltnis_id, vertragsbestandteil.vertragsbestandteil_id
					FROM 
						public.tbl_benutzerfunktion bf JOIN public.tbl_organisationseinheit using(oe_kurzbz)
						JOIN public.tbl_organisationseinheittyp kstt USING(organisationseinheittyp_kurzbz)
						JOIN hr.tbl_vertragsbestandteil_funktion vbf ON bf.benutzerfunktion_id = vbf.benutzerfunktion_id
						JOIN hr.tbl_vertragsbestandteil vertragsbestandteil ON vbf.vertragsbestandteil_id = vertragsbestandteil.vertragsbestandteil_id
					WHERE 
						vertragsbestandteiltyp_kurzbz=\'funktion\' AND funktion_kurzbz=\'kstzuordnung\'
						'.$vbs_where.'
						-- ) kst ON(dienstverhaeltnis.dienstverhaeltnis_id=kst.dienstverhaeltnis_id AND kst.vertragsbestandteil_id = gehaltsbestandteil.vertragsbestandteil_id)
			    ) kst ON(dienstverhaeltnis.dienstverhaeltnis_id=kst.dienstverhaeltnis_id)
				
			WHERE
				gehaltstyp.gehaltstyp_kurzbz <> \'lohnausgleichatz\'
				AND ((gehaltsbestandteil.bis >= '. $this->_ci->db->escape($von_datestring) .')
					OR gehaltsbestandteil.bis IS NULL)
				AND
				((gehaltsbestandteil.von <= '. $this->_ci->db->escape($bis_datestring) .')
					OR gehaltsbestandteil.von IS NULL)

		';

		$where = '';
		if ($person != null && $person !== '') {
			if (!is_numeric($person)) {
				$where .= " AND (nachname ~* ".$this->_ci->db->escape($person). ") ";
			} else {
				$where .= " AND (mitarbeiter.personalnummer = ".$this->_ci->db->escape($person). ") ";
			}
		}

		$where .= " AND (dienstverhaeltnis.oe_kurzbz = ".$this->_ci->db->escape($orgID). ") ";

		$qry_live = $qry_live.$where;

		$qry_history = '
			SELECT live.*, historie.datum hdatum, historie.gehaltsbestandteil_von, historie.gehaltsbestandteil_bis, betrag hbetrag_decrypted
			FROM (select * from ('.$qry_live.') t) live 
			JOIN hr.tbl_gehaltshistorie historie using(gehaltsbestandteil_id) 
			WHERE
				((historie.datum >= '. $this->_ci->db->escape($von_datestring) .')
					AND historie.datum <= '. $this->_ci->db->escape($bis_datestring) .')
			';

		//$result = $this->_ci->GehaltsbestandteilModel->loadWhere($where, $this->_ci->GehaltsbestandteilModel->getEncryptedColumns());

		

		switch ($listType) {
			case 'live':
				$qry = $qry_live;
				$encryptedCols = $this->_ci->GehaltsbestandteilModel->getEncryptedColumns();
				break;
			case 'history':
				$qry = $qry_history;
				$encryptedCols = array_merge($this->_ci->GehaltsbestandteilModel->getEncryptedColumns(), $this->_ci->GehaltshistorieModel->getEncryptedColumns());
				break;
		};


		$result = $this->_ci->GehaltsbestandteilModel->execReadOnlyQuery(
			$qry,
			[],
			$encryptedCols
		);

		//var_dump($result);
		
		if (isError($result)) {
			$this->outputJsonError('query failed');
			return;
		}

		//if (!hasData($result)) return error("Keine Gehaltsbestandteile gefunden!");

		if (!$export) {
			return $this->outputJson($result);
		}

		return $this->export2csv($result->retval);
	}

	private function export2csv($data)
	{
		$header = array("Personalnummer", "Name", "SVNR", "Vertragsart", "DV von", "DV bis", "Gehaltstyp",
			"WS", "Von", "Bis", "Betrag", "Betrag valorisiert", "Karenz von", "Karenz bis");
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
					$element->wochenstunden, $element->von, $element->bis, $element->grundbetr_decrypted, $element->betr_valorisiert_decrypted,  
					$element->karenz_von, $element->karenz_bis), $delimiter);
			}
			fclose($fp);
		}

		return $fp;
	}

	


}