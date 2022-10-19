<?php 


// FH
const OE_KURZBZ = 'gst';

/**
 */
class MigratePPD extends CI_Controller {

    private $ppdDB;
    private $ci;

    public function __construct()
    {
        parent::__construct();
        $filename = APPPATH.'config/extensions/FHC-Core-Personalverwaltung/migrate.config.inc.php';
        require($filename);
        $this->ci =& get_instance();
        $this->ci->load->database();
    }

    private function uidExists($uid)
    {
        $query = $this->ci->db->query('SELECT mitarbeiter_uid FROM public.tbl_mitarbeiter where mitarbeiter_uid=?',array($uid));
        $result = $query->result();
        return $result;
    }

    private function insertDV($row)
    {
        $qry = "insert into hr.tbl_dienstverhaeltnis(mitarbeiter_uid,von,bis,vertragsart_kurzbz, oe_kurzbz, insertamum,insertvon) values(?,?,?,?,?,now(),?)";
        $result = $this->ci->db->query($qry, array($row->uid, $row->dv_beginn, $row->dv_ende, 'echterDV', OE_KURZBZ, 'migration'));
        return $result;
    }

    private function insertVertragsbestandteil($dv_id, $row)
    {
        $qry = "insert into hr.tbl_vertragsbestandteil(von, bis, stundenausmass, dienstverhaeltnis_id) values(?, ?, ?, ?)";
        $result = $this->ci->db->query($qry,array($row->beginn, $row->ende, $row->stunden_pro_woche, $dv_id));
        return $result;
    }

    private function getPPDVertraege($dv_id)
    {
        $qry="select vertrag.beginn, vertrag.ende, vertrag.grundgehalt, vertrag.stunden_pro_woche 
            from vertrag
            where vertrag.parent_id is null and vertrag.dv_id=?
            order by vertrag.beginn";
        $query = $this->ppdDB->query($qry, array($dv_id));
        $result = $query->result();
        return $result;
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
                        echo "$row->uid, $row->vorname, $row->nachname, DV=$row->dv_beginn - $row->dv_ende <br>";
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
                                    $this->insertVertragsbestandteil($dv_id, $vertrag_row);
                                }
                                // gehaltsbestandteile anlegen
                            }
                            

                            

                            // valorisierungen eintragen
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

}