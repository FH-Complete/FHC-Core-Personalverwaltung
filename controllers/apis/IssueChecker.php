<?php
defined('BASEPATH') || exit('No direct script access allowed');

class IssueChecker extends Auth_Controller
{
	const DEBUG = false;
	const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';

	protected $personid;
	protected $_app;
	protected $_extensionName;
	protected $_codeLibMappings;

	protected $infos;
	protected $errors;
	protected $debug;

	public function __construct()
	{
		parent::__construct(
			array(
				'checkPerson' => self::DEFAULT_PERMISSION,
				'countPersonOpenIssues' => self::DEFAULT_PERMISSION
			)
		);

		$this->_app = 'personalverwaltung';
		$this->_extensionName = 'FHC-Core-Personalverwaltung';

		// set fehler codes which can be resolved by the job
		// structure: fehlercode => class (library) name for resolving
		$this->_codeLibMappings = array(
			'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001',
			'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0002' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0002',
			'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0003' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0003',
			'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0004' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0004',
			'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0005' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0005',
			'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0001' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0001',
			'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0002' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0002',
			'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0003' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0003',
			'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0004' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0004',
			'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0005' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0005',
			'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0006' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0006',
			'PERSONALVERWALTUNG_GEHALT_0001' => 'PERSONALVERWALTUNG_GEHALT_0001',
			'PERSONALVERWALTUNG_GEHALT_0002' => 'PERSONALVERWALTUNG_GEHALT_0002',
			'PERSONALVERWALTUNG_GEHALT_0003' => 'PERSONALVERWALTUNG_GEHALT_0003',
			'PERSONALVERWALTUNG_GEHALT_0004' => 'PERSONALVERWALTUNG_GEHALT_0004',
			'PERSONALVERWALTUNG_FUNKTION_0001' => 'PERSONALVERWALTUNG_FUNKTION_0001',
			'PERSONALVERWALTUNG_FUNKTION_0002' => 'PERSONALVERWALTUNG_FUNKTION_0002'
		);

		$this->debug = array();
		$this->errors = array();
		$this->infos = array();

		$this->load->model('system/Issue_model', 'IssueModel');
		$this->load->model('person/Person_model', 'PersonModel');

		$this->load->library('IssuesLib', null, 'IssuesLib');
		$this->load->library(
			'extensions/FHC-Core-Personalverwaltung/issues/PlausicheckDefinitionLib',
			null,
			'PlausicheckDefinitionLib'
		);
		$this->load->library(
			'issues/PlausicheckProducerLib',
			array(
				'app' => $this->_app,
				'extensionName' => $this->_extensionName,
				'fehlerLibMappings' => $this->PlausicheckDefinitionLib->getFehlerLibMappings()
			),
			'PlausicheckProducerLib'
		);
		$this->load->library(
			'issues/PlausicheckResolverLib',
			array(
				'extensionName' => $this->_extensionName,
				'codeLibMappings' => $this->_codeLibMappings
			),
			'PlausicheckResolverLib'
		);
	}

	public function checkPerson($personid)
	{
		$this->personid = intval($personid);

		$persres = $this->PersonModel->load($this->personid);
		$openissues = null;
		if(hasData($persres))
		{
			if($this->input->method(true) === 'POST')
			{
				$this->produceIssues();
				$this->resolveIssues();
				$this->produceIssues();
			}
			else
			{
				$this->errors[] = 'Not called via POST so Plausichecks were not executed.';
			}
			$openissues = $this->countOpenIssues();
		}
		else
		{
			$this->errors[] = 'Person with id ' . $this->personid . ' not found.';
		}

		$data = array(
			'personid' => $this->personid,
			'openissues' => $openissues
		);

		$meta = array(
			'errors' => $this->errors,
			'infos' => $this->infos
		);
		if(self::DEBUG)
		{
			$meta['mapping'] = $this->PlausicheckDefinitionLib->getFehlerLibMappings();
			$meta['debug'] = $this->debug;
		}

		$this->outputJson(
			array(
				'data' => $data,
				'meta' => $meta
			)
		);
		return;
	}

	public function countPersonOpenIssues($personid)
	{
		$this->personid = intval($personid);
		$persres = $this->PersonModel->load($this->personid);
		$openissues = null;
		if(hasData($persres))
		{
			$openissues = $this->countOpenIssues();
		}
		else
		{
			$this->errors[] = 'Person with id ' . $this->personid . ' not found.';
		}

		$data = array(
			'personid' => $this->personid,
			'openissues' => $openissues
		);

		$meta = array(
			'errors' => $this->errors,
			'infos' => $this->infos
		);
		if(self::DEBUG)
		{
			$meta['mapping'] = $this->PlausicheckDefinitionLib->getFehlerLibMappings();
			$meta['debug'] = $this->debug;
		}

		$this->outputJson(
			array(
				'data' => $data,
				'meta' => $meta
			)
		);
		return;
	}

	protected function produceIssues()
	{
		$result = $this->PlausicheckProducerLib->producePlausicheckIssues(
			array('person_id' => $this->personid)
		);

		// log if error, or log info if inserted new issue
		if (isset($result->errors))
			$this->errors = array_merge($this->errors, $result->errors);
		if (isset($result->infos))
			$this->infos = array_merge($this->infos, $result->infos);
	}

	protected function countOpenIssues()
	{
		// load open issues with given errorcodes
		$openIssuesRes = $this->IssueModel->getOpenIssues(
			array_keys($this->_codeLibMappings),
			$this->personid
		);

		// log error if occured
		if (isError($openIssuesRes))
		{
			$this->errors[] = getError($openIssuesRes);
			return null;
		}

		$issues = getData($openIssuesRes);
		$issuescount = (is_array($issues) || $issues instanceof Countable)
					 ? count($issues)
					 : 0;
		return $issuescount;
	}

	protected function resolveIssues()
	{
		// load open issues with given errorcodes
		$openIssuesRes = $this->IssueModel->getOpenIssues(
			array_keys($this->_codeLibMappings),
			$this->personid
		);

		if (hasData($openIssuesRes))
		{
			$openIssues = getData($openIssuesRes);

			$result = $this->PlausicheckResolverLib->resolvePlausicheckIssues($openIssues);

			// log if error, or log info if inserted new issue
			if (isset($result->errors))
				$this->errors = array_merge($this->errors, $result->errors);
			if (isset($result->infos))
				$this->infos = array_merge($this->infos, $result->infos);
		}
	}
}
