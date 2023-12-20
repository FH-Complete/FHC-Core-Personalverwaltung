<?php
class Api_model extends DB_Model
{
    function fetch_all()
    {
        $this->db->order_by('nachname', 'DESC');
        return $this->db->get('campus.vw_mitarbeiter');
    }

    public function getUID($person_id)
	{
        $qry = "
        SELECT tbl_benutzer.uid
        FROM tbl_mitarbeiter
            JOIN tbl_benutzer ON tbl_mitarbeiter.mitarbeiter_uid::text = tbl_benutzer.uid::text
            JOIN tbl_person USING (person_id)
        WHERE tbl_person.person_id=?
        ";

        return $this->execQuery($qry, array($person_id));
	}

    function getEmployee($person_id)
    {

        $qry = "
        SELECT tbl_benutzer.uid,
            tbl_mitarbeiter.personalnummer,
            tbl_mitarbeiter.kurzbz,
            tbl_mitarbeiter.lektor,
            tbl_mitarbeiter.fixangestellt,
            tbl_mitarbeiter.telefonklappe,
            tbl_person.person_id,
            tbl_benutzer.alias,
            tbl_person.titelpost,
            tbl_person.titelpre,
            tbl_person.nachname,
            tbl_person.vorname,
            tbl_person.vornamen,
            tbl_person.foto,
            ( SELECT tbl_kontakt.kontakt
              FROM tbl_kontakt
              WHERE tbl_kontakt.person_id = tbl_person.person_id AND tbl_kontakt.kontakttyp::text = 'email'::text
              ORDER BY tbl_kontakt.zustellung DESC
              LIMIT 1) AS email_privat,
            tbl_benutzer.updateaktivam,
            tbl_benutzer.updateaktivvon,
            GREATEST(tbl_person.updateamum, tbl_benutzer.updateamum, tbl_mitarbeiter.updateamum) AS lastupdate
        FROM tbl_mitarbeiter
            JOIN tbl_benutzer ON tbl_mitarbeiter.mitarbeiter_uid::text = tbl_benutzer.uid::text
            JOIN tbl_person USING (person_id)
        WHERE tbl_person.person_id=?
        ";

        return $this->execQuery($qry, array($person_id));
    }

    function getPersonHeaderData($person_id)
    {
        $qry = "
        SELECT
            p.person_id,
            tbl_benutzer.uid,
            tbl_benutzer.alias,
            tbl_mitarbeiter.personalnummer,
            tbl_mitarbeiter.kurzbz,
            tbl_mitarbeiter.telefonklappe,
            p.aktiv,
            p.anrede,
            p.titelpost,
            p.titelpre,
            p.nachname,
            p.vorname,
            p.vornamen,
            p.sprache,
            p.geschlecht,
            p.anmerkung,
            p.homepage,
            p.foto,
            p.updateamum AS lastupdate
        FROM tbl_person p
             JOIN tbl_benutzer ON (p.person_id=tbl_benutzer.person_id)
             JOIN tbl_mitarbeiter ON tbl_benutzer.uid::text = tbl_mitarbeiter.mitarbeiter_uid::text
        WHERE p.person_id=?
        ";

        return $this->execQuery($qry, array($person_id));
    }

    /**
     * get current disciplinary Abteilung of person
     */
    function getPersonAbteilung($uid)
    {

        $qry ="
            SELECT
                bf.benutzerfunktion_id,bf.fachbereich_kurzbz,bf.uid,bf.funktion_kurzbz,bf.updateamum,bf.updatevon,bf.insertamum,bf.insertvon,bf.ext_id,bf.semester,bf.oe_kurzbz,bf.datum_von,bf.datum_bis,bf.bezeichnung,bf.wochenstunden,
                oe.oe_kurzbz,oe.oe_parent_kurzbz,oe.bezeichnung,oe.organisationseinheittyp_kurzbz,oe.aktiv,oe.mailverteiler,oe.freigabegrenze,oe.kurzzeichen,oe.lehre,oe.standort,oe.warn_semesterstunden_frei,oe.warn_semesterstunden_fix,oe.standort_id
            FROM tbl_benutzerfunktion bf JOIN public.tbl_organisationseinheit oe USING(oe_kurzbz)
            WHERE uid = ? AND funktion_kurzbz='oezuordnung'
                AND datum_von<=now() AND (datum_bis is null OR datum_bis>=now())
        ";

        return $this->execQuery($qry, array($uid));
    }

