<?php
if (! defined('BASEPATH')) exit('No direct script access allowed');

class Employees extends Auth_Controller
{
	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct(array(
			'index'=>'admin:rw'	,
			'person'=>'admin:rw',
			'summary'=>'admin:rw',
			)
		);
		$this->load->model('extensions/FHC-Core-Personalverwaltung/Api_model','ApiModel');
		
		// Loads WidgetLib
		$this->load->library('WidgetLib');

		// Loads phrases system
		$this->loadPhrases(
			array(
				'global',
				'ui',
				'filter'
			)
		);
	}

	/**
	 * Index Controller
	 * @return void
	 */
	public function index()
	{
		$data = $this->_getAllEmployees();
		$this->load->library('WidgetLib');
		$this->load->view('extensions/FHC-Core-Personalverwaltung/employees/home', $data);
	}

	// public function person()
	// {
	// 	$this->load->library('WidgetLib');
	// 	$this->load->view('extensions/FHC-Core-Personalverwaltung/employees/person_overview.php');
	// }

	private function _getAllEmployees() {
		$list = $this->ApiModel->getEmployeeList();

		if (isError($list))
		{
			show_error(getError($list));
		}

		if (!isset($list->retval))
			return null;

		return array(
			'employeeList' => $list->retval,
		);

	}

	private function _getEmployeeData() {
		$person_id = $this->input->get('person_id');

		if (!is_numeric($person_id))
			show_error('person id is not numeric!');

		$employee = $this->ApiModel->getEmployee($person_id);

		if (isError($employee))
		{
			show_error(getError($employee));
		}

		if (!isset($employee->retval))
			return null;

		$data = array(
			'employee' => $employee->retval[0],
		);

		return $data;
	}

	public function summary()
	{
		$data = $this->_getEmployeeData();

		if ($data == null) 
		{
			return null;
		}

		$this->load->library('WidgetLib');
		$this->load->view('extensions/FHC-Core-Personalverwaltung/employees/person_summary.php', $data);
	}

	public function person()
	{
		$data = $this->_getEmployeeData();

		if ($data == null) 
		{
			return null;
		}

		$this->load->library('WidgetLib');
		$this->load->view('extensions/FHC-Core-Personalverwaltung/employees/person.php', $data);
	}

	public function contract()
	{
		$this->load->library('WidgetLib');
		$this->load->view('extensions/FHC-Core-Personalverwaltung/employees/contract.php');
	}
}

