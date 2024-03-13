<?php

require_once __DIR__.'/AbstractFrist.php';
require_once __DIR__.'/FristTyp.php';

class DVEndFrist extends AbstractFrist {


    public function getData($date)
    {
        return $this->getDataByTable('hr.tbl_dienstverhaeltnis', $date);
    }

    public function generateFristEreignis($rowdata)
    {
        $parameter['dienstverhaeltnis_id'] = $rowdata->dienstverhaeltnis_id;

        $fristEreignis = [];
        $fristEreignis['insertvon'] = getAuthUID();
        $fristEreignis['ereignis_kurzbz'] = 'dv_ende';
        $fristEreignis['mitarbeiter_uid'] = $rowdata->mitarbeiter_uid;
        $fristEreignis['datum'] = $rowdata->bis;
        $fristEreignis['status_kurzbz'] = 'neu';
        $fristEreignis['parameter'] = json_encode($parameter);

        return $fristEreignis;
    }

}