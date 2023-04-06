INSERT INTO system.tbl_fehler (fehlercode, fehler_kurzbz, fehlercode_extern, fehlertext, fehlertyp_kurzbz, app) VALUES
/* Errors */
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001', 'paralelleDienstverhaeltnisseEinUnternehmen', NULL, 'Paralelle Dienstverhältnisse in einem Unternehmen; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0002', 'undurchgaengigesDienstverhaeltnis', NULL, 'Undurchgängiges Dienstverhältnis; vertragsbestandteil_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0003', 'echteDienstverhaeltnisseOhneStundenVertragsbestandteil', NULL, 'Echtes Dienstverhältnis ohne Stunden Vertragsbestandteil dienstverhaeltnis_id %s', 'error', 'personalverwaltung'),
('PERSONALVERWALTUNG_VERTRAGSBESTANDTEIL_0001', 'vertragsbestandteilStartBeforeDienstverhaeltnis', NULL, 'Vertragsbestandteil Startdatum liegt vor Dienstverhältnis Startdatum; vertragsbestandteil_id %s', 'error', 'personalverwaltung')
/* Warnings */
ON CONFLICT (fehlercode) DO NOTHING;
