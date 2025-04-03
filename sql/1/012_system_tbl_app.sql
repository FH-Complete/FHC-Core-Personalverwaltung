INSERT INTO system.tbl_app (app) VALUES
('personalverwaltung')
ON CONFLICT (app) DO NOTHING;
