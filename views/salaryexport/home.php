<?php
	$this->load->view(
		'templates/FHC-Header',
		array(
			'title' => 'Personalverwaltung',
			'bootstrap5' => true,
			'fontawesome6' => true,
			'tabulator5' => true,
      'axios027' => true,
			'navigationcomponent' => true,
      'vue3' => true,
      'primevue3' => true,
      'customCSSs' => ['vendor/vuejs/vuedatepicker_css/main.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/dashboard.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/personalverwaltung.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/toast.css',
                       'public/css/components/searchbar.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/vbform/vbform.css'],
      'customJSs' =>  [
                        'vendor/vuejs/vuedatepicker_js/vue-datepicker.iife.js'
                      ],
      'customJSModules' => array('public/extensions/FHC-Core-Personalverwaltung/js/apps/SalaryExport.js'),
		)
	);
?>



<div id="wrapper">

  <header class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark flex-md-nowrap p-0 border-bottom">
    <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="<?php echo APP_ROOT ?>">FHComplete [PV21]</a>
    <button class="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div id="chooser" class="w-100">
      <searchbar :searchoptions="searchbaroptions" :searchfunction="searchfunction"></searchbar>
    </div>
    <div class="navbar-nav">
      <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle px-3" data-bs-toggle="dropdown" href="#" id="navbarDropdownMenuLink">Häufige Funktionen</a>
        <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
        </ul>
      </div>
    </div>
  </header>

  <div class="container-fluid">
    <div class="row">

      <core-navigation-cmpt :add-side-menu-entries="appSideMenuEntries" hide-top-menu  noheader left-nav-css-classes="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"></core-navigation-cmpt>

      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4" style="height:100%">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
          <h1 class="h2">Gehaltsliste</h1>
          <div class="btn-toolbar mb-2 mb-md-0">

            <div class="btn-group me-2">
              <!--button type="button" class="btn btn-sm btn-outline-secondary" @click="expandAllHandler">Expand</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="collapseAllHandler">Collapse</button-->
            </div>


          </div>
        </div>

        <div class="mh-100 pb-5" >

          <salary-export></salary-export>

        </div>

      </main>
    </div>
  </div>

</div>




<script>
(function () {
  'use strict'
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl)
  })
})()
</script>

</body>

<?php $this->load->view('templates/FHC-Footer'); ?>
