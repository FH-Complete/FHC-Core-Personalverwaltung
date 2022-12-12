<?php 


// FH
const OE_KURZBZ = 'gst';

/**
 */
class MigratePPD extends CI_Controller {

    private $ppdDB;
    private $ci;
    private const dvTypDef = array('echterDV','freierDV','Werkvertrag');
    private const vertragTypDef = array('Gastlektor','StudHilfskraft');
    private const grundgehaltTypDef = array('GRUNDGEHALT','PRAEMIE','UEBERSTUNDEN','SONSTIGES');

    public function __construct()
    {
        parent::__construct();
        $migrate_filename = APPPATH.'config/extensions/FHC-Core-Personalverwaltung/migrate.config.inc.php';
        require($migrate_filename);
        $encryptionkey_filename = APPPATH.'config/extensions/FHC-Core-Personalverwaltung/keys.config.inc.php';
        require($encryptionkey_filename);
        $this->ci =& get_instance();
        $this->ci->load->database();

        $this->load->model('extensions/FHC-Core-Personalverwaltung/Dienstverhaeltnis_model','DienstverhaeltnisModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Vertragsbestandteil_model', 'VertragsbestandteilModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Vertragsbestandteil_stunden_model', 'VertragsbestandteilStundenModel');
        $this->load->model('extensions/FHC-Core-Personalverwaltung/Gehaltsbestandteil_model', 'GehaltsbestandteilModel');
        
    }

    private function uidExists($uid)
    {
        $query = $this->ci->db->query('SELECT mitarbeiter_uid FROM public.tbl_mitarbeiter where mitarbeiter_uid=?',array($uid));
        $result = $query->result();
        return $result;
    }

    private function insertDV($row)
    {
        
        $dvTyp = MigratePPD::dvTypDef[0];
        if ($row->typ_id!=0) $dvTyp=MigratePPD::dvTypDef[1]; 
        $qry = "insert into hr.tbl_dienstverhaeltnis(mitarbeiter_uid,von,bis,vertragsart_kurzbz, oe_kurzbz, insertamum,insertvon) values(?,?,?,?,?,now(),?)";
        $result = $this->ci->db->query($qry, array($row->uid, $row->dv_beginn, $row->dv_ende, $dvTyp, OE_KURZBZ, 'migration'));
        return $result;
    }

    private function insertVertragsbestandteil($dv_id, $row, $dvTyp)
    {
        $vertragTyp = null;
        if ($dvTyp==MigratePPD::dvTypDef[1]) $vertragTyp=MigratePPD::vertragTypDef[0];
        $qry = "insert into hr.tbl_vertragsbestandteil(von, bis, stundenausmass, dienstverhaeltnis_id, vertragsart_kurzbz) values(?, ?, ?, ?, ?)";
        $result = $this->ci->db->query($qry,array($row->beginn, $row->ende, $row->stunden_pro_woche, $dv_id, $vertragTyp));
        return $result;
    }

    private function insertVertragsbestandteilStunden($vertragsbestandteil_id, $von, $bis, $stunden)
    {
        $vertragTyp = null;
        if ($dvTyp==MigratePPD::dvTypDef[1]) $vertragTyp=MigratePPD::vertragTypDef[0];
        $qry = "insert into hr.tbl_vertragsbestandteil_stunden(von, bis, stundenausmass, dienstverhaeltnis_id, vertragsart_kurzbz) values(?, ?, ?, ?, ?)";
        $result = $this->ci->db->query($qry,array($row->beginn, $row->ende, $row->stunden_pro_woche, $dv_id, $vertragTyp));
        return $result;
    }

    private function finishGehaltsbestandteil($dienstverhaeltnis_id, $datum)
    {
        $qry = "update hr.tbl_gehaltsbestandteil set bis=? where gehaltsbestandteil_id=(select gehaltsbestandteil_id from hr.tbl_gehaltsbestandteil where dienstverhaeltnis_id=? order by gehaltsbestandteil_id desc limit 1)";
        $result = $this->ci->db->query($qry,array($datum, $dienstverhaeltnis_id ));
        return $result;
    }

    private function insertGehaltsbestandteil($dienstverhaeltnis_id, $vertragsbestandteil_id, $von, $bis, $gehaltstyp, $grundgehalt, $valorisieren, $ist_gehalt)
    {
        $qry = "insert into hr.tbl_gehaltsbestandteil(dienstverhaeltnis_id, vertragsbestandteil_id, von, bis, gehaltstyp_kurzbz, grundbetrag, valorisieren, betrag_valorisiert) 
            values(?, ?, ?, ?, ?, pgp_sym_encrypt(?, ?), ?, pgp_sym_encrypt(?, ?))";
        $result = $this->ci->db->query($qry,array($dienstverhaeltnis_id, $vertragsbestandteil_id, $von, $bis, $gehaltstyp, 
            (string)$grundgehalt, ENCRYPTIONKEY, $valorisieren, (string)$ist_gehalt, ENCRYPTIONKEY));
            return $result;

    }


