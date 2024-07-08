<?php

require_once __DIR__.'/AbstractFrist.php';
require_once __DIR__.'/FristTyp.php';

class DVEndFrist extends AbstractFrist {

    public function __construct()
	{
        parent::__construct(FristTyp::ENDE);
        $this->ereignis_kurzbz = 'dv_ende';
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
        $fristEreignis['ereignis_kurzbz'] = $this->ereignis_kurzbz;
        $fristEreignis['mitarbeiter_uid'] = $rowdata->mitarbeiter_uid;
        $fristEreignis['datum'] = $rowdata->bis;
        $fristEreignis['status_kurzbz'] = 'neu';
        $fristEreignis['parameter'] = json_encode($parameter);

        return $fristEreignis;
    }

}