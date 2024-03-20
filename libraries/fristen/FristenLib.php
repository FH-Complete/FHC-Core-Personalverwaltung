<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

require_once  __DIR__.'/DVEndFrist.php';
require_once  __DIR__.'/DVBeginFrist.php';
require_once  __DIR__.'/ZeitaufzeichnungBeginFrist.php';
require_once  __DIR__.'/ZeitaufzeichnungEndFrist.php';
require_once  __DIR__.'/KarenzBeginFrist.php';
require_once  __DIR__.'/KarenzEndFrist.php';
require_once  __DIR__.'/StundenBeginFrist.php';
require_once  __DIR__.'/StundenEndFrist.php';

class FristenLib
{
	private $_ci; // Code igniter instance
    private $_insertvon = 'system';

	public function __construct()
	{
		$this->_ci =& get_instance();
        $this->_ci->load->model('extensions/FHC-Core-Personalverwaltung/Frist_model', 'FristModel');
	}

    public function updateFristen(DateTime $date)
    {
        $count = 0;
        $dvBeginFrist = new DVBeginFrist();
        $dvEndFrist = new DVEndFrist();
        $zeitaufzeichnungBeginFrist = new ZeitaufzeichnungBeginFrist();
        $zeitaufzeichnungEndFrist = new ZeitaufzeichnungEndFrist();
        $karenzBeginFrist = new KarenzBeginFrist();
        $karenzEndFrist = new KarenzEndFrist();
        $stundenBeginFrist = new StundenBeginFrist();
        $stundenEndFrist = new StundenEndFrist();
        $res=$this->runFristenUpdate($dvBeginFrist, $date);
        if ($res !== false) {
            $count+=$res;
        }
        $res=$this->runFristenUpdate($dvEndFrist, $date);
        if ($res !== false) {
            $count+=$res;
        }
        $res=$this->runFristenUpdate($zeitaufzeichnungBeginFrist, $date);
        if ($res !== false) {
            $count+=$res;
        }
        $res=$this->runFristenUpdate($zeitaufzeichnungEndFrist, $date);
        if ($res !== false) {
            $count+=$res;
        }
        $res=$this->runFristenUpdate($karenzBeginFrist, $date);
        if ($res !== false) {
            $count+=$res;
        }
        $res=$this->runFristenUpdate($karenzEndFrist, $date);
        if ($res !== false) {
            $count+=$res;
        }
        $res=$this->runFristenUpdate($stundenBeginFrist, $date);
        if ($res !== false) {
            $count+=$res;
        }
        $res=$this->runFristenUpdate($stundenEndFrist, $date);
        if ($res !== false) {
            $count+=$res;
        }
        return $count;
    }

    public function updateFristStatus(string $uid, int $frist_id, string $status)
    {
        $fristEreignis['frist_id'] = $frist_id;
        $fristEreignis['updatevon'] = $uid;
        $fristEreignis['status_kurzbz'] = $status;
        $result = $this->_ci->FristModel->update($fristEreignis);

        if (isError($result))
        {
            log_message('debug', "update frist failed" . $result->msg);
            return false;
        }
        return true;
    }


    private function runFristenUpdate(&$fristInstance, DateTime $date)
    {
        $result = $fristInstance->getData($date);

        try {
            $this->_ci->db->trans_begin();

            $count = 0;

            foreach ($result->retval as $rowData) {

                if (!$fristInstance->exists($rowData)) {

                    $fristEreignis = $fristInstance->generateFristEreignis($rowData);
                    $fristEreignis['insertvon'] = $this->_insertvon;
                    $result = $this->_ci->FristModel->insert($fristEreignis);

                    if (isError($result))
                    {
                        log_message('debug', "insert frist failed" . $result->msg);
                        $this->_ci->db->trans_rollback();
                        return false;
                    }
                    $count++;
                }
            }
            $this->_ci->db->trans_commit();
        }
        catch (Exception $ex)
        {
            log_message('debug', "Transaction rolled back. " . $ex->getMessage());
            $this->_ci->db->trans_rollback();
            throw new Exception('update fristen job failed.');
        }
        return $count;
    }

    /**
     * get list of current deadlines
     */
    public function getFristenListe($uid=null)
    {
        $WHERE = "";
        $param =  array();

        if (!empty($uid))
        {
            $WHERE = "WHERE m.mitarbeiter_uid=?";
            $param = array($uid);
        }

        $sql = "SELECT f.*,status.bezeichnung status_bezeichnung,ereignis.bezeichnung ereignis_bezeichnung,p.vorname,p.nachname,p.person_id
                FROM hr.tbl_frist f JOIN hr.tbl_frist_status status using(status_kurzbz)
                    join hr.tbl_frist_ereignis ereignis using(ereignis_kurzbz)
                    left join public.tbl_mitarbeiter m using(mitarbeiter_uid)
                    left join public.tbl_benutzer b on(m.mitarbeiter_uid=b.uid)
                    left join public.tbl_person p on (b.person_id=p.person_id)
                $WHERE
                ORDER BY f.datum ASC";

		$query = $this->_ci->db->query($sql, $param);
        return $query->result();
    }

    public function getFristenStatus()
    {
        $sql = "SELECT *
                FROM hr.tbl_frist_status
                ORDER BY bezeichnung ASC";

		$query = $this->_ci->db->query($sql);
        return $query->result();
    }

    public function getFristenEreignis()
    {
        $sql = "SELECT ereignis_kurzbz, bezeichnung, manuell
                FROM hr.tbl_frist_ereignis
                ORDER BY bezeichnung ASC";

		$query = $this->_ci->db->query($sql);
        return $query->result();
    }



}