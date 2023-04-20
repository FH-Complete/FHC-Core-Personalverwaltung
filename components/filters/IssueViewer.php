<?php
	$filterCmptArray = array(
		'app' => 'personalverwaltung',
		'datasetName' => 'personalIssueViewer',
		'query' => '
			SELECT
				issue.issue_id AS "IssueId",
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
