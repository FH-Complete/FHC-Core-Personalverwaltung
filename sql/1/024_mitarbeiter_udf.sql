-- Add the UDF definition for udf_studienrichtung in the "public"."tbl_mitarbeiter" table
INSERT INTO system.tbl_udf ("schema", "table", "jsons")
VALUES ('public', 'tbl_mitarbeiter', '
[
	{
		"name": "udf_studienrichtung",
		"sort": 1,
		"type": "textfield",
		"title": "Studienrichtung",
		"description": "Studienrichtung",
		"placeholder": "Studienrichtung",
		"defaultValue": "",
		"requiredPermissions": [
			"basis/mitarbeiter"
		]
	}
]
'::jsonb)
ON CONFLICT ("schema", "table") DO NOTHING;

-- Add the "udf_values" column to the table "public"."tbl_mitarbeiter"
DO $$
BEGIN
	ALTER TABLE "public"."tbl_mitarbeiter" ADD "udf_values" JSONB NULL;
	EXCEPTION WHEN OTHERS THEN NULL;
END $$;

