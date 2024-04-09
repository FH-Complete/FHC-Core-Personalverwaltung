<?php


abstract class AbstractFrist {

    private $_ci;

    /** @var string ENDE=deadline expires within timespan */
    protected string $fristTyp = FristTyp::ENDE;
    /** @var int timespan in months */
    protected int $zeitraum = 2;
    /** @var string ereignis id (needs to be set in sub class) */
    protected string $ereignis_kurzbz = '';
    /** @var string name of id column (needs to be set in sub class) */
    protected string $id_colname = '';
    /** @var  string optional filter */
    protected string $vertragsbestandteiltyp_kurzbz = '';
    /** @var string optional array for detail data  i.e. ['table_name' => 'hr.tbl_vertragsbestandteil_freitext', 'typ_colname' => 'freitexttyp_kurzbz', 'typ_kurzbz' => 'befristung'] */
    protected array $detailbestandteil;

    public function __construct(string $typ = FristTyp::ENDE, int $zeitraum = 2)
	{
        $this->_ci =& get_instance();
        $this->fristTyp = $typ;
        $this->zeitraum = $zeitraum;
    }

    /**
     * query data from db. Depending on the type of fristTyp it returns all records
     * that expire within timespan or that are about to start within the timespan.
     */
    public function getDataByTable(string $dbTable, DateTime $date)
    {
        $colname = "bis";
        if ($this->fristTyp == FristTyp::BEGINN) {
            $colname = "von";
        }
        $d = $date->format('Y-m-d');
        //$qry = "select * from $dbTable where $colname between '$d'::date and ('$d'::date + interval '".$this->zeitraum." months')::date";

        $dbModel = new DB_Model();

        $hasDetailConfig = isset($this->detailbestandteil['table_name']) && !isEmptyString($this->detailbestandteil['table_name']);

        // query DV
        $qry = "
            WITH frist AS (select frist_id,ereignis_kurzbz, parameter from hr.tbl_frist where ereignis_kurzbz=".$dbModel->escape($this->ereignis_kurzbz).")
            select d.*, frist.frist_id 
            from $dbTable d  left join frist on (d.".$this->id_colname." = (frist.parameter->>".$dbModel->escape($this->id_colname).")::integer)
            where $colname between '$d'::date and ('$d'::date + interval '".$this->zeitraum." months')::date and frist.frist_id is null";

        if (!isEmptyString($this->vertragsbestandteiltyp_kurzbz) && !$hasDetailConfig)
        {
            // query Vertragsbestandteil
            $qry = "
            WITH frist AS (select frist_id,ereignis_kurzbz, parameter from hr.tbl_frist where ereignis_kurzbz=".$dbModel->escape($this->ereignis_kurzbz).")
            select dv.mitarbeiter_uid,d.*, frist.frist_id 
            from hr.tbl_dienstverhaeltnis dv join $dbTable d using(dienstverhaeltnis_id) left join frist on (d.dienstverhaeltnis_id = (frist.parameter->>'dienstverhaeltnis_id')::integer  and d.".$this->id_colname." = (frist.parameter->>".$dbModel->escape($this->id_colname).")::integer)
            where d.$colname between '$d'::date and ('$d'::date + interval '".$this->zeitraum." months')::date and frist.frist_id is null
            and vertragsbestandteiltyp_kurzbz=".$dbModel->escape($this->vertragsbestandteiltyp_kurzbz);
        } else if (!isEmptyString($this->vertragsbestandteiltyp_kurzbz) && $hasDetailConfig)
        {
            // query Vertragsbestandteil with detail table 
            $qry = "
            WITH frist AS (select frist_id,ereignis_kurzbz, parameter from hr.tbl_frist where ereignis_kurzbz=".$dbModel->escape($this->ereignis_kurzbz).")
            select dv.mitarbeiter_uid,d.*, frist.frist_id 
            from hr.tbl_dienstverhaeltnis dv join $dbTable d using(dienstverhaeltnis_id) join ".$this->detailbestandteil['table_name']." using(vertragsbestandteil_id) left join frist on (d.dienstverhaeltnis_id = (frist.parameter->>'dienstverhaeltnis_id')::integer  and d.".$this->id_colname." = (frist.parameter->>".$dbModel->escape($this->id_colname).")::integer)
            where d.$colname between '$d'::date and ('$d'::date + interval '".$this->zeitraum." months')::date and frist.frist_id is null
            and vertragsbestandteiltyp_kurzbz=".$dbModel->escape($this->vertragsbestandteiltyp_kurzbz)." 
            and ".$this->detailbestandteil['table_name'].'.'.$this->detailbestandteil['typ_colname']."=".$dbModel->escape($this->detailbestandteil['typ_kurzbz']);
        }

        $result = $dbModel->execReadOnlyQuery($qry);

		if (isError($result)) return $result;
		
		return $result;
    }

    public function exists($rowData)
    {
        return false;
    }

    
    abstract public function generateFristEreignis($rowData);

    /**
     * Get the value of fristTyp
     *
     * @return string
     */
    public function getFristTyp(): string
    {
        return $this->fristTyp; 
    }

    /**
     * Set the value of fristTyp
     *
     * @param string $fristTyp
     *
     * @return self
     */
    public function setFristTyp(string $fristTyp): self
    {
        $this->fristTyp = $fristTyp;

        return $this;
    }
    

    /**
     * Get the value of zeitraum
     *
     * @return int
     */
    public function getZeitraum(): int
    {
        return $this->zeitraum;
    }

    /**
     * Set the value of zeitraum
     *
     * @param int $zeitraum
     *
     * @return self
     */
    public function setZeitraum(int $zeitraum): self
    {
        $this->zeitraum = $zeitraum;

        return $this;
    }
}