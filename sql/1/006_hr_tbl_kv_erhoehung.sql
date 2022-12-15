CREATE TABLE IF NOT EXISTS hr.tbl_kv_erhoehung (
	jahr smallint,
	kv_gruppe  character varying(32),
	prozent numeric(8,2),
	CONSTRAINT tbl_kv_erhoehung_pk PRIMARY KEY (jahr,kv_gruppe)
);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_kv_erhoehung TO vilesci;

DO $$
BEGIN
	ALTER TABLE hr.tbl_kv_erhoehung ADD CONSTRAINT tbl_kv_erhoehung_fk FOREIGN KEY (kv_gruppe)
	REFERENCES hr.tbl_kv_gruppe (kv_gruppe) MATCH FULL
	ON DELETE CASCADE ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- kv erhoehungen

INSERT INTO hr.tbl_kv_erhoehung 
	(jahr,kv_gruppe,prozent) 
SELECT '2022','I',3.10
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_erhoehung WHERE kv_gruppe = 'I' AND jahr= 2022 
   ); 

INSERT INTO hr.tbl_kv_erhoehung 
	(jahr,kv_gruppe,prozent) 
SELECT '2022','II',3.10
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_erhoehung WHERE kv_gruppe = 'II' AND jahr= 2022 
   );

INSERT INTO hr.tbl_kv_erhoehung 
	(jahr,kv_gruppe,prozent) 
SELECT '2022','III',2.90
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_erhoehung WHERE kv_gruppe = 'III' AND jahr= 2022 
   );

INSERT INTO hr.tbl_kv_erhoehung 
	(jahr,kv_gruppe,prozent) 
SELECT '2022','IV',2.90
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_erhoehung WHERE kv_gruppe = 'IV' AND jahr= 2022 
   );

INSERT INTO hr.tbl_kv_erhoehung 
	(jahr,kv_gruppe,prozent) 
SELECT '2022','V',2.85
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_erhoehung WHERE kv_gruppe = 'V' AND jahr= 2022 
   );

INSERT INTO hr.tbl_kv_erhoehung 
	(jahr,kv_gruppe,prozent) 
SELECT '2022','VI',2.70
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_erhoehung WHERE kv_gruppe = 'VI' AND jahr= 2022 
   );

INSERT INTO hr.tbl_kv_erhoehung 
	(jahr,kv_gruppe,prozent) 
SELECT '2022','MI',2.90
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_erhoehung WHERE kv_gruppe = 'MI' AND jahr= 2022 
   );

INSERT INTO hr.tbl_kv_erhoehung 
	(jahr,kv_gruppe,prozent) 
SELECT '2022','MII o.F.',2.90
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_erhoehung WHERE kv_gruppe = 'MII o.F.' AND jahr= 2022 
   );

INSERT INTO hr.tbl_kv_erhoehung 
	(jahr,kv_gruppe,prozent) 
SELECT '2022','MII m.F.',2.90
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_erhoehung WHERE kv_gruppe = 'MII m.F.' AND jahr= 2022 
   );

INSERT INTO hr.tbl_kv_erhoehung 
	(jahr,kv_gruppe,prozent) 
SELECT '2022','MIII',2.85
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_erhoehung WHERE kv_gruppe = 'MIII' AND jahr= 2022 
   );
