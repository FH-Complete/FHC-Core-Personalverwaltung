<?php

defined('BASEPATH') || exit('No direct script access allowed');

$route['extensions/FHC-Core-Personalverwaltung/Employees'] = 'extensions/FHC-Core-Personalverwaltung/Employees/index';
$route['extensions/FHC-Core-Personalverwaltung/Employees/(:any)'] = 'extensions/FHC-Core-Personalverwaltung/Employees/index';
$route['extensions/FHC-Core-Personalverwaltung/Employees/(:any)/(:any)'] = 'extensions/FHC-Core-Personalverwaltung/Employees/index';
$route['extensions/FHC-Core-Personalverwaltung/Employees/(:any)/(:any)/contract'] = 'extensions/FHC-Core-Personalverwaltung/Employees/index';
$route['extensions/FHC-Core-Personalverwaltung/Employees/(:any)/(:any)/salary'] = 'extensions/FHC-Core-Personalverwaltung/Employees/index';
$route['extensions/FHC-Core-Personalverwaltung/Employees/(:any)/(:any)/summary'] = 'extensions/FHC-Core-Personalverwaltung/Employees/index';
$route['extensions/FHC-Core-Personalverwaltung/Employees/(:any)/(:any)/documents'] = 'extensions/FHC-Core-Personalverwaltung/Employees/index';