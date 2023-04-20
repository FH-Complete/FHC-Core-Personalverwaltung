<?php
	$filterCmptArray = array(
		'app' => 'personalverwaltung',
		'datasetName' => 'personalIssueViewer',
		'query' => '
			SELECT
				issue.issue_id AS "IssueId",
				issue.fehlercode AS "Fehlercode",
				issue.inhalt AS "Text",
				issue.person_id AS "PersonId",
				issue.datum AS "Datum",
				issue.verarbeitetvon AS "Bearbeitet von",
				issue.verarbeitetamum AS "Bearbeitet am",
				issue.status_kurzbz AS "Statuscode"
			FROM
				system.tbl_issue issue
				JOIN system.tbl_fehler fehler USING (fehlercode)
			WHERE
				fehler.app = \'personalverwaltung\'
			ORDER BY
				issue.issue_id
		',
		'requiredPermissions' => 'admin'
	);
