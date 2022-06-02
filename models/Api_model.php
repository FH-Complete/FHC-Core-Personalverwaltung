<?php
class Api_model extends DB_Model
{
    function fetch_all()
    {
        $this->db->order_by('nachname', 'DESC');
        return $this->db->get('campus.vw_mitarbeiter');
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
            tbl_mitarbeiter.personalnummer,
            tbl_mitarbeiter.kurzbz,
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
            LEFT JOIN tbl_benutzer ON (p.person_id=tbl_benutzer.person_id)
            LEFT JOIN tbl_mitarbeiter ON tbl_benutzer.uid::text = tbl_mitarbeiter.mitarbeiter_uid::text
        WHERE p.person_id=?
        ";

        return $this->execQuery($qry, array($person_id));
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
            p.updateamum AS lastupdate
        FROM tbl_person p
        WHERE p.person_id=?
        ";

        return $this->execQuery($qry, array($person_id));
    }


    function updatePersonBaseData($personJson)
    {
        unset($personJson['uids']);
        unset($personJson['lastupdate']);
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

        return success($personJson['person_id']);
    }

    function insertPersonBaseData($personJson)
    {
        unset($personJson['uids']);
        unset($personJson['lastupdate']);
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

        if ($employeeDataJson['standort_id'] == 0)
        {
            $employeeDataJson['standort_id'] = null;
        }

        $result = $this->EmployeeModel->update($employeeDataJson['mitarbeiter_uid'], $employeeDataJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        // update alias
        // TODO check for duplicates!!!
        $result = $this->BenutzerModel->load($employeeDataJson['mitarbeiter_uid']);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $userData = $result->retval[0];
        $userData->alias = $alias;
        $userData->updatevon = getAuthUID();
        $userData->updateamum = $this->escape('NOW()');
        $this->BenutzerModel->update($employeeDataJson['mitarbeiter_uid'], $userData);

        return success($employeeDataJson['mitarbeiter_uid']);
    }


    // --------------------------------
    // PersonBankData
    // --------------------------------

    function updatePersonBankData($bankDataJson)
    {
        $bankDataJson['updatevon'] = getAuthUID();
        $bankDataJson['updateamum'] = $this->escape('NOW()');

        $result = $this->BankverbindungModel->update($bankDataJson['person_id'], $bankDataJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($bankDataJson['person_id']);
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
        LIMIT 100
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