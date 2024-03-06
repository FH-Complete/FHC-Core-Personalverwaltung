<?php



class DVEndFrist extends AbstractFrist {


    public function getData()
    {
        return $this->getDataByTable('hr.tbl_dienstverhaeltnis');
    }

    public function generateFristEreignis($rowdata)
    {
        $parameter['dienstverhaeltnis_id'] = $rowdata->dienstverhaeltnis_id;

        $fristEreignis = [];
        $fristEreignis['insertvon'] = getAuthUID();
        $fristEreignis['ereignis_kurzbz'] = 'dv_ende';
        $fristEreignis['mitarbeiter_uid'] = $rowdata->mitarbeiter_uid;
        $fristEreignis['datum'] = $rowdata['bis'];
        $fristEreignis['status'] = 'neu';
        $fristEreignis['parameter'] = json_encode($parameter);

        return $fristEreignis;
    }

}