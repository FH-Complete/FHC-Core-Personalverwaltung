<?php
	$includesArray = array(
		'title' => 'Handyverwaltung',
		'axios027' => true,
		'bootstrap5' => true,
		'fontawesome6' => true,
		'vue3' => true,
		'filtercomponent' => true,
		'navigationcomponent' => true,
		'tabulator5' => true,
		'phrases' => array(
			'global' => array('mailAnXversandt'),
			'ui' => array('bitteEintragWaehlen')
		),
		'customCSSs' => [
		    'public/css/components/verticalsplit.css',
		    'public/css/components/vue-datepicker.css'
		],
		'customJSModules' => array('public/extensions/FHC-Core-Personalverwaltung/js/apps/Handyverwaltung/Handyverwaltung.js')
	);

	$this->load->view('templates/FHC-Header', $includesArray);
?>

	<div id="main"></div>

<?php $this->load->view('templates/FHC-Footer', $includesArray); ?>

