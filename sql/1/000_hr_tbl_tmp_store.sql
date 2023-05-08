CREATE TABLE IF NOT EXISTS hr.tbl_tmp_store (
    tmp_store_id bigserial NOT NULL,
    typ character varying(32) NOT NULL,
    mitarbeiter_uid character varying(32) NOT NULL,
    formdata jsonb NOT NULL,
    insertvon character varying(32) NOT NULL,
    insertamum timestamp without time zone DEFAULT now() NOT NULL,
    updatevon character varying(32),
    updateamum timestamp without time zone,
    CONSTRAINT tbl_tmp_store_pkey PRIMARY KEY (tmp_store_id)
);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_tmp_store TO vilesci;
GRANT SELECT,UPDATE ON SEQUENCE hr.tbl_tmp_store_tmp_store_id_seq TO vilesci;
