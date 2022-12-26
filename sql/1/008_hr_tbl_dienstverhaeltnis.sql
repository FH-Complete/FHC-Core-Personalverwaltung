CREATE TABLE IF NOT EXISTS hr.tbl_dienstverhaeltnis (
	dienstverhaeltnis_id integer NOT NULL,
	mitarbeiter_uid character varying(32),
	von date,
	bis date,
	unternehmen_id integer,    -- war standort_id
	vertragsart_kurzbz character varying(32),
	hauptberufcode smallint,
	probezeit smallint,
	insertamum timestamp,
	insertvon character varying(32),
	updateamum timestamp,
	updatevon character varying(32),
	CONSTRAINT tbl_dienstverhaeltnis_pk PRIMARY KEY (dienstverhaeltnis_id)
);

CREATE SEQUENCE IF NOT EXISTS hr.tbl_dienstverhaeltnis_dienstverhaeltnis_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1
	OWNED BY hr.tbl_dienstverhaeltnis.dienstverhaeltnis_id;

GRANT SELECT, UPDATE ON hr.tbl_dienstverhaeltnis_dienstverhaeltnis_id_seq TO vilesci;

-- serial
DO $$
BEGIN
	ALTER TABLE hr.tbl_dienstverhaeltnis ALTER COLUMN dienstverhaeltnis_id SET DEFAULT nextval('hr.tbl_dienstverhaeltnis_dienstverhaeltnis_id_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- mitarbeiter
DO $$
BEGIN
	ALTER TABLE hr.tbl_dienstverhaeltnis ADD CONSTRAINT tbl_mitarbeiter_fk FOREIGN KEY (mitarbeiter_uid)
	REFERENCES public.tbl_mitarbeiter (mitarbeiter_uid) MATCH FULL
	ON DELETE RESTRICT ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- vertragsart
DO $$
BEGIN
	ALTER TABLE hr.tbl_dienstverhaeltnis ADD CONSTRAINT tbl_vertragsart_fk FOREIGN KEY (vertragsart_kurzbz)
	REFERENCES hr.tbl_vertragsart (vertragsart_kurzbz) MATCH FULL
	ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
	ALTER TABLE hr.tbl_dienstverhaeltnis ADD CONSTRAINT tbl_unternehmen_fk FOREIGN KEY (unternehmen_id)
	REFERENCES public.tbl_unternehmen (unternehmen_id) MATCH FULL
	ON DELETE RESTRICT ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_dienstverhaeltnis TO vilesci;
