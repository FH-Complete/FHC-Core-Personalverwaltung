<?php

require_once __DIR__.'/AbstractFrist.php';
require_once __DIR__.'/FristTyp.php';

class StundenBeginFrist extends AbstractFrist {


    public function __construct()
	{
        parent::__construct(FristTyp::BEGINN);
        $this->ereignis_kurzbz = 'stunden_beginn';
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
        $fristEreignis['insertvon'] = getAuthUID();
        $fristEreignis['ereignis_kurzbz'] = $this->ereignis_kurzbz;
        $fristEreignis['mitarbeiter_uid'] = $rowdata->mitarbeiter_uid;
        $fristEreignis['datum'] = $rowdata->von;
        $fristEreignis['status_kurzbz'] = 'neu';
        $fristEreignis['parameter'] = json_encode($parameter);

        return $fristEreignis;
    }

}