    private function insertValorisierungDienstverhaeltnis($dv_id, $valorisierung_id)
    {
        $qry = "insert into hr.tbl_valorisierung_dienstverhaeltnis(dienstverhaeltnis_id, valorisierung_id) 
            values(?, ?)";
        $result = $this->ci->db->query($qry, array($dv_id, $valorisierung_id));
        return $result;
    }

    private function insertValorisierung($row)
    {
        $qry = "insert into hr.tbl_valorisierung(datum, prozent, betrag, insertamum,insertvon) values(?, ?, ?,now(),'ppd')";
        $result = $this->ci->db->query($qry,array(sprintf('%d-9-1',$row->jahr), $row->prozent, $row->betrag));        
        return $result;
    }

    private function getPPDVertraege($dv_id)
    {
        $qry="select vertrag_id, vertrag.beginn, vertrag.ende, vertrag.grundgehalt, vertrag.stunden_pro_woche, art_id 
            from vertrag
            where vertrag.parent_id is null and vertrag.dv_id=?
            order by vertrag.beginn";
        $query = $this->ppdDB->query($qry, array($dv_id));
        $result = $query->result();
        return $result;
    }

    /**
     * Anpassung changes parameters of a contract without actually creating a new contract. Sideletter
     * is a contract that also changes the parameters of the main contract but is an actual subcontract.
     */
    private function getPPDSubvertrag($vertrag_id, $anpassung=true)
    {
        $qry = "select vertrag_id, vertrag.beginn, vertrag.ende, vertrag.grundgehalt, vertrag.stunden_pro_woche, art_id,
            anpassung, sideletter, anpassung_prozent, naechste_valor 
        from vertrag
        where vertrag.parent_id=? and vertrag.anpassung=? and vertrag.sideletter=?
        order by vertrag.beginn";
        $query = $this->ppdDB->query($qry, array($vertrag_id, $anpassung, !$anpassung));
        $result = $query->result();
        return $result;
    }

    private function getPPDVertragLetztesGehalt($ppdVertragID)
    {
        $qry="select betrag_ist, stunden from vertrag_events where vertrag_id=? order by id desc limit 1";

        $query = $this->ppdDB->query($qry, array($ppdVertragID));
        $result = $query->result();
        return $result;
    }

    private function getPPDValorisierung($uid, $von, $bis)
    {
        $qry="select prozent, betrag, jahr
            from valorisierung
            where uid=? and jahr>=? and jahr<=?
            order by jahr";
        $query = $this->ppdDB->query($qry, array($uid, $von, $bis));
        $result = $query->result();
        return $result;
    }

    private function getValorisierung($jahr, $prozent, $betrag)
    {
        $where = "";
        $parameter = null;
        if ($prozent) 
        {
            $where = "prozent=? and betrag is null";
            $parameter = $prozent;
        } else {
            $where = "prozent is null  and betrag=?";
            $parameter = $betrag;
        }
        $qry = "select valorisierung_id from hr.tbl_valorisierung where datum=? and $where";
        $query = $this->ci->db->query($qry, array(sprintf('%d-9-1',$jahr), $parameter));
        $result = $query->result();
        if (count($result) > 0) 
        {
            return $result[0]->valorisierung_id;        
        }
        return 0;
    }

