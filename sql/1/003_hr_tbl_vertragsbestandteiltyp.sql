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
SELECT 'FREITEXT','Freitext', 1,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'FREITEXT'
   );

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'STUNDEN','Stunden', 2,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'STUNDEN'
   );   

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'FUNKTION','Funktion', 3,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'FUNKTION'
   ); 

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'LEHRE','Lehre', 4,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'LEHRE'
   ); 

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'ZEITAUFZEICHNUNG','Zeitaufzeichnung', 5,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'ZEITAUFZEICHNUNG'
   ); 

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'KUENDIGUNGSFRIST','Kündigungsfrist', 6,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'KUENDIGUNGSFRIST'
   ); 

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'URLAUBSANSPRUCH','Urlaubsanspruch', 7,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'URLAUBSANSPRUCH'
   );    

INSERT INTO hr.tbl_vertragsbestandteiltyp 
	(vertragsbestandteiltyp_kurzbz, bezeichnung, sort, aktiv) 
SELECT 'KV','KV', 8,true
WHERE
   NOT EXISTS (
       SELECT vertragsbestandteiltyp_kurzbz FROM hr.tbl_vertragsbestandteiltyp WHERE vertragsbestandteiltyp_kurzbz = 'KV'
   );    