    function getLeitungOrg($oe_kurzbz)
    {
        $qry = "
            SELECT bf.benutzerfunktion_id,bf.fachbereich_kurzbz,bf.uid,bf.funktion_kurzbz,bf.updateamum,bf.updatevon,bf.insertamum,bf.insertvon,bf.ext_id,bf.semester,bf.oe_kurzbz,bf.datum_von,bf.datum_bis,bf.bezeichnung,bf.wochenstunden,
                p.person_id, p.vorname,p.nachname,p.titelpre,p.titelpost
            FROM public.tbl_benutzerfunktion bf JOIN public.tbl_organisationseinheit oe USING(oe_kurzbz)
            JOIN public.tbl_benutzer b USING (uid) JOIN public.tbl_mitarbeiter ma ON(b.uid=ma.mitarbeiter_uid)
            JOIN public.tbl_person p  USING(person_id)
            WHERE funktion_kurzbz='Leitung' AND oe.oe_kurzbz = ?
                AND datum_von<=now() AND (datum_bis is null OR datum_bis>=now());
        ";

        return $this->execQuery($qry, array($oe_kurzbz));
    }

    function getGemeinden($plz)
    {
        $qry = "
        SELECT
            distinct g.name
        FROM bis.tbl_gemeinde g
        WHERE g.plz=?
        ORDER BY g.name
        ";

        return $this->execQuery($qry, array($plz));
    }

    function getOrtschaften($plz)
    {
        $qry = "
        SELECT distinct
            g.ortschaftsname
        FROM bis.tbl_gemeinde g
        WHERE g.plz=?
        ORDER BY g.ortschaftsname
        ";

        return $this->execQuery($qry, array($plz));
    }

    // ------------------------------------
    // Contracts new/expiring
    // ------------------------------------
    function getContractExpire($year, $month)
    {
        return $this->getContractsNewOrExpire($year, $month, true);
    }

    function getContractNew($year, $month)
    {
        return $this->getContractsNewOrExpire($year, $month, false);
    }

    /**
     * helper to get expired or new contracts
     */
    private function getContractsNewOrExpire($year, $month, $expire=true)
    {

        $startDate = \DateTime::createFromFormat("Y-m-d", "$year-$month-1")->format("Y-m-d");
        $endDate = \DateTime::createFromFormat("Y-m-d", "$year-$month-1")->format("Y-m-t");

        $where = "where dv.bis>='$startDate' and dv.bis<='$endDate' ";
        $order = "order by bis asc";

        if (!$expire)
        {
            $where = "where dv.von>='$startDate' and dv.von<='$endDate' ";
            $order = "order by von asc";
        }

        $qry="
        select m.personalnummer, p.person_id, b.uid, p.nachname, p.vorname, p.nachname || ', ' || coalesce(p.vorname,'') || ' ' || coalesce(p.titelpre,'') as name,dv.mitarbeiter_uid,dv.von,dv.bis
        from hr.tbl_dienstverhaeltnis dv join public.tbl_benutzer b on  (dv.mitarbeiter_uid=b.uid)  join public.tbl_person p using(person_id)
             join public.tbl_mitarbeiter m  on (b.uid=m.mitarbeiter_uid)
        $where
        $order
        ";

        return $this->execQuery($qry);
    }

    public function getBirthdays($dateAsUnixTS)
    {

        $query = "SELECT uid, person_id, nachname,vorname, titelpre, titelpost, age(ma.gebdatum) age, geschlecht
					FROM campus.vw_mitarbeiter ma
				   WHERE date_part('month',gebdatum)=? and date_part('day',gebdatum)=? and aktiv=true
				ORDER BY nachname, vorname";

        $currentTime = DateTime::createFromFormat( 'U', $dateAsUnixTS );
        $month = $currentTime->format('m');
        $day = $currentTime->format('d');

		return $this->execQuery($query, array($month, $day));
    }

    public function getCovidDate($person_id, $dateAsUnixTS)
    {
        $date = DateTime::createFromFormat( 'U', $dateAsUnixTS );
        $datestring = $date->format("Y-m-d");

        $query="SELECT (p.udf_values -> 'udf_3gvalid')::text::date covid_date, CASE
            WHEN (p.udf_values -> 'udf_3gvalid')::text::date >= ? THEN 1
            WHEN (p.udf_values -> 'udf_3gvalid')::text::date < ? THEN 0
            ELSE -1
            END AS covidvalid
            FROM tbl_person p
            WHERE p.person_id = ?";

        return $this->execQuery($query, array($datestring, $datestring, $person_id));
    }

    public function getOffTimeList($person_uid, $year = 0)    
    {

        $year_filter = " AND z.vondatum>=now()";
        $query_parameter = array($person_uid);

        if ($year > 0)
        {
            $year_filter = " AND date_part('year',vondatum)>=? AND date_part('year',bisdatum)<=? ";
            $query_parameter[] = $year;
            $query_parameter[] = $year;
        }

        $qry = "
        SELECT 
            z.zeitsperre_id,
            z.zeitsperretyp_kurzbz,
            t.beschreibung as zeitsperretyp,
            z.mitarbeiter_uid,
            z.bezeichnung,
            z.vondatum,
            z.vonstunde,
            z.bisdatum,
            z.bisstunde,
            z.vertretung_uid,
            z.updateamum,
            z.updatevon,
            z.insertamum,
            z.insertvon,
            z.erreichbarkeit_kurzbz,
            e.beschreibung as erreichbarkeit,
            z.freigabeamum,
            z.freigabevon

        FROM campus.tbl_zeitsperre z
            LEFT JOIN campus.tbl_zeitsperretyp t using(zeitsperretyp_kurzbz)
            LEFT JOIN campus.tbl_erreichbarkeit e using(erreichbarkeit_kurzbz)
        WHERE z.mitarbeiter_uid=? $year_filter
        ";

        return $this->execQuery($qry, $query_parameter);

    }

    function runReport($sql, $filter)
    {
        // replace user
        if(strpos($sql, '$user')!==false)
        {
            $uid = get_uid();
            $sql = str_replace('$user',pg_escape_string($uid),$sql);
        }
        foreach($filter as $item)
        {
            $sql = str_replace('$'.$item['name'],"'".pg_escape_string($item['value'])."'",$sql);
        }

        return $this->execQuery($sql);
    }


    // -------------------------------------
    // PersonBaseData
    // -------------------------------------

    function getPersonBaseData($person_id)
    {
        $qry = "
        SELECT tbl_benutzer.uid,
            p.person_id,
            p.aktiv,
            p.anrede,
            p.titelpost,
            p.titelpre,
            p.nachname,
            p.vorname,
            p.vornamen,
            p.sprache,
            p.geschlecht,
            p.gebdatum,
            p.svnr,
            p.anmerkung,
            p.ersatzkennzeichen,
            p.staatsbuergerschaft,
            p.geburtsnation,
            p.insertamum,
            p.insertvon,
            p.updatevon,
            p.updateamum
        FROM tbl_person p
            LEFT JOIN tbl_benutzer on(p.person_id=tbl_benutzer.person_id)
            LEFT JOIN tbl_mitarbeiter on(tbl_benutzer.uid=tbl_mitarbeiter.mitarbeiter_uid)
        WHERE p.person_id=?
        ";

        return $this->execQuery($qry, array($person_id));
    }


