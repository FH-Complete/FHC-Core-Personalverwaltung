CREATE TABLE IF NOT EXISTS hr.tbl_gehaltsabrechnung (
	gehaltsabrechnung_id integer NOT NULL,
    datum date,
    betrag numeric(8,2),
    gehaltsbestandteil_id integer,
	CONSTRAINT tbl_gehaltsabrechnung_pk PRIMARY KEY (gehaltsabrechnung_id)
);

CREATE SEQUENCE IF NOT EXISTS hr.tbl_gehaltsabrechnung_gehaltsabrechnung_id_seq
	AS integer
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;

GRANT SELECT, UPDATE ON hr.tbl_gehaltsabrechnung_gehaltsabrechnung_id_seq TO vilesci;

DO $$
BEGIN
	ALTER TABLE hr.tbl_gehaltsabrechnung ALTER COLUMN gehaltsabrechnung_id SET DEFAULT nextval('hr.tbl_gehaltsabrechnung_gehaltsabrechnung_id_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
	ALTER TABLE hr.tbl_gehaltsabrechnung ADD CONSTRAINT tbl_gehaltsbestandteil_fk FOREIGN KEY (gehaltsbestandteil_id)
	REFERENCES hr.tbl_gehaltsbestandteil (gehaltsbestandteil_id) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_gehaltsabrechnung TO vilesci;
