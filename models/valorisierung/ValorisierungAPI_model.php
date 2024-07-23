<?php
class ValorisierungAPI_model extends DB_Model
{
	public function getDVsForValorisation($valorisierungsDatum, $valorisierungsOeKurzbz = null)
	{
		$sql = <<<EOSQL
SELECT
	p.nachname || ' ' || p.vorname AS mitarbeiter,
	0 AS sumsalarypreval,
	0 AS sumsalarypostval,
	NULL AS valorisierungmethode,
	kstzuordnung.kst AS stdkst,
	oezuordnung.oe AS diszplzuordnung,
	dv.dienstverhaeltnis_id,
	va.bezeichnung AS vertragsart,
	oe.bezeichnung AS unternehmen,
	dv.von AS dvvon,
	dv.bis AS dvbis
FROM
	hr.tbl_dienstverhaeltnis dv
JOIN
	public.tbl_benutzer b ON b.uid = dv.mitarbeiter_uid
JOIN
	public.tbl_person p ON b.person_id = p.person_id
JOIN
	hr.tbl_vertragsart va USING(vertragsart_kurzbz)
JOIN
	public.tbl_organisationseinheit oe ON dv.oe_kurzbz = oe.oe_kurzbz
LEFT JOIN (
	SELECT
		vb.dienstverhaeltnis_id, STRING_AGG(oe.bezeichnung, ', ') AS kst
	FROM
		hr.tbl_vertragsbestandteil vb
	JOIN
		hr.tbl_dienstverhaeltnis dv USING(dienstverhaeltnis_id)
	JOIN
		hr.tbl_vertragsbestandteil_funktion vbf USING (vertragsbestandteil_id)
	JOIN
		public.tbl_benutzerfunktion bf USING(benutzerfunktion_id)
	JOIN
		public.tbl_organisationseinheit oe ON bf.oe_kurzbz = oe.oe_kurzbz
	WHERE
		dv.vertragsart_kurzbz = 'echterdv' AND
		bf.funktion_kurzbz = 'kstzuordnung' AND
		{$this->db->escape($valorisierungsDatum)} BETWEEN COALESCE(bf.datum_von, '1970-01-01') AND COALESCE(bf.datum_bis, '2170-12-31')
	GROUP BY
		vb.dienstverhaeltnis_id
) kstzuordnung USING(dienstverhaeltnis_id)
LEFT JOIN (
	SELECT
		vb.dienstverhaeltnis_id, STRING_AGG(oe.bezeichnung, ', ') AS oe
	FROM
		hr.tbl_vertragsbestandteil vb
	JOIN
		hr.tbl_dienstverhaeltnis dv USING(dienstverhaeltnis_id)
	JOIN
		hr.tbl_vertragsbestandteil_funktion vbf USING (vertragsbestandteil_id)
	JOIN
		public.tbl_benutzerfunktion bf USING(benutzerfunktion_id)
	JOIN
		public.tbl_organisationseinheit oe ON bf.oe_kurzbz = oe.oe_kurzbz
	WHERE
		dv.vertragsart_kurzbz = 'echterdv' AND
		bf.funktion_kurzbz = 'oezuordnung' AND
		{$this->db->escape($valorisierungsDatum)} BETWEEN COALESCE(bf.datum_von, '1970-01-01') AND COALESCE(bf.datum_bis, '2170-12-31')
	GROUP BY
		vb.dienstverhaeltnis_id
) oezuordnung USING(dienstverhaeltnis_id)
WHERE
	dv.vertragsart_kurzbz = 'echterdv'
	AND
		{$this->db->escape($valorisierungsDatum)} BETWEEN COALESCE(dv.von, '1970-01-01') AND COALESCE(dv.bis, '2170-12-31')
EOSQL;

		if (isset($valorisierungsOeKurzbz)) $sql .= <<<EOSQL
	AND {$this->db->escape($valorisierungsOeKurzbz)} = dv.oe_kurzbz
EOSQL;

		return $this->execReadOnlyQuery($sql);
	}
}
