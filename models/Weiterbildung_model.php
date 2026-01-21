<?php


class Weiterbildung_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_weiterbildung';
		$this->pk = 'weiterbildung_id';
	}

    private function unsetIfEmpty($attr, &$weiterbildung) 
    {
        if (isset($weiterbildung[$attr]) && $weiterbildung[$attr]=='')
		{
			unset($weiterbildung[$attr]);
		}
    }

	public function insertWeiterbildung($weiterbildung, $kategorie_kurzbz = [])
	{
		unset($weiterbildung['weiterbildung_id']);
        unset($weiterbildung['updateamum']);
        $weiterbildung['insertvon'] = getAuthUID();
        $weiterbildung['insertamum'] = $this->escape('NOW()');

        $this->unsetIfEmpty('von',$weiterbildung);
        $this->unsetIfEmpty('bis',$weiterbildung);
        $this->unsetIfEmpty('ablaufdatum',$weiterbildung);
        $this->unsetIfEmpty('beantragt',$weiterbildung);
        $this->unsetIfEmpty('freigegeben',$weiterbildung);
        $this->unsetIfEmpty('stunden',$weiterbildung);

        $result = $this->insert($weiterbildung);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $record = $this->load($result->retval);

        return $record;
	}

	function updateWeiterbildung($weiterbildung, $kategorie_kurzbz = [])
    {
        $weiterbildung['updatevon'] = getAuthUID();
        $weiterbildung['updateamum'] = $this->escape('NOW()');

        $this->unsetIfEmpty('von',$weiterbildung);
        $this->unsetIfEmpty('bis',$weiterbildung);
        $this->unsetIfEmpty('ablaufdatum',$weiterbildung);
        $this->unsetIfEmpty('beantragt',$weiterbildung);
        $this->unsetIfEmpty('freigegeben',$weiterbildung);
        $this->unsetIfEmpty('stunden',$weiterbildung);

        $result = $this->update($weiterbildung['weiterbildung_id'], $weiterbildung);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $result = $this->load($weiterbildung['weiterbildung_id']);

        return $result;
    }
	
	function deleteWeiterbildung($weiterbildung)
    {
        $result = $this->delete($weiterbildung);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($weiterbildung);
    }

    function syncKategorien($weiterbildung_id, $weiterbildungskategorie_kurzbzs) {
        // Delete old relations
        $this->db->delete('hr.tbl_weiterbildung_kategorie_rel', ['weiterbildung_id' => $weiterbildung_id]);

        // Insert new ones
        foreach ($weiterbildungskategorie_kurzbzs as $weiterbildungskategorie_kurzbz) {
            $success = $this->db->insert('hr.tbl_weiterbildung_kategorie_rel', [
                'weiterbildung_id' => $weiterbildung_id,
                'weiterbildungskategorie_kurzbz'  => $weiterbildungskategorie_kurzbz
            ]);

            if (!$success)
            {
                return error($this->db->error(), EXIT_ERROR);
            }
        }

        $k = $this->getKategorien($weiterbildung_id);
        return success($k);
    }

    function getKategorien($weiterbildung_id) {
        $this->db->select('hr.tbl_weiterbildungskategorie.*')
                 ->from('hr.tbl_weiterbildungskategorie')
                 ->join('hr.tbl_weiterbildung_kategorie_rel', 'hr.tbl_weiterbildungskategorie.weiterbildungskategorie_kurzbz = hr.tbl_weiterbildung_kategorie_rel.weiterbildungskategorie_kurzbz')
                 ->where('hr.tbl_weiterbildung_kategorie_rel.weiterbildung_id', $weiterbildung_id);
        return $this->db->get()->result();
    }

    public function getDokumente($weiterbildung_id)
	{
		$this->addSelect('campus.tbl_dms_version.*');

		$this->addJoin('hr.tbl_weiterbildung_dokument', 'ON (hr.tbl_weiterbildung_dokument.weiterbildung_id = hr.tbl_weiterbildung.weiterbildung_id)');
		$this->addJoin('campus.tbl_dms_version', 'ON (hr.tbl_weiterbildung_dokument.dms_id = campus.tbl_dms_version.dms_id)');

		$result = $this->loadWhere(
			array('hr.tbl_weiterbildung.weiterbildung_id' => $weiterbildung_id)
		);

		return $result;		
	}

    /**
     * return training that belongs to a document. Needed to prevent download of documents that
     * are not associated with trainings.
     */
    public function getByDocument($dms_id)
	{
		$this->addSelect('campus.tbl_dms_version.*');

		$this->addJoin('hr.tbl_weiterbildung_dokument', 'ON (hr.tbl_weiterbildung_dokument.weiterbildung_id = hr.tbl_weiterbildung.weiterbildung_id)');
		$this->addJoin('campus.tbl_dms_version', 'ON (hr.tbl_weiterbildung_dokument.dms_id = campus.tbl_dms_version.dms_id)');

		$result = $this->loadWhere(
			array('hr.tbl_weiterbildung_dokument.dms_id' => $dms_id)
		);

		return $result;
	}

    /**
     * @deprecated
     */
    public function getExpiresWithinDays($days)
    {

        $days = (int) $days; 

        $qry = "
        SELECT
            w.*
        FROM hr.tbl_weiterbildung  w
        WHERE ablaufdatum <= NOW() + (? * INTERVAL '1 day')
         AND NOT EXISTS (select weiterbildung_id from hr.tbl_weiterbildung_msg_log log where log.days<=? and log.weiterbildung_id=w.weiterbildung_id)
        ORDER BY w.weiterbildung_id
        ";

        return $this->execQuery($qry, array($days, $days));
    }

    /**
     * @param dateTime $dt
     * @param string $template
     */
    public function getExpiresUntilDate($dt, $template)
    {

        $qry = "
         SELECT
            w.*
        FROM hr.tbl_weiterbildung w 
        WHERE ablaufdatum > NOW() and ablaufdatum <= ? 
         AND NOT EXISTS (select weiterbildung_id from hr.tbl_weiterbildung_msg_log log where log.template=? and log.weiterbildung_id=w.weiterbildung_id)
        ORDER BY w.weiterbildung_id
        ";

        return $this->execQuery($qry, array($dt, $template));
    }

    /**
     *  @deprecated use getExpiresUntilDateByUID($uid, $dt)
     */
    public function getExpiresWithinDaysByUID($uid,$days)
    {

        $days = (int) $days; 

        $qry = "
        SELECT
            w.*
        FROM hr.tbl_weiterbildung w 
        WHERE ablaufdatum <= NOW() + (? * INTERVAL '1 day') AND mitarbeiter_uid = ?
         AND NOT EXISTS (select weiterbildung_id from hr.tbl_weiterbildung_msg_log log where log.days<=? and log.weiterbildung_id=w.weiterbildung_id)
        ORDER BY w.weiterbildung_id
        ";

        return $this->execQuery($qry, array($days, $uid, $days));
    }

    public function getExpiresUntilDateByUID($uid, $dt, $template)
    {
         $qry = "
        SELECT
            w.*
        FROM hr.tbl_weiterbildung w 
        WHERE ablaufdatum > NOW() and ablaufdatum <= ? AND mitarbeiter_uid = ?
         AND NOT EXISTS (select weiterbildung_id from hr.tbl_weiterbildung_msg_log log where log.template=? and log.weiterbildung_id=w.weiterbildung_id)
        ORDER BY w.weiterbildung_id
        ";

        return $this->execQuery($qry, array($dt, $uid, $template));

    }

}
