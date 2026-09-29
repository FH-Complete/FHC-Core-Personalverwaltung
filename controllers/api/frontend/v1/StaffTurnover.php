<?php

defined('BASEPATH') || exit('No direct script access allowed');


class StaffTurnover extends FHCAPI_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';
    // code igniter
    protected $CI;

    public function __construct() {

        parent::__construct(
			array(
				'index' => Self::DEFAULT_PERMISSION,
				'getRateByOrget' => Self::DEFAULT_PERMISSION,
			)
		);

		// Loads authentication library and starts authenticationfetc
		$this->load->library('AuthLib');

        $this->load->model('extensions/FHC-Core-Personalverwaltung/SalaryRange_model','SalaryRangeModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/SalaryRangeBetrag_model','SalaryRangeBetragModel');
		$this->load->model('extensions/FHC-Core-Personalverwaltung/SalaryRangeFunktion_model','SalaryRangeFunktionModel');
		$this->load->model('person/Person_model','PersonModel');
        $this->load->model('person/Benutzer_model', 'BenutzerModel');

        // get CI for transaction management
        $this->CI = &get_instance();
    }

    public function index()
    {
		$this->terminateWithSuccess('not implemented');
	}


    public function getRateByOrget() {
        $von = $this->input->get('von', null);
		$bis = $this->input->get('bis', null);
		$orgID = $this->input->get('orgID', null);
		$orgetID = $this->input->get('orgetID', null);

		// validate 
		$date_von = DateTime::createFromFormat( 'Y-m-d', $von );
		$date_bis = DateTime::createFromFormat( 'Y-m-d', $bis );
        $von_datestring = $date_von->format("Y-m-d");
		$bis_datestring = $date_bis->format("Y-m-d");

		if ($date_von === false || $date_bis === false) {
			$this->terminateWithError('no date range selected');
			return;
		}

		if ($orgetID === null) {
			$this->terminateWithError('no department selected');
			return;
		}

        $dbModel = new DB_Model();

        $qry = "
        
WITH params AS (
    SELECT ?::date AS periode_start,
           ?::date AS periode_ende,
           ?::text AS oe_kurzbz
),

-- Anfangsbestand: Personen, die am Stichtag periode_start bereits aktiv in der Funktion waren
anfangsbestand AS (
    SELECT COUNT(DISTINCT p.person_id) AS anzahl
    FROM public.tbl_benutzerfunktion bf 
    JOIN public.tbl_benutzer b USING (uid) 
    JOIN tbl_person p USING (person_id)
    JOIN tbl_mitarbeiter m ON m.mitarbeiter_uid::text = b.uid::text
    CROSS JOIN params
    WHERE bf.oe_kurzbz = params.oe_kurzbz 
        AND bf.funktion_kurzbz = 'oezuordnung'
        AND bf.datum_von <= params.periode_start
        AND (bf.datum_bis >= params.periode_start OR bf.datum_bis IS NULL)
),

-- Zugänge: Personen mit allererstem Eintritt in die Funktion innerhalb der Periode
zugaenge AS (
    SELECT COUNT(*) AS anzahl
    FROM (
        SELECT p.person_id, MIN(bf.datum_von) AS erster_eintritt
        FROM public.tbl_benutzerfunktion bf 
        JOIN public.tbl_benutzer b USING (uid) 
        JOIN tbl_person p USING (person_id)
        JOIN tbl_mitarbeiter m ON m.mitarbeiter_uid::text = b.uid::text
        CROSS JOIN params
        WHERE bf.oe_kurzbz = params.oe_kurzbz 
            AND bf.funktion_kurzbz = 'oezuordnung'
        GROUP BY p.person_id
    ) sub, params
    WHERE erster_eintritt BETWEEN params.periode_start AND params.periode_ende
),

-- Abgänge: Personen mit letztem Austritt aus der Funktion innerhalb der Periode
abgaenge AS (
    SELECT COUNT(*) AS anzahl
    FROM (
        SELECT p.person_id, MAX(bf.datum_bis) AS letzter_austritt
        FROM public.tbl_benutzerfunktion bf 
        JOIN public.tbl_benutzer b USING (uid) 
        JOIN tbl_person p USING (person_id)
        JOIN tbl_mitarbeiter m ON m.mitarbeiter_uid::text = b.uid::text
        CROSS JOIN params
        WHERE bf.oe_kurzbz = params.oe_kurzbz
            AND bf.funktion_kurzbz = 'oezuordnung'
        GROUP BY p.person_id
    ) sub, params
    WHERE letzter_austritt BETWEEN params.periode_start AND params.periode_ende
)

SELECT 
    a.anzahl AS anfangsbestand,
    z.anzahl AS zugaenge,
    ab.anzahl AS abgaenge,
    ROUND(
        ab.anzahl::numeric / NULLIF((a.anzahl + z.anzahl), 0), 
        4
    ) AS fluktuationsrate,
    ROUND(
        ab.anzahl::numeric / NULLIF((a.anzahl + z.anzahl), 0) * 100, 
        2
    ) AS fluktuationsrate_prozent
FROM anfangsbestand a, zugaenge z, abgaenge ab;
        ";

        $qry="
WITH RECURSIVE params AS (
    SELECT ?::date AS periode_start,
           ?::date AS periode_ende,
           ?::text AS oe_kurzbz
),

-- Hierarchie ab der Wurzel, mit Ebene und Pfad für die Sortierung
oe_baum AS (
    SELECT o.oe_kurzbz,
           o.bezeichnung,
           NULL::text AS parent_kurzbz,          -- Wurzel hat keinen Parent
           0 AS ebene,
           ARRAY[o.oe_kurzbz::text] AS pfad
    FROM public.tbl_organisationseinheit o
    JOIN params p ON o.oe_kurzbz = p.oe_kurzbz

    UNION ALL

    SELECT o.oe_kurzbz,
           o.bezeichnung,
           o.oe_parent_kurzbz::text,
           ob.ebene + 1,
           ob.pfad || o.oe_kurzbz::text
    FROM public.tbl_organisationseinheit o
    JOIN oe_baum ob ON o.oe_parent_kurzbz = ob.oe_kurzbz
    WHERE NOT o.oe_kurzbz::text = ANY (ob.pfad)
),

-- Zuordnung: jede OE mit sich selbst und all ihren Nachkommen
oe_nachfolger AS (
    SELECT oe_kurzbz, oe_kurzbz AS nachfolger
    FROM oe_baum

    UNION

    SELECT n.oe_kurzbz, o.oe_kurzbz
    FROM oe_nachfolger n
    JOIN public.tbl_organisationseinheit o ON o.oe_parent_kurzbz = n.nachfolger
),

-- Basis: disziplinäre Zuordnung von Mitarbeitern in der Hierarchie
funktionen AS (
    SELECT bf.oe_kurzbz, b.person_id, bf.datum_von, bf.datum_bis
    FROM public.tbl_benutzerfunktion bf
    JOIN public.tbl_benutzer b USING (uid)
    JOIN public.tbl_mitarbeiter m ON m.mitarbeiter_uid::text = b.uid::text
    WHERE bf.funktion_kurzbz = 'oezuordnung' 
        AND bf.oe_kurzbz IN (SELECT oe_kurzbz FROM oe_baum)
),

-- Zwei Sichten je OE: nur die OE selbst ('eigen') bzw. OE + Nachkommen ('gesamt')
funktionen_scope AS (
    SELECT f.oe_kurzbz, 'eigen'::text AS scope,
           f.person_id, f.datum_von, f.datum_bis
    FROM funktionen f

    UNION ALL

    SELECT n.oe_kurzbz, 'gesamt'::text,
           f.person_id, f.datum_von, f.datum_bis
    FROM oe_nachfolger n
    JOIN funktionen f ON f.oe_kurzbz = n.nachfolger
),

-- Pro OE, Sicht und Person: Zeitpunkte verdichten
personen AS (
    SELECT fs.oe_kurzbz,
           fs.scope,
           fs.person_id,
           MIN(fs.datum_von) AS erster_eintritt,
           MAX(fs.datum_bis) AS letzter_austritt,
           BOOL_OR(fs.datum_bis IS NULL) AS hat_offene_zuordnung,
           BOOL_OR(fs.datum_von <= p.periode_start
                   AND (fs.datum_bis >= p.periode_start OR fs.datum_bis IS NULL)) AS im_bestand_am_start
    FROM funktionen_scope fs
    CROSS JOIN params p
    GROUP BY fs.oe_kurzbz, fs.scope, fs.person_id
),

-- Kennzahlen pro OE und Sicht
stat AS (
    SELECT pe.oe_kurzbz,
           pe.scope,
           COUNT(*) FILTER (WHERE pe.im_bestand_am_start) AS anfangsbestand,
           COUNT(*) FILTER (WHERE pe.erster_eintritt BETWEEN p.periode_start AND p.periode_ende) AS zugaenge,
           COUNT(*) FILTER (WHERE NOT pe.hat_offene_zuordnung
                              AND pe.letzter_austritt BETWEEN p.periode_start AND p.periode_ende) AS abgaenge
    FROM personen pe
    CROSS JOIN params p
    GROUP BY pe.oe_kurzbz, pe.scope
)

SELECT
    b.oe_kurzbz,
    b.parent_kurzbz,
    b.bezeichnung,
    b.ebene,

    COALESCE(e.anfangsbestand, 0) AS eigen_anfangsbestand,
    COALESCE(e.zugaenge, 0)       AS eigen_zugaenge,
    COALESCE(e.abgaenge, 0)       AS eigen_abgaenge,
    ROUND(e.abgaenge::numeric / NULLIF(e.anfangsbestand + e.zugaenge, 0) * 100, 2)
                                  AS eigen_fluktuation_prozent,

    COALESCE(g.anfangsbestand, 0) AS gesamt_anfangsbestand,
    COALESCE(g.zugaenge, 0)       AS gesamt_zugaenge,
    COALESCE(g.abgaenge, 0)       AS gesamt_abgaenge,
    ROUND(g.abgaenge::numeric / NULLIF(g.anfangsbestand + g.zugaenge, 0) * 100, 2)
                                  AS gesamt_fluktuation_prozent
FROM oe_baum b
LEFT JOIN stat e ON e.oe_kurzbz = b.oe_kurzbz AND e.scope = 'eigen'
LEFT JOIN stat g ON g.oe_kurzbz = b.oe_kurzbz AND g.scope = 'gesamt'
ORDER BY b.pfad;
        ";

        $queryparam = array($von_datestring, $bis_datestring, $orgetID);
        $result = $dbModel->execReadOnlyQuery($qry, $queryparam);

		if (isError($result))
		{
			$this->terminateWithError(getError($result));
			return;
		}
		
		return $this->terminateWithSuccess(getData($result));


    }

}

