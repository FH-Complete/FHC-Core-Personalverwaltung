CREATE TABLE IF NOT EXISTS hr.tbl_gehaltstyp (
    gehaltstyp_kurzbz character varying(32) NOT NULL,
    bezeichnung character varying(256),
    valorisierung boolean,
	sort smallint,
	aktiv boolean,    
	CONSTRAINT tbl_gehaltstyp_pk PRIMARY KEY (gehaltstyp_kurzbz)
);

COMMENT ON TABLE hr.tbl_gehaltstyp IS 'Grundgehalt, Prämie, Zulage, Überstundenauszahlung, Scriptenerstellung, Fahrtkostenersatz';

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_gehaltstyp TO vilesci;

INSERT INTO hr.tbl_gehaltstyp
	(gehaltstyp_kurzbz, bezeichnung, valorisierung, sort, aktiv)
SELECT 'GRUNDGEHALT','Grundgehalt',true,1,true
WHERE
   NOT EXISTS (
       SELECT bezeichnung FROM hr.tbl_gehaltstyp WHERE gehaltstyp_kurzbz = 'GRUNDGEHALT'
   );

INSERT INTO hr.tbl_gehaltstyp
	(gehaltstyp_kurzbz, bezeichnung, valorisierung, sort, aktiv)
SELECT 'PRAEMIE','Prämie',false,2,true
WHERE
   NOT EXISTS (
       SELECT bezeichnung FROM hr.tbl_gehaltstyp WHERE gehaltstyp_kurzbz = 'PRAEMIE'
   );

INSERT INTO hr.tbl_gehaltstyp
	(gehaltstyp_kurzbz, bezeichnung, valorisierung, sort, aktiv)
SELECT 'UEBERSTUNDEN','Überstundenauszahlung',false,3,true
WHERE
   NOT EXISTS (
       SELECT bezeichnung FROM hr.tbl_gehaltstyp WHERE gehaltstyp_kurzbz = 'UEBERSTUNDEN'
   );

-- valorisierter Behaltsbestandteil
INSERT INTO hr.tbl_gehaltstyp
	(gehaltstyp_kurzbz, bezeichnung, valorisierung, sort, aktiv)
SELECT 'GEHALTSBESTANDTEIL','Gehaltsbestandteil',true,4,true
WHERE
   NOT EXISTS (
       SELECT bezeichnung FROM hr.tbl_gehaltstyp WHERE gehaltstyp_kurzbz = 'GEHALTSBESTANDTEIL'
   );

-- zusätzlicher Bestandteil (nicht valorisiert)
INSERT INTO hr.tbl_gehaltstyp
	(gehaltstyp_kurzbz, bezeichnung, valorisierung, sort, aktiv)
SELECT 'ZUSATZBESTANDTEIL','Zusatz',false,5,true
WHERE
   NOT EXISTS (
       SELECT bezeichnung FROM hr.tbl_gehaltstyp WHERE gehaltstyp_kurzbz = 'ZUSATZBESTANDTEIL'
   );