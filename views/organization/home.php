<?php
	$this->load->view(
		'templates/FHC-Header',
		array(
			'title' => 'Personalverwaltung',		
			'bootstrap5' => true,
			'fontawesome6' => true,
      'axios027' => true,
			'navigationcomponent' => true,
      'vue3' => true,  
      'primevue3' => true,    
      'customCSSs' => ['public/extensions/FHC-Core-Personalverwaltung/css/dashboard.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/personalverwaltung.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/toast.css',
                       'public/css/components/searchbar/searchbar.css'],
      'customJSModules' => array('public/extensions/FHC-Core-Personalverwaltung/js/components/organisation/OrgChooser.js',
                                 'public/extensions/FHC-Core-Personalverwaltung/js/apps/Organisation.js'),
		)
	);
?>

<!-- chart styles -->
<style>
      .p-organizationchart .p-person {
        padding: 0;
        border: 0 none;
      }

      .p-organizationchart .node-header,
      .p-organizationchart .node-content {
        padding: 0.5em 0.7rem;
      }

      .p-organizationchart .node-header {
        background-color: #495ebb;
        color: #ffffff;
      }

      .p-organizationchart .node-content {
        text-align: center;
        border: 1px solid #495ebb;
      }

      .p-organizationchart .node-content img {
        border-radius: 50%;
      }

      .p-organizationchart .department-cfo {
        background-color: #7247bc;
        color: #ffffff;
      }

      .p-organizationchart .department-coo {
        background-color: #a534b6;
        color: #ffffff;
      }

      .p-organizationchart .department-cto {
        background-color: #e9286f;
        color: #ffffff;
      }
</style>

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
        
      <core-navigation-cmpt :add-side-menu-entries="appSideMenuEntries" hide-top-menu left-nav-css-classes="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"></core-navigation-cmpt>      

      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div class="d-flex justify-content-start flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
            <h1 class="h2">Organisation</h1>
          </div>
        <div class="d-flex justify-content-end flex-wrap flex-md-nowrap align-items-center pb-2">
          <org-chooser @org-selected="orgSelectedHandler" ></org-chooser>
          <div class="btn-toolbar mb-2 mb-md-0">
            <div class="btn-group ms-2">
              <button v-show="isCollapsed" type="button" class="btn btn-sm btn-outline-secondary" @click="expandAllHandler"><i class="fa-solid fa-maximize"></i></button>
              <button v-show="!isCollapsed" type="button" class="btn btn-sm btn-outline-secondary" @click="collapseAllHandler"><i class="fa-solid fa-minimize"></i></button>
            </div>
          </div>
        </div>                

        <div class="d-flex justify-content-between align-items-center col-md-9 ms-sm-auto col-lg-12 p-md-2" >         
          <org-viewer :oe="currentOrg" ref="orgviewer" ></org-viewer>
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




