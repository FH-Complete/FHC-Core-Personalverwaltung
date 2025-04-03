<?php
	$includesArray = array(
		'title' => 'Test VBform',
                'axios027' => true,
		'bootstrap5' => true,
		'fontawesome6' => true,
		'vue3' => true,
                'customCSSs' => array(
                        'vendor/vuejs/vuedatepicker_css/main.css',
                        'public/extensions/FHC-Core-Personalverwaltung/css/vbform/vbform.css'
                ),
                'customJSs' => array(
                        'vendor/vuejs/vuedatepicker_js/vue-datepicker.iife.js'
                ),
		'customJSModules' => array(
                        'public/extensions/FHC-Core-Personalverwaltung/js/apps/vbform/vbform.js'
                )
	);

	$this->load->view('templates/FHC-Header', $includesArray);
?>

	<div id="main"></div>

<?php $this->load->view('templates/FHC-Footer', $includesArray); ?>

