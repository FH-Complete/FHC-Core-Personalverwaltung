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
SELECT 'freitext','Freitext', 1,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'freitext'
   );

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'stunden','Stunden', 2,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'stunden'
   );   

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'funktion','Funktion', 3,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'funktion'
   ); 

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'lehre','Lehre', 4,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'lehre'
   ); 

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'zeitaufzeichnung','Zeitaufzeichnung', 5,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'zeitaufzeichnung'
   ); 

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'kuendigungsfrist','Kündigungsfrist', 6,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'kuendigungsfrist'
   ); 

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'urlaubsanspruch','Urlaubsanspruch', 7,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'urlaubsanspruch'
   );    

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'kv','KV', 8,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'kv'
   );    

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'karenz','Karenz', 9,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'karenz'
   ); 

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'befristung','Befristung', 10,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'Befristung'
   );   


