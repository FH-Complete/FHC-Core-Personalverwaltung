INSERT INTO system.tbl_fehler (fehlercode, fehler_kurzbz, fehlercode_extern, fehlertext, fehlertyp_kurzbz, app) VALUES
/* Errors */
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001', 'paralelleDienstverhaeltnisseEinUnternehmen', NULL, 'Paralelle Dienstverhältnisse in einem Unternehmen; erste dienstverhaeltnis_id %s, zweite dienstverhaeltnis_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0002', 'undurchgaengigesDienstverhaeltnis', NULL, 'Undurchgängiges Dienstverhältnis; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0003', 'echteDienstverhaeltnisseOhneStundenVertragsbestandteil', NULL, 'Echtes Dienstverhältnis ohne Stunden Vertragsbestandteil dienstverhaeltnis_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0001', 'vertragsbestandteilStartBeforeDienstverhaeltnis', NULL, 'Vertragsbestandteil Startdatum liegt vor Dienstverhältnis Startdatum; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0002', 'vertragsbestandteilEndAfterDienstverhaeltnis', NULL, 'Vertragsbestandteil Endedatum liegt nach Dienstverhältnis Endedatum; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0003', 'ueberlappendeVertragsbestandteile', NULL, 'Vertragsbestandteile mit gleichem Typ überlappen sich im selben Dienstverhältnis; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0004', 'ueberlappendeFreitextVertragsbestandteile', NULL, 'Vertragsbestandteile mit Typ Freitext überlappen sich im selben Dienstverhältnis; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_GEHALT_0001', 'grundgehaltKeinemStundenVertragsbestandteilZugewiesen', NULL, 'Grundgehaltsbestandteil keinem Stundenvertragsbestandteil zugewiesen; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_GEHALT_0002', 'gehaltsbestandteilNichtImVertragsbestandteilDatumsbereich', NULL, 'Datum des Gehaltbestandteils liegt nicht im Datumsbereich des zugewiesenen Vertragsbestandteil; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_GEHALT_0003', 'gehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich', NULL, 'Datum des Gehaltbestandteils liegt nicht im Datumsbereich des zugewiesenen Dienstverhältnisses; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_FUNKTION_0001', 'funktionUidUngleichDienstverhaeltnisUid', NULL, 'Mitarbeiter UID der Funktion stimmt nicht mit Mitarbeiter UID des Dienstverhältnisses überein; dienstverhaeltnis_id %s, benutzerfunktion_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_FUNKTION_0002', 'funktionFaelltNichtInVertragsbestandteilZeitraum', NULL, 'Zeitraum der Mitarbeiter Funktion fällt nicht in Zeitraum des Vertragsbestandteils; vertragsbestandteil_id %s, benutzerfunktion_id %s', 'error', 'personalverwaltung')
/* Warnings */
ON CONFLICT (fehlercode) DO NOTHING;
