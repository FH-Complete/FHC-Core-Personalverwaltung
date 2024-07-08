       
CREATE TABLE IF NOT EXISTS hr.tbl_gehaltsband (
    gehaltsband_kurzbz character varying(32) NOT NULL,
    bezeichnung varchar(32) NOT NULL,
    aktiv boolean DEFAULT FALSE,
    sort smallint,
    insertvon character varying(32) NOT NULL,
    insertamum timestamp without time zone DEFAULT now() NOT NULL,
    updatevon character varying(32),
    updateamum timestamp without time zone,
    CONSTRAINT tbl_gehaltsband_pkey PRIMARY KEY (gehaltsband_kurzbz)
);

CREATE TABLE IF NOT EXISTS hr.tbl_gehaltsband_funktion (
    gehaltsband_funktion_id bigserial NOT NULL,
    gehaltsband_kurzbz varchar(32) NOT NULL,
    funktion_kurzbz varchar(32) NOT NULL,
    oe_kurzbz varchar(32),
    organisationseinheittyp_kurzbz varchar(32),
    insertvon character varying(32) NOT NULL,
    insertamum timestamp without time zone DEFAULT now() NOT NULL,
    updatevon character varying(32),
    updateamum timestamp without time zone
);

CREATE TABLE IF NOT EXISTS hr.tbl_gehaltsband_betrag (
    gehaltsband_betrag_id bigserial NOT NULL,
    gehaltsband_kurzbz character varying(32) NOT NULL,
    von date,
    bis date,
    betrag_von numeric(9,5),
    betrag_bis numeric(9,5),
    insertvon character varying(32) NOT NULL,
    insertamum timestamp without time zone DEFAULT now() NOT NULL,
    updatevon character varying(32),
    updateamum timestamp without time zone,
    CONSTRAINT tbl_gehaltsband_betrag_pkey PRIMARY KEY (gehaltsband_betrag_id)
);

ALTER TABLE hr.tbl_gehaltsband_betrag DROP CONSTRAINT IF EXISTS tbl_gehaltsband_betrag_gehaltsband_kurzbz_fk;
ALTER TABLE hr.tbl_gehaltsband_betrag ADD CONSTRAINT tbl_gehaltsband_betrag_gehaltsband_kurzbz_fk FOREIGN KEY (gehaltsband_kurzbz)
REFERENCES hr.tbl_gehaltsband (gehaltsband_kurzbz) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE hr.tbl_gehaltsband_funktion DROP CONSTRAINT IF EXISTS tbl_gehaltsband_funktion_oe_kurzbz_fk;
ALTER TABLE hr.tbl_gehaltsband_funktion ADD CONSTRAINT tbl_gehaltsband_funktion_oe_kurzbz_fk FOREIGN KEY (oe_kurzbz)
REFERENCES public.tbl_organisationseinheit (oe_kurzbz) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE hr.tbl_gehaltsband_funktion DROP CONSTRAINT IF EXISTS tbl_gehaltsband_funktion_organisationseinheittyp_kurzbz_fk;
ALTER TABLE hr.tbl_gehaltsband_funktion ADD CONSTRAINT tbl_gehaltsband_funktion_organisationseinheittyp_kurzbz_fk FOREIGN KEY (organisationseinheittyp_kurzbz)
REFERENCES public.tbl_organisationseinheittyp (organisationseinheittyp_kurzbz) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

COMMENT ON TABLE hr.tbl_gehaltsband IS E'Definition of salary range types';
COMMENT ON TABLE hr.tbl_gehaltsband_funktion IS E'job functions assigned to salary range';
COMMENT ON TABLE hr.tbl_gehaltsband_betrag IS E'salary range (time dependend)';

GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_gehaltsband TO vilesci;
GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_gehaltsband_betrag TO vilesci;
GRANT USAGE ON hr.tbl_gehaltsband_betrag_gehaltsband_betrag_id_seq TO vilesci;
GRANT USAGE ON hr.tbl_gehaltsband_funktion_gehaltsband_funktion_id_seq TO vilesci;

INSERT INTO hr.tbl_gehaltsband(gehaltsband_kurzbz, bezeichnung, aktiv, sort, insertvon) VALUES
('ASSISTENTIN','AssistentIn', 't', 1, 'system'),
('JUNIOR_LECTURER_RESEARCHER','Junior Lecturer/Researcher', 't', 2, 'system'),
('LECTURER_RESEARCHER','Lecturer/Researcher', 't', 3, 'system'),
('SENIOR_LECTURER_RESEARCHER','Senior Lecturer/Researcher', 't', 4, 'system'),
('STUDIENGANGSLEITERIN','StudiengangsleiterIn', 't', 5, 'system'),
('KOMPETENZFELDLEITERIN','KompetenzfeldleiterIn', 't', 6, 'system'),
('DEPARTMENTLEITERIN','DepartmentleiterIn', 't', 7, 'system'),
('FAKULTAETSLEITERIN','FakultätsleiterIn', 't', 8, 'system')
ON CONFLICT (gehaltsband_kurzbz) DO NOTHING;



