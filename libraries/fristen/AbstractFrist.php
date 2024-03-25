<?php


abstract class AbstractFrist {

    private $_ci;

    /** @var FristTyp ENDE=deadline expires within timespan */
    protected FristTyp $fristTyp = FristTyp::ENDE;
    /** @var int timespan in months */
    protected int $zeitraum = 2;

    public function __construct(fristTyp $typ = FristTyp::ENDE, int $zeitraum = 2)
	{
        $this->_ci =& get_instance();
        $this->fristTyp = $typ;
        $this->zeitraum = $zeitraum;
    }

    /**
     * query data from db. Depending on the type fo fristTyp it returns all records
     * that expire within timespan or that are about to start within the timespan.
     */
    public function getDataByTable(string $dbTable)
    {
        $colname = "bis";
        if ($this->fristTyp == FristTyp::BEGINN) {
            $colname = "von";
        }
        $qry = "select dv.* from $dbTable where $colname between now()::date and (now()::date + interval '? months')::date";
        $dbModel = new DB_Model();
        $result = $dbModel->execReadOnlyQuery($qry, [$this->zeitraum]);

		if (isError($result)) return $result;

		if (!hasData($result)) return error("Keine Datensätze gefunden!");

		return $result;
    }

    public function exists(string $ereignisKurzbz, string $paramName, int $paramValue)
    {

    }

    
    abstract public function generateFristEreignis($rowData);

    /**
     * Get the value of fristTyp
     *
     * @return FristTyp
     */
    public function getFristTyp(): FristTyp
    {
        return $this->fristTyp;
    }

    /**
     * Set the value of fristTyp
     *
     * @param FristTyp $fristTyp
     *
     * @return self
     */
    public function setFristTyp(FristTyp $fristTyp): self
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