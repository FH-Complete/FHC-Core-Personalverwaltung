<?php
	$this->load->view(
		'templates/FHC-Header',
		array(
			'title' => 'Personalverwaltung',
			'jquery' => true,
			'jqueryui' => false,
			'bootstrap5' => true,
			'fontawesome6' => true,
			'sbadmintemplate' => false,
			'ajaxlib' => true,
			'navigationwidget' => false,
      'vue3' => true,  
      'primevue3' => true,    
      'customCSSs' => ['public/extensions/FHC-Core-Personalverwaltung/css/dashboard.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/EmployeeChooser.css',  
                       'public/extensions/FHC-Core-Personalverwaltung/css/personalverwaltung.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/toast.css'],     
      'customJSs' => ['public/extensions/FHC-Core-Personalverwaltung/js/components/EmployeeChooser.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/Sidebar.js',                      
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/organisation/OrgChooser.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/organisation/OrgViewer.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/apps/Organisation.js'                    
                    ],
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

  <header class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
    <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="<?php echo APP_ROOT ?>">FHComplete [PV21]</a>
    <button class="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div id="chooser" class=" form-control-dark w-100">
      <employee-chooser placeholder="MA suchen..."></employee-chooser>
    </div>
    <div class="navbar-nav">
      <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle px-3" data-bs-toggle="dropdown" href="#" id="navbarDropdownMenuLink">H??ufige Funktionen</a>
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
        
      <sidebar :active="2"></sidebar>

      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 class="h2">Organisation</h1>
          <div class="btn-toolbar mb-2 mb-md-0">        
                      
            <div class="btn-group me-2">
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="expandAllHandler">Expand</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="collapseAllHandler">Collapse</button>
            </div>

            <org-chooser  @org-selected="orgSelectedHandler" ></org-chooser>
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




