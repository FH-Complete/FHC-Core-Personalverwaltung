<?php

/**
 * Job for resolving Personalverwaltung issues
 */
class IssueProducer extends PlausiIssueProducer_Controller
{
	public function __construct()
	{
		parent::__construct();

		// set fehler which can be produced by the job
		// structure: fehler_kurzbz => class (library) name for resolving
		$this->_fehlerKurzbz = array(
			'paralelleDienstverhaeltnisseEinUnternehmen',
			'undurchgaengigesDienstverhaeltnis',
			'echteDienstverhaeltnisseOhneStundenVertragsbestandteil',
			'echteDienstverhaeltnisseOhneOeVertragsbestandteil',
			'echteDienstverhaeltnisseOhneKostenstelleVertragsbestandteil',
			'fehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe',
			'fehlendesDienstverhaeltnisFuerAktivenMitarbeiter',
			'vertragsbestandteilStartBeforeDienstverhaeltnis',
			'vertragsbestandteilEndAfterDienstverhaeltnis',
			'ueberlappendeVertragsbestandteile',
			'ueberlappendeFreitextVertragsbestandteile',
			'vertragsbestandteilOhneZusatztabelle',
			'valorisierungsBetragAbweichendVonBerechnung',
			'vertragsbestandteilFalscheZusatztabelle',
			'grundgehaltKeinemStundenVertragsbestandteilZugewiesen',
			'gehaltsbestandteilNichtImVertragsbestandteilDatumsbereich',
			'gehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich',
			'verschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil',
			'funktionUidUngleichDienstverhaeltnisUid',
			'funktionFaelltNichtInVertragsbestandteilZeitraum'
		);
	}
}
