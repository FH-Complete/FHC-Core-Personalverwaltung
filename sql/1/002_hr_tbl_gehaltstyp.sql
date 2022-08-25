CREATE TABLE IF NOT EXISTS hr.tbl_gehaltstyp (
    gehaltstyp_kurzbz character varying(32) NOT NULL,
    bezeichnung character varying(256),
	sort smallint,
	aktiv boolean,
	CONSTRAINT tbl_gehaltstyp_pk PRIMARY KEY (gehaltstyp_kurzbz)
);

COMMENT ON TABLE hr.tbl_gehaltstyp IS 'Grundgehalt, Prämie, Zulage, Überstundenauszahlung, Scriptenerstellung, Fahrtkostenersatz';

CREATE SEQUENCE IF NOT EXISTS hr.tbl_gehaltstyp_gehaltstyp_id_seq
	AS integer
	START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_gehaltstyp TO vilesci;

INSERT INTO hr.tbl_gehaltstyp 
	(gehaltstyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'GRUNDGEHALT','Grundgehalt',1,true
WHERE
   NOT EXISTS (
       SELECT bezeichnung FROM hr.tbl_gehaltstyp WHERE gehaltstyp_kurzbz = 'GRUNDGEHALT'
   );

INSERT INTO hr.tbl_gehaltstyp 
	(gehaltstyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'PRAEMIE','Prämie',2,true
WHERE
   NOT EXISTS (
       SELECT bezeichnung FROM hr.tbl_gehaltstyp WHERE gehaltstyp_kurzbz = 'PRAEMIE'
   );

INSERT INTO hr.tbl_gehaltstyp 
	(gehaltstyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'UEBERSTUNDEN','Überstundenauszahlung',3,true
WHERE
   NOT EXISTS (
       SELECT bezeichnung FROM hr.tbl_gehaltstyp WHERE gehaltstyp_kurzbz = 'UEBERSTUNDEN'
   );

INSERT INTO hr.tbl_gehaltstyp 
	(gehaltstyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'SONSTIGES','Sonstiges',4,true
WHERE
   NOT EXISTS (
       SELECT bezeichnung FROM hr.tbl_gehaltstyp WHERE gehaltstyp_kurzbz = 'SONSTIGES'
   );

