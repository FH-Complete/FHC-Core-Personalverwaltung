CREATE TABLE IF NOT EXISTS hr.tbl_sachaufwand (
	sachaufwand_id bigint NOT NULL,
	mitarbeiter_uid character varying(32),
	sachaufwandtyp_kurzbz character varying(32),
	dienstverhaeltnis_id integer, -- neu
	beginn date,
	ende date,
	anmerkung text,
	insertamum timestamp,
	insertvon character varying(32),
	updateamum timestamp,
	updatevon character varying(32),
	CONSTRAINT tbl_sachaufwand_pk PRIMARY KEY (sachaufwand_id)
);


CREATE SEQUENCE IF NOT EXISTS hr.tbl_sachaufwand_sachaufwand_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;

GRANT SELECT, UPDATE ON hr.tbl_sachaufwand_sachaufwand_id_seq TO vilesci;

DO $$
BEGIN
	ALTER TABLE hr.tbl_sachaufwand ALTER COLUMN sachaufwand_id SET DEFAULT nextval('hr.tbl_sachaufwand_sachaufwand_id_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
	ALTER TABLE hr.tbl_sachaufwand ADD CONSTRAINT tbl_dienstverhaeltnis_fk FOREIGN KEY (dienstverhaeltnis_id)
	REFERENCES hr.tbl_dienstverhaeltnis (dienstverhaeltnis_id) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS hr.tbl_sachaufwandtyp (
	sachaufwandtyp_kurzbz character varying(32) NOT NULL,
	bezeichnung character varying(256),
	sort smallint,
	aktiv boolean,
	CONSTRAINT tbl_sachaufwandtyp_pk PRIMARY KEY (sachaufwandtyp_kurzbz)
);

DO $$
BEGIN
	ALTER TABLE hr.tbl_sachaufwand ADD CONSTRAINT tbl_sachaufwandtyp_fk FOREIGN KEY (sachaufwandtyp_kurzbz)
	REFERENCES hr.tbl_sachaufwandtyp (sachaufwandtyp_kurzbz) MATCH FULL
	ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
END $$;	

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_sachaufwand TO vilesci;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_sachaufwandtyp TO vilesci;

INSERT INTO hr.tbl_sachaufwandtyp 
	(sachaufwandtyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'Jobticket','Jobticket',1,true
WHERE
   NOT EXISTS (
       SELECT sachaufwandtyp_kurzbz FROM hr.tbl_sachaufwandtyp WHERE sachaufwandtyp_kurzbz = 'Jobticket'
   );

INSERT INTO hr.tbl_sachaufwandtyp 
	(sachaufwandtyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'Klimaticket','Klimaticket',2,true
WHERE
   NOT EXISTS (
       SELECT sachaufwandtyp_kurzbz FROM hr.tbl_sachaufwandtyp WHERE sachaufwandtyp_kurzbz = 'Klimaticket'
   );


INSERT INTO hr.tbl_sachaufwandtyp 
	(sachaufwandtyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'Pendlerpauschale','Pendlerpauschale',3,true
WHERE
   NOT EXISTS (
       SELECT sachaufwandtyp_kurzbz FROM hr.tbl_sachaufwandtyp WHERE sachaufwandtyp_kurzbz = 'Pendlerpauschale'
   );
