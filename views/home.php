<?php
	$this->load->view(
		'templates/FHC-Header',
		array(
			'title' => 'Personalverwaltung',
			'bootstrap5' => true,
			'fontawesome6' => true,
      'axios027' => true,
			'restclient' => true,
      'tabulator5' => true,
      'vue3' => true,
      'primevue3' => true,
			'navigationcomponent' => true, 
			'customCSSs' => ['public/extensions/FHC-Core-Personalverwaltung/css/dashboard.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/EmployeeChooser.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/ContractsExpiring.css',       
                       'public/css/components/searchbar.css',
					   'public/extensions/FHC-Core-Personalverwaltung/css/personalverwaltung.css'],
      'customJSs' => [
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/Sidebar.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/home/ContractsExpiring.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/home/ContractsNew.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/home/ContractsCountCard.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/home/BirthdayCountCard.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/home/IssuesCountCard.js',
                      //'public/extensions/FHC-Core-Personalverwaltung/js/components/home/DeadlineIssueTable.js',
                      ],
      'customJSModules' => array('public/extensions/FHC-Core-Personalverwaltung/js/apps/Home.js'),
       
      // VUE APP build:      
			// 'vueSFCs' => [[
        // "vendor" => "public/extensions/FHC-Core-Personalverwaltung/js/vendor.3239befe.js", 
				// "js" => "public/extensions/FHC-Core-Personalverwaltung/js/index.ccd9a95a.js", 
				// "css" => "public/extensions/FHC-Core-Personalverwaltung/css/index.c5353a60.css", ]]
        
		)
	);
?>
<div id="wrapper">
<header class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark flex-md-nowrap p-0 border-bottom">
	<a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="<?php echo APP_ROOT ?>/">FHComplete [PV21] <span style="color:#999;font-size:0.5em"><?php echo ($_SERVER['CI_ENV']!='production'?$_SERVER['CI_ENV']:''); ?></span></a>
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

  <core-navigation-cmpt :add-side-menu-entries="appSideMenuEntries" hide-top-menu=true  left-nav-css-classes="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"></core-navigation-cmpt>

    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">

      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <h1 class="h2">Dashboard</h1>
        <!--div class="btn-toolbar mb-2 mb-md-0">
          <div class="btn-group me-2">
            <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
            <button type="button" class="btn btn-sm btn-outline-secondary">Export</button>
          </div>
          <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle">
            <span data-feather="calendar"></span>
            This week
          </button>
        </div-->
      </div>

      <div class="row">

        <div class="col">
          <contract-count-card ></contract-count-card>
        </div>          

        <div class="col">
          <contract-count-card show-new></contract-count-card>
        </div>

        <div class="col">
          <issues-count-card></issues-count-card>
        </div>

        <div class="col">
          <birthday-count-card></birthday-count-card>
        </div>

      </div>

      <div class="row">
          <deadline-issue-table></deadline-issue-table>
      </div>

      <!--div class="d-flex bd-highlight">
        <div class="p-2 flex-fill bd-highlight">
          <h3>Verträge neu ({{ contractDataNew.length }})</h3>
          <contract-new :columns="['personalnummer','name','beginn','ende']" :data="contractDataNew"></contract-new>
        </div>
        <div class="p-2 flex-fill bd-highlight">
          <h3>Verträge auslaufend ({{ contractDataExpiring.length }})</h3>
          <contract-expiring :columns="['personalnummer','name','beginn','ende']" :data="contractDataExpiring"></contract-expiring>
        </div>
      </div-->
      
    </main>
  </div>
</div>

</div> <!-- wrapper -->      


<div class="container-fluid">
  <div class="row">
    <div class="col-md-9 offset-lg-2 col-lg-5 px-md-4">
    </div>
    <div class="col-md-9  col-lg-5 px-md-4">
    </div>
  </div>
</div>  



</script>

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

