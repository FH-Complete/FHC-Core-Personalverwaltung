CREATE TABLE IF NOT EXISTS hr.tbl_vertragsbestandteiltyp (
    vertragsbestandteiltyp_kurzbz character varying(32) NOT NULL,  
    bezeichnung character varying(256),  
	sort smallint default 1,
	aktiv boolean default true,
	CONSTRAINT tbl_vertragsbestandteiltyp_pk PRIMARY KEY (vertragsbestandteiltyp_kurzbz)
);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_vertragsbestandteiltyp TO vilesci;

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'VERTRAG','Vertrag', 1,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'VERTRAG'
   );

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'SIDELETTER','Sideletter', 2,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'SIDELETTER'
   );   

