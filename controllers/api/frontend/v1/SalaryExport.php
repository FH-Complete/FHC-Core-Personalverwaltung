<?php

defined('BASEPATH') || exit('No direct script access allowed');


class SalaryExport extends Auth_Controller
{

    const DEFAULT_PERMISSION = 'basis/gehaelter:r';
    // code igniter
    protected $_ci;

    public function __construct() {

        parent::__construct(
			array(
				'index' => Self::DEFAULT_PERMISSION,
				'getAll' => Self::DEFAULT_PERMISSION,
				'existsAnyGehaltshistorie' => Self::DEFAULT_PERMISSION,
				'runGehaltshistorieJob' => Self::DEFAULT_PERMISSION,
				'deleteGehaltshistorie' => Self::DEFAULT_PERMISSION,
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

		$orgID = $this->input->get('orgID', null);

		if ($orgID === null) {
			$this->outputJsonError('no organisation selected');
			return;
		}

		$result = $this->_ci->gehaltslib->existsAnyGehaltshistorie($date, $orgID);
		
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

		$orgID = $this->input->get('orgID', null);

		if ($orgID === null) {
			$this->outputJsonError('no organisation selected');
			return;
		}

		// check for existing data to avoid unwanted modification
		$result = $this->_ci->gehaltslib->existsAnyGehaltshistorie($date, $orgID);
		
		if (isError($result))
		{
			$this->outputJsonError(getError($result));
			return;
		} elseif (hasData($result))
		{
			$this->outputJsonError('Gehaltshistorie existiert bereits!');
			return;
		}

		// code copied from GehaltshistorieJob
		$result = $this->_ci->gehaltslib->getBestandteile($date, null, $orgID);
		
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

	public function deleteGehaltshistorie()
	{
		if($this->input->method() === 'post')
        {
            $payload = json_decode($this->input->raw_input_stream, TRUE);

			$orgID = null;
			$date = null;
			
			if(array_key_exists( 'orgID', $payload)) {
				$orgID = $payload['orgID'];
			}
			if(array_key_exists( 'date', $payload)) {
				$date = $payload['date'];
			}

			$result = $this->_ci->gehaltslib->deleteGehaltshistorieByOrg($orgID, $date);
		
			if (isError($result))
			{
				$this->logError(getError($result));
				$this->outputJsonError(getError($result));
				return;
			}

			return $this->outputJson($result);

		} else {
            $this->output->set_status_header('405');
        }
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

		$sapInstalled = $this->_checkIfSAPSyncTableExists();

		$oe_kurzbz_sap = $sapInstalled ? 'sap_org.oe_kurzbz_sap' : 'NULL';
		$sap_join = $sapInstalled ? 'LEFT JOIN sync.tbl_sap_organisationsstruktur sap_org ON(kst.oe_kurzbz=sap_org.oe_kurzbz)' : '';

        $von_datestring = $date_von->format("Y-m-d");
		$bis_datestring = $date_bis->format("Y-m-d");

		$vbs_where = 'AND ((vertragsbestandteil.bis >= '. $this->_ci->db->escape($von_datestring) .')
							OR vertragsbestandteil.bis IS NULL)
						AND
						((vertragsbestandteil.von <= '. $this->_ci->db->escape($bis_datestring) .')
							OR vertragsbestandteil.von IS NULL)';

		$qry_live = '
			SELECT
				lvexport_sum,
				gehaltsbestandteil.gehaltsbestandteil_id, gehaltsbestandteil.auszahlungen, 
				gehaltsbestandteil.von, gehaltsbestandteil.bis, 
				grundbetrag as grundbetr_decrypted, betrag_valorisiert as betr_valorisiert_decrypted,
				dienstverhaeltnis.dienstverhaeltnis_id, dienstverhaeltnis.von as dv_von, dienstverhaeltnis.bis as dv_bis, 
				gehaltstyp.gehaltstyp_kurzbz, gehaltstyp.bezeichnung as gehaltstyp_bezeichnung, 
				gehaltstyp.sort as gehaltstyp_sort,
				vertragsart.bezeichnung as vertragsart_bezeichnung,dienstverhaeltnis.mitarbeiter_uid, 
				mitarbeiter.personalnummer,person.vorname || \' \' || person.nachname as name_gesamt,person.svnr,
				person.nachname,person.vorname,
				vertragsbestandteil_freitext.freitexttyp_kurzbz,vertragsbestandteil_freitext.titel freitext_titel, vertragsbestandteil_freitext.anmerkung as freitext_anmerkung,
				vertragsbestandteil_karenz.von as karenz_von, vertragsbestandteil_karenz.bis as karenz_bis, vertragsbestandteil_karenz.karenztyp_kurzbz, vertragsbestandteil_karenz.bezeichnung karenztyp_bezeichnung,
				vertragsbestandteil_stunden.von as stunden_von, vertragsbestandteil_stunden.bis as stunden_bis, vertragsbestandteil_stunden.wochenstunden, vertragsbestandteil_stunden.bezeichnung as teilzeittyp,
				ksttypbezeichnung, kstorgbezeichnung, 
				' . $oe_kurzbz_sap . ' AS kstnummer
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
						
					) as vertragsbestandteil_stunden ON(dienstverhaeltnis.dienstverhaeltnis_id=vertragsbestandteil_stunden.dienstverhaeltnis_id)
				 
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

				' . $sap_join . '
				
			WHERE
				gehaltstyp.lvexport = true
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

		/* $qry_history = '
			SELECT live.*, historie.datum hdatum, historie.gehaltsbestandteil_von, historie.gehaltsbestandteil_bis, betrag hbetrag_decrypted
			FROM (select * from ('.$qry_live.') t) live 
			LEFT JOIN hr.tbl_gehaltshistorie historie using(gehaltsbestandteil_id) 
			WHERE
				((historie.datum >= '. $this->_ci->db->escape($von_datestring) .')
					AND historie.datum <= '. $this->_ci->db->escape($bis_datestring) .')			
			'; */

		$qry_history = '
			SELECT live.*, historie.datum hdatum, historie.gehaltsbestandteil_von, historie.gehaltsbestandteil_bis, betrag hbetrag_decrypted, 
				vh.betrag_valorisiert as betrag_valorisiert_historie_decrypted
			FROM (select * FROM ('.$qry_live.') t) live 
			LEFT JOIN (
				SELECT * FROM hr.tbl_gehaltshistorie
				WHERE
				((datum >= '. $this->_ci->db->escape($von_datestring) .')
					AND datum <= '. $this->_ci->db->escape($bis_datestring) .')
				) historie using(gehaltsbestandteil_id)
			LEFT JOIN 
				hr.tbl_valorisierung_historie vh ON vh.gehaltsbestandteil_id = live.gehaltsbestandteil_id AND vh.valorisierungsdatum = (
					SELECT 
						vi.valorisierungsdatum 
					FROM 
						hr.tbl_valorisierung_instanz vi
					JOIN
						hr.tbl_dienstverhaeltnis d ON d.dienstverhaeltnis_id = live.dienstverhaeltnis_id 
						AND d.oe_kurzbz = vi.oe_kurzbz
					WHERE 
						'. $this->_ci->db->escape($bis_datestring) .' >= valorisierungsdatum 
					ORDER BY 
						valorisierungsdatum DESC 
					LIMIT 1
					) 
			';

		$qry_grouped =  "
			SELECT
					dienstverhaeltnis_id,
					array_agg(gehaltsbestandteil_id ORDER BY gehaltstyp_sort ASC) as gehaltsbestandteil_id, 
					array_agg(DISTINCT auszahlungen) as gehaltsbestandteil_auszahlungen, 
					lvexport_sum,sum(grundbetr_decrypted) as grundbetr_decrypted, sum(betr_valorisiert_decrypted) as betr_valorisiert_decrypted,
					sum(hbetrag_decrypted) as hbetrag_decrypted,sum(betrag_valorisiert_historie_decrypted) as betrag_valorisiert_historie_decrypted,
					dv_von, dv_bis, 
					array_agg(gehaltstyp_bezeichnung ORDER BY gehaltstyp_sort ASC) as gehaltstyp_bezeichnung, 
					vertragsart_bezeichnung,mitarbeiter_uid, 
					personalnummer,name_gesamt,svnr,
					nachname,vorname,
					array_agg(freitexttyp_kurzbz) freitexttyp_kurzbz,array_agg(freitext_titel) freitext_titel, array_agg(freitext_anmerkung) as freitext_anmerkung,
					karenz_von, karenz_bis, karenztyp_kurzbz, karenztyp_bezeichnung,
					stunden_von, stunden_bis, wochenstunden,
					ksttypbezeichnung, kstorgbezeichnung, kstnummer
				FROM ($qry_history) as hist

			GROUP BY dienstverhaeltnis_id,
					coalesce(lvexport_sum,gehaltsbestandteil_id::text),lvexport_sum,
                    dv_von, dv_bis,
					vertragsart_bezeichnung,mitarbeiter_uid, 
					personalnummer,name_gesamt,svnr,
					nachname,vorname,
					karenz_von, karenz_bis, karenztyp_kurzbz, karenztyp_bezeichnung,
					stunden_von, stunden_bis, wochenstunden,
					ksttypbezeichnung, kstorgbezeichnung, kstnummer
			HAVING ((dv_bis >= ". $this->_ci->db->escape($von_datestring) .")
							OR dv_bis IS NULL)
						AND
						((dv_von <= ". $this->_ci->db->escape($bis_datestring) .")
							OR dv_von IS NULL)
		";
		/* switch ($listType) {
			case 'live':
				//$qry = $qry_live;
				$qry = $qry_grouped;
				$encryptedCols = array_merge($this->_ci->GehaltsbestandteilModel->getEncryptedColumns(), $this->_ci->GehaltshistorieModel->getEncryptedColumns());
				// $encryptedCols = $this->_ci->GehaltsbestandteilModel->getEncryptedColumns();
				break;
			case 'history': 
				$qry = $qry_grouped;
				$encryptedCols = array_merge($this->_ci->GehaltsbestandteilModel->getEncryptedColumns(), $this->_ci->GehaltshistorieModel->getEncryptedColumns());
				break;
		}; */

		$qry = $qry_grouped;
		$encryptedCols = array_merge($this->_ci->GehaltsbestandteilModel->getEncryptedColumns(), $this->_ci->GehaltshistorieModel->getEncryptedColumns());



		$result = $this->_ci->GehaltsbestandteilModel->execReadOnlyQuery(
			$qry,
			[],
			$encryptedCols
		);
		
		if (isError($result)) {
			$this->outputJsonError('query failed');
			return;
		}

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

	/**
	 * Checks if sap sync table exists.
	 * slightly adapted duplicate of core Vertragsbestandteil_model->_checkIfSAPSyncTableExists
	 * @return bool
	 */
	private function _checkIfSAPSyncTableExists()
	{
		$params = array(
			DB_NAME,
			'sync',
			'tbl_sap_organisationsstruktur'
		);

		$sql = "SELECT
				1 AS exists
			FROM
				information_schema.tables
			WHERE
				table_catalog = ? AND
				table_schema = ? AND
				table_name = ?";

		$res = $this->_ci->GehaltsbestandteilModel->execReadOnlyQuery($sql, $params);

		return hasData($res);
	}
}