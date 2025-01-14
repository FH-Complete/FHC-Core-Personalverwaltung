INSERT INTO system.tbl_berechtigung (berechtigung_kurzbz, beschreibung) VALUES
('extension/pv21_dv', 'Erstellen und Bearbeiten von DVs') 
ON CONFLICT (berechtigung_kurzbz) DO NOTHING;

INSERT INTO system.tbl_berechtigung (berechtigung_kurzbz, beschreibung) VALUES
('extension/pv21_dv_korr', 'Korrigieren von DVs') 
ON CONFLICT (berechtigung_kurzbz) DO NOTHING;