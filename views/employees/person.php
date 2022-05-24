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
      'vue3' => true, 
			'ajaxlib' => true,
			'navigationwidget' => false,
			'customCSSs' => ['public/extensions/FHC-Core-Personalverwaltung/css/dashboard.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/EmployeeChooser.css'],       
      'customJSs' => ['public/extensions/FHC-Core-Personalverwaltung/js/components/EmployeeChooser.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/Sidebar.js',
                      // Base
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/BaseData.js',
                      // Employee
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/EmployeeData.js',
                      // Contact
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/contact/EmailTelData.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/contact/AddressData.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/contact/ContactData.js',                                          
                      // Bank
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/BankData.js',     
                      // Person SubMenu
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/EmployeePerson.js', 
                      // App        
                      'public/extensions/FHC-Core-Personalverwaltung/js/apps/EmployeeTabPerson.js'],
			/*'vueSFCs' => [[
        "vendor" => "public/extensions/FHC-Core-Personalverwaltung/js/vendor.3239befe.js", 
				"js" => "public/extensions/FHC-Core-Personalverwaltung/js/index.ccd9a95a.js", 
				"css" => "public/extensions/FHC-Core-Personalverwaltung/css/index.c5353a60.css", ]]*/
		)
	);
?>


<div id="wrapper">


<header class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
	<a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="#">FHComplete [PV21]</a>
	<button class="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>
  <div id="chooser" class=" form-control-dark w-100">
    <employee-chooser placeholder="MA suchen..." @person_selected="selectPerson"></employee-chooser>
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
    <sidebar :active="1"></sidebar>

    <div class="d-flex justify-content-between align-items-center col-md-9 ms-sm-auto col-lg-10 p-md-4" >
      <div class="d-flex align-items-center" >
<?php
    if ($employee->foto) {
?>        
        <img class="img-thumbnail " src="data:image/jpeg;charset=utf-8;base64,<?php echo $employee->foto; ?>" />
<?php
    } else {
?>
        <svg class="bd-placeholder-img img-thumbnail" width="100" height="131" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A generic square placeholder image with a white border around it, making it resemble a photograph taken with an old instant camera: 200x200" preserveAspectRatio="xMidYMid slice" focusable="false"><title>A generic square placeholder image with a white border around it, making it resemble a photograph taken with an old instant camera</title><rect width="100%" height="100%" fill="#868e96"></rect><text x="50%" y="50%" fill="#dee2e6" dy=".3em"></text></svg>
<?php      
    } 
?>             
        <div class="ms-3">
          <h2 class="h2"><?php echo $employee->nachname,', '.$employee->vorname.' '.$employee->titelpre ?></h2>
          <h6 class="mb-2 text-muted">Funktion, Abteilung</h6>  
        </div>
      </div>
      <div>
        <h2>PNr.</h2>
        <h6 class="mb-2 text-muted" style="text-align:right"><?php echo $employee->personalnummer ?></h6>  
      </div>
    </div>

  

      <nav class="nav nav-pills flex-column flex-sm-row col-md-9 ms-sm-auto col-lg-10 subnav" >
        <a class="flex-sm-fill text-sm-center nav-link " aria-current="page" href="<?php echo site_url('/extensions/FHC-Core-Personalverwaltung/Employees/summary?person_id='.$employee->person_id); ?>">Überblick</a>
        <a class="flex-sm-fill text-sm-center nav-link active" href="<?php echo site_url('/extensions/FHC-Core-Personalverwaltung/Employees/person?person_id='.$employee->person_id); ?>">Person</a>
        <a class="flex-sm-fill text-sm-center nav-link" href="<?php echo site_url('/extensions/FHC-Core-Personalverwaltung/Employees/contract?person_id='.$employee->person_id); ?>">Verträge</a>
        <a class="flex-sm-fill text-sm-center nav-link" href="<?php echo site_url('/extensions/FHC-Core-Personalverwaltung/Employees/person?person_id='.$employee->person_id); ?>">Gehalt</a>
        <a class="flex-sm-fill text-sm-center nav-link" href="<?php echo site_url('/extensions/FHC-Core-Personalverwaltung/Employees/person?person_id='.$employee->person_id); ?>">Zeiten</a>
        <a class="flex-sm-fill text-sm-center nav-link" href="<?php echo site_url('/extensions/FHC-Core-Personalverwaltung/Employees/person?person_id='.$employee->person_id); ?>">Life Cycle</a>
        <a class="flex-sm-fill text-sm-center nav-link" href="<?php echo site_url('/extensions/FHC-Core-Personalverwaltung/Employees/document?person_id='.$employee->person_id); ?>">Dokumente</a>
      </nav>

    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">      
      <employee-person :personid="<?php echo $employee->person_id ?>" ></employee-person>
    </main>
  </div>
</div>

</div> <!-- wrapper -->

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

