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
        
        $where = "where bv.ende>='$startDate' and bv.ende<='$endDate' ";
        $order = "order by ende asc";

        if (!$expire)
        {
            $where = "where bv.beginn>='$startDate' and bv.beginn<='$endDate' ";
            $order = "order by beginn asc";
        }

        $qry="
        select m.personalnummer, b.uid, p.nachname || ', ' || coalesce(p.vorname,'') || ' ' || coalesce(p.titelpre,'') as name,bv.mitarbeiter_uid,bv.beginn,bv.ende, m.fixangestellt, bv.vertragsstunden,bv.dv_art,bv.hauptberuflich
        from bis.tbl_bisverwendung bv join public.tbl_benutzer b on  (bv.mitarbeiter_uid=b.uid)  join public.tbl_person p using(person_id)
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
        SELECT array(select tbl_benutzer.uid from tbl_benutzer where tbl_benutzer.person_id=p.person_id) uids,
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
            p.insertamum,
            p.insertvon,
            p.updatevon,
            p.updateamum
        FROM tbl_person p
        WHERE p.person_id=?
        ";

        return $this->execQuery($qry, array($person_id));
    }


    function updatePersonBaseData($personJson)
    {
        unset($personJson['uids']);
        unset($personJson['insertamum']);
        // set empty values to null
        if ($personJson['sprache'] == '')
        {
            $personJson['sprache'] = null;
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
        unset($personJson['uids']);
        unset($personJson['updateamum']);
        unset($personJson['updatevon']);
        // set empty values to null
        if ($personJson['sprache'] == '')
        {
            $personJson['sprache'] = null;
        }

        $personJson['insertvon'] = getAuthUID();
        $personJson['insertamum'] = $this->escape('NOW()');

        $result = $this->PersonModel->insert($personJson['person_id'], $personJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($personJson['person_id']);
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

        if ($contactDataJson['standort_id'] == 0)
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

    function getBankverbindung($person_id)
    {

    }


}