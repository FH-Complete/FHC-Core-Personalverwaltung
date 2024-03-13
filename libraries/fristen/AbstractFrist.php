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

    public function __construct(string $typ = FristTyp::ENDE, int $zeitraum = 2)
	{
        $this->_ci =& get_instance();
        $this->fristTyp = $typ;
        $this->zeitraum = $zeitraum;
    }

    /**
     * query data from db. Depending on the type fo fristTyp it returns all records
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
        $qry = "
             WITH frist AS (select frist_id,ereignis_kurzbz, parameter from hr.tbl_frist where ereignis_kurzbz=".$dbModel->escape($this->ereignis_kurzbz).")
            select d.*, frist.frist_id 
            from $dbTable d  left join frist on (d.".$this->id_colname." = (frist.parameter->>".$dbModel->escape($this->id_colname).")::integer)
            where $colname between '$d'::date and ('$d'::date + interval '".$this->zeitraum." months')::date and frist.frist_id is null";

        /* $qry = "select d.*, frist.frist_id 
            from $dbTable d  left join hr.tbl_frist ereignis_kurzbz=".$dbModel->escape($this->ereignis_kurzbz).")frist on (d.".$this->id_colname." = (frist.parameter->>".$dbModel->escape($this->id_colname).")::integer)
            where $colname between '$d'::date and ('$d'::date + interval '".$this->zeitraum." months')::date and frist.frist_id is null"; */
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