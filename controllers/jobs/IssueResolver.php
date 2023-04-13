<?php

/**
 * Job for resolving Personalverwaltung issues
 */
class IssueResolver extends IssueResolver_Controller
{
	protected $_extensionName = 'FHC-Core-Personalverwaltung'; // name of extension for file path

	public function __construct()
	{
		parent::__construct();

		// set fehler codes which can be resolved by the job
		// structure: fehlercode => class (library) name for resolving
		$this->_codeLibMappings = array(
			'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001'
		);
	}
}
