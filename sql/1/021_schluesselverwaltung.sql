INSERT INTO system.tbl_berechtigung (berechtigung_kurzbz, beschreibung) VALUES
('extension/pv21_schluesselver', 'Zugriff auf Schlüsselverwaltung GUI')
ON CONFLICT (berechtigung_kurzbz) DO NOTHING;
