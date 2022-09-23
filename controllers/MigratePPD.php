<?php 

/**
 */
class MigratePPD extends CI_Controller {

    private $ppdDB;

    private function insertDV($row)
    {
        $qry = "insert into hr.tbl_dienstverhaeltnis(mitarbeiter_uid,von,bis,vertragart_kurzbz,insertamum,insertvon) values(?,?,?,?,now(),?)";
        $this->ppdDB->query($qry, $row->uid, $row->dv_von, $row->dv_bis, 2, 'migration');
        $error = $this->db->error();
        return $error;
    }

    public function message($to = 'World')
    {
        try {
            echo '<html><body style="font-family: Courier">';
            echo "PPD MIGRATION SCRIPT<br>";
            echo "--------------------<br>";
            echo "<br>";
            echo "connecting....";
            $dsn = 'postgre://gefi:snakepit@dev-postgres/ppd??char_set=utf8&dbcollat=utf8_general_ci&cache_on=true';
            $this->ppdDB = $this->load->database($dsn, TRUE);
            echo "success<br><br>";

            $this->ppdDB->trans_begin();

            $qry="select uid, personalnummer, vorname, nachname, dv.beginn dv_beginn, dv.ende dv_ende, dv.typ_id,vertrag.beginn v_beginn, vertrag.ende v_ende, vertrag.grundgehalt, vertrag.stunden_pro_woche 
                from tbl_mitarbeiter join dv using(uid) join vertrag using(dv_id) where archivdate is null and vertrag.parent_id is null and vertrag.grundgehalt>0.0
                order by nachname, dv.beginn,vertrag.beginn";
            $query = $this->ppdDB->query($qry);

            if (!$query) 
            {
                $error = $this->ppdDB->error();
                echo "Error: $error<br>";
                var_dump($query);
            } else {

                foreach ($query->result() as $row)
                {
                        echo "$row->uid, $row->vorname, $row->nachname, DV=$row->dv_beginn - $row->dv_ende, V=$row->v_beginn - $row->v_ende, ".number_format($row->grundgehalt,2).", Stunden/Woche=".number_format($row->stunden_pro_woche, 2)."<br>";
                        // DV anlegen
                        $error = $this->insertDV($row);
                        if ($error)
                        {
                            echo " Error: <span style=\"color:red\">$error</span><br>";
                        } else {
                            echo " <span style=\"color:green\">OK</span><br>";
                        }
                        // vertrag anlegen

                        // gehaltsbestandteile anlegen

                        // valorisierungen eintragen
                }
            }
            
            

            $this->ppdDB->trans_commit();

        } catch (Exception $e) {

            echo 'Error: '.$e->getMessage();
            $this->ppdDB->trans_rollback();

        } finally {

        }
    }

}