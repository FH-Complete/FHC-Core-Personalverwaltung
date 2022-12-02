CREATE TABLE IF NOT EXISTS hr.tbl_mindestgehalt (
	jahr smallint,
	kv_gruppe character varying(32),   -- beschaeftigungsgruppe (A, B, C, ..)
	stufe smallint,  				-- vorrueckungsstufe	
	betrag numeric(8,2),	
	CONSTRAINT tbl_mindestgehalt_pk PRIMARY KEY (jahr, kv_gruppe, stufe)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_mindestgehalt ADD CONSTRAINT tbl_mindestgehalt_fk FOREIGN KEY (kv_gruppe)
	REFERENCES hr.tbl_kv_gruppe (kv_gruppe) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_mindestgehalt TO vilesci;

-- TODO mindestgehaelter