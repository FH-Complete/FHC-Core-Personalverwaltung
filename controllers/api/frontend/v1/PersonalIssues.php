<?php
defined('BASEPATH') || exit('No direct script access allowed');

require_once APPPATH.'/controllers/api/frontend/v1/issues/Issues.php';

class PersonalIssues extends Issues
{
	const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';

	public function __construct()
	{
		parent::__construct(
			array(
				'index' => Self::DEFAULT_PERMISSION,
				'getOpenIssuesByProperties' => Self::DEFAULT_PERMISSION,
				'getPersonenMitOffenenIssues' => self::DEFAULT_PERMISSION
			)
		);
	}
}
