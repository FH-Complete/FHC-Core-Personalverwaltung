<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

$config['fehler'] = array(
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001',
		'fehler_kurzbz' => 'paralelleDienstverhaeltnisseEinUnternehmen',
		'fehlercode_extern' => null,
		'fehlertext' => 'Paralelle Dienstverhältnisse in einem Unternehmen; erste dienstverhaeltnis_id %s, zweite dienstverhaeltnis_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'ParalelleDienstverhaeltnisseEinUnternehmen',
		'resolverLibName' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0002',
		'fehler_kurzbz' => 'undurchgaengigesDienstverhaeltnis',
		'fehlercode_extern' => null,
		'fehlertext' => 'Undurchgängiges Dienstverhältnis; vertragsbestandteil_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'UndurchgaengigesDienstverhaeltnis',
		'resolverLibName' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0002',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0003',
		'fehler_kurzbz' => 'echteDienstverhaeltnisseOhneStundenVertragsbestandteil',
		'fehlercode_extern' => null,
		'fehlertext' => 'Echtes Dienstverhältnis ohne Stunden Vertragsbestandteil; dienstverhaeltnis_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'EchteDienstverhaeltnisseOhneStundenVertragsbestandteil',
		'resolverLibName' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0003',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0004',
		'fehler_kurzbz' => 'fehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe',
		'fehlercode_extern' => null,
		'fehlertext' => 'Falsche Dienstverhältnis Organisationseinheit (Unternehmen) für Standardkostenstelle; benutzerfunktion_id %s, oe_kurzbz %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'FehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe',
		'resolverLibName' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0004',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0005',
		'fehler_kurzbz' => 'fehlendesDienstverhaeltnisFuerAktivenMitarbeiter',
		'fehlercode_extern' => null,
		'fehlertext' => 'Fehlendes Dienstverhältnis für aktiven Benutzer; mitarbeiter uid %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'FehlendesDienstverhaeltnisFuerAktivenMitarbeiter',
		'resolverLibName' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0005',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0006',
		'fehler_kurzbz' => 'echteDienstverhaeltnisseOhneOeVertragsbestandteil',
		'fehlercode_extern' => null,
		'fehlertext' => 'Fehlende oder überschneidende Organisationseinheitszuordnung-Vertragsbestandteile, gesamte Dauer des Dienstverhältnisses muss abgedeckt sein; dienstverhaeltnis_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'EchteDienstverhaeltnisseOhneOeVertragsbestandteil',
		'resolverLibName' => null,
		'producerIsResolver' => true
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0007',
		'fehler_kurzbz' => 'echteDienstverhaeltnisseOhneKostenstelleVertragsbestandteil',
		'fehlercode_extern' => null,
		'fehlertext' => 'Fehlende oder überschneidende Standardkostenstellen-Vertragsbestandteile, gesamte Dauer des Dienstverhältnisses muss abgedeckt sein; dienstverhaeltnis_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'EchteDienstverhaeltnisseOhneKostenstelleVertragsbestandteil',
		'resolverLibName' => null,
		'producerIsResolver' => true
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0001',
		'fehler_kurzbz' => 'vertragsbestandteilStartBeforeDienstverhaeltnis',
		'fehlercode_extern' => null,
		'fehlertext' => 'Vertragsbestandteil Startdatum liegt vor Dienstverhältnis Startdatum; vertragsbestandteil_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'VertragsbestandteilStartBeforeDienstverhaeltnis',
		'resolverLibName' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0001',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0002',
		'fehler_kurzbz' => 'vertragsbestandteilEndAfterDienstverhaeltnis',
		'fehlercode_extern' => null,
		'fehlertext' => 'Vertragsbestandteil Endedatum liegt nach Dienstverhältnis Endedatum; vertragsbestandteil_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'VertragsbestandteilEndAfterDienstverhaeltnis',
		'resolverLibName' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0002',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0003',
		'fehler_kurzbz' => 'ueberlappendeVertragsbestandteile',
		'fehlercode_extern' => null,
		'fehlertext' => 'Vertragsbestandteile mit gleichem Typ überlappen sich im selben Dienstverhältnis; erste vertragsbestandteil_id %s, zweite vertragsbestandteil_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'UeberlappendeVertragsbestandteile',
		'resolverLibName' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0003',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0004',
		'fehler_kurzbz' => 'ueberlappendeFreitextVertragsbestandteile',
		'fehlercode_extern' => null,
		'fehlertext' => 'Vertragsbestandteile mit Typ Freitext überlappen sich im selben Dienstverhältnis; erste vertragsbestandteil_id %s, zweite vertragsbestandteil_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'UeberlappendeFreitextVertragsbestandteile',
		'resolverLibName' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0004',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0005',
		'fehler_kurzbz' => 'vertragsbestandteilOhneZusatztabelle',
		'fehlercode_extern' => null,
		'fehlertext' => 'Fehlende Zusatztabelle bei Vertragsbestandteil; vertragsbestandteil_id %s, vertragsbestandteil_typ %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'VertragsbestandteilOhneZusatztabelle',
		'resolverLibName' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0005',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0006',
		'fehler_kurzbz' => 'vertragsbestandteilFalscheZusatztabelle',
		'fehlercode_extern' => null,
		'fehlertext' => 'Falsche Zusatztabelle bei Vertragsbestandteil; erste vertragsbestandteil_id %s, vertragsbestandteil_typ %s, zusatztabellen %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'VertragsbestandteilFalscheZusatztabelle',
		'resolverLibName' => 'PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0006',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_GEHALT_0001',
		'fehler_kurzbz' => 'grundgehaltKeinemStundenVertragsbestandteilZugewiesen',
		'fehlercode_extern' => null,
		'fehlertext' => 'Fehlende oder überschneidende Standardkostenstellen-Vertragsbestandteile, gesamte Dauer des Dienstverhältnisses muss abgedeckt sein; dienstverhaeltnis_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'GrundgehaltKeinemStundenVertragsbestandteilZugewiesen',
		'resolverLibName' => 'PERSONALVERWALTUNG_GEHALT_0001',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_GEHALT_0002',
		'fehler_kurzbz' => 'gehaltsbestandteilNichtImVertragsbestandteilDatumsbereich',
		'fehlercode_extern' => null,
		'fehlertext' => 'Grundgehaltsbestandteil keinem Stundenvertragsbestandteil zugewiesen; gehaltsbestandteil_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'GehaltsbestandteilNichtImVertragsbestandteilDatumsbereich',
		'resolverLibName' => 'PERSONALVERWALTUNG_GEHALT_0002',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_GEHALT_0003',
		'fehler_kurzbz' => 'gehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich',
		'fehlercode_extern' => null,
		'fehlertext' => 'Datum des Gehaltbestandteils liegt nicht im Datumsbereich des zugewiesenen Dienstverhältnisses; gehaltsbestandteil_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'GehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich',
		'resolverLibName' => 'PERSONALVERWALTUNG_GEHALT_0003',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_GEHALT_0004',
		'fehler_kurzbz' => 'verschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil',
		'fehlercode_extern' => null,
		'fehlertext' => 'Gehaltsbestandteil und verknüpfter Vertragsbestandteil sind unterschiedlichem Dienstverhältnis zugewiesen; gehaltsbestandteil_id %s, vertragsbestandteil_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'VerschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil',
		'resolverLibName' => 'PERSONALVERWALTUNG_GEHALT_0004',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_GEHALT_0005',
		'fehler_kurzbz' => 'valorisierungsBetragAbweichendVonBerechnung',
		'fehlercode_extern' => null,
		'fehlertext' => 'Valorisierungshistorie oder valorisierter Betrag stimmt nicht mit berechneter Valorisierung überein; gehaltsbestandteil_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'ValorisierungsBetragAbweichendVonBerechnung',
		'resolverLibName' => null,
		'producerIsResolver' => true
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_FUNKTION_0001',
		'fehler_kurzbz' => 'funktionUidUngleichDienstverhaeltnisUid',
		'fehlercode_extern' => null,
		'fehlertext' => 'Mitarbeiter UID der Funktion stimmt nicht mit Mitarbeiter UID des Dienstverhältnisses überein; dienstverhaeltnis_id %s, benutzerfunktion_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'FunktionUidUngleichDienstverhaeltnisUid',
		'resolverLibName' => 'PERSONALVERWALTUNG_FUNKTION_0001',
		'producerIsResolver' => false
	),
	array(
		'fehlercode' => 'PERSONALVERWALTUNG_FUNKTION_0002',
		'fehler_kurzbz' => 'funktionFaelltNichtInVertragsbestandteilZeitraum',
		'fehlercode_extern' => null,
		'fehlertext' => 'Zeitraum der Mitarbeiter Funktion fällt nicht in Zeitraum des Vertragsbestandteils; vertragsbestandteil_id %s, benutzerfunktion_id %s',
		'fehlertyp_kurzbz' => 'error',
		'app' => array('personalverwaltung'),
		'producerLibName' => 'FunktionFaelltNichtInVertragsbestandteilZeitraum',
		'resolverLibName' => 'PERSONALVERWALTUNG_FUNKTION_0002',
		'producerIsResolver' => false
	)
);