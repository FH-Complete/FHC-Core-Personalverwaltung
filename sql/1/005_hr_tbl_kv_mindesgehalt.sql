CREATE TABLE IF NOT EXISTS hr.tbl_kv_mindestgehalt (
	mindestgehalt_id integer,
	jahr smallint,
	kv_gruppe character varying(32),   -- beschaeftigungsgruppe (I, II, III, IV, V, VI, MI, ..)
	vw_jahr_von smallint, 	   -- vorrueckungsstufe	 (Verwendungsgruppenjahr)
	vw_jahr_bis smallint,
	betrag numeric(8,2),	
	CONSTRAINT tbl_kv_mindestgehalt_pk PRIMARY KEY (mindestgehalt_id)
);

CREATE SEQUENCE IF NOT EXISTS hr.tbl_kv_mindestgehalt_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1
	OWNED BY hr.tbl_kv_mindestgehalt.mindestgehalt_id;

DO $$
BEGIN
	ALTER TABLE hr.tbl_kv_mindestgehalt ALTER COLUMN mindestgehalt_id SET DEFAULT nextval('hr.tbl_kv_mindestgehalt_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;	

DO $$
BEGIN
	ALTER TABLE hr.tbl_kv_mindestgehalt ADD CONSTRAINT tbl_kv_mindestgehalt_fk FOREIGN KEY (kv_gruppe)
	REFERENCES hr.tbl_kv_gruppe (kv_gruppe) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_kv_mindestgehalt TO vilesci;

-- TODO mindestgehaelter

-- I

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','I',1,2,1568.92
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'I' AND jahr= 2022 and vw_jahr_von = 1
   );   

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','I',3,4,1568.92
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'I' AND jahr= 2022 and vw_jahr_von = 4
   );  

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','I',5,6,1618.30
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'I' AND jahr= 2022 and vw_jahr_von = 5
   );    

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','I',7,8,1717.69
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'I' AND jahr= 2022 and vw_jahr_von = 7
   );   
   
INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','I',9,10,1817.04
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'I' AND jahr= 2022 and vw_jahr_von = 9
   ); 

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','I',11,12,1916.43
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'I' AND jahr= 2022 and vw_jahr_von = 11
   ); 
     
INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','I',13,14,2001.59
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'I' AND jahr= 2022 and vw_jahr_von = 13
   ); 

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','I',15,null,2157.75
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'I' AND jahr= 2022 and vw_jahr_von = 15
   ); 



-- II


INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','II',1,2,1633.18
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'II' AND jahr= 2022 and vw_jahr_von = 1
   );   

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','II',3,4,1735.23
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'II' AND jahr= 2022 and vw_jahr_von = 4
   );  

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','II',5,6,1843.32
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'II' AND jahr= 2022 and vw_jahr_von = 5
   );    

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','II',7,8,1956.52
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'II' AND jahr= 2022 and vw_jahr_von = 7
   );   
   
INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','II',9,10,2069.70
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'II' AND jahr= 2022 and vw_jahr_von = 9
   ); 

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','II',11,12,2182.91
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'II' AND jahr= 2022 and vw_jahr_von = 11
   ); 
     
INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','II',13,14,2279.92
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'II' AND jahr= 2022 and vw_jahr_von = 13
   ); 

INSERT INTO hr.tbl_kv_mindestgehalt 
	(jahr,kv_gruppe,vw_jahr_von,vw_jahr_bis,betrag) 
SELECT '2022','II',15,null,2457.76
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_mindestgehalt WHERE kv_gruppe = 'II' AND jahr= 2022 and vw_jahr_von = 15
   ); 

-- III

-- TODO