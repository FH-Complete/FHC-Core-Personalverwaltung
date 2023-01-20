CREATE TABLE IF NOT EXISTS hr.tbl_unternehmen (
	unternehmen_id integer NOT NULL,	
	oe_kurzbz character varying(32),     	
	CONSTRAINT tbl_unternehmen_pk PRIMARY KEY (unternehmen_id)
);

CREATE SEQUENCE IF NOT EXISTS hr.tbl_unternehmen_unternehmen_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1
	OWNED BY hr.tbl_unternehmen.unternehmen_id;

GRANT SELECT, UPDATE ON hr.tbl_unternehmen_unternehmen_id_seq TO vilesci;

-- serial
DO $$
BEGIN
	ALTER TABLE hr.tbl_unternehmen ALTER COLUMN unternehmen_id SET DEFAULT nextval('hr.tbl_unternehmen_unternehmen_id_seq');
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- FK
DO $$
BEGIN
	ALTER TABLE hr.tbl_unternehmen ADD CONSTRAINT tbl_organisationseinheit_fk FOREIGN KEY (oe_kurzbz)
	REFERENCES public.tbl_organisationseinheit (oe_kurzbz) MATCH FULL
	ON DELETE RESTRICT ON UPDATE CASCADE;
 	EXCEPTION WHEN OTHERS THEN NULL;
END $$;



-- insert default org
INSERT INTO hr.tbl_unternehmen
	(oe_kurzbz)
SELECT 'gst'
WHERE
   NOT EXISTS (
       SELECT oe_kurzbz FROM hr.tbl_unternehmen WHERE oe_kurzbz = 'gst'
   );

INSERT INTO hr.tbl_unternehmen
	(oe_kurzbz)
SELECT 'gmbh'
WHERE
   NOT EXISTS (
       SELECT oe_kurzbz FROM hr.tbl_unternehmen WHERE oe_kurzbz = 'gmbh'
   );   