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

		// set fehler codes which can be resolved by the job, with own resolver defined
		// structure: fehlercode => class (library) name for resolving in "resolvers" folder
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

		// fehler which are resolved by the job the same way as they are produced
		// structure: fehlercode => class (library) name for resolving in "plausichecks" folder
		$this->_codeProducerLibMappings = array(
			'PERSONALVERWALTUNG_GEHALT_0005' => 'ValorisierungsBetragAbweichendVonBerechnung',
			'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0006' => 'EchteDienstverhaeltnisseOhneOeVertragsbestandteil',
			'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0007' => 'EchteDienstverhaeltnisseOhneKostenstelleVertragsbestandteil'
		);
	}
}
