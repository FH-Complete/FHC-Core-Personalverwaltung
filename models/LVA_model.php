<?php

class LVA_model extends DB_Model
{
    

    public function getSupportHours($uid,$semester_kurzbz)
    {
        $result = null;

		$qry = "
        select ma.mitarbeiter_uid,lehrveranstaltung.lehrveranstaltung_id,lehreinheit.studiensemester_kurzbz,lehrveranstaltung.studiengang_kz,sum(b.stunden) as semesterstunden, b.stundensatz,b.faktor 
        from lehre.tbl_projektbetreuer as b join lehre.tbl_projektarbeit using(projektarbeit_id)  
                join lehre.tbl_lehreinheit as lehreinheit using(lehreinheit_id) join lehre.tbl_lehrveranstaltung as lehrveranstaltung using(lehrveranstaltung_id) 
                join public.tbl_studiengang as studiengang using(studiengang_kz), 
                 tbl_person as p join tbl_benutzer as benutzer on(p.person_id=benutzer.person_id) join tbl_mitarbeiter as ma on (ma.mitarbeiter_uid=benutzer.uid) 
        where b.person_id=p.person_id and b.stundensatz is not null and ma.mitarbeiter_uid=? and ma.lehreinheit.studiensemester_kurzbz=?
        group by ma.mitarbeiter_uid,lehrveranstaltung.lehrveranstaltung_id, lehreinheit.studiensemester_kurzbz,lehrveranstaltung.studiengang_kz,b.stundensatz,b.faktor 
        order by lehreinheit.studiensemester_kurzbz 
        ";

        return $this->execQuery($qry, array($uid, $semester_kurzbz));
		
    }

    public function getAllSupportHours($uid)
    {
        $result = null;

		$qry = "
        SELECT studiensemester_kurzbz, sum(semesterstunden)::float  semesterstunden FROM
            (  
                select ma.mitarbeiter_uid,lehrveranstaltung.lehrveranstaltung_id,lehreinheit.studiensemester_kurzbz,lehrveranstaltung.studiengang_kz,sum(b.stunden) as semesterstunden, b.stundensatz,b.faktor 
                from lehre.tbl_projektbetreuer as b join lehre.tbl_projektarbeit using(projektarbeit_id)  
                        join lehre.tbl_lehreinheit as lehreinheit using(lehreinheit_id) join lehre.tbl_lehrveranstaltung as lehrveranstaltung using(lehrveranstaltung_id) 
                        join public.tbl_studiengang as studiengang using(studiengang_kz), 
                         tbl_person as p join tbl_benutzer as benutzer on(p.person_id=benutzer.person_id) join tbl_mitarbeiter as ma on (ma.mitarbeiter_uid=benutzer.uid) 
                where b.person_id=p.person_id and b.stundensatz is not null and ma.mitarbeiter_uid=? 
                group by ma.mitarbeiter_uid,lehrveranstaltung.lehrveranstaltung_id, lehreinheit.studiensemester_kurzbz,lehrveranstaltung.studiengang_kz,b.stundensatz,b.faktor 
            ) q
        GROUP BY studiensemester_kurzbz            
        ORDER BY substr(studiensemester_kurzbz,3) asc,substr(studiensemester_kurzbz,1,2) desc
        ";

        return $this->execQuery($qry, array($uid));
		
    }


    public function getAllCourseHours($uid)
    {
        $result = null;

		$qry = "         
            SELECT studiensemester_kurzbz, sum(semesterstunden)::float  semesterstunden FROM
            (            
                SELECT lehreinheitmitarbeiter.mitarbeiter_uid,lehreinheitmitarbeiter.lehreinheit_id,lehrveranstaltung.lehrveranstaltung_id, lehreinheit.studiensemester_kurzbz,
                   lehrveranstaltung.studiengang_kz,lehreinheitmitarbeiter.semesterstunden,lehreinheitmitarbeiter.stundensatz,lehreinheitmitarbeiter.faktor 
                FROM lehre.tbl_lehreinheitmitarbeiter as lehreinheitmitarbeiter, 
                    lehre.tbl_lehrveranstaltung as lehrveranstaltung, 
                    lehre.tbl_lehreinheitgruppe as lehreinheitgruppe, 
                    public.tbl_studiengang as studiengang 
                WHERE lehreinheit.lehreinheit_id=lehreinheitmitarbeiter.lehreinheit_id AND 
                    lehrveranstaltung.lehrveranstaltung_id=lehreinheit.lehrveranstaltung_id AND 
                    lehrveranstaltung.studiengang_kz=studiengang.studiengang_kz AND     
                    lehreinheitmitarbeiter.mitarbeiter_uid=? 
            ) q
            GROUP BY studiensemester_kurzbz            
            ORDER BY substr(studiensemester_kurzbz,3) asc,substr(studiensemester_kurzbz,1,2) desc
        ";

        return $this->execQuery($qry, array($uid));
		
    }

    public function getCourseHours($uid,$semester_kurzbz)
    {
        $result = null;

		$qry = "
        SELECT sum(semesterstunden)::float  semesterstunden FROM
            (
                SELECT lehreinheitmitarbeiter.mitarbeiter_uid,lehreinheitmitarbeiter.lehreinheit_id,lehrveranstaltung.lehrveranstaltung_id, lehreinheit.studiensemester_kurzbz,lehrveranstaltung.studiengang_kz,lehreinheitmitarbeiter.semesterstunden,lehreinheitmitarbeiter.stundensatz,lehreinheitmitarbeiter.faktor 
                FROM lehre.tbl_lehreinheitmitarbeiter as lehreinheitmitarbeiter, 
                    lehre.tbl_lehreinheit as lehreinheit, 
                    lehre.tbl_lehrveranstaltung as lehrveranstaltung, 
                    lehre.tbl_lehreinheitgruppe as lehreinheitgruppe, 
                    public.tbl_studiengang as studiengang 
                WHERE lehreinheit.lehreinheit_id=lehreinheitmitarbeiter.lehreinheit_id AND 
                    lehrveranstaltung.lehrveranstaltung_id=lehreinheit.lehrveranstaltung_id AND 
                    lehreinheit.lehreinheit_id=lehreinheitgruppe.lehreinheit_id AND 
                    lehrveranstaltung.studiengang_kz=studiengang.studiengang_kz AND 
                    lehrveranstaltung.studiengang_kz>=0 AND
                    lehreinheitmitarbeiter.mitarbeiter_uid=? AND lehreinheit.studiensemester_kurzbz=?
                GROUP BY lehreinheitmitarbeiter.mitarbeiter_uid,lehreinheitmitarbeiter.lehreinheit_id,lehrveranstaltung.lehrveranstaltung_id, lehreinheit.studiensemester_kurzbz,lehrveranstaltung.studiengang_kz,lehreinheitmitarbeiter.stundensatz,lehreinheitmitarbeiter.faktor,lehreinheitmitarbeiter.semesterstunden 
            ) sub
        ";

        return $this->execQuery($qry, array($uid, $semester_kurzbz));
		
    }


   
}