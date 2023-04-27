<?php

/**
 * Job for resolving Personalverwaltung issues
 */
class IssueProducer extends PlausiIssueProducer_Controller
{
	protected $_extensionName = 'FHC-Core-Personalverwaltung'; // name of extension for file path

	public function __construct()
	{
		parent::__construct();

		// set fehler which can be produced by the job
		// structure: fehler_kurzbz => class (library) name for resolving
		$this->_fehlerLibMappings = array(
			'paralelleDienstverhaeltnisseEinUnternehmen' => 'ParalelleDienstverhaeltnisseEinUnternehmen',
			'undurchgaengigesDienstverhaeltnis' => 'UndurchgaengigesDienstverhaeltnis',
			'echteDienstverhaeltnisseOhneStundenVertragsbestandteil' => 'EchteDienstverhaeltnisseOhneStundenVertragsbestandteil',
			'fehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe' => 'FehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe',
			'vertragsbestandteilStartBeforeDienstverhaeltnis' => 'VertragsbestandteilStartBeforeDienstverhaeltnis',
			'vertragsbestandteilEndAfterDienstverhaeltnis' => 'VertragsbestandteilEndAfterDienstverhaeltnis',
			'ueberlappendeVertragsbestandteile' => 'UeberlappendeVertragsbestandteile',
			'ueberlappendeFreitextVertragsbestandteile' => 'UeberlappendeFreitextVertragsbestandteile',
			'vertragsbestandteilOhneZusatztabelle' => 'VertragsbestandteilOhneZusatztabelle',
			'vertragsbestandteilFalscheZusatztabelle' => 'VertragsbestandteilFalscheZusatztabelle',
			'grundgehaltKeinemStundenVertragsbestandteilZugewiesen' => 'GrundgehaltKeinemStundenVertragsbestandteilZugewiesen',
			'gehaltsbestandteilNichtImVertragsbestandteilDatumsbereich' => 'GehaltsbestandteilNichtImVertragsbestandteilDatumsbereich',
			'gehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich' => 'GehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich',
			'verschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil' => 'VerschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil',
			'funktionUidUngleichDienstverhaeltnisUid' => 'FunktionUidUngleichDienstverhaeltnisUid',
			'funktionFaelltNichtInVertragsbestandteilZeitraum' => 'FunktionFaelltNichtInVertragsbestandteilZeitraum'
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