    public function launch()
    {
        try {
            echo '<html><body style="font-family: Courier">';
            echo "PPD MIGRATION SCRIPT<br>";
            echo "--------------------<br>";
            echo "<br>";
            echo "connecting....";
            $this->ppdDB = $this->load->database(PPD_DSN, TRUE);
            echo "success<br><br>";

            $this->ppdDB->trans_begin();

            $qry="select distinct dv.dv_id, uid, personalnummer, vorname, nachname, dv.beginn dv_beginn, dv.ende dv_ende, dv.typ_id
                from tbl_mitarbeiter join dv using(uid) join vertrag using(dv_id) 
                where archivdate is null 
                order by nachname, dv.beginn";
            $query = $this->ppdDB->query($qry);

            if (!$query) 
            {
                $error = $this->ppdDB->error();
                echo "Error: $error<br>";
                var_dump($query);
            } else {

                foreach ($query->result() as $row)
                {
                        echo "$row->uid, $row->vorname, $row->nachname, DV=$row->dv_beginn - $row->dv_ende, typ_id=$row->typ_id <br>";
                        if ($this->uidExists($row->uid))
                        {
                            // DV anlegen
                            if (!$this->insertDV($row))
                            {
                                // error
                            } else {
                                $dv_id = $this->ci->db->insert_id();
                                // Verträge
                                $vertraege = $this->getPPDVertraege($row->dv_id);
                                foreach ($vertraege as $vertrag_row)
                                {
                                    // vertrag anlegen
                                    $this->insertVertragsbestandteil($dv_id, $vertrag_row,null);
                                    $vertragsbestandteil_id = $this->ci->db->insert_id();

                                    // wenn fix angestellt
                                    if ($row->typ_id == 0)
                                    {
                                        
                                        $grundgehalt = $vertrag_row->grundgehalt;

                                        // letztes valorisiertes Gehalt holen
                                        $letztesGehalt_row = $this->getPPDVertragLetztesGehalt($vertrag_row->vertrag_id);

                                        if (count($letztesGehalt_row) > 0)
                                        {
                                            $ist_gehalt = $letztesGehalt_row[0]->betrag_ist;
                                        } else {
                                            $ist_gehalt = $grundgehalt;
                                        }

                                        //  gehaltsbestandteile anlegen 
                                        $this->insertGehaltsbestandteil($dv_id, $vertragsbestandteil_id, $vertrag_row->beginn, $vertrag_row->ende, MigratePPD::grundgehaltTypDef[0], $grundgehalt, true, $ist_gehalt);
                                    }

                                    // Anpassungen
                                    
                                    $anpassungen = $this->getPPDSubvertrag($vertrag_row->vertrag_id, true);

                                    foreach ($anpassungen as $anpassung_row)
                                    {
                                        $grundgehalt += $anpassung_row->grundgehalt;

                                        // letztes valorisiertes Gehalt holen
                                        $letztesGehalt_row = $this->getPPDVertragLetztesGehalt($anpassung_row->vertrag_id);

                                        if (count($letztesGehalt_row) > 0)
                                        {
                                            $ist_gehalt += $letztesGehalt_row[0]->betrag_ist;
                                        } else {
                                            $ist_gehalt = $grundgehalt;
                                        }

                                        $datum_bis = date_create($anpassung_row->beginn)->modify('-1 day');

                                        $this->finishGehaltsbestandteil($dv_id, date_format($datum_bis,"Y-m-d"));

                                        // gehaltsbestandteil anlegen
                                        $this->insertGehaltsbestandteil($dv_id, $vertragsbestandteil_id, $anpassung_row->beginn, $anpassung_row->ende, MigratePPD::grundgehaltTypDef[0], $grundgehalt, true, $ist_gehalt);

                                    }
                                }
                             
                                
                                // wenn fix angestellt
                                // valorisierungen eintragen
                                if ($row->typ_id == 0)
                                {
                                    
                                    // relevanten Zeitraum holen
                                    $dv_beginn = strtotime($row->dv_beginn);
                                    $dv_beginn_jahr = date('Y', $dv_beginn);

                                    if (!$this->dateBeforeSep($dv_beginn)) {
                                        $dv_beginn_jahr++;
                                    }
                                    $dv_ende_jahr = 9999;

                                    if ($row->dv_ende != null && $row->dv_ende != '') 
                                    {
                                        $dv_ende = strtotime($row->dv_ende);
                                        $dv_ende_jahr = date('Y', $dv_ende);
                                        if ($this->dateBeforeSep($dv_ende))
                                        {
                                            $dv_ende_jahr--;
                                        }
                                    }
                                   
                                    $valorisierungen = $this->getPPDValorisierung($row->uid, $dv_beginn_jahr, $dv_ende_jahr);
                                    foreach ($valorisierungen as $valorisierung_row)
                                    {
                                        // Valorisierung in FHComplete vorhanden?
                                        $valorisierung_id = $this->getValorisierung($valorisierung_row->jahr, $valorisierung_row->prozent, $valorisierung_row->betrag);

                                        if ($valorisierung_id == 0)
                                        {
                                            // Valorisierung noch nicht vorhanden -> anlegen
                                            if ($this->insertValorisierung($valorisierung_row))
                                            {
                                                $valorisierung_id = $this->ci->db->insert_id();
                                            } else {
                                                // error
                                            }
                                        } 
                                        // Zuordnung zu DV herstellen
                                        $this->insertValorisierungDienstverhaeltnis($dv_id, $valorisierung_id);
                                    }
                                }


                            }
                            

                            

                            
                        }
                        
                }
            }
            
            

            $this->ppdDB->trans_commit();

        } catch (Exception $e) {

            echo 'Error: '.$e->getMessage().'<br>';
            $this->ppdDB->trans_rollback();

        } finally {

        }
    }

    private function  dateBeforeSep($dateParam)
    {
        if (date('m', $dateParam)<9) return true;
        return false;
    }

}