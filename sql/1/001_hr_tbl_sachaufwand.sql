CREATE TABLE hr.tbl_sachaufwand (
	sachaufwand_id bigint NOT NULL,
	mitarbeiter_uid character varying(32),
	sachaufwandtyp_kurzbz character varying(32),
--	dienstverhaeltnis_id integer, // Später
	beginn date,
	ende date,
	anmerkung text,
	insertamum timestamp,
	insertvon character varying(32),
	updateamum timestamp,
	updatevon character varying(32),
	CONSTRAINT tbl_sachaufwand_pk PRIMARY KEY (sachaufwand_id)
);


CREATE SEQUENCE IF NOT EXISTS hr.tbl_sachaufwand_sachaufwand_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;

GRANT SELECT, UPDATE ON hr.tbl_sachaufwand_sachaufwand_id_seq TO vilesci;

ALTER TABLE hr.tbl_sachaufwand ALTER COLUMN sachaufwand_id SET DEFAULT nextval('hr.tbl_sachaufwand_sachaufwand_id_seq');



ALTER TABLE hr.tbl_sachaufwand ADD CONSTRAINT tbl_mitarbeiter_fk FOREIGN KEY (mitarbeiter_uid)
REFERENCES public.tbl_mitarbeiter (mitarbeiter_uid) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE hr.tbl_sachaufwandtyp (
	sachaufwandtyp_kurzbz character varying(32) NOT NULL,
	bezeichnung character varying(256),
	sort smallint,
	aktiv boolean,
	CONSTRAINT tbl_sachaufwandtyp_pk PRIMARY KEY (sachaufwandtyp_kurzbz)
);

ALTER TABLE hr.tbl_sachaufwand ADD CONSTRAINT tbl_sachaufwandtyp_fk FOREIGN KEY (sachaufwandtyp_kurzbz)
REFERENCES hr.tbl_sachaufwandtyp (sachaufwandtyp_kurzbz) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_sachaufwand TO vilesci;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_sachaufwandtyp TO vilesci;

INSERT INTO hr.tbl_sachaufwandtyp (sachaufwandtyp_kurzbz, bezeichnung, sort, aktiv) VALUES('Jobticket','Jobticket',1,true);
INSERT INTO hr.tbl_sachaufwandtyp (sachaufwandtyp_kurzbz, bezeichnung, sort, aktiv) VALUES('Klimaticket','Klimaticket',2,true);
INSERT INTO hr.tbl_sachaufwandtyp (sachaufwandtyp_kurzbz, bezeichnung, sort, aktiv) VALUES('Pendlerpauschale','Pendlerpauschale',3,true);
