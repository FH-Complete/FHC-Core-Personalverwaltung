<?php
class Sachaufwand_model extends DB_Model
{

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_sachaufwand';
		$this->pk = 'sachaufwand_id';
	}

	public function getByPersonID($person_id)
	{
		$result = null;

		$this->db->select("hr.tbl_sachaufwand.*");
		$this->addJoin('public.tbl_benutzer', 'uid=mitarbeiter_uid', 'LEFT');
	
		$parametersArray = array();

		if (!is_null($person_id))
		{
			$parametersArray['person_id'] = $person_id;
		}

		if (count($parametersArray) > 0)
		{
			$result = $this->loadWhere($parametersArray);
		}
		
		return $result;
	}

	public function insertPersonSachaufwand($sachaufwandJson)
	{
		unset($sachaufwandJson['sachaufwand_id']);
        unset($sachaufwandJson['updateamum']);
        $sachaufwandJson['insertvon'] = getAuthUID();
        $sachaufwandJson['insertamum'] = $this->escape('NOW()');

		if ($sachaufwandJson['ende']=='')
		{
			unset($sachaufwandJson['ende']);
		}

        $result = $this->insert($sachaufwandJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $record = $this->load($result->retval);

        return $record;
	}

	function updatePersonSachaufwand($sachaufwandJson)
    {
        $sachaufwandJson['updatevon'] = getAuthUID();
        $sachaufwandJson['updateamum'] = $this->escape('NOW()');

        $result = $this->update($sachaufwandJson['sachaufwand_id'], $sachaufwandJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        $result = $this->load($sachaufwandJson['sachaufwand_id']);

        return $result;
    }
	
	function deletePersonSachaufwand($sachaufwandJson)
    {
        $result = $this->delete($sachaufwandJson);

        if (isError($result))
        {
            return error($result->msg, EXIT_ERROR);
        }

        return success($sachaufwandJson);
    }
}