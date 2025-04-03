INSERT INTO system.tbl_berechtigung (berechtigung_kurzbz, beschreibung) VALUES
('extension/pv21_valorisierung', 'Zugriff auf Valorisierung GUI') 
ON CONFLICT (berechtigung_kurzbz) DO NOTHING;