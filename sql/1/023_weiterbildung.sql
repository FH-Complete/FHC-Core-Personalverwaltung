CREATE TABLE hr.tbl_weiterbildungskategorie
(
    weiterbildungskategorie_kurzbz varchar(32) NOT NULL,
    bezeichnung character varying(32),
    beschreibung varchar(100),
    sort smallint,
    aktiv boolean NOT NULL DEFAULT true,
    weiterbildungskategorietyp_kurzbz   character varying(32),
    insertamum timestamp,
    insertvon varchar(32),
    updateamum timestamp,
    updatevon varchar(32),
    CONSTRAINT tbl_weiterbildungskategorie_pk PRIMARY KEY (weiterbildungskategorie_kurzbz)
);
/
CREATE TABLE hr.tbl_weiterbildungskategorietyp
(
    weiterbildungskategorietyp_kurzbz  character varying(32) NOT NULL,
    bezeichnung character varying(32),  
    sort smallint,
    aktiv boolean NOT NULL DEFAULT true,
    insertamum timestamp,
    insertvon varchar(32),
    updateamum timestamp,
    updatevon varchar(32),
    CONSTRAINT tbl_weiterbildungskategorietyp_pk PRIMARY KEY (weiterbildungskategorietyp_kurzbz)
);

CREATE TABLE hr.tbl_weiterbildung
(
    weiterbildung_id serial NOT NULL,
    mitarbeiter_uid character varying(32),
    intern bool default true,
    bezeichnung varchar(100),
    von date,
    bis date,
    ablaufdatum date,
    stunden numeric(8, 2),
    beantragt date,
    hr_freigegeben date,
    insertamum timestamp,
    insertvon varchar(32),
    updateamum timestamp,
    updatevon varchar(32),
    CONSTRAINT tbl_weiterbildung_pk PRIMARY KEY (weiterbildung_id)
);

CREATE TABLE hr.tbl_weiterbildung_kategorie_rel 
(
    weiterbildung_id int NOT NULL,
    weiterbildungskategorie_kurzbz  varchar(32) NOT NULL
);


CREATE TABLE hr.tbl_weiterbildung_dokument 
(
    weiterbildung_id int NOT NULL,
    dms_id int NOT NULL
);


-- tbl_weiterbildungskategorie->tbl_weiterbildungskategorietyp
ALTER TABLE hr.tbl_weiterbildungskategorie ADD CONSTRAINT tbl_weiterbildungskategorie_typ_kurzbz_fk FOREIGN KEY (weiterbildungskategorietyp_kurzbz)
REFERENCES hr.tbl_weiterbildungskategorietyp (weiterbildungskategorietyp_kurzbz) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

-- tbl_weiterbildung->tbl_mitarbeiter
ALTER TABLE hr.tbl_weiterbildung ADD CONSTRAINT tbl_weiterbildung_mitarbeiter_uid_fk FOREIGN KEY (mitarbeiter_uid)
REFERENCES public.tbl_mitarbeiter (mitarbeiter_uid) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

-- tbl_weiterbildung->tbl_weiterbildungskategorie  (m:n)
ALTER TABLE hr.tbl_weiterbildung_kategorie_rel ADD CONSTRAINT tbl_weiterbildung_kategorie_rel_weiterbildung_id_fk FOREIGN KEY (weiterbildung_id)
REFERENCES hr.tbl_weiterbildung (weiterbildung_id) MATCH FULL
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE hr.tbl_weiterbildung_kategorie_rel ADD CONSTRAINT tbl_weiterbildung_kategorie_rel_kurzbz_fk FOREIGN KEY (weiterbildungskategorie_kurzbz)
REFERENCES hr.tbl_weiterbildungskategorie (weiterbildungskategorie_kurzbz) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE hr.tbl_weiterbildung_dokument ADD CONSTRAINT tbl_weiterbildung_dokument_fk FOREIGN KEY (weiterbildung_id)
REFERENCES hr.tbl_weiterbildung (weiterbildung_id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE hr.tbl_weiterbildung_dokument ADD CONSTRAINT tbl_weiterbildung_dokument__dms_fk FOREIGN KEY (dms_id)
REFERENCES campus.tbl_dms (dms_id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;

GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_weiterbildungskategorie TO vilesci;
GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_weiterbildungskategorietyp TO vilesci;
GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_weiterbildung_kategorie_rel TO vilesci;
GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_weiterbildung TO vilesci;
GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_weiterbildung_dokument TO vilesci;

COMMENT ON TABLE hr.tbl_weiterbildung IS E'Interne und externe Weiterbildung von Mitarbeitern';

GRANT USAGE ON hr.tbl_weiterbildung_weiterbildung_id_seq TO vilesci;

-- Anm: es existiert bereits eine Kategorie Weiterbildung => TODO check ob neue Kategorie notwendig ist
-- INSERT INTO campus.tbl_dms_kategorie(kategorie_kurzbz, bezeichnung, beschreibung) VALUES('weiterbildung','Weiterbildung','Weiterbildung');

  
