INSERT INTO system.tbl_berechtigung (berechtigung_kurzbz, beschreibung) VALUES
('extension/pv21_kontaktdatenver', 'Zugriff auf Kontaktdatenverwaltung GUI')
ON CONFLICT (berechtigung_kurzbz) DO NOTHING;
