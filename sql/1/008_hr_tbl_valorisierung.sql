
CREATE TABLE IF NOT EXISTS hr.tbl_valorisierung (
    valorisierung_id integer NOT NULL,    
    datum date NOT NULL,
    prozent numeric(8,4),
    betrag numeric(8,2),
    insertamum timestamp,
	insertvon character varying(32),
	updateamum timestamp,
	updatevon character varying(32),
    CONSTRAINT "betrag or prozent" CHECK (((betrag IS NULL) OR (prozent IS NULL))),
    CONSTRAINT valorisierung_id_pk PRIMARY KEY (valorisierung_id)
);

CREATE SEQUENCE IF NOT EXISTS hr.tbl_valorisierung_valorisierung_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1
    OWNED BY hr.tbl_valorisierung.valorisierung_id;

GRANT SELECT, UPDATE ON hr.tbl_valorisierung_valorisierung_id_seq TO vilesci;

DO $$
BEGIN
	ALTER TABLE hr.tbl_valorisierung ALTER COLUMN valorisierung_id SET DEFAULT nextval('hr.tbl_valorisierung_valorisierung_id_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_valorisierung TO vilesci;

--

CREATE TABLE IF NOT EXISTS hr.tbl_valorisierung_dienstverhaeltnis (
    valorisierung_dienstverhaeltnis_id integer NOT NULL,
    valorisierung_id integer NOT NULL, 
    dienstverhaeltnis_id integer NOT NULL,
    angewendet boolean default false,
    insertamum timestamp,
	insertvon character varying(32),
	updateamum timestamp,
	updatevon character varying(32),
    CONSTRAINT valorisierung_dienstverhaeltnis_id_pk PRIMARY KEY (valorisierung_dienstverhaeltnis_id)
);    

CREATE SEQUENCE IF NOT EXISTS hr.tbl_valorisierung_dv_valorisierung_dv_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1
    OWNED BY hr.tbl_valorisierung_dienstverhaeltnis.valorisierung_dienstverhaeltnis_id;

GRANT SELECT, UPDATE ON hr.tbl_valorisierung_dv_valorisierung_dv_id_seq TO vilesci;

DO $$
BEGIN
	ALTER TABLE hr.tbl_valorisierung_dienstverhaeltnis ALTER COLUMN valorisierung_dienstverhaeltnis_id SET DEFAULT nextval('hr.tbl_valorisierung_dv_valorisierung_dv_id_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_valorisierung_dienstverhaeltnis TO vilesci;


DO $$
BEGIN
	ALTER TABLE hr.tbl_valorisierung_dienstverhaeltnis ADD CONSTRAINT tbl_dienstverhaeltnis_fk FOREIGN KEY (dienstverhaeltnis_id)
	REFERENCES hr.tbl_dienstverhaeltnis (dienstverhaeltnis_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
	ALTER TABLE hr.tbl_valorisierung_dienstverhaeltnis ADD CONSTRAINT tbl_valorisierung_fk FOREIGN KEY (valorisierung_id)
	REFERENCES hr.tbl_valorisierung (valorisierung_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;



