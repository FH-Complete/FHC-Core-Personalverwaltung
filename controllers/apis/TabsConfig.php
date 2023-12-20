<?php

defined('BASEPATH') || exit('No direct script access allowed');

use CI3_Events as Events;

class TabsConfig extends Auth_Controller
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
    }

    function index()
    {}

    function Stammdaten()
    {
		$result = array(
			'test1' => array(
				'title' => 'Test1',
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/organisation/chartdemo.js'
			),
			'test2' => array(
				'title' => 'Test2',
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/organisation/chartdemo.js'
			),
			'test3' => array(
				'title' => 'Test3',
				'component' => APP_ROOT . 'public/extensions/FHC-Core-Personalverwaltung/js/components/organisation/chartdemo.js'
			)
		);

		Events::trigger('pv21_conf_stammdaten', function & () use (&$result) {
			return $result;
		});

		$this->outputJsonSuccess($result);
    }
}