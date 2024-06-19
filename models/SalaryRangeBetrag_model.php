<?php


class SalaryRangeBetrag_model extends DB_Model
{

    public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_gehaltsband_betrag';
		$this->pk = 'gehaltsband_betrag_id';
	}

	public function insertSalaryRangeBetrag($salaryRangeJson)
	{
		unset($salaryRangeJson['gehaltsband_betrag_id']);
        unset($salaryRangeJson['updateamum']);
        $salaryRangeJson['insertvon'] = getAuthUID();
        $salaryRangeJson['insertamum'] = $this->escape('NOW()');

		if ($salaryRangeJson['bis']=='')
		{
			unset($salaryRangeJson['bis']);
		}

        $result = $this->insert($salaryRangeJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $record = $this->load($result->retval);

        return $record;
	}

	function updateSalaryRangeBetrag($salaryRangeJson)
    {
        $salaryRangeJson['updatevon'] = getAuthUID();
        $salaryRangeJson['updateamum'] = $this->escape('NOW()');

        $result = $this->update($salaryRangeJson['gehaltsband_betrag_id'], $salaryRangeJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $result = $this->load($salaryRangeJson['gehaltsband_betrag_id']);

        return $result;
    }
	
	function deleteSalaryRangeBetrag($salaryRangeJson)
    {
        $result = $this->delete($salaryRangeJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($salaryRangeJson);
    }

}
