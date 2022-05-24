<?php
// Add Header-Menu-Entry to all Pages
$config['navigation_header']['*']['Personen']['children']['PV21'] = array(
	'link' => site_url('extensions/FHC-Core-Personalverwaltung/Home'),
	'sort' => 25,
	'description' => 'PV21',
	'expand' => false,
	'requiredPermissions' => 'extension/budget_verwaltung:r'
);

$config['navigation_menu']['extensions/FHC-Core-Personalverwaltung/*'] = array(
	'Dashboard' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Home'),
		'description' => 'Home',
		'icon' => 'home'
	),
	'Budgetanträge OE Übersicht' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Employees'),
		'description' => 'Mitarbeiter',
		'icon' => 'users'
	),
	'Organigramm' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Organization'),
		'description' => 'Organigramm',
		'icon' => 'sitemap'
	),
	'Berichte' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/BI'),
		'description' => 'Berichte',
		'icon' => 'file-text-o'
	),
	'Dokumente' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Doc'),
		'description' => 'Dokumente',
		'icon' => 'line-chart'
	),
	'Einstellungen' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Setup'),
		'description' => 'Einstellungen',
		'icon' => 'cog',
		'requiredPermissions' => 'extension/budget_freigabe:r'
	)
);

// Add Header-Menu-Entry to Extension Page with DropDown
/*
$config['navigation_header']['extensions/FHC-Core-Extension/MyExtension/index'] = array(
		'FHC-Core-Extension-Advanced-Menu' => array(
		'link' => '#',
		'icon' => '',
		'description' => 'Additional Extension Options',
		'sort' => 10,
		'children'=> array(
			'sub1' => array(
				'link' => site_url(),
				'icon' => '',
				'description' => 'Submenu 1',
				'expand' => true,
				'sort' => 1,
				'requiredPermissions' => 'basis/vilesci:r'
			),
			'sub2' => array(
				'link' => site_url(),
				'icon' => 'cubes',
				'description' => 'Submenu 2',
				'expand' => true,
				'sort' => 2,
				'requiredPermissions' => 'admin:r'
			)
		)
	));

// Add Side-Menu-Entry to Main Page
$config['navigation_menu']['Vilesci/index']['administration']['children']['MyExtension'] = array(
		'link' => site_url('extensions/FHC-Core-Extension/MyExtension'),
		'icon' => 'cubes',
		'description' => 'My Extension',
		'expand' => true
);

// Add Side-Menu-Entry to Extension Page
$config['navigation_menu']['extensions/FHC-Core-Extension/MyExtension/index'] = array(
	'Back' => array(
		'link' => site_url(),
		'description' => 'Zurück',
		'icon' => 'angle-left'
	),
	'Dashboard' => array(
		'link' => '#',
		'description' => 'Dashboard',
		'icon' => 'dashboard'
	)
);*/
