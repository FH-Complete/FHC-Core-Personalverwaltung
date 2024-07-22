INSERT INTO system.tbl_berechtigung (berechtigung_kurzbz, beschreibung) VALUES
('extension/pv21_handyverwaltung', 'Zugriff auf Handyverwaltung GUI') 
ON CONFLICT (berechtigung_kurzbz) DO NOTHING;
