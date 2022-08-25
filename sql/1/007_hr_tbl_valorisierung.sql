CREATE TABLE hr.tbl_valorisierung (
    valorisierung_id integer NOT NULL,
    jahr date,
    prozent numeric(8,4),
    betrag numeric(8,2),
    dienstverhaeltnis_id integer,
    CONSTRAINT "betrag or prozent" CHECK (((betrag IS NULL) OR (prozent IS NULL)))
);

CREATE SEQUENCE IF NOT EXISTS hr.tbl_valorisierung_valorisierung_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;

GRANT SELECT, UPDATE ON hr.tbl_valorisierung_valorisierung_id_seq TO vilesci;

DO $$
BEGIN
	ALTER TABLE hr.tbl_valorisierung ALTER COLUMN valorisierung_id SET DEFAULT nextval('hr.tbl_valorisierung_valorisierung_id_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_valorisierung TO vilesci;


DO $$
BEGIN
	ALTER TABLE hr.tbl_valorisierung ADD CONSTRAINT tbl_dienstverhaeltnis_fk FOREIGN KEY (dienstverhaeltnis_id)
	REFERENCES hr.tbl_dienstverhaeltnis (dienstverhaeltnis_id) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;