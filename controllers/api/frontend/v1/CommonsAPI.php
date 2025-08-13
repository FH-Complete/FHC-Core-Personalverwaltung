<?php

defined('BASEPATH') || exit('No direct script access allowed');

class CommonsAPI extends FHCAPI_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:rw';
    const HANDYVERWALTUNG_PERMISSION = 'extension/pv21_handyverwaltung:rw';
    const SCHLUESSELVERWALTUNG_PERMISSION = 'extension/pv21_schluesselver:rw';
    const KONTAKTDATENVERWALTUNG_PERMISSION = 'extension/pv21_kontaktdatenver:rw';

    public function __construct() {
        parent::__construct(
	    array(
		'getSprache' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getSachaufwandtyp' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getNations' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getAusbildung' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getStandorteIntern' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getOrte' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getGemeinden' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getOrtschaften' => [CommonsAPI::DEFAULT_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getVertragsartAll' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],

		'getContractExpire' => CommonsAPI::DEFAULT_PERMISSION,
		'getContractNew' => CommonsAPI::DEFAULT_PERMISSION,
		'getBirthdays' => CommonsAPI::DEFAULT_PERMISSION,
		'getCovidState' => CommonsAPI::DEFAULT_PERMISSION,

		'getCourseHours' => CommonsAPI::DEFAULT_PERMISSION,
		'getAllCourseHours' => CommonsAPI::DEFAULT_PERMISSION,
		'getAllSupportHours' => CommonsAPI::DEFAULT_PERMISSION,
		'getReportData' => CommonsAPI::DEFAULT_PERMISSION,
		'getKontakttyp' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getAdressentyp' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],

		'getGehaltstypen' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getVertragsarten' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getVertragsbestandteiltypen' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],

		'getKarenztypen' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getTeilzeittypen' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getFreitexttypen' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
		'getStundensatztypen' => [CommonsAPI::DEFAULT_PERMISSION, self::HANDYVERWALTUNG_PERMISSION, self::SCHLUESSELVERWALTUNG_PERMISSION, self::KONTAKTDATENVERWALTUNG_PERMISSION],
            )
        );
        $this->load->library('AuthLib');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
        $this->load->model('person/kontakttyp_model', 'KontakttypModel');
        $this->load->model('person/Adressentyp_model', 'AdressentypModel');
        $this->load->model('codex/Nation_model', 'NationModel');
        $this->load->model('codex/Ausbildung_model', 'AusbildungModel');

        $this->load->model('system/sprache_model', 'SpracheModel');
        $this->load->model('ressource/ort_model', 'OrtModel');
        $this->load->model('person/Benutzer_model', 'BenutzerModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Organisationseinheit_model', 'OrganisationseinheitModel');
        $this->load->model('codex/bisverwendung_model', 'BisverwendungModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Statistik_model', 'StatistikModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Sachaufwandtyp_model', 'SachaufwandtypModel');
        $this->load->model('vertragsbestandteil/Dienstverhaeltnis_model', 'DVModel');
        $this->load->model('vertragsbestandteil/Gehaltsbestandteil_model', 'GBTModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Gehaltstyp_model', 'GehaltstypModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/LVA_model', 'LVAModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Vertragsart_model', 'VertragsartModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Vertragsbestandteiltyp_model', 'VertragsbestandteiltypModel');
	$this->load->model('extensions/FHC-Core-Personalverwaltung/Karenztyp_model', 'KarenztypModel');
	$this->load->model('extensions/FHC-Core-Personalverwaltung/Teilzeittyp_model', 'TeilzeittypModel');
	$this->load->model('extensions/FHC-Core-Personalverwaltung/Freitexttyp_model', 'FreitexttypModel');
	$this->load->model('ressource/Stundensatztyp_model', 'StundensatztypModel');
    }


    function getSprache()
    {
        //$this->SpracheModel->addOrder("sprache");
        $spracheRes = $this->SpracheModel->load();

        if (isError($spracheRes))
        {
            $this->terminateWithError(getError($spracheRes));
            exit;
        }

        $this->terminateWithSuccess(getData($spracheRes));
    }


    function getSachaufwandtyp()
    {
        $this->SachaufwandtypModel->addSelect("sachaufwandtyp_kurzbz, bezeichnung, sort, aktiv");
	$this->SachaufwandtypModel->addOrder("bezeichnung");
	$sachaufwandTypRes = $this->SachaufwandtypModel->load();

	if (isError($sachaufwandTypRes))
	{
		$this->terminateWithError(getError($sachaufwandTypRes));
		exit;
	}

        $this->terminateWithSuccess(getData($sachaufwandTypRes));
    }

    function getNations()
    {
        $language = getUserLanguage();

	$nationTextFieldName = $language == 'German' ? 'langtext' : 'engltext';

        $this->NationModel->addSelect("nation_code, $nationTextFieldName AS nation_text, sperre");
	$this->NationModel->addOrder("nation_text");
	$nationRes = $this->NationModel->load();

	if (isError($nationRes))
	{
	    $this->terminateWithError(getError($nationRes));
	    exit;
	}

        $this->terminateWithSuccess(getData($nationRes));
    }

    function getAusbildung()
    {
        $this->AusbildungModel->addOrder("ausbildungcode");
	$result = $this->AusbildungModel->load();

	if (isError($result))
	{
	    $this->terminateWithError(getError($result));
	    exit;
	}

        $this->terminateWithSuccess(getData($result));
    }

    function getStandorteIntern()
    {
        $data = $this->ApiModel->getStandorteIntern();
        $this->terminateWithSuccess(getData($data));
    }

    function getOrte()
    {
        $this->OrtModel->addOrder("ort_kurzbz");
        $data = $this->OrtModel->load();
        $this->terminateWithSuccess(getData($data));
    }

    function getGemeinden()
    {
        $plz = $this->input->get('plz', TRUE);

        if (!is_numeric($plz))
        {
            $this->terminateWithError("plz '$plz' is not numeric!'");
        } else {
            $data = $this->ApiModel->getGemeinden($plz);
            $this->terminateWithSuccess(getData($data));
        }
    }

    function getOrtschaften()
    {
        $plz = $this->input->get('plz', TRUE);

        if (!is_numeric($plz))
            $this->terminateWithError("plz '$plz' is not numeric!'");

        $data = $this->ApiModel->getOrtschaften($plz);
        $this->terminateWithSuccess(getData($data));
    }

    

    // ----------------------------
    // Vertragart
    // ----------------------------
    function getVertragsartAll()
    {
        $this->VertragsartModel->addOrder("sort");
        $data = $this->VertragsartModel->load();
        $this->terminateWithSuccess(getData($data));
    }



    //  ------------------------------------------
    // Kontakttyp
    // -------------------------------------------

    function getKontakttyp()
    {
		$result = $this->KontakttypModel->loadWhere('kontakttyp != \'hidden\'');

		if (isError($result))
		{
			$this->terminateWithError(getError($result));
			exit;
		}

        $this->terminateWithSuccess(getData($result));
    }

    //  ------------------------------------------
    // Adressentyp
    // -------------------------------------------

    function getAdressentyp()
    {
		$this->AdressentypModel->addOrder("sort");
		$result = $this->AdressentypModel->load();

		if (isError($result))
		{
			$this->terminateWithError(getError($result));
			exit;
		}

        $this->terminateWithSuccess(getData($result));
    }

    // -----------------------------------------
    // contracts about to expire (bisverwendung)
    // -----------------------------------------
    function getContractExpire()
    {
        $year = $this->input->get('year', TRUE);

        if (!is_numeric($year))
			show_error('year is not numeric!');

        $month = $this->input->get('month', TRUE);

        if (!is_numeric($month))
			show_error('month is not numeric!');

        $data = $this->ApiModel->getContractExpire($year, $month);
        $this->terminateWithSuccess(getData($data));
    }

    function getContractNew()
    {
        $year = $this->input->get('year', TRUE);

        if (!is_numeric($year))
			show_error('year is not numeric!');

        $month = $this->input->get('month', TRUE);

        if (!is_numeric($month))
			show_error('month is not numeric!');

        $data = $this->ApiModel->getContractNew($year, $month);
        $this->terminateWithSuccess(getData($data));
    }

    function getBirthdays()
    {
        $date = $this->input->get('date', TRUE);
        $data = $this->ApiModel->getBirthdays($date);
        $this->terminateWithSuccess(getData($data));
    }

    function getCovidState()
    {
        $person_id = $this->input->get('person_id', TRUE);

        if (!is_numeric($person_id))
        {
            $this->terminateWithError("person_id is not numeric!'");
            return;
        }

        $date = $this->input->get('d', TRUE);

        if ($date== null)
        {
            $date = time();
        }


        $data = $this->ApiModel->getCovidDate($person_id, $date);
        $this->terminateWithSuccess(getData($data));
    }

    function getCourseHours()
    {
        $uid = $this->input->get('uid', TRUE);
        $semester = $this->input->get('semester', TRUE);

        if ($uid == '')
        {
            $this->terminateWithError("uid is missing!'");
            return;
        }

        if ($semester == '')
        {
            $this->terminateWithError("semester is missing!'");
            return;
        }

        $data = $this->LVAModel->getCourseHours($uid, $semester);
        $this->terminateWithSuccess(getData($data));
    }

    function getAllCourseHours()
    {
        $uid = $this->input->get('uid', TRUE);

        if ($uid == '')
        {
            $this->terminateWithError("uid is missing!'");
            return;
        }

        $data = $this->LVAModel->getAllCourseHours($uid);
        $this->terminateWithSuccess(getData($data));
    }

    function getAllSupportHours()
    {
        $uid = $this->input->get('uid', TRUE);

        if ($uid == '')
        {
            $this->terminateWithError("uid is missing!'");
            return;
        }

        $data = $this->LVAModel->getAllSupportHours($uid);
        $this->terminateWithSuccess(getData($data));
    }


    public function getGehaltstypen()
	{
		$this->GehaltstypModel->resetQuery();
		$this->GehaltstypModel->addSelect('gehaltstyp_kurzbz AS value, '
			. 'bezeichnung AS label, NOT(aktiv) AS disabled, valorisierung');
		$this->GehaltstypModel->addOrder('sort', 'ASC');
		$gehaltstypen = $this->GehaltstypModel->load();
		if( hasData($gehaltstypen) )
		{
			$this->terminateWithSuccess(getData($gehaltstypen));
			return;
		}
		else
		{
			$this->terminateWithError('no contract types found');
			return;
		}
	}

	public function getVertragsarten()
	{
		$this->VertragsartModel->resetQuery();
		$this->VertragsartModel->addSelect('vertragsart_kurzbz AS value, bezeichnung AS label, \'false\'::boolean AS disabled');
		$this->VertragsartModel->addOrder('sort', 'ASC');
		$unternehmen = $this->VertragsartModel->loadWhere('dienstverhaeltnis = true');
		if( hasData($unternehmen) )
		{
			$this->terminateWithSuccess(getData($unternehmen));
			return;
		}
		else
		{
			$this->terminateWithError('no contract types found');
			return;
		}
	}

    public function getVertragsbestandteiltypen()
	{
		$this->VertragsbestandteiltypModel->resetQuery();
		$this->VertragsbestandteiltypModel->addSelect('vertragsbestandteiltyp_kurzbz AS value, bezeichnung AS label');
        $vbtypen = $this->VertragsbestandteiltypModel->load();
		if( hasData($vbtypen) )
		{
			$this->terminateWithSuccess(getData($vbtypen));
			return;
		}
		else
		{
			$this->terminateWithError('no contract types found');
			return;
		}
	}



	public function getKarenztypen()
	{
		$this->KarenztypModel->resetQuery();
		$this->KarenztypModel->addSelect('karenztyp_kurzbz AS value, bezeichnung AS label, \'false\'::boolean AS disabled');
		$this->KarenztypModel->addOrder('bezeichnung', 'ASC');
		$rows = $this->KarenztypModel->load();
		if( hasData($rows) )
		{
			$this->terminateWithSuccess(getData($rows));
			return;
		}
		else
		{
			$this->terminateWithError('no karenz types found');
			return;
		}
	}

	public function getTeilzeittypen()
	{
		$this->TeilzeittypModel->resetQuery();
		$this->TeilzeittypModel->addSelect('teilzeittyp_kurzbz AS value, bezeichnung AS label, \'false\'::boolean AS disabled');
		$this->TeilzeittypModel->addOrder('bezeichnung', 'ASC');
		$rows = $this->TeilzeittypModel->load();
		if( hasData($rows) )
		{
			$this->terminateWithSuccess(getData($rows));
			return;
		}
		else
		{
			$this->terminateWithError('no teilzeit types found');
			return;
		}
	}

	public function getFreitexttypen()
	{
		$this->FreitexttypModel->resetQuery();
		$this->FreitexttypModel->addSelect('freitexttyp_kurzbz AS value, bezeichnung AS label, \'false\'::boolean AS disabled');
		$this->FreitexttypModel->addOrder('bezeichnung', 'ASC');
		$rows = $this->FreitexttypModel->load();
		if( hasData($rows) )
		{
			$this->terminateWithSuccess(getData($rows));
			return;
		}
		else
		{
			$this->terminateWithError('no freitext types found');
			return;
		}
	}
	
	public function getStundensatztypen()
	{
		$this->StundensatztypModel->addSelect('stundensatztyp, bezeichnung');
		$this->StundensatztypModel->addOrder('bezeichnung', 'ASC');
		$result = $this->StundensatztypModel->load();

		if (isError($result))
		{
			return $this->terminateWithError('Keine Stundensatztypen gefunden');
		}

		if (hasData($result))
		{
			return $this->terminateWithSuccess(getData($result));
		}
	}

    // --------------------------------------
    // Report
    // --------------------------------------

    /**
     * execute statistik report
     * expects a payload like this:
     * {
     *  "report":"HomeofficetageMitarbeiterInnen",
     *  "filter":[{"name":"DatumVon","value":"2022-05-01"},{"name":"DatumBis","value":"2022-05-31"}]
     * }
     */
    function getReportData()
    {
        if($this->input->method() === 'post'){
            $payload = json_decode($this->input->raw_input_stream, TRUE);

            // TODO validate param

            $result = $this->StatistikModel->load($payload['report']);
            $this->terminateWithSuccess(getData($this->ApiModel->runReport($result->retval[0]->sql, $payload['filter'])));
        }  else {
            $this->output->set_status_header('405');
        }
    }

    



}