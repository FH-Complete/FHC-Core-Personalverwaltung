<?php

if (! defined('BASEPATH')) exit('No direct script access allowed');

// require_once  __DIR__.'/DVBeginFrist.php';
require_once  __DIR__.'/DVEndFrist.php';

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
        $dvEndFrist = new DVEndFrist();
        $result = $dvEndFrist->getData($date);
     
        try {
            $this->_ci->db->trans_begin();

            $count = 0;

            foreach ($result->retval as $rowData) {
                
                if (!$dvEndFrist->exists($rowData)) {

                    $fristEreignis = $dvEndFrist->generateFristEreignis($rowData);
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
}