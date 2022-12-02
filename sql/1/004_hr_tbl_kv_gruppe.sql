CREATE TABLE IF NOT EXISTS hr.tbl_kv_gruppe (
	kv_gruppe character varying(32),	
	CONSTRAINT tbl_kv_gruppe_pk PRIMARY KEY (kv_gruppe)
);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_kv_gruppe TO vilesci;

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe) 
SELECT 'A'
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'A'
   );

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe) 
SELECT 'B'
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'B'
   );

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe) 
SELECT 'C'
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'C'
   );

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe) 
SELECT 'D'
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'D'
   );


INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe) 
SELECT 'E'
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'E'
   );

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe) 
SELECT 'F'
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'F'
   );      

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe) 
SELECT 'G'
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'G'
   );

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe) 
SELECT 'H'
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'H'
   );               
