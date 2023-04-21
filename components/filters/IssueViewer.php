<?php
	$filterCmptArray = array(
		'app' => 'personalverwaltung',
		'datasetName' => 'personalIssueViewer',
		'query' => '
			SELECT
				issue.datum AS "Datum",
				issue.fehlercode AS "Fehlercode",
				issue.inhalt AS "Inhalt",
				pers.vorname AS "Vorname",
				pers.nachname AS "Nachname",
				issue.person_id AS "PersonId",
				issue.status_kurzbz AS "Statuscode",
				issue.verarbeitetvon AS "Bearbeitet von",
				issue.verarbeitetamum AS "Bearbeitet am",
				issue.issue_id AS "IssueId",
				fehler.fehlertyp_kurzbz AS "Fehlertyp"
			FROM
				system.tbl_issue issue
				JOIN system.tbl_fehler fehler USING (fehlercode)
				JOIN public.tbl_person pers USING (person_id)
			WHERE
				fehler.app = \'personalverwaltung\'
			ORDER BY
				CASE
					WHEN fehler.fehlertyp_kurzbz = \'error\' THEN 0
					WHEN fehler.fehlertyp_kurzbz = \'warning\' THEN 1
					ELSE 2
				END,
				CASE
					WHEN issue.status_kurzbz = \'new\' THEN 0
					WHEN issue.status_kurzbz = \'inProgress\' THEN 1
					ELSE 2
				END,
				issue.datum DESC,
				issue.fehlercode,
				issue.issue_id DESC
		',
		'requiredPermissions' => 'admin'
	);
