<?php
	$filterCmptArray = array(
		'app' => 'core',
		'datasetName' => 'employees',
		//'filterKurzbz' => 'jobs48hours', // REMOVE ME
		'query' => '
			SELECT ma.uid as "UID",
				ma.person_id as "PersonId",
				ma.personalnummer as "Personalnummer",
				ma.kurzbz as "Kurzbz",
				ma.vorname as "Vorname",
				ma.vornamen as "Vornamen",
				ma.nachname as "Nachname",
				ma.titelpre as "TitelPre",
				ma.titelpost as "TitelPost",
				ma.alias as "Alias",
				ma.gebdatum as "Geburtsdatum",
				ma.aktiv as "Aktiv",
				ma.fixangestellt as "Fixangestellt",
				ma.svnr as "SVNR",
				ma.ort_kurzbz as "Raum",
				ma.geschlecht as "Geschlecht",				
				ma.telefonklappe as "DW",
				oe.oe_kurzbz as "OeKurzbz",
				oe.oe_parent_kurzbz as "OeParent",
				oe.bezeichnung as "OeBezeichnung",
				oe.organisationseinheittyp_kurzbz as "OeTyp"
			 FROM campus.vw_mitarbeiter ma
			   LEFT JOIN tbl_benutzerfunktion bf USING(uid) LEFT JOIN public.tbl_organisationseinheit oe USING(oe_kurzbz)
			 WHERE bf.funktion_kurzbz=\'oezuordnung\' AND datum_von<=now() AND (datum_bis is null OR datum_bis>=now())
		 ORDER BY ma.nachname, ma.vorname
		',
		'requiredPermissions' => 'admin'
	);

