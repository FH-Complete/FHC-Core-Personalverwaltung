<?php

class Organisationseinheit_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'public.tbl_organisationseinheit';
		$this->pk = 'oe_kurzbz';
		//$this->load->model('ressource/Mitarbeiter_model', 'MitarbeiterModel');
	}

    /**
     * get highest organisation units
     */
    public function getHeads()
    {
        //$this->addJoin('tbl_organisationseinheittyp','organisationseinheittyp_kurzbz','LEFT');
        $result = $this->loadWhere(array('oe_parent_kurzbz' => NULL));

        return $result;
    }

    public function getDirectChilds($oe_kurzbz)
    {
        $this->addOrder('organisationseinheittyp_kurzbz','DESC');
        $this->addOrder('bezeichnung');
        $result = $this->loadWhere(array('oe_parent_kurzbz' => $oe_kurzbz));

        return $result;
    }

    public function getOrgStructure($oe_kurzbz)
    {
        return $this->getChilds($oe_kurzbz);   
    }

    private function getChilds($oe_kurzbz)
    {        
        $arr = array();
        $arr1 = $this->getDirectChilds($oe_kurzbz);
        foreach ($arr1->retval as $value)
            $arr[$value->oe_kurzbz]=array("unit" => $value, "children" => array());

        foreach ($arr as $val=>$k)
        {
            $hlp = $this->getChilds($val);
            $arr[$val]["children"] = $hlp;
        }

        return $arr;
    }


}
