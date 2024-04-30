<?php
class ValorisierungAPI_model extends DB_Model
{
    public function getDVsForValorisation()
    {
	$sql = <<<EOSQL
SELECT 
	p.nachname || ' ' || p.vorname AS mitarbeiter, 
	va.bezeichnung AS vertragsart,
	0 AS sumsalarypreval,
	0 AS sumsalarypostval,
	NULL AS valorisierungmethode,
	kstzuordnung.kst AS stdkst, 
	oezuordnung.oe AS diszplzuordnung,
	dv.von AS dv_von,
	dv.bis AS dv_bis, 
	dv.dienstverhaeltnis_id 
FROM 
	hr.tbl_dienstverhaeltnis dv 
JOIN 
	public.tbl_benutzer b ON b.uid = dv.mitarbeiter_uid 
JOIN 
	public.tbl_person p ON b.person_id = p.person_id 
JOIN
	hr.tbl_vertragsart va USING(vertragsart_kurzbz)
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
		'2024-09-01' BETWEEN COALESCE(bf.datum_von, '1970-01-01') AND COALESCE(bf.datum_bis, '2170-12-31') 
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
		'2024-09-01' BETWEEN COALESCE(bf.datum_von, '1970-01-01') AND COALESCE(bf.datum_bis, '2170-12-31') 
	GROUP BY
		vb.dienstverhaeltnis_id
) oezuordnung USING(dienstverhaeltnis_id)
WHERE 
		dv.vertragsart_kurzbz = 'echterdv' 
	AND 
		'2024-09-01' BETWEEN COALESCE(dv.von, '1970-01-01') AND COALESCE(dv.bis, '2170-12-31') 
EOSQL;
	return $this->execReadOnlyQuery($sql);
    }
}    
