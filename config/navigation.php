<?php
// Add Header-Menu-Entry to all Pages
$config['navigation_header']['*']['Personen']['children']['PV21'] = array(
	'link' => site_url('extensions/FHC-Core-Personalverwaltung/Home'),
	'sort' => 25,
	'description' => 'PV21',
	'expand' => false,
	'requiredPermissions' => 'basis/mitarbeiter:r'
);

$config['navigation_menu']['extensions/FHC-Core-Personalverwaltung/*'] = array(
	'DashboardRestricted' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/restricted/Home'),
		'description' => 'Home (restricted)',
		'icon' => 'home',
		'requiredPermissions' => 'assistenz:r'
	),
	'Dashboard' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Home'),
		'description' => 'Home',
		'icon' => 'home',
		'requiredPermissions' => 'basis/mitarbeiter:r'
	),
	'Mitarbeiter' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Employees'),
		'description' => 'Mitarbeiter',
		'icon' => 'users',
		'requiredPermissions' => 'basis/mitarbeiter:r'
	),
	'Organigramm' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Organisation'),
		'description' => 'Organigramm',
		'icon' => 'sitemap',
		'requiredPermissions' => 'basis/mitarbeiter:r'
	),
	'Valorisierung' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Bulk'),
		'description' => 'Bulk Edit',
		'icon' => 'percent',
		'requiredPermissions' => 'basis/mitarbeiter:r'
	),
	'Berichte' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Reports'),
		'description' => 'Berichte',
		'icon' => 'file-text',
		'requiredPermissions' => 'basis/mitarbeiter:r'
	)
);
