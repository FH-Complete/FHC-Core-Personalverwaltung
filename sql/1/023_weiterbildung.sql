CREATE TABLE hr.tbl_weiterbildung_hauptkategorie
(
    weiterbildung_hauptkategorie_id serial NOT NULL,
    bezeichnung character varying(32),
    beschreibung varchar(100),
    sort smallint,
    aktiv boolean NOT NULL DEFAULT true,
    insertamum timestamp,
    insertvon varchar(32),
    updateamum timestamp,
    updatevon varchar(32),
    CONSTRAINT tbl_weiterbildung_hauptkategorie_pk PRIMARY KEY (weiterbildung_hauptkategorie_id)
);



CREATE TABLE hr.tbl_weiterbildung_statistik
(
    weiterbildung_statistik_id serial NOT NULL,
    bezeichnung character varying(32),
    beschreibung varchar(100),
    sort smallint,
    aktiv boolean NOT NULL DEFAULT true,
    insertamum timestamp,
    insertvon varchar(32),
    updateamum timestamp,
    updatevon varchar(32),
    CONSTRAINT tbl_weiterbildung_statistik_pk PRIMARY KEY (weiterbildung_statistik_id)
);

CREATE TABLE hr.tbl_weiterbildung
(
    weiterbildung_id serial NOT NULL,
    mitarbeiter_uid character varying(32),
    intern bool default true,
    hauptkategorie_id int,
    statistikkategorie_id int,
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

CREATE TABLE hr.tbl_weiterbildung_dokument 
(
    weiterbildung_id int NOT NULL,
    dms_id int NOT NULL
);

ALTER TABLE hr.tbl_weiterbildung ADD CONSTRAINT tbl_weiterbildung_mitarbeiter_uid_fk FOREIGN KEY (mitarbeiter_uid)
REFERENCES public.tbl_mitarbeiter (mitarbeiter_uid) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE hr.tbl_weiterbildung ADD CONSTRAINT tbl_weiterbildung_hauptkategorie_fk FOREIGN KEY (hauptkategorie_id)
REFERENCES hr.tbl_weiterbildung_hauptkategorie (weiterbildung_hauptkategorie_id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE hr.tbl_weiterbildung ADD CONSTRAINT tbl_weiterbildung_statistikkategorie_fk FOREIGN KEY (statistikkategorie_id)
REFERENCES hr.tbl_weiterbildung_statistikkategorie (weiterbildung_statistikkategorie_id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE hr.tbl_weiterbildung_dokument ADD CONSTRAINT tbl_weiterbildung_dokument_fk FOREIGN KEY (weiterbildung_id)
REFERENCES hr.tbl_weiterbildung (weiterbildung_id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE hr.tbl_weiterbildung_dokument ADD CONSTRAINT tbl_weiterbildung_dokument__dms_fk FOREIGN KEY (dms_id)
REFERENCES campus.tbl_dms (dms_id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;

GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_weiterbildung_hauptkategorie TO vilesci;
GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_weiterbildung_statistik TO vilesci;

GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_weiterbildung TO vilesci;
GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_weiterbildung_dokument TO vilesci;

COMMENT ON TABLE hr.tbl_weiterbildung IS E'Interne und Externe Weiterbildung von Mitarbeitern';

GRANT USAGE ON hr.tbl_weiterbildung_weiterbildung_id_seq TO vilesci;
GRANT USAGE ON hr.tbl_weiterbildung_hauptkatego_weiterbildung_hauptkategorie__seq TO vilesci;
GRANT USAGE ON hr.tbl_weiterbildung_statistik_weiterbildung_statistik_id_seq TO vilesci;