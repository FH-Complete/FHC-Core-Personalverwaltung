<?php
	$filterCmptArray = array(
		'app' => 'personalverwaltung',
		'datasetName' => 'handyverwaltung',
		//'filterKurzbz' => 'jobs48hours', // REMOVE ME
		'query' =>  '
		    SELECT 
			    b.uid AS "UID", p.person_id AS "PersonId",
			    p.vorname AS "Vorname", p.nachname AS "Nachname",
			    b.alias || \'@' . DOMAIN . '\' AS "EMail", u.bezeichnung AS "Unternehmen",
			    va.bezeichnung AS "Vertragsart", d.von AS "DV_von", d.bis AS "DV_bis",
			    ws.wochenstunden AS "Wochenstunden", ws.von AS "WS_von", ws.bis AS "WS_bis",
			    \'[\' || kst.ksttypbezeichnung || \'] \' || kst.bezeichnung as "Standardkostenstelle",
			    \'[\' || oe.oetypbezeichnung || \'] \' || oe.bezeichnung as "Disziplinäre Zuordnung",
			    d.dienstverhaeltnis_id AS "DienstverhaeltnisId"
		    FROM 
			    hr.tbl_dienstverhaeltnis d 
		    JOIN 
			    public.tbl_benutzer b ON d.mitarbeiter_uid = b.uid 
		    JOIN 
			    public.tbl_person p ON p.person_id = b.person_id 
		    JOIN
			    public.tbl_organisationseinheit u ON d.oe_kurzbz = u.oe_kurzbz
		    JOIN
			    hr.tbl_vertragsart va ON d.vertragsart_kurzbz = va.vertragsart_kurzbz
		    LEFT JOIN (
			    SELECT
				    bf.uid,oe_kurzbz,oe_parent_kurzbz,public.tbl_organisationseinheit.bezeichnung,
				    organisationseinheittyp_kurzbz, oet.bezeichnung AS oetypbezeichnung
			    FROM 
				    public.tbl_benutzerfunktion bf JOIN public.tbl_organisationseinheit using(oe_kurzbz)
			    JOIN 
				    public.tbl_organisationseinheittyp oet USING(organisationseinheittyp_kurzbz)
			    WHERE 
				    funktion_kurzbz=\'oezuordnung\' and datum_von<=now() AND (datum_bis is null OR datum_bis>=now())
			    ) oe USING(uid)
		    LEFT JOIN (
			    SELECT 
				    bf.uid,oe_kurzbz,public.tbl_organisationseinheit.bezeichnung, kstt.bezeichnung AS ksttypbezeichnung
			    FROM 
				    public.tbl_benutzerfunktion bf JOIN public.tbl_organisationseinheit using(oe_kurzbz)
			    JOIN 
				    public.tbl_organisationseinheittyp kstt USING(organisationseinheittyp_kurzbz)
			    WHERE 
				    funktion_kurzbz=\'kstzuordnung\' and datum_von<=now() AND (datum_bis is null OR datum_bis>=now())
			    ) kst USING(uid)
		    LEFT JOIN (
			    SELECT 
				    vb.dienstverhaeltnis_id, vb.von, vb.bis, wochenstunden 
			    FROM 
				    hr.tbl_vertragsbestandteil vb 
			    JOIN 
				    hr.tbl_vertragsbestandteil_stunden vbs USING(vertragsbestandteil_id) 
			    WHERE 
				    (vb.von >= NOW()::date OR COALESCE(vb.bis, \'2100-12-31\'::date) > NOW()::date) 
			    ORDER BY 
				    vb.von ASC
		    ) ws USING(dienstverhaeltnis_id)
		    WHERE 
			    d.vertragsart_kurzbz = \'echterdv\' AND (d.von >= NOW()::date OR COALESCE(d.bis, \'2100-12-31\'::date) > NOW()::date)
		    ORDER BY
			    p.nachname, p.vorname
		',
		'requiredPermissions' => 'assistenz'
	);

/*
 * 
 * {"name": "MA Handyverwaltung", "columns": [{"name": "UID"}, {"name": "PersonId"}, {"name": "Vorname"}, {"name": "Nachname"}, {"name": "EMail"}, {"name": "Unternehmen"}, {"name": "Vertragsart"}, {"name": "DV_von"}, {"name": "DV_bis"}, {"name": "Wochenstunden"}, {"name": "WS_von"}, {"name": "WS_bis"}, {"name": "Standardkostenstelle"}], "filters": [{"name": "Nachname", "option": "", "condition": "", "operation": ""}]}
 * 
 '    
			SELECT ma.uid as "UID",
				ma.person_id as "PersonId",
				ma.personalnummer as "Personalnummer",
				ma.vorname as "Vorname",
				ma.nachname as "Nachname",
				ma.titelpre as "TitelPre",
				ma.titelpost as "TitelPost",
				ma.alias as "Alias",
				ma.gebdatum as "Geburtsdatum",
				ma.aktiv as "Aktiv",
				ma.fixangestellt as "Fixangestellt",
				ma.ort_kurzbz as "Raum",
				ma.geschlecht as "Geschlecht",
				ma.telefonklappe as "Durchwahl",
				\'[\' || kst.ksttypbezeichnung || \'] \' || kst.bezeichnung as "Standardkostenstelle",
				\'[\' || oe.oetypbezeichnung || \'] \' || oe.bezeichnung as "Disziplinäre Zuordnung",
				coalesce(kst.oe_kurzbz,oe.oe_kurzbz) as "OE Key"
			 FROM campus.vw_mitarbeiter ma
			   LEFT JOIN (
				SELECT
					bf.uid,oe_kurzbz,oe_parent_kurzbz,public.tbl_organisationseinheit.bezeichnung,
					organisationseinheittyp_kurzbz, oet.bezeichnung AS oetypbezeichnung
				FROM public.tbl_benutzerfunktion bf JOIN public.tbl_organisationseinheit using(oe_kurzbz)
				JOIN public.tbl_organisationseinheittyp oet USING(organisationseinheittyp_kurzbz)
				WHERE funktion_kurzbz=\'oezuordnung\' and datum_von<=now() AND (datum_bis is null OR datum_bis>=now())) oe USING(uid)
			   LEFT JOIN (
				SELECT bf.uid,oe_kurzbz,public.tbl_organisationseinheit.bezeichnung, kstt.bezeichnung AS ksttypbezeichnung
				FROM public.tbl_benutzerfunktion bf JOIN public.tbl_organisationseinheit using(oe_kurzbz)
				JOIN public.tbl_organisationseinheittyp kstt USING(organisationseinheittyp_kurzbz)
				WHERE funktion_kurzbz=\'kstzuordnung\' and datum_von<=now() AND (datum_bis is null OR datum_bis>=now())) kst USING(uid)
		 ORDER BY ma.nachname, ma.vorname
	    '
*/