<?php
// Add Header-Menu-Entry to all Pages
$config['navigation_header']['*']['Personen']['children']['PV21'] = array(
	'link' => site_url('extensions/FHC-Core-Personalverwaltung/Home'),
	'sort' => 25,
	'description' => 'PV21',
	'expand' => false,
	'requiredPermissions' => 'basis/mitarbeiter:r'
);

$config['navigation_header']['*']['Personen']['children']['Handyverwaltung'] = array(
	'link' => site_url('extensions/FHC-Core-Personalverwaltung/restricted/Handyverwaltung'),
	'sort' => 26,
	'description' => 'Handyverwaltung',
	'expand' => false,
	'requiredPermissions' => array('extension/pv21_handyverwaltung:r', 'basis/mitarbeiter:r')
);

$config['navigation_menu']['extensions/FHC-Core-Personalverwaltung/restricted/*'] = array(
	'Handyverwaltung' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/restricted/Handyverwaltung'),
		'description' => 'Handyverwaltung',
		'icon' => 'home',
		'requiredPermissions' => array('extension/pv21_handyverwaltung:r', 'basis/mitarbeiter:r')
	)
);

$config['navigation_menu']['extensions/FHC-Core-Personalverwaltung/*'] = array(
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
	'BulkEdit' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Bulk'),
		'description' => 'Bulk Edit',
		'icon' => 'percent',
		'requiredPermissions' => 'basis/mitarbeiter:r'
	),
	'Gehaltsbaender' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/SalaryRange'),
		'description' => 'Gehaltsbänder',
		'icon' => 'money-bill-wave',
		'requiredPermissions' => 'basis/mitarbeiter:r'
	),
	'Valorisierung' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Valorisation'),
		'description' => 'Valorisierung',
		'icon' => 'money-bill-wave',
		'requiredPermissions' => 'extension/pv21_valorisierung:r'
	),
	'Berichte' => array(
		'link' => site_url('extensions/FHC-Core-Personalverwaltung/Reports'),
		'description' => 'Berichte',
		'icon' => 'file-text',
		'requiredPermissions' => 'basis/mitarbeiter:r'
	)
);
