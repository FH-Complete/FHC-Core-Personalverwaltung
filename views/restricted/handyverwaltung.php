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
		    'public/css/components/vue-datepicker.css',
		    'public/extensions/FHC-Core-Personalverwaltung/css/personalverwaltung.css',
		    'public/css/components/verticalsplit.css'
		],
		'customJSs' => [
		    'vendor/vuejs/vuedatepicker_js/vue-datepicker.iife.js'
		],
		'customJSModules' => array(
		    'public/extensions/FHC-Core-Personalverwaltung/js/apps/Handyverwaltung/Handyverwaltung.js'
		)
	);

	$this->load->view('templates/FHC-Header', $includesArray);
?>

	<div id="main"></div>

	<script>

		var FHC_JS_CONFIG = { domain: '<?php echo DOMAIN; ?>'};
		var CIS_ROOT = '<?php echo APP_ROOT ?>';

		(function () {
			'use strict'
			var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
			tooltipTriggerList.forEach(function (tooltipTriggerEl) {
				new bootstrap.Tooltip(tooltipTriggerEl)
			})
		})()
	</script>

<?php $this->load->view('templates/FHC-Footer', $includesArray); ?>

