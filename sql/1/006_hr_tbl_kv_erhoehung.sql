CREATE TABLE IF NOT EXISTS hr.tbl_kv_erhoehung (
	jahr smallint,
	prozent numeric(8,2),
	CONSTRAINT tbl_kv_erhoehung_pk PRIMARY KEY (jahr)
);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hr.tbl_kv_erhoehung TO vilesci;

-- TODO insert kv erhoehungen