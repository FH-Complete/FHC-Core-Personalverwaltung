<?php

require_once __DIR__.'/AbstractFrist.php';
require_once __DIR__.'/FristTyp.php';

class StundenEndFrist extends AbstractFrist {


    public function __construct()
	{
        parent::__construct(FristTyp::ENDE);
        $this->ereignis_kurzbz = 'stunden_ende';
        $this->id_colname = 'vertragsbestandteil_id';
        $this->vertragsbestandteiltyp_kurzbz = 'stunden';
    }

    public function getData($date)
    {
        return $this->getDataByTable('hr.tbl_vertragsbestandteil', $date);
    }

    public function generateFristEreignis($rowdata)
    {
        $parameter['dienstverhaeltnis_id'] = $rowdata->dienstverhaeltnis_id;
        $parameter[$this->id_colname] = $rowdata->vertragsbestandteil_id;

        $fristEreignis = [];
        $fristEreignis['ereignis_kurzbz'] = $this->ereignis_kurzbz;
        $fristEreignis['mitarbeiter_uid'] = $rowdata->mitarbeiter_uid;
        $fristEreignis['datum'] = $rowdata->bis;
        $fristEreignis['status_kurzbz'] = 'neu';
        $fristEreignis['parameter'] = json_encode($parameter);

        return $fristEreignis;
    }

}