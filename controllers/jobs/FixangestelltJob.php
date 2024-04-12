<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class FixangestelltJob extends JOB_Controller
{
	private $_ci; // Code igniter instance

	public function __construct()
	{
		parent::__construct();

		$this->_ci =& get_instance();

		$this->_ci->load->model('vertragsbestandteil/Dienstverhaeltnis_model', 'DienstverhaeltnisModel');
		$this->_ci->load->model('ressource/Mitarbeiter_model', 'MitarbeiterModel');
	}

	/**
	 * Sets correct "fixangestellt" flag for all current Mitarbeiter.
	 */
	public function updateFixangestellt()
	{
		$this->logInfo('Start Fixangestellt Job');

		$qry = "
			-- get all currently active dvs
			WITH dvs AS (
				SELECT
					dv.vertragsart_kurzbz, ma.fixangestellt, dv.mitarbeiter_uid, dv.von
				FROM
					hr.tbl_dienstverhaeltnis dv
					JOIN public.tbl_mitarbeiter ma USING (mitarbeiter_uid)
				WHERE
					ma.personalnummer > 0
					AND NOW() BETWEEN dv.von AND COALESCE(dv.bis, '2999-12-31')
			)
			SELECT
				*
			FROM
				dvs
			WHERE
				(
					-- dv not marked as fixangestellt, but should be
					vertragsart_kurzbz IN ('echterdv')
					AND fixangestellt = FALSE
				)
				OR
				(
					-- dv marked as fixangestellt, but should not be
					vertragsart_kurzbz IN ('freierdv', 'externerlehrender')
					AND fixangestellt = TRUE
					-- shouldn't have a paralell DV which would make the Mitarbeiter fixangestellt
					AND NOT EXISTS(
						SELECT 1
						FROM
							dvs fixAng
						WHERE
							mitarbeiter_uid = dvs.mitarbeiter_uid
							AND vertragsart_kurzbz IN ('echterdv')
					)
				)
			ORDER BY
				dvs.mitarbeiter_uid, dvs.von";

		// get all dvs with wrong fixangestellt value
		$result = $this->_ci->DienstverhaeltnisModel->execReadOnlyQuery($qry);

		if (isError($result))
		{
			$this->logError(getError($result));
		}

		$count = 0;

		if (hasData($result))
		{
			$dvs = getData($result);

			foreach ($dvs as $dv)
			{
				// update wrong fixangestellt value
				$result = $this->_ci->MitarbeiterModel->update($dv->mitarbeiter_uid, array('fixangestellt' => !$dv->fixangestellt));

				if (isError($result))
					$this->logError(getError($result));
				else
					$count++;
			}
		}

		$this->logInfo('End Fixangestellt Job', array('Number of changes ' => $count));
	}
}
