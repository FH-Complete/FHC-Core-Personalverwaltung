<?php

/**
 * Job for resolving Personalverwaltung issues
 */
class PlausiIssueProducer extends PlausiIssueProducer_Controller
{
	protected $_extensionName = 'FHC-Core-Personalverwaltung'; // name of extension for file path

	public function __construct()
	{
		parent::__construct();

		// set fehler which can be produced by the job
		// structure: fehler_kurzbz => class (library) name for resolving
		$this->_fehlerLibMappings = array(
			'paralelleDienstverhaeltnisseEinUnternehmen' => 'ParalelleDienstverhaeltnisseEinUnternehmen',
			'undurchgaengigesDienstverhaeltnis' => 'UndurchgaengigesDienstverhaeltnis'
		);
	}

	/**
	 * Runs issue production job.
	 */
	public function run()
	{
		// producing issues
		$this->producePlausicheckIssues(array());
	}
}
