<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Library containing definitions of all core plausichecks.
 */
class PlausicheckDefinitionLib
{
	// set fehler for core plausichecks
	// structure: fehler_kurzbz => class (library) name for resolving
	private $_fehlerLibMappings = array(
		'echteDienstverhaeltnisseOhneStundenVertragsbestandteil' => 'EchteDienstverhaeltnisseOhneStundenVertragsbestandteil',
		'fehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe' => 'FehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe',
		'funktionFaelltNichtInVertragsbestandteilZeitraum' => 'FunktionFaelltNichtInVertragsbestandteilZeitraum',
		'funktionUidUngleichDienstverhaeltnisUid' => 'FunktionUidUngleichDienstverhaeltnisUid',
		'gehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich' => 'GehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich',
		'gehaltsbestandteilNichtImVertragsbestandteilDatumsbereich' => 'GehaltsbestandteilNichtImVertragsbestandteilDatumsbereich',
		'grundgehaltKeinemStundenVertragsbestandteilZugewiesen' => 'GrundgehaltKeinemStundenVertragsbestandteilZugewiesen',
		'paralelleDienstverhaeltnisseEinUnternehmen' => 'ParalelleDienstverhaeltnisseEinUnternehmen',
		'ueberlappendeFreitextVertragsbestandteile' => 'UeberlappendeFreitextVertragsbestandteile',
		'ueberlappendeVertragsbestandteile' => 'UeberlappendeVertragsbestandteile',
		'undurchgaengigesDienstverhaeltnis' => 'UndurchgaengigesDienstverhaeltnis',
		'valorisierungsBetragAbweichendVonBerechnung' => 'ValorisierungsBetragAbweichendVonBerechnung',
		'vertragsbestandteilEndAfterDienstverhaeltnis' => 'VertragsbestandteilEndAfterDienstverhaeltnis',
		'vertragsbestandteilFalscheZusatztabelle' => 'VertragsbestandteilFalscheZusatztabelle',
		'vertragsbestandteilOhneZusatztabelle' => 'VertragsbestandteilOhneZusatztabelle',
		'vertragsbestandteilStartBeforeDienstverhaeltnis' => 'VertragsbestandteilStartBeforeDienstverhaeltnis'
	);

	/**
	 * Gets all fehler_kurzbz-library mappings for fehler which need to be checked.
	 */
	public function getFehlerLibMappings()
	{
		return $this->_fehlerLibMappings;
	}

	/**
	 * Gets all fehler_kurzbz for fehler which need to be checked.
	 */
	public function getFehlerKurzbz()
	{
		return array_keys($this->_fehlerLibMappings);
	}
}