    function updatePersonBaseData($personJson)
    {
        unset($personJson['uid']);
        unset($personJson['insertamum']);
        // set empty values to null
        if ($personJson['sprache'] == '')
        {
            $personJson['sprache'] = null;
        }
        if ($personJson['geburtsnation'] == '')
        {
            $personJson['geburtsnation'] = null;
        }
        if ($personJson['staatsbuergerschaft'] == '')
        {
            $personJson['staatsbuergerschaft'] = null;
        }

        $personJson['updatevon'] = getAuthUID();
        $personJson['updateamum'] = $this->escape('NOW()');

        $result = $this->PersonModel->update($personJson['person_id'], $personJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $result = $this->getPersonBaseData($personJson['person_id']);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return $result;
    }

    function insertPersonBaseData($personJson)
    {
        unset($personJson['uid']);
        unset($personJson['updateamum']);
        unset($personJson['updatevon']);
        // set empty values to null
        if (isset($personJson['sprache']) && $personJson['sprache'] == '')
        {
            $personJson['sprache'] = null;
        }
        if (isset($personJson['geburtsnation']) && $personJson['geburtsnation'] == '')
        {
            $personJson['geburtsnation'] = null;
        }
        if (isset($personJson['staatsbuergerschaft']) && $personJson['staatsbuergerschaft'] == '')
        {
            $personJson['staatsbuergerschaft'] = null;
        }
        if (isset($personJson['svnr']) && $personJson['svnr'] == '')
        {
            $personJson['svnr'] = null;
        }

        $personJson['insertvon'] = getAuthUID();
        $personJson['insertamum'] = $this->escape('NOW()');

        $result = $this->PersonModel->insert($personJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $person_id = $result->retval;

        return success($person_id);
    }

    private function generateEmployeeUID($personalnummer)
    {
        /* did not work out:
        $string = $person_id - 10000;
        $uid = strlen($string) < 4 ? 'ma0'. $string: 'ma'. $string;
        return $uid;
        */
        //$qry = "select max(substr(uid,3)::integer) uid from tbl_benutzer where uid~'^ma[0-9]+'";

        $uid = sprintf('ma%05d',  $personalnummer);

        return $uid;
    }

    function generatePersonalnummer()
    {
        $qry = "select nextval('tbl_mitarbeiter_personalnummer_seq') pnr";

        $result = $this->execQuery($qry);

        return $result->retval[0]->pnr;
    }

    function insertUser($userJson)
    {

        unset($userJson['updateamum']);
        unset($userJson['updatevon']);
        $userJson['aktiv'] = true;

        $userJson['insertvon'] = getAuthUID();
        $userJson['insertamum'] = $this->escape('NOW()');

        $result = $this->BenutzerModel->insert($userJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($userJson['uid']);
    }

    // -------------------------------------
    // PersonEmployeeData (Mitarbeiterdaten)
    // -------------------------------------

    /**
     * get Mitarbeiterdaten by person_id
     * @param $person_id
     */
    function getPersonEmployeeData($person_id)
    {
        $qry = "
        SELECT
            b.person_id,
            p.mitarbeiter_uid,
            p.personalnummer,
            p.telefonklappe,
            p.kurzbz,
            p.lektor,
            p.fixangestellt,
            p.stundensatz,
            p.ausbildungcode,
            p.ort_kurzbz,
            p.ext_id,
            p.anmerkung,
            p.bismelden,
            p.standort_id,
            p.kleriker,
            b.alias,
            b.aktiv,
            p.insertamum,
            p.insertvon,
            p.updatevon,
            p.updateamum
        FROM tbl_mitarbeiter p join tbl_benutzer b on (p.mitarbeiter_uid=b.uid)
        WHERE b.person_id=?
        ";

        return $this->execQuery($qry, array($person_id));
    }

    function updatePersonEmployeeData($employeeDataJson)
    {
        $employeeDataJson['updatevon'] = getAuthUID();
        $employeeDataJson['updateamum'] = $this->escape('NOW()');

        $alias = $employeeDataJson['alias'];
        unset($employeeDataJson['alias']);
        $aktiv = $employeeDataJson['aktiv'];
        unset($employeeDataJson['aktiv']);
        $person_id = $employeeDataJson['person_id'];
        unset($employeeDataJson['person_id']);

        if ($employeeDataJson['standort_id'] == 0)
        {
            $employeeDataJson['standort_id'] = null;
        }

        $result = $this->EmployeeModel->update($employeeDataJson['mitarbeiter_uid'], $employeeDataJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        // update alias and aktiv flag
        // TODO check for alias duplicates!!!
        $result = $this->BenutzerModel->load($employeeDataJson['mitarbeiter_uid']);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $userData = $result->retval[0];
        $userData->alias = $alias;
        $userData->aktiv = $aktiv;
        $userData->updatevon = getAuthUID();
        $userData->updateamum = $this->escape('NOW()');
        $this->BenutzerModel->update($employeeDataJson['mitarbeiter_uid'], $userData);

        $result = $this->getPersonEmployeeData($person_id);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return $result;
        //return success($employeeDataJson['mitarbeiter_uid']);
    }

    function insertEmployee($employeeJson)
    {

        $employeeJson['insertvon'] = getAuthUID();
        $employeeJson['insertamum'] = $this->escape('NOW()');

        if (isset($employeeJson['standort_id'])
			&& $employeeJson['standort_id'] == 0)
        {
            $employeeJson['standort_id'] = null;
        }

        $result = $this->EmployeeModel->insert($employeeJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($employeeJson['personalnummer']);
        //return success($employeeJson['mitarbeiter_uid']);
    }


    // --------------------------------
    // PersonBankData
    // --------------------------------

    function updatePersonBankData($bankDataJson)
    {
        $bankDataJson['updatevon'] = getAuthUID();
        $bankDataJson['updateamum'] = $this->escape('NOW()');

        $result = $this->BankverbindungModel->update($bankDataJson['bankverbindung_id'], $bankDataJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $result = $this->BankverbindungModel->load($bankDataJson['bankverbindung_id']);

        return $result;
    }

    function insertPersonBankData($bankDataJson)
    {
        unset($bankDataJson['bankverbindung_id']);
        unset($bankDataJson['updateamum']);
        unset($bankDataJson['orgform_kurzbz']);
        unset($bankDataJson['oe_kurzbz']);
        $bankDataJson['insertvon'] = getAuthUID();
        $bankDataJson['insertamum'] = $this->escape('NOW()');
        $bankDataJson['typ']='p';

        $result = $this->BankverbindungModel->insert($bankDataJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $record = $this->BankverbindungModel->load($result->retval);

        return $record;
    }

    function deletePersonBankData($bankverbindung_id)
    {
        $result = $this->BankverbindungModel->delete($bankverbindung_id);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($bankverbindung_id);
    }



    // --------------------------------
    // PersonAddressData
    // --------------------------------

    function getPersonAddressData($person_id)
    {
        $qry = "
            SELECT
                adresse_id,
                person_id,
                name,
                strasse,
                plz,
                ort,
                gemeinde,
                nation,
                typ,
                heimatadresse,
                zustelladresse,
                firma_id,
                updateamum,
                updatevon,
                insertamum,
                insertvon,
                ext_id,
                rechnungsadresse,
                anmerkung,
                co_name
            FROM public.tbl_adresse a
            WHERE a.person_id=?
        ";

        return $this->execQuery($qry, array($person_id));
    }

    function insertPersonAddressData($addressDataJson)
    {
        unset($addressDataJson['adresse_id']);
        unset($addressDataJson['updateamum']);
        $addressDataJson['rechnungsadresse'] = false;
        $addressDataJson['insertvon'] = getAuthUID();
        $addressDataJson['insertamum'] = $this->escape('NOW()');

        if ($addressDataJson['firma_id'] == 0)
        {
            $addressDataJson['firma_id'] = null;
        }

        if ($addressDataJson['nation'] == '')
        {
            $addressDataJson['nation'] = 'A';
        }

        if ($addressDataJson['typ'] == '')
        {
            $addressDataJson['typ'] = 'h';
        }

        $result = $this->AdresseModel->insert($addressDataJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $record = $this->AdresseModel->load($result->retval);

        return $record;
    }

    function updatePersonAddressData($addressDataJson)
    {
        $addressDataJson['updatevon'] = getAuthUID();
        $addressDataJson['updateamum'] = $this->escape('NOW()');

        if ($addressDataJson['firma_id'] == 0)
        {
            $addressDataJson['firma_id'] = null;
        }

        $result = $this->AdresseModel->update($addressDataJson['adresse_id'], $addressDataJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $record = $this->AdresseModel->load($result->retval);

        return $record;
    }

    function deletePersonAddressData($adresse_id)
    {
        $result = $this->AdresseModel->delete($adresse_id);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($adresse_id);
    }

    // --------------------------------
    // PersonContactData
    // --------------------------------

    function insertPersonContactData($contactDataJson)
    {
        unset($contactDataJson['kontakt_id']);
        unset($contactDataJson['updateamum']);
        $contactDataJson['insertvon'] = getAuthUID();
        $contactDataJson['insertamum'] = $this->escape('NOW()');

        if ( isset($contactDataJson['standort_id'])
			&& $contactDataJson['standort_id'] == 0)
        {
            $contactDataJson['standort_id'] = null;
        }

        $result = $this->KontaktModel->insert($contactDataJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $record = $this->KontaktModel->load($result->retval);

        return $record;
    }

    function updatePersonContactData($contactDataJson)
    {
        $contactDataJson['updatevon'] = getAuthUID();
        $contactDataJson['updateamum'] = $this->escape('NOW()');

        if ($contactDataJson['kontakt_id'] == 0)
        {
            $contactDataJson['kontakt_id'] = null;
        }
        if ($contactDataJson['standort_id'] == 0)
        {
            $contactDataJson['standort_id'] = null;
        }
        // remove data introduced by the join with tbl_firma and tbl_standort
        unset($contactDataJson['firma_id']);
        unset($contactDataJson['adresse_id']);
        unset($contactDataJson['aktiv']);
        unset($contactDataJson['bezeichnung']);
        unset($contactDataJson['code']);
        unset($contactDataJson['kurzbz']);
        unset($contactDataJson['finanzamt']);
        unset($contactDataJson['firmentyp_kurzbz']);
        unset($contactDataJson['gesperrt']);
        unset($contactDataJson['insertamum']);
        unset($contactDataJson['insertvon']);
        unset($contactDataJson['lieferant']);
        unset($contactDataJson['lieferbedingungen']);
        unset($contactDataJson['name']);
        unset($contactDataJson['partner_code']);
        unset($contactDataJson['schule']);
        unset($contactDataJson['steuernummer']);

        $result = $this->KontaktModel->update($contactDataJson['kontakt_id'], $contactDataJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $record = $this->KontaktModel->load($result->retval);

        return $record;
    }

    function deletePersonContactData($kontakt_id)
    {
        $result = $this->KontaktModel->delete($kontakt_id);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($kontakt_id);
    }


    /**
     * search for employees
     */
    function filter($filter)
    {

        $parametersArray = array($filter, $filter);
        $where ="tbl_person.nachname~* ? or tbl_person.vorname~* ?";

        if(is_numeric($filter))
        {
			$where="tbl_mitarbeiter.personalnummer=?";
            $parametersArray = array($filter);
        }

        $qry = "
        SELECT tbl_benutzer.uid,
            tbl_mitarbeiter.personalnummer,
            tbl_mitarbeiter.kurzbz,
            tbl_mitarbeiter.lektor,
            tbl_mitarbeiter.fixangestellt,
            tbl_mitarbeiter.telefonklappe,
            tbl_benutzer.person_id,
            tbl_benutzer.alias,
            tbl_person.titelpost,
            tbl_person.titelpre,
            tbl_person.nachname,
            tbl_person.vorname,
            tbl_person.vornamen,
            ( SELECT tbl_kontakt.kontakt
              FROM tbl_kontakt
              WHERE tbl_kontakt.person_id = tbl_person.person_id AND tbl_kontakt.kontakttyp::text = 'email'::text
              ORDER BY tbl_kontakt.zustellung DESC
              LIMIT 1) AS email_privat,
            tbl_benutzer.updateaktivam,
            tbl_benutzer.updateaktivvon,
            GREATEST(tbl_person.updateamum, tbl_benutzer.updateamum, tbl_mitarbeiter.updateamum) AS lastupdate
        FROM tbl_mitarbeiter
            JOIN tbl_benutzer ON tbl_mitarbeiter.mitarbeiter_uid::text = tbl_benutzer.uid::text
            JOIN tbl_person USING (person_id)
        WHERE $where
        ORDER BY tbl_person.nachname, tbl_person.vorname
        ";

        return $this->execQuery($qry, $parametersArray);
    }

    /**
     * search person (used by employee create dialog)
     */
    function filterPerson($surname, $birthdate=null)
    {

        $parametersArray = array($surname);
        $where ="p.nachname~* ? ";
        if (mb_strlen($surname) == 2) 
        {
            $where = "p.nachname=? ";
        }

        if(isset($birthdate) && $birthdate != '')
        {
			$where.=" AND p.gebdatum=?";
            $parametersArray[] = $birthdate;
        }

        $qry='
            SELECT
                p.person_id,
                b.uid,
                p.svnr,
                p.titelpost,
                p.titelpre,
                p.nachname,
                p.vorname,
                p.vornamen,
                p.geschlecht,
                p.gebdatum,
                ma.personalnummer,
                s.matrikelnr,
                CASE WHEN ma.personalnummer is not null THEN \'Mitarbeiter\'
                     WHEN s.matrikelnr is not null THEN \'Student\'
                     ELSE \'-\'
                END AS status,
                exists (select 1 from public.tbl_benutzer tb join public.tbl_mitarbeiter tm on(tb.uid=tm.mitarbeiter_uid) where person_id=p.person_id) as taken
            FROM
                public.tbl_person p LEFT JOIN
                public.tbl_benutzer b ON (p.person_id=b.person_id)  LEFT JOIN
                public.tbl_mitarbeiter ma ON (b.uid=ma.mitarbeiter_uid) LEFT JOIN
                public.tbl_student s ON (b.uid=s.student_uid)
            WHERE '.$where.'
            ORDER BY p.nachname, p.vorname, status
        ';

        return $this->execQuery($qry, $parametersArray);
    }

    // -----------------------------------
    // Foto
    // -----------------------------------

    function getFoto($person_id)
    {
        $qry = "
        SELECT
            tbl_person.foto
        FROM tbl_person
        WHERE tbl_person.person_id=?
        ";

        $result= $this->execQuery($qry, array($person_id));
        return $result;
    }

    function updateFoto($person_id, $foto)
    {
        $personJson['foto'] = $foto;
        $result = $this->PersonModel->update($person_id, $personJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return $result;
    }

    function deleteFoto($person_id)
    {
        $personJson['foto'] = null;
        $result = $this->PersonModel->update($person_id, $personJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return $result;
    }

    function getEmployeeList()
    {

        $qry = "
        SELECT tbl_benutzer.uid,
            tbl_mitarbeiter.personalnummer,
            tbl_mitarbeiter.kurzbz,
            tbl_mitarbeiter.lektor,
            tbl_mitarbeiter.fixangestellt,
            tbl_mitarbeiter.telefonklappe,
            tbl_benutzer.person_id,
            tbl_benutzer.alias,
            tbl_person.titelpost,
            tbl_person.titelpre,
            tbl_person.nachname,
            tbl_person.vorname,
            tbl_person.vornamen,
            ( SELECT tbl_kontakt.kontakt
              FROM tbl_kontakt
              WHERE tbl_kontakt.person_id = tbl_person.person_id AND tbl_kontakt.kontakttyp::text = 'email'::text
              ORDER BY tbl_kontakt.zustellung DESC
              LIMIT 1) AS email_privat,
            tbl_benutzer.updateaktivam,
            tbl_benutzer.updateaktivvon,
            GREATEST(tbl_person.updateamum, tbl_benutzer.updateamum, tbl_mitarbeiter.updateamum) AS lastupdate
        FROM tbl_mitarbeiter
            JOIN tbl_benutzer ON tbl_mitarbeiter.mitarbeiter_uid::text = tbl_benutzer.uid::text
            JOIN tbl_person USING (person_id)

        ORDER BY tbl_person.nachname, tbl_person.vorname
        LIMIT 300
        ";

        return $this->execQuery($qry);
    }



    function getStandorteIntern() {
        $qry = "SELECT * FROM public.tbl_standort JOIN public.tbl_firma USING(firma_id) WHERE tbl_firma.firmentyp_kurzbz='Intern' ORDER BY tbl_standort.kurzbz";
        return $this->execQuery($qry);
    }


    // -----------------------------------------
    // DV
    // -----------------------------------------
    function insertDV($contractDataJSON)
    {
        $dvDataJson['insertvon'] = getAuthUID();
        $dvDataJson['insertamum'] = $this->escape('NOW()');

        $result = $this->DVModel->insert($dvDataJson);
        $dvData = $this->KontaktModel->load($result->retval);

        // create contract details (Vertragsbestandteile)

        // Stunden

        // Befristung



        return $dvData;
    }

}