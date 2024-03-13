<?php

require_once './AbstractFrist.php';

class DVBeginFrist extends AbstractFrist {


    public function __construct()
	{
        parent::__construct(FristTyp::BEGINN);
    }

    public function getData($date)
    {
        return $this->getDataByTable('hr.tbl_dienstverhaeltnis', $date);
    }

    public function generateFristEreignis($rowdata)
    {
        $parameter['dienstverhaeltnis_id'] = $rowdata->dienstverhaeltnis_id;

        $fristEreignis = [];
        $fristEreignis['insertvon'] = getAuthUID();
        $fristEreignis['ereignis_kurzbz'] = 'dv_begin';
        $fristEreignis['mitarbeiter_uid'] = $rowdata->mitarbeiter_uid;
        $fristEreignis['datum'] = $rowdata['von'];
        $fristEreignis['status'] = 'neu';
        $fristEreignis['parameter'] = json_encode($parameter);

        return $fristEreignis;
    }

}