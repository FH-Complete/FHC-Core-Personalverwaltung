<?php
defined('BASEPATH') || exit('No direct script access allowed');

class IssueChecker extends Auth_Controller
{
	const DEBUG = false;
    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';

	const CI_PATH = 'application';
	const CI_LIBRARY_FOLDER = 'libraries';
	const EXTENSIONS_FOLDER = 'extensions';
	const ISSUE_RESOLVERS_FOLDER = 'issues/resolvers';
	const CHECK_ISSUE_RESOLVED_METHOD_NAME = 'checkIfIssueIsResolved';
	
	protected $personid;
	protected $_app;
	protected $_extensionName;
	protected $_codeLibMappings;
	
	protected $infos;
	protected $errors;
	protected $debug;


	public function __construct() {
        
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
		$this->load->library('issues/PlausicheckProducerLib', 
			array(
				'app' => $this->_app, 
				'extensionName' => $this->_extensionName
			), 
			'PlausicheckProducerLib'
		);
		$this->load->library('extensions/FHC-Core-Personalverwaltung/issues/PlausicheckDefinitionLib', 
			null, 'PlausicheckDefinitionLib');
	}

	public function checkPerson($personid)
	{
		$this->personid = intval($personid);

		$persres = $this->PersonModel->load($this->personid);
		$openissues = null;
		if(hasData($persres)) 
		{
			if( $this->input->method(TRUE) === 'POST' ) 
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
		foreach ( $this->PlausicheckDefinitionLib->getFehlerLibMappings() as $fehler_kurzbz => $libName)
		{
			$plausicheckRes = $this->PlausicheckProducerLib->producePlausicheckIssue(
				$libName,
				$fehler_kurzbz,
				array(
					'person_id' => $this->personid
				)
			);
			
			if(self::DEBUG) 
			{
				$this->debug[$fehler_kurzbz] = $plausicheckRes;
			}
			
			if (hasData($plausicheckRes))
			{
				$plausicheckData = getData($plausicheckRes);

				foreach ($plausicheckData as $plausiData)
				{
					// get the data needed for issue production
					$person_id = isset($plausiData['person_id']) ? $plausiData['person_id'] : null;
					$oe_kurzbz = isset($plausiData['oe_kurzbz']) ? $plausiData['oe_kurzbz'] : null;
					$fehlertext_params = isset($plausiData['fehlertext_params']) ? $plausiData['fehlertext_params'] : null;
					$resolution_params = isset($plausiData['resolution_params']) ? $plausiData['resolution_params'] : null;

					// write the issue
					$addIssueRes = $this->IssuesLib->addFhcIssue($fehler_kurzbz, $person_id, $oe_kurzbz, $fehlertext_params, $resolution_params);

					// log if error, or log info if inserted new issue
					if (isError($addIssueRes))
						$this->errors[] = (getError($addIssueRes));
					elseif (hasData($addIssueRes) && is_integer(getData($addIssueRes)))
						$this->infos[] = "Plausicheck issue " . $fehler_kurzbz . " successfully produced, person_id: " . $person_id;
				}
			}
		}
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

		// log error if occured
		if (isError($openIssuesRes))
		{
			$this->errors[] = getError($openIssuesRes);
		}
		else
		{
			// log info if no data found
			if (!hasData($openIssuesRes))
			{
				$this->infos[] = "No open issues found";
			}
			else
			{
				$openIssues = getData($openIssuesRes);

				foreach ($openIssues as $issue)
				{
					// ignore if Fehlercode is not in libmappings (shouldn't be checked)
					if (!isset($this->_codeLibMappings[$issue->fehlercode])) continue;

					$libName = $this->_codeLibMappings[$issue->fehlercode];

					// add person id and oe kurzbz automatically as params, merge it with additional params
					// decode bewerbung_parameter into assoc array
					$params = array_merge(
						array('issue_id' => $issue->issue_id, 'issue_person_id' => $issue->person_id, 'issue_oe_kurzbz' => $issue->oe_kurzbz),
						isset($issue->behebung_parameter) ? json_decode($issue->behebung_parameter, true) : array()
					);

					// if called from extension (extension name set), path includes extension names
					$libRootPath = isset($this->_extensionName) ? self::EXTENSIONS_FOLDER . '/' . $this->_extensionName . '/' : '';

					// path for loading issue library
					$issuesLibPath = $libRootPath . self::ISSUE_RESOLVERS_FOLDER . '/';

					// file path of library for check if file exists
					$issuesLibFilePath = DOC_ROOT . self::CI_PATH
						. '/' . $libRootPath . self::CI_LIBRARY_FOLDER . '/' . self::ISSUE_RESOLVERS_FOLDER . '/' . $libName . '.php';

					// check if library file exists
					if (!file_exists($issuesLibFilePath))
					{
						// log error and continue with next issue if not
						$this->errors[] = "Issue library file " . $issuesLibFilePath . " does not exist";
						continue;
					}

					// load library connected to fehlercode
					$this->load->library($issuesLibPath . $libName);

					$lowercaseLibName = mb_strtolower($libName);

					// check if method is defined in library class
					if (!is_callable(array($this->{$lowercaseLibName}, self::CHECK_ISSUE_RESOLVED_METHOD_NAME)))
					{
						// log error and continue with next issue if not
						$this->errors[] = "Method " . self::CHECK_ISSUE_RESOLVED_METHOD_NAME . " is not defined in library $lowercaseLibName";
						continue;
					}

					// call the function for checking for issue resolution
					$issueResolvedRes = $this->{$lowercaseLibName}->{self::CHECK_ISSUE_RESOLVED_METHOD_NAME}($params);

					if (isError($issueResolvedRes))
					{
						$this->errors[] = getError($issueResolvedRes);
					}
					else
					{
						$issueResolvedData = getData($issueResolvedRes);

						if ($issueResolvedData === true)
						{
							// set issue to resolved if needed
							$behobenRes = $this->IssuesLib->setBehoben($issue->issue_id, null);

							if (isError($behobenRes))
								$this->errors[] = getError($behobenRes);
							else
								$this->infos[] = "Issue " . $issue->issue_id . " successfully resolved";
						}
					}
				}
			}
		}
	}
}
