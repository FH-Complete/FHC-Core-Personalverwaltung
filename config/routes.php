<?php

defined('BASEPATH') || exit('No direct script access allowed');

$route['extensions/FHC-Core-Personalverwaltung/Employees/person/(:any)/summary'] = 'employees/summary/$1';
$route['employees/person/(:any)/summary'] = 'employees/summary/$1';