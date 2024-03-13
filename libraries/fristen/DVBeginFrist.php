<?php

require_once './AbstractFrist.php';

class DVBeginFrist extends AbstractFrist {


    public function __construct()
	{
        parent::__construct(FristTyp::BEGINN);
        $this->ereignis_kurzbz = 'dv_beginn';
        $this->id_colname = 'dienstverhaeltnis_id';
    }

    public function getData($date)
    {
        return $this->getDataByTable('hr.tbl_dienstverhaeltnis', $date);
    }

    public function generateFristEreignis($rowdata)
    {
        $parameter[$this->id_colname] = $rowdata->dienstverhaeltnis_id;

        $fristEreignis = [];
        $fristEreignis['insertvon'] = getAuthUID();
        $fristEreignis['ereignis_kurzbz'] = $this->ereignis_kurzbz;
        $fristEreignis['mitarbeiter_uid'] = $rowdata->mitarbeiter_uid;
        $fristEreignis['datum'] = $rowdata['von'];
        $fristEreignis['status'] = 'neu';
        $fristEreignis['parameter'] = json_encode($parameter);

        return $fristEreignis;
    }

}