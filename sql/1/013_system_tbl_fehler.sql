INSERT INTO system.tbl_fehler (fehlercode, fehler_kurzbz, fehlercode_extern, fehlertext, fehlertyp_kurzbz, app) VALUES
/* Errors */
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001', 'paralelleDienstverhaeltnisseEinUnternehmen', NULL, 'Paralelle Dienstverhältnisse in einem Unternehmen; erste dienstverhaeltnis_id %s, zweite dienstverhaeltnis_id %s, erste vertragsbestandteil_id %s, zweite vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0002', 'undurchgaengigesDienstverhaeltnis', NULL, 'Undurchgängiges Dienstverhältnis; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0003', 'echteDienstverhaeltnisseOhneStundenVertragsbestandteil', NULL, 'Echtes Dienstverhältnis ohne Stunden Vertragsbestandteil; dienstverhaeltnis_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0004', 'fehlendeDienstverhaeltnisOeFuerStandardkostenstelleOe', NULL, 'Falsche Dienstverhältnis Organisationseinheit (Unternehmen) für Standardkostenstelle; benutzerfunktion_id %s, oe_kurzbz %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0005', 'fehlendesDienstverhaeltnisFuerAktivenMitarbeiter', NULL, 'Fehlendes Dienstverhältnis für aktiven Benutzer; mitarbeiter uid %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0006', 'echteDienstverhaeltnisseOhneOeVertragsbestandteil', NULL, 'Fehlende Organisationseinheitszuordnung-Vertragsbestandteile, gesamte Dauer des Dienstverhältnisses muss abgedeckt sein; dienstverhaeltnis_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0007', 'echteDienstverhaeltnisseOhneKostenstelleVertragsbestandteil', NULL, 'Fehlende Standardkostenstellen-Vertragsbestandteile, gesamte Dauer des Dienstverhältnisses muss abgedeckt sein; dienstverhaeltnis_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0001', 'vertragsbestandteilStartBeforeDienstverhaeltnis', NULL, 'Vertragsbestandteil Startdatum liegt vor Dienstverhältnis Startdatum; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0002', 'vertragsbestandteilEndAfterDienstverhaeltnis', NULL, 'Vertragsbestandteil Endedatum liegt nach Dienstverhältnis Endedatum; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0003', 'ueberlappendeVertragsbestandteile', NULL, 'Vertragsbestandteile mit gleichem Typ überlappen sich im selben Dienstverhältnis; erste vertragsbestandteil_id %s, zweite vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0004', 'ueberlappendeFreitextVertragsbestandteile', NULL, 'Vertragsbestandteile mit Typ Freitext überlappen sich im selben Dienstverhältnis; erste vertragsbestandteil_id %s, zweite vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0005', 'vertragsbestandteilOhneZusatztabelle', NULL, 'Fehlende Zusatztabelle bei Vertragsbestandteil; vertragsbestandteil_id %s, vertragsbestandteil_typ %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0006', 'vertragsbestandteilFalscheZusatztabelle', NULL, 'Falsche Zusatztabelle bei Vertragsbestandteil; erste vertragsbestandteil_id %s, vertragsbestandteil_typ %s, zusatztabellen %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_GEHALT_0001', 'grundgehaltKeinemStundenVertragsbestandteilZugewiesen', NULL, 'Grundgehaltsbestandteil keinem Stundenvertragsbestandteil zugewiesen; gehaltsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_GEHALT_0002', 'gehaltsbestandteilNichtImVertragsbestandteilDatumsbereich', NULL, 'Datum des Gehaltbestandteils liegt nicht im Datumsbereich des zugewiesenen Vertragsbestandteils; gehaltsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_GEHALT_0003', 'gehaltsbestandteilNichtImDienstverhaeltnisDatumsbereich', NULL, 'Datum des Gehaltbestandteils liegt nicht im Datumsbereich des zugewiesenen Dienstverhältnisses; gehaltsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_GEHALT_0004', 'verschiedenesDienstverhaeltnisBeiGehaltUndVertragsbestandteil', NULL, 'Gehaltsbestandteil und verknüpfter Vertragsbestandteil sind unterschiedlichem Dienstverhältnis zugewiesen; gehaltsbestandteil_id %s, vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_GEHALT_0005', 'valorisierungsBetragAbweichendVonBerechnung', NULL, 'Valorisierungshistorie oder valorisierter Betrag stimmt nicht mit berechneter Valorisierung überein; gehaltsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_FUNKTION_0001', 'funktionUidUngleichDienstverhaeltnisUid', NULL, 'Mitarbeiter UID der Funktion stimmt nicht mit Mitarbeiter UID des Dienstverhältnisses überein; dienstverhaeltnis_id %s, benutzerfunktion_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_FUNKTION_0002', 'funktionFaelltNichtInVertragsbestandteilZeitraum', NULL, 'Zeitraum der Mitarbeiter Funktion fällt nicht in Zeitraum des Vertragsbestandteils; vertragsbestandteil_id %s, benutzerfunktion_id %s', 'error', 'personalverwaltung')
/* Warnings */
ON CONFLICT (fehlercode) DO NOTHING;
