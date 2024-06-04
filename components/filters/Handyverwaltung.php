<?php
	$filterCmptArray = array(
		'app' => 'personalverwaltung',
		'datasetName' => 'handyverwaltung',
		//'filterKurzbz' => 'jobs48hours', // REMOVE ME
		'query' => '
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
		',
		'requiredPermissions' => 'assistenz'
	);
