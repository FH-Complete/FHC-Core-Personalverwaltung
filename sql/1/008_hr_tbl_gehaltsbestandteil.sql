CREATE TABLE IF NOT EXISTS hr.tbl_gehaltsbestandteil (
    gehaltsbestandteil_id integer NOT NULL,
    von date,
    bis date,
    anmerkung text,
    grundbetrag text,
    betrag_valorisiert text,
    dienstverhaeltnis_id integer,
    gehaltstyp_kurzbz character varying(32),
    valorisierungssperre smallint,
	CONSTRAINT tbl_gehaltsbestandteil_pk PRIMARY KEY (gehaltsbestandteil_id)
);

COMMENT ON COLUMN hr.tbl_gehaltsbestandteil.grundbetrag IS 'Verschlüsselt';
COMMENT ON COLUMN hr.tbl_gehaltsbestandteil.betrag_valorisiert IS 'Verschlüsselt';

CREATE SEQUENCE IF NOT EXISTS hr.tbl_gehaltsbestandteil_gehaltsbestandteil_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;

GRANT SELECT, UPDATE ON hr.tbl_gehaltsbestandteil_gehaltsbestandteil_id_seq TO vilesci;

DO $$
BEGIN
	ALTER TABLE hr.tbl_gehaltsbestandteil ALTER COLUMN gehaltsbestandteil_id SET DEFAULT nextval('hr.tbl_gehaltsbestandteil_gehaltsbestandteil_id_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- dienstverhaeltnis
DO $$
BEGIN
	ALTER TABLE hr.tbl_gehaltsbestandteil ADD CONSTRAINT tbl_dienstverhaeltnis_fk FOREIGN KEY (dienstverhaeltnis_id)
	REFERENCES hr.tbl_dienstverhaeltnis (dienstverhaeltnis_id) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- gehaltstyp
DO $$
BEGIN
	ALTER TABLE hr.tbl_gehaltsbestandteil ADD CONSTRAINT tbl_gehaltstyp_fk FOREIGN KEY (gehaltstyp_kurzbz)
	REFERENCES hr.tbl_gehaltstyp (gehaltstyp_kurzbz) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;


GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_gehaltsbestandteil TO vilesci;
