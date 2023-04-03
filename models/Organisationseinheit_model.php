<?php

class Organisationseinheit_model extends DB_Model
{
    const FUNKTION_LEITUNG = 'Leitung';
    const FUNKTION_ASSISTENZ = 'ass';
    const FUNKTION_DISZIPLINAER = 'oezuordnung';
    const FUNKTION_FACHLICH = 'fachzuordnung';

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'public.tbl_organisationseinheit';
		$this->pk = 'oe_kurzbz';
		//$this->load->model('ressource/Mitarbeiter_model', 'MitarbeiterModel');
	}

    /**
     * get highest organisation units
     */
    public function getHeads()
    {
        //$this->addJoin('hr.tbl_unternehmen','public.tbl_organisationseinheit.oe_kurzbz=hr.tbl_unternehmen.oe_kurzbz','INNER');
        $result = $this->loadWhere(array('oe_parent_kurzbz' => NULL));
        $result = $this->load();

        return $result;
    }

    public function getDirectChilds($oe_kurzbz)
    {
        $this->addOrder('organisationseinheittyp_kurzbz','DESC');
        $this->addOrder('bezeichnung');
        $result = $this->loadWhere(array('oe_parent_kurzbz' => $oe_kurzbz, 'aktiv' => true));

        return $result;
    }
   
    public function getOrgStructure($oe_kurzbz)
    {
        $head = $this->load($oe_kurzbz);        
        $leitung = $this->getLeitung($oe_kurzbz);
        $leitung_str = $this->formatPerson($leitung);
        $ass = $this->getAssistenz($oe_kurzbz);
        $ass_str = $this->formatPerson($ass);
        $head->retval[0]->leitung = $leitung_str;
        $head->retval[0]->leitung_array = $this->createPersonArray($leitung);
        $head->retval[0]->assistenz = $ass_str;
        $head->retval[0]->assistenz_array = $this->createPersonArray($ass);
        return array("key" => $oe_kurzbz, "type" => "person", "class" => "p-person", "data" => $head->retval[0], "children" => $this->getChilds($oe_kurzbz));   
    }


    private function getChilds($oe_kurzbz)
    {        
        $arr = array();
        $arr1 = $this->getDirectChilds($oe_kurzbz);
        foreach ($arr1->retval as $value)
        {
            $leitung = $this->getLeitung($value->oe_kurzbz);
            $leitung_str = $this->formatPerson($leitung);
            $ass = $this->getAssistenz($value->oe_kurzbz);
            $ass_str = $this->formatPerson($ass);
            $value->leitung = $leitung_str;
            $value->leitung_array = $this->createPersonArray($leitung);
            $value->assistenz = $ass_str;
            $value->assistenz_array = $this->createPersonArray($ass);
            $arr[]=array("key" => $value->oe_kurzbz, "type" => "person", "class" => "p-person", "data" => $value, "children" => $this->getChilds($value->oe_kurzbz));
        }

        return $arr;
    }

    private function formatPerson($person)
    {        
        $l = array();
        foreach ($person->retval as $p)
            $l[] = $p->nachname.', '.$p->vorname; // .' (DW '.$p->telefonklappe.')';
        $person_str = implode(' | ',$l);
        return $person_str;
    }

    private function createPersonArray($person)
    {        
        $l = array();

        $p_str = $this->formatPerson($person);
        foreach ($person->retval as $p)
        {
            $l[] = [ 'uid' => $p->uid, 'person_id' => $p->person_id, 'name' => $p->nachname.', '.$p->vorname ];

        }
             
        return [ 'str' => $p_str, 'data' => $l] ;
    }

    public function getLeitung($oe_kurzbz)
    {        
        return $this->getPersonenByFunktion($oe_kurzbz, Organisationseinheit_model::FUNKTION_LEITUNG);
    }

    public function getAssistenz($oe_kurzbz)
    {        
        return $this->getPersonenByFunktion($oe_kurzbz, Organisationseinheit_model::FUNKTION_ASSISTENZ);
    }

    public function getPersonenByFunktion($oe_kurzbz, $funktion)
    {        
        $query = 'SELECT distinct p.person_id,b.uid,p.titelpre,p.titelpost,p.nachname,p.vorname, m.ort_kurzbz, m.telefonklappe FROM public.tbl_benutzerfunktion bf JOIN public.tbl_benutzer b using(uid) 
            JOIN tbl_person p using(person_id)
            JOIN tbl_mitarbeiter m ON m.mitarbeiter_uid::text = b.uid::text
        WHERE bf.funktion_kurzbz=?
        AND (bf.datum_bis >= now() OR bf.datum_bis IS NULL)
        AND (bf.datum_von <= now() OR bf.datum_von IS NULL)
        AND bf.oe_kurzbz=?
        ORDER BY p.nachname';

		$result = $this->execQuery($query, array($funktion, $oe_kurzbz));
        return $result;
    }

    public function getPersonen($oe_kurzbz)
    {        

        $query='SELECT distinct p.person_id,b.uid,
            ARRAY(
                select beschreibung 
                from tbl_benutzerfunktion join tbl_funktion using(funktion_kurzbz) 
                where tbl_benutzerfunktion.oe_kurzbz=? AND tbl_benutzerfunktion.uid=m.mitarbeiter_uid AND
                     (tbl_benutzerfunktion.datum_bis >= now() OR tbl_benutzerfunktion.datum_bis IS NULL) AND
                     (tbl_benutzerfunktion.datum_von <= now() OR tbl_benutzerfunktion.datum_von IS NULL)
                ) funktionen,
                p.titelpre,p.titelpost,p.nachname,p.vorname, m.ort_kurzbz, m.telefonklappe 
        FROM public.tbl_benutzerfunktion bf JOIN public.tbl_benutzer b using(uid) 
            JOIN tbl_person p using(person_id)
            JOIN tbl_mitarbeiter m ON m.mitarbeiter_uid::text = b.uid::text            
        WHERE
         (bf.datum_bis >= now() OR bf.datum_bis IS NULL)
        AND (bf.datum_von <= now() OR bf.datum_von IS NULL)
        AND bf.oe_kurzbz=? 
        AND b.aktiv=true
        ORDER BY p.nachname, p.vorname';


		$result = $this->execQuery($query, array($oe_kurzbz, $oe_kurzbz));
        return $result;
    }




}
