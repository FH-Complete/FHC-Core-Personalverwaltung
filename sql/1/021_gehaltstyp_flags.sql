ALTER TABLE hr.tbl_gehaltstyp ADD COLUMN lvexport boolean not null default false;
ALTER TABLE hr.tbl_gehaltstyp ADD COLUMN lvexport_sum VARCHAR(256) default null;

UPDATE hr.tbl_gehaltstyp SET lvexport = true WHERE gehaltstyp_kurzbz<>'lohnausgleichatz';

ALTER TABLE INSERT INTO hr.tbl_gehaltstyp(gehaltstyp_kurzbz, bezeichnung, valorisierung, sort,aktiv, lvexport) VALUES('zulage_allin', 'Zulage (allin)', true, 3, true, true); ADD COLUMN lvexport_sum VARCHAR(256) not null default false;
UPDATE hr.tbl_gehaltstyp set sort = sort + 1 where sort > 3;
INSERT INTO hr.tbl_gehaltstyp(gehaltstyp_kurzbz, bezeichnung, valorisierung, sort,aktiv, lvexport) VALUES('zulage_allin', 'Zulage (allin)', true, 4, true, true);
UPDATE hr.tbl_gehaltstyp set lvexport_sum = 'GRUNDGEHALT' where gehaltstyp_kurzbz IN ('grundgehalt', 'zulage_allin');