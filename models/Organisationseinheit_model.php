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
        $result = $this->loadWhere(array('oe_parent_kurzbz' => $oe_kurzbz, 'aktiv' => true));

        return $result;
    }
   
    public function getOrgStructure($oe_kurzbz)
    {
        $head = $this->load($oe_kurzbz);        
        return array("key" => $oe_kurzbz, "type" => "person", "class" => "p-person", "data" => $head->retval[0], "children" => $this->getChilds($oe_kurzbz));   
    }


    private function getChilds($oe_kurzbz)
    {        
        $arr = array();
        $arr1 = $this->getDirectChilds($oe_kurzbz);
        foreach ($arr1->retval as $value)
            $arr[]=array("key" => $value->oe_kurzbz, "type" => "person", "class" => "p-person", "data" => $value, "children" => $this->getChilds($value->oe_kurzbz));

        return $arr;
    }




}
