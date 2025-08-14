<?php
	$filterCmptArray = array(
		'app' => 'personalverwaltung',
		'datasetName' => 'kontaktdatenverwaltung',
		'query' =>  '
			SELECT
				DISTINCT ON(p.nachname, p.vorname, p.person_id)
				b.uid AS "UID", p.person_id AS "PersonId",
				p.vorname AS "Vorname", p.nachname AS "Nachname", u.bezeichnung AS "Unternehmen",
				va.bezeichnung AS "Vertragsart", d.von AS "DV_von", d.bis AS "DV_bis",
				\'[\' || oe.oetypbezeichnung || \'] \' || oe.bezeichnung as "Disziplinaere_Zuordnung",
				d.dienstverhaeltnis_id AS "DienstverhaeltnisId",
				CASE
					WHEN (d.von >= NOW()::date) THEN \'zukünftig\'
					WHEN (COALESCE(d.bis, \'2100-12-31\'::date) > NOW()::date) THEN \'laufend\'
				ELSE \'beendet\'
				END AS "DV_status"
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
				    organisationseinheittyp_kurzbz, oet.bezeichnung AS oetypbezeichnung, vb.dienstverhaeltnis_id
			    FROM
				    public.tbl_benutzerfunktion bf JOIN public.tbl_organisationseinheit using(oe_kurzbz)
			    JOIN
				    public.tbl_organisationseinheittyp oet USING(organisationseinheittyp_kurzbz)
				JOIN
					hr.tbl_vertragsbestandteil_funktion vbf ON bf.benutzerfunktion_id = vbf.benutzerfunktion_id
				JOIN
					hr.tbl_vertragsbestandteil vb ON vbf.vertragsbestandteil_id = vb.vertragsbestandteil_id
			    WHERE
				    funktion_kurzbz=\'oezuordnung\' and datum_von<=now() AND (datum_bis is null OR datum_bis>=now())
			    ) oe ON b.uid = oe.uid AND d.dienstverhaeltnis_id = oe.dienstverhaeltnis_id
		    WHERE
				d.vertragsart_kurzbz = \'externerlehrender\'
				AND NOT EXISTS ( 
					SELECT 1
					FROM hr.tbl_dienstverhaeltnis d2
					WHERE d2.mitarbeiter_uid   = d.mitarbeiter_uid
						AND (d2.von  <= NOW()::date
						AND (d2.bis IS NULL OR d2.bis >= NOW()::date))
						AND d2.vertragsart_kurzbz != \'externerlehrender\'
				)

			ORDER BY p.nachname, p.vorname, p.person_id, d.von DESC

		',
		'requiredPermissions' => 'extension/pv21_kontaktdatenver'
	);
