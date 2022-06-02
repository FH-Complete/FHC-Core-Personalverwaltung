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
      'customCSSs' => ['public/extensions/FHC-Core-Personalverwaltung/css/dashboard.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/personalverwaltung.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/EmployeeChooser.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/EmployeeHeader.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/verticalsplit.css',
                       'public/extensions/FHC-Core-Personalverwaltung/css/components/toast.css',
                      ],       
      'customJSs' => ['public/extensions/FHC-Core-Personalverwaltung/js/components/EmployeeChooser.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/Modal.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/ModalDialog.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/Toast.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/verticalsplit.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/Sidebar.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/EmployeeNav.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/BaseData.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/EmployeeData.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/BankData.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/contact/AddressData.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/contact/EmailTelData.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/contact/ContactData.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/EmployeeHeader.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/EmployeePerson.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/employee/EmployeeEditor.js',                      
                      'public/extensions/FHC-Core-Personalverwaltung/js/components/EmployeeTable.js',
                      'public/extensions/FHC-Core-Personalverwaltung/js/apps/Employee.js'],
      /*
      'vueSFCs' => [[
        "vendor" => "public/extensions/FHC-Core-Personalverwaltung/js/vendor.3239befe.js", 
				"js" => "public/extensions/FHC-Core-Personalverwaltung/js/index.ccd9a95a.js", 
				"css" => "public/extensions/FHC-Core-Personalverwaltung/css/index.c5353a60.css", ]]*/
		)
	);
?>

<script>

  
  var tableData = [
<?php 
  foreach ($employeeList as $value) {
    echo json_encode($value).",\n";
    //echo "{ID:'".$value->uid."', Name: '".$value->nachname.', Vorname: "'.$value->vorname.' '.$value->titelpre."', Course:'Computer Science', Gender:'Female', Age:'17'},\n";
  }

?>
   /* {ID:"01", Name: "Abiola Esther", Course:"Computer Science", Gender:"Female", Age:"17"},
    {ID:"02", Name: "Robert V. Kratz", Course:"Philosophy", Gender:"Male", Age:'19'},
    {ID:"03", Name: "Kristen Anderson", Course:"Economics", Gender:"Female", Age:'20'},
    {ID:"04", Name: "Adam Simon", Course:"Food science", Gender:"Male", Age:'21'},
    {ID:"05", Name: "Daisy Katherine", Course:"Business studies", Gender:"Female", Age:'22'}, */ 
  ];

</script>

<div id="wrapper">

  <header class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
    <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="#">FHComplete [PV21]</a>
    <button class="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div id="chooser" class=" form-control-dark w-100">
      <employee-chooser placeholder="MA suchen..."></employee-chooser>
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

      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-3">
                

          <verticalsplit id="macombined">
              <template #top>
                <employee-table id="employee-table" :minimized="isEditorOpen" @person-selected="personSelectedHandler" :fields="['uid','nachname','vorname','titelpre','telefonklappe','lektor','fixangestellt','lastupdate']"  :tabledata="tabledata"></employee-table>
              </template>
              <template #bottom>
                <employee-editor :personid="currentPersonID" :open="isEditorOpen" @close-editor="closeEditorHandler"></employee-editor>
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

