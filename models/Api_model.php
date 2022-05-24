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
            p.anmerkung,
            p.homepage,
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


}