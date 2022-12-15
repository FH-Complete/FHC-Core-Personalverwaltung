CREATE TABLE IF NOT EXISTS hr.tbl_vertragsbestandteil (
	vertragsbestandteil_id bigint NOT NULL,
	dienstverhaeltnis_id integer,
	von date,
    bis date,
	vertragsbestandteiltyp_kurzbz character varying(32),    	
	insertamum timestamp,
	insertvon character varying(32),
	updateamum timestamp,
	updatevon character varying(32),
	CONSTRAINT tbl_vertragsbestandteil_pk PRIMARY KEY (vertragsbestandteil_id)
);


CREATE SEQUENCE IF NOT EXISTS hr.tbl_vertragsbestandteil_vertragsbestandteil_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1
	OWNED BY hr.tbl_vertragsbestandteil.vertragsbestandteil_id;

GRANT SELECT, USAGE, UPDATE ON hr.tbl_vertragsbestandteil_vertragsbestandteil_id_seq TO vilesci;

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil ALTER COLUMN vertragsbestandteil_id SET DEFAULT nextval('hr.tbl_vertragsbestandteil_vertragsbestandteil_id_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil ADD CONSTRAINT tbl_vertragsbestandteiltyp_fk FOREIGN KEY (vertragsbestandteiltyp_kurzbz)
	REFERENCES hr.tbl_vertragsbestandteiltyp (vertragsbestandteiltyp_kurzbz) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- fk dienstverhaeltnis
DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil ADD CONSTRAINT tbl_dienstverhaeltnis_fk FOREIGN KEY (dienstverhaeltnis_id)
	REFERENCES hr.tbl_dienstverhaeltnis (dienstverhaeltnis_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil TO vilesci;

-- stunden

CREATE TABLE IF NOT EXISTS hr.tbl_vertragsbestandteil_stunden (
	vertragsbestandteil_id integer NOT NULL,
	wochenstunden float,
	karenz bool,
	CONSTRAINT tbl_vertragsbestandteil_stunden_pk PRIMARY KEY (vertragsbestandteil_id)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_stunden ADD CONSTRAINT tbl_vertragsbestandteil_fk FOREIGN KEY (vertragsbestandteil_id)
	REFERENCES hr.tbl_vertragsbestandteil (vertragsbestandteil_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil_stunden TO vilesci;

-- karenztyp


CREATE TABLE hr.tbl_vertragsbestandteil_karenztyp (
	karenztyp_kurzbz varchar NOT NULL,
	bezeichnung text,
	sort smallint,
	CONSTRAINT tbl_karenztyp_pk PRIMARY KEY (karenztyp_kurzbz)
);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil_karenztyp TO vilesci;

COMMENT ON TABLE hr.tbl_vertragsbestandteil_karenztyp IS E'Mutterschutz, Elternkarenz, Bildungskarenz, ...';

INSERT INTO hr.tbl_vertragsbestandteil_karenztyp
	(karenztyp_kurzbz, bezeichnung, sort)
SELECT 'MUTTERSCHUTZ','Mutterschutz',1
WHERE
   NOT EXISTS (
       SELECT karenztyp_kurzbz FROM hr.tbl_vertragsbestandteil_karenztyp WHERE karenztyp_kurzbz = 'MUTTERSCHUTZ'
   );

INSERT INTO hr.tbl_vertragsbestandteil_karenztyp
	(karenztyp_kurzbz, bezeichnung, sort)
SELECT 'ELTERNKARENZ','Elternkarenz',2
WHERE
   NOT EXISTS (
       SELECT karenztyp_kurzbz FROM hr.tbl_vertragsbestandteil_karenztyp WHERE karenztyp_kurzbz = 'ELTERNKARENZ'
   );

INSERT INTO hr.tbl_vertragsbestandteil_karenztyp
	(karenztyp_kurzbz, bezeichnung, sort)
SELECT 'ELTERNTEILZEIT','Elternteilzeit',3
WHERE
   NOT EXISTS (
       SELECT karenztyp_kurzbz FROM hr.tbl_vertragsbestandteil_karenztyp WHERE karenztyp_kurzbz = 'ELTERNTEILZEIT'
   );   
   
INSERT INTO hr.tbl_vertragsbestandteil_karenztyp
	(karenztyp_kurzbz, bezeichnung, sort)
SELECT 'BILDUNGSKARENZ','Bildungskarenz',4
WHERE
   NOT EXISTS (
       SELECT karenztyp_kurzbz FROM hr.tbl_vertragsbestandteil_karenztyp WHERE karenztyp_kurzbz = 'BILDUNGSKARENZ'
   );    

-- karenz
CREATE TABLE IF NOT EXISTS hr.tbl_vertragsbestandteil_karenz (
	vertragsbestandteil_id integer NOT NULL,
	karenztyp_kurzbz varchar NOT NULL,
	geburtstermin date DEFAULT NULL,
	CONSTRAINT tbl_vertragsbestandteil_karenz_pk PRIMARY KEY (vertragsbestandteil_id)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_karenz ADD CONSTRAINT tbl_vertragsbestandteil_fk FOREIGN KEY (vertragsbestandteil_id)
	REFERENCES hr.tbl_vertragsbestandteil (vertragsbestandteil_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_karenz ADD CONSTRAINT tbl_vertragsbestandteil_karenztyp_fk FOREIGN KEY (karenztyp_kurzbz)
	REFERENCES hr.tbl_vertragsbestandteil_karenztyp (karenztyp_kurzbz) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil_karenz TO vilesci;

-- funktionen

CREATE TABLE IF NOT EXISTS hr.tbl_vertragsbestandteil_funktionen (
	vertragsbestandteil_id integer NOT NULL,
	benutzerffunktion_id smallint,
	anmerkung smallint,
	kuendigungsrelevant bool,
	CONSTRAINT tbl_vertragsbestandteil_funktionen_pk PRIMARY KEY (vertragsbestandteil_id)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_funktionen ADD CONSTRAINT tbl_vertragsbestandteil_fk FOREIGN KEY (vertragsbestandteil_id)
	REFERENCES hr.tbl_vertragsbestandteil (vertragsbestandteil_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil_funktionen TO vilesci;

-- freitext typ

CREATE TABLE hr.tbl_vertragsbestandteil_freitexttyp (
	freitexttyp_kurzbz varchar NOT NULL,
	bezeichnung text,
	CONSTRAINT tbl_freitexttyp_pk PRIMARY KEY (freitexttyp_kurzbz)
);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil_freitexttyp TO vilesci;

COMMENT ON TABLE hr.tbl_vertragsbestandteil_freitexttyp IS E'Verwendung, Sonstiges, Ersatzarbeitskraft, ...';

-- freitext

CREATE TABLE IF NOT EXISTS hr.tbl_vertragsbestandteil_freitext (
	vertragsbestandteil_id integer NOT NULL,
	anmerkung smallint,
	kuendigungrelevant bool,
	freitexttyp_kurzbz varchar,
	CONSTRAINT tbl_vertragsbestandteil_freitext_pk PRIMARY KEY (vertragsbestandteil_id)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_freitext ADD CONSTRAINT tbl_vertragsbestandteil_fk FOREIGN KEY (vertragsbestandteil_id)
	REFERENCES hr.tbl_vertragsbestandteil (vertragsbestandteil_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_freitext ADD CONSTRAINT tbl_vertragsbestandteil_freitexttyp_fk FOREIGN KEY (freitexttyp_kurzbz)
	REFERENCES hr.tbl_vertragsbestandteil_freitexttyp (freitexttyp_kurzbz) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil_freitext TO vilesci;

-- zeitaufzeichnung

CREATE TABLE hr.tbl_vertragsbestandteil_zeitaufzeichnung (
	vertragsbestandteil_id integer NOT NULL,
	zeitaufzeichnung bool,
	azgrelevant bool,
	homeoffice bool,
	CONSTRAINT tbl_vertragsbestandteil_zeitaufzeichnung_pk PRIMARY KEY (vertragsbestandteil_id)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_zeitaufzeichnung ADD CONSTRAINT tbl_vertragsbestandteil_fk FOREIGN KEY (vertragsbestandteil_id)
	REFERENCES hr.tbl_vertragsbestandteil (vertragsbestandteil_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil_zeitaufzeichnung TO vilesci;

-- kv

CREATE TABLE  IF NOT EXISTS hr.tbl_vertragsbestandteil_kv (
	vertragsbestandteil_id integer NOT NULL,
	kollektivvertragsgruppe character varying(32),
	verwendungsgruppenjahr smallint,
	CONSTRAINT tbl_vertragsbestandteil_kv_pk PRIMARY KEY (vertragsbestandteil_id)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_kv ADD CONSTRAINT tbl_vertragsbestandteil_fk FOREIGN KEY (vertragsbestandteil_id)
	REFERENCES hr.tbl_vertragsbestandteil (vertragsbestandteil_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_kv ADD CONSTRAINT tbl_kv_gruppe_fk FOREIGN KEY (kollektivvertragsgruppe)
	REFERENCES public.tbl_kv_gruppe (kv_gruppe) MATCH FULL
	ON DELETE RESTRICT ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil_kv TO vilesci;

-- lehre

CREATE TABLE IF NOT EXISTS hr.tbl_vertragsbestandteil_lehre (
	vertragsbestandteil_id integer NOT NULL,
	inkludierte_lehre smallint,
	CONSTRAINT tbl_vertragsbestandteil_lehre_pk PRIMARY KEY (vertragsbestandteil_id)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_lehre ADD CONSTRAINT tbl_vertragsbestandteil_fk FOREIGN KEY (vertragsbestandteil_id)
	REFERENCES hr.tbl_vertragsbestandteil (vertragsbestandteil_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil_lehre TO vilesci;

-- urlaubsanspruch

CREATE TABLE IF NOT EXISTS hr.tbl_vertragsbetandteil_urlaubsanspruch (
	vertragsbestandteil_id integer NOT NULL,
	tage smallint,
	CONSTRAINT tbl_vertragsbetandteil_urlaubsanspruch_pk PRIMARY KEY (vertragsbestandteil_id)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbetandteil_urlaubsanspruch ADD CONSTRAINT tbl_vertragsbestandteil_fk FOREIGN KEY (vertragsbestandteil_id)
	REFERENCES hr.tbl_vertragsbestandteil (vertragsbestandteil_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbetandteil_urlaubsanspruch TO vilesci;

-- kuendigungsfrist

CREATE TABLE IF NOT EXISTS hr.tbl_vertragsbestandteil_kuendigungsfrist (
	vertragsbestandteil_id integer NOT NULL,
	arbeitgeber_frist smallint,
	arbeitnehmer_frist smallint,
	CONSTRAINT tbl_vertragsbestandteil_kuendigungsfrist_pk PRIMARY KEY (vertragsbestandteil_id)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_vertragsbestandteil_kuendigungsfrist ADD CONSTRAINT tbl_vertragsbestandteil_fk FOREIGN KEY (vertragsbestandteil_id)
	REFERENCES hr.tbl_vertragsbestandteil (vertragsbestandteil_id) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteil_kuendigungsfrist TO vilesci;

-- 




