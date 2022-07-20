<?php
	$this->load->view(
		'templates/FHC-Header',
		array(
			'title' => 'Personalverwaltung',
			'bootstrap5' => true,
			'fontawesome6' => true,
			'tabulator5' => true,
			'primevue3' => true,
			'axios027' => true,
			'restclient' => true,
			'filtercomponent' => true,
			'navigationcomponent' => true,
			'phrases' => array(
				'global' => array('mailAnXversandt'),
				'ui' => array('bitteEintragWaehlen')
			),
			'vue3' => true,
			'customCSSs' => [
				'public/extensions/FHC-Core-Personalverwaltung/css/dashboard.css',
				'public/extensions/FHC-Core-Personalverwaltung/css/personalverwaltung.css',
				'public/extensions/FHC-Core-Personalverwaltung/css/components/EmployeeChooser.css',
				'public/extensions/FHC-Core-Personalverwaltung/css/components/EmployeeHeader.css',
				'public/extensions/FHC-Core-Personalverwaltung/css/components/toast.css',
				'public/css/components/verticalsplit.css',
				'public/css/components/searchbar.css',
			], 
			'customJSs' => [
				'public/extensions/FHC-Core-Personalverwaltung/js/components/Sidebar.js',
			],
			'customJSModules' => ['public/extensions/FHC-Core-Personalverwaltung/js/apps/Employee.js']
		)
	);
?>

<div id="wrapper">

  <header class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
    <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="<?php echo APP_ROOT ?>index.ci.php">FHComplete [PV21]</a>
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
        
      <!--sidebar :active="1"></sidebar-->

      <core-navigation-cmpt :add-side-menu-entries="appSideMenuEntries" hide-top-menu=true  noheader custom-nav-styles="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"></core-navigation-cmpt>

      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-3">
                
          <verticalsplit id="macombined" ref="verticalsplitRef">
              <template #top>
                <div class="d-flex  flex-column" style="height:100%"  >
                  <div id="master" class="flex-shrink-0 d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            
                    <div class="flex-fill align-self-center">
                      <h1 class="h2" style="margin-bottom:0" > Mitarbeiter</h1>
                    </div>
                    <div class="btn-toolbar mb-2 mb-md-0" style="margin-right:1.75rem">
                        <button type="button" class="btn btn-outline-secondary" ><i class="fa fa-plus"></i></button>
                    </div>
                  </div>
                    <!-- Filter component -->
                    <core-filter-cmpt
                      filter-type="EmployeeViewer"
                      :tabulator-options="employeesTabulatorOptions"
                      :tabulator-events="employeesTabulatorEvents"
                      @nw-new-entry="newSideMenuEntryHandler">
                    </core-filter-cmpt>
                </div>
              </template>
              <template #bottom>
                <employee-editor :personid="currentPersonID" :open="isEditorOpen" @person-selected="personSelectedHandler" @close-editor="closeEditorHandler"></employee-editor>
              </template>
          </verticalsplit> 
                    
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

