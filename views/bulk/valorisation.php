<?php
$this->load->view(
    'templates/FHC-Header',
    array(
	'title' => 'Valorisierung',
	'bootstrap5' => true,
	'fontawesome6' => true,
	'tabulator5' => true,
	'axios027' => true,
	'navigationcomponent' => true,
	'vue3' => true,
	'primevue3' => true,
	'customCSSs' => array(
	    'vendor/vuejs/vuedatepicker_css/main.css',
	    'public/extensions/FHC-Core-Personalverwaltung/css/dashboard.css',
	    'public/extensions/FHC-Core-Personalverwaltung/css/personalverwaltung.css',
	    'public/extensions/FHC-Core-Personalverwaltung/css/components/toast.css',
	    'public/css/components/searchbar/searchbar.css'
	),
	'customJSs' => array(
	    'vendor/vuejs/vuedatepicker_js/vue-datepicker.iife.js'
	),
	'customJSModules' => array(
	    'public/extensions/FHC-Core-Personalverwaltung/js/apps/Valorisation.js'
	),
    )
);
?>

<div id="wrapper"><router-view></router-view></div>

<script>
(function () {
    'use strict';
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
	new bootstrap.Tooltip(tooltipTriggerEl);
    });
})();
</script>

<?php $this->load->view('templates/FHC-Footer'); ?>
