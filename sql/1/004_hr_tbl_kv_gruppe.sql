CREATE TABLE IF NOT EXISTS hr.tbl_kv_gruppe (
	kv_gruppe character varying(32),
    sort smallint,	
	CONSTRAINT tbl_kv_gruppe_pk PRIMARY KEY (kv_gruppe)
);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_kv_gruppe TO vilesci;

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe,sort) 
SELECT 'I',1
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'AI'
   );

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe,sort) 
SELECT 'II',2
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'II'
   );

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe,sort) 
SELECT 'III',3
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'III'
   );

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe,sort) 
SELECT 'IV',4
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'IV'
   );


INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe,sort) 
SELECT 'V',5
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'V'
   );

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe,sort) 
SELECT 'VI',6
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'VI'
   );      

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe,sort) 
SELECT 'MI',7
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'MI'
   );

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe,sort) 
SELECT 'MII o.F.',8
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'MII o.F.'
   );               

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe,sort) 
SELECT 'MII m.F.',9
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'MII m.F.'
   );               

INSERT INTO hr.tbl_kv_gruppe 
	(kv_gruppe,sort) 
SELECT 'MIII',10
WHERE
   NOT EXISTS (
       SELECT kv_gruppe FROM hr.tbl_kv_gruppe WHERE kv_gruppe = 'MIII'
   );               
