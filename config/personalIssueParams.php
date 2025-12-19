<?php

// Date from which Dienstverhältnisse should have a Standardkostenstelle
// NOTE: if there is no entry or it is a falsey value, check is not executed. If it is a truish value, check is executed for all dv dates.
$config['STANDARDKOSTENSTELLE_START_DATE'] = '2022-09-01';

// Date from which Dienstverhältnisse should have an Oezuordnung
// NOTE: if there is no entry or it is a falsey value, check is not executed. If is a truish value, check is executed for all dv dates.
$config['OEZUORDNUNG_START_DATE'] = '2022-09-01';
