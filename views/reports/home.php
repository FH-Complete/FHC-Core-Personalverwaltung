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
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/EmployeeChooser.css'],       
      'customJSs' => ['public/extensions/FHC-Core-Personalverwaltung/js/components/EmployeeChooser.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/Sidebar.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/report/PivotReport.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/apps/Report.js'],
      /*
      'vueSFCs' => [[
        "vendor" => "public/extensions/FHC-Core-Personalverwaltung/js/vendor.3239befe.js", 
				"js" => "public/extensions/FHC-Core-Personalverwaltung/js/index.ccd9a95a.js", 
				"css" => "public/extensions/FHC-Core-Personalverwaltung/css/index.c5353a60.css", ]]*/
		)
	);


  function printStatistikLink($kurzbz)
  {
    echo APP_ROOT.'addons/reports/cis/vorschau.php?statistik_kurzbz='.$kurzbz;
  }

  function printChartLink($chartID)
  {
    echo APP_ROOT.'addons/reports/cis/vorschau.php?chart_id='.$chartID;
  }
?>

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
        
      <sidebar :active="3"></sidebar>

      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 class="h2">Berichte</h1>
          <div class="btn-toolbar mb-2 mb-md-0">        
                      
            
          </div>
        </div>  
        
        <div class="row  gy-3">

          <div class="col-md-4 col-sm-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <a  href="<?php printStatistikLink('HomeofficetageMitarbeiterInnen') ?>" class="stretched-link" target="_blank">
                  Homeoffice Tage
                </a></h5> 
              </div>
              <div class="card-body" style="text-align: center;">
                <i class="fa-solid fa-table fa-3x"></i>
              </div>
            </div>
          </div>          

          <div class="col-md-4 col-sm-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <a  href="<?php printStatistikLink('MitarbeiterInnenFunktionen') ?>" class="stretched-link" target="_blank">
                  MitarbeiterInnen nach Funktionen
                </a></h5> 
              </div>
              <div class="card-body" style="text-align: center;">
                <i class="fa-solid fa-table fa-3x"></i>
              </div>
            </div>
          </div>      

          <div class="col-md-4 col-sm-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <a  href="<?php printStatistikLink('MitarbeiterAltersverteilung') ?>" class="stretched-link" target="_blank">
                  Mitarbeiter nach Altersverteilung
                </a></h5> 
              </div>
              <div class="card-body" style="text-align: center;">
                <i class="fa-solid fa-table fa-3x"></i>
              </div>
            </div>
          </div>      

          <div class="col-md-4 col-sm-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <a  href="<?php printStatistikLink('MitarbeiterGesamtdaten') ?>" class="stretched-link" target="_blank">
                  Mitarbeiterdaten gesamt
                </a></h5> 
              </div>
              <div class="card-body" style="text-align: center;">
                <i class="fa-solid fa-table fa-3x"></i>
              </div>
            </div>
          </div>      

          <div class="col-md-4 col-sm-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <a  href="<?php printStatistikLink('Zeitaufzeichnung') ?>" class="stretched-link" target="_blank">
                  Zeitaufzeichnung
                </a></h5> 
              </div>
              <div class="card-body" style="text-align: center;">
                <i class="fa-solid fa-table fa-3x"></i>
              </div>
            </div>
          </div>     
          
          <div class="col-md-4 col-sm-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <a  href="<?php printStatistikLink('MitarbeiterVerwendung') ?>" class="stretched-link" target="_blank">
                  Mitarbeiter je Verwendung
                </a></h5> 
              </div>
              <div class="card-body" style="text-align: center;">
                <i class="fa-solid fa-table fa-3x"></i>
              </div>
            </div>
          </div>      

        </div>

       

        <br/>

        <div class="row  gy-3">

          <div class="col-md-4 col-sm-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <a  href="<?php printChartLink(50) ?>" class="stretched-link" target="_blank">
                  Lehrauftragstunden je Department/Kompetenzfeld
                </a></h5> 
              </div>
              <div class="card-body" style="text-align: center;">
                <i class="fa-solid fa-chart-pie fa-3x"></i>
              </div>
            </div>
          </div>       
          
          <div class="col-md-4 col-sm-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <a  href="<?php printChartLink(64) ?>" class="stretched-link" target="_blank">
                  Interessenten pro Fakult??t
                </a></h5> 
              </div>
              <div class="card-body" style="text-align: center;">
                <i class="fa-solid fa-chart-pie fa-3x"></i>
              </div>
            </div>
          </div>      

          <div class="col-md-4 col-sm-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <a  href="<?php printChartLink(65) ?>" class="stretched-link" target="_blank">
                  Studierende pro Fakult??t
                </a></h5> 
              </div>
              <div class="card-body" style="text-align: center;">
                <i class="fa-solid fa-chart-pie fa-3x"></i>
              </div>
            </div>
          </div>      


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

