INSERT INTO system.tbl_berechtigung (berechtigung_kurzbz, beschreibung) VALUES
('extension/pv21_lohnguide_export', 'Zugriff auf Lohnguide Export')
ON CONFLICT (berechtigung_kurzbz) DO NOTHING;