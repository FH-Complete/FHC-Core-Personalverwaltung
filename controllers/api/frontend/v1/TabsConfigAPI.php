<?php

defined('BASEPATH') || exit('No direct script access allowed');

use CI3_Events as Events;

class TabsConfigAPI extends FHCAPI_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';
    // code igniter 
    protected $CI;

    public function __construct() {
        
        parent::__construct(
			array(
				'index' => Self::DEFAULT_PERMISSION,
				'Stammdaten' => self::DEFAULT_PERMISSION
			)
		);

		// Loads phrases system
		$this->loadPhrases(
			array(
				'global',
				'ui',
				'person'
			)
		);
    }

    function index()
    {}

    function Stammdaten()
    {
			
		$result = array(
			'base' => array(
				'title' => $this->p->t('global', 'stammdaten'),
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/BaseData.js',
				'config' => null
			),
			'employee' => array(
				'title' => $this->p->t('person', 'mitarbeiterdaten'),
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/EmployeeData.js',
				'config' => null
			),
			'contact' => array(
				'title' => $this->p->t('person', 'kontaktdaten'),
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/contact/ContactData.js',
				'config' => null
			),
			'bank' => array(
				'title' => $this->p->t('person', 'bankdaten'),
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/BankData.js',
				'config' => null
			),
			'materialexpenses' => array(
				'title' => $this->p->t('person', 'sachaufwand'),
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/MaterialExpensesData.js',
				'config' => null
			),
			'hourlyrate' => array(
				'title' => $this->p->t('person', 'stundensaetze'),
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/HourlyRateData.js',
				'config' => null
			),
			'jobfunction' => array(
				'title' => $this->p->t('person', 'funktionen') . " PV_21",
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/JobFunction.js',
				'config' => null
			),
			'corefunction' => array(
				'title' => $this->p->t('person', 'funktionen'),
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/EmployeeFunction.js',
				'config' => null
			),
		);

		Events::trigger('pv21_conf_stammdaten', function & () use (&$result) {
			return $result;
		});

		$this->terminateWithSuccess($result);
    }
}
