CREATE TABLE IF NOT EXISTS hr.tbl_vertragsart (
    vertragsart_kurzbz character varying(32) NOT NULL,
    bezeichnung character varying(256),
    anmerkung text,
    dienstverhaeltnis boolean,
    ba1code integer,
	sort smallint,
	aktiv boolean,
	CONSTRAINT tbl_vertragsart_pk PRIMARY KEY (vertragsart_kurzbz)
);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsart TO vilesci;

INSERT INTO hr.tbl_vertragsart 
	(vertragsart_kurzbz, bezeichnung, anmerkung, dienstverhaeltnis, ba1code, sort, aktiv) 
SELECT 'echterDV','Echter DV', 'Echter Diensvertrag', true, 103, 1,true
WHERE
   NOT EXISTS (
       SELECT vertragsart_kurzbz FROM hr.tbl_vertragsart WHERE vertragsart_kurzbz = 'echterDV'
   );

INSERT INTO hr.tbl_vertragsart 
	(vertragsart_kurzbz, bezeichnung, anmerkung, dienstverhaeltnis, ba1code, sort, aktiv) 
SELECT 'freierDV','Freier DV', 'Externe Lehrende', true, 105, 2,true
WHERE
   NOT EXISTS (
       SELECT vertragsart_kurzbz FROM hr.tbl_vertragsart WHERE vertragsart_kurzbz = 'freierDV'
   );

INSERT INTO hr.tbl_vertragsart 
	(vertragsart_kurzbz, bezeichnung, anmerkung, dienstverhaeltnis, ba1code, sort, aktiv) 
SELECT 'Gastlektor','Gastlektor', 'Gastlektor', false, 105, 3,true
WHERE
   NOT EXISTS (
       SELECT vertragsart_kurzbz FROM hr.tbl_vertragsart WHERE vertragsart_kurzbz = 'Gastlektor'
   );

INSERT INTO hr.tbl_vertragsart 
	(vertragsart_kurzbz, bezeichnung, anmerkung, dienstverhaeltnis, ba1code, sort, aktiv) 
SELECT 'Werkvertrag','Werkvertrag', 'Werkvertrag', true, 105, 4,true
WHERE
   NOT EXISTS (
       SELECT vertragsart_kurzbz FROM hr.tbl_vertragsart WHERE vertragsart_kurzbz = 'Werkvertrag'
   );

INSERT INTO hr.tbl_vertragsart 
	(vertragsart_kurzbz, bezeichnung, anmerkung, dienstverhaeltnis, ba1code, sort, aktiv) 
SELECT 'StudHilfskraft','Stud. Hilfskraft', 'Studentische Hilfskraft', false, 101, 1,true
WHERE
   NOT EXISTS (
       SELECT vertragsart_kurzbz FROM hr.tbl_vertragsart WHERE vertragsart_kurzbz = 'StudHilfskraft'
   );      


