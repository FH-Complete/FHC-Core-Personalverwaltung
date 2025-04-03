UPDATE
	system.tbl_fehler
SET
	fehlertext = 'Paralelle Dienstverhältnisse in einem Unternehmen; erste dienstverhaeltnis_id %s, zweite dienstverhaeltnis_id %s'
WHERE
	fehlercode = 'PERSONALVERWALTUNG_DIENSTVERHAELTNIS_0001'
	AND LENGTH(fehlertext) > 112
