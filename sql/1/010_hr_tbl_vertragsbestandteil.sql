CREATE TABLE IF NOT EXISTS hr.tbl_vertragsbestandteil (
	vertragsbestandteil_id integer NOT NULL,
    von date,
    bis date,
    stundenausmass numeric(8,2),
    zeitaufzeichnung boolean,
    azgrelevant boolean,
    homeoffice boolean,
    dienstverhaeltnis_id integer,
    ba1code integer,
    verwendung_code smallint,
    hauptberufcode integer,
    kv_gruppe character varying(32),
    verwendungsgruppenjahr smallint,
    dvart character varying(32),
    inkludierte_lehre smallint,
    vertragsart_kurzbz character varying(32),
	CONSTRAINT tbl_vertragsbestandteil_pk PRIMARY KEY (vertragsbestandteil_id)
);


CREATE SEQUENCE IF NOT EXISTS hr.tbl_vertragsbestandteil_vertragsbestandteil_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;

GRANT SELECT, UPDATE ON hr.tbl_vertragsbestandteil_vertragsbestandteil_id_seq TO vilesci;

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil ALTER COLUMN vertragsbestandteil_id SET DEFAULT nextval('hr.tbl_vertragsbestandteil_vertragsbestandteil_id_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- dienstverhaeltnis
DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil ADD CONSTRAINT tbl_dienstverhaeltnis_fk FOREIGN KEY (dienstverhaeltnis_id)
	REFERENCES hr.tbl_dienstverhaeltnis (dienstverhaeltnis_id) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- tbl_vertragsart
DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil ADD CONSTRAINT tbl_vertragsart_fk FOREIGN KEY (vertragsart_kurzbz)
	REFERENCES hr.tbl_vertragsart (vertragsart_kurzbz) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- tbl_beschaeftigungsart1
DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil ADD CONSTRAINT tbl_beschaeftigungsart1_fk FOREIGN KEY (ba1code)
	REFERENCES bis.tbl_beschaeftigungsart1 (ba1code) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- tbl_hauptberuf
DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil ADD CONSTRAINT tbl_hauptberuf_fk FOREIGN KEY (hauptberufcode)
	REFERENCES bis.tbl_hauptberuf (hauptberufcode) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- tbl_verwendung
DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil ADD CONSTRAINT tbl_verwendung_fk FOREIGN KEY (verwendung_code)
	REFERENCES bis.tbl_verwendung (verwendung_code) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- tbl_kv_gruppe
DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil ADD CONSTRAINT tbl_kv_gruppe_fk FOREIGN KEY (kv_gruppe)
	REFERENCES hr.tbl_kv_gruppe (kv_gruppe) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil TO vilesci;

