<?php
	$this->load->view(
		'templates/FHC-Header',
		array(
			'title' => 'Personalverwaltung',
			'jquery' => true,
			'jqueryui' => true,
			'bootstrap' => true,
			'fontawesome' => true,
			'sbadmintemplate' => true,
			'ajaxlib' => true,
			'navigationwidget' => true,
			'customCSSs' => 'public/extensions/FHC-Core-Personalverwaltung/css/personalverwaltung.css'
		)
	);
?>

<body>
	<div id="wrapper">

		<?php echo $this->widgetlib->widget('NavigationWidget'); ?>

		<div id="page-wrapper">
			<br/>
			<!--div class="row">
				<div class="col-lg-12">					
					<div class="alert alert-success alert-dismissable">
					<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
					Willkommen bei <a class="alert-link" href="#">PV21</a>! Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
					</div>
				</div>
			</div--><!-- /.row -->

			<div class="row">
				<div class="col-lg-4">
					<ol class="breadcrumb">
						<li><i class="fa fa-users"></i> Mitarbeiter</li>
						<li class="active"> Person</li>
					</ol>
					
				</div>
				<div class="col-lg-4">
					<div class="form-group input-group">
						<input type="text" class="form-control">
						<span class="input-group-btn">
						<button class="btn btn-default" type="button"><i class="fa fa-search"></i></button>
						</span>
					</div>
				</div>

				<div class="col-lg-4">

					<ul class="nav navbar-nav navbar-right navbar-user">
						
						
						<li class="dropdown user-dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-star-o"></i> Häufige Aktionen <b class="caret"></b></a>
						<ul class="dropdown-menu">
							<li><a href="#"><i class="fa fa-user"></i> Anlegen</a></li>
							<li><a href="#"><i class="fa fa-gear"></i> Umstufen</a></li>
							<li><a href="#"><i class="fa fa-table"></i> FH <span class="badge">307</span></a></li>
							<li><a href="#"><i class="fa fa-table"></i> GmbH <span class="badge">107</span></a></li>
											
						</ul>
						</li>
					</ul>


				</div>

			</div>

			<div class="row">
				<div class="col-lg-12" >
					<p>
						<button type="button" class="btn btn-default btn-lg btn-block">Alle MitarbeiterInnen</button>
					</p>
				</div>
			</div>

			<div class="row">
				<div class="col-lg-1" style="padding-right:0;">
							<a href="#" class="btn btn-primary btn-circle btn-lg" style="font-size:20px;font-weight:bold;margin-left:10px">
                                +
                             </a>	


				</div>
				<div class="col-lg-9" style="padding-left:0;padding-right:0">
							<h4 style="margin-bottom:0px;">Mustermann, Max Dipl. Ing.</h4>
							Studiengangsleiter
				</div>
				<div class="col-lg-2" style="padding-left:0;text-align:right;">
							<h3>PNr 88786</h3>
							
				</div>
			</div>
			<br>

			<div class="row">
				<div class="col-lg-12">
					<div class="btn-group btn-group-justified">
						<a href="<?php echo site_url('extensions/FHC-Core-Personalverwaltung/Employees'); ?>" class="btn btn-default">Überblick</a>
						<a href="<?php echo site_url('extensions/FHC-Core-Personalverwaltung/Employees/person'); ?>" class="btn btn-default active">Person</a>
						<a href="<?php echo site_url('extensions/FHC-Core-Personalverwaltung/Employees/contract'); ?>" class="btn btn-default">Verträge</a>
						<a href="<?php echo site_url('extensions/FHC-Core-Personalverwaltung/Employees/salary'); ?>" class="btn btn-default">Gehalt</a>
						<a href="#" class="btn btn-default">Zeiten</a>
						<a href="#" class="btn btn-default">Life Cycle</a>
						<a href="#" class="btn btn-default">Dokumente</a>
					</div>

				</div>

			</div>
			<br/>


			<div class="row">

				<div class="col-lg-2">        
					
					<div class="bs-example">
						<div class="list-group">
							<a href="#" class="list-group-item active">
							Stammdaten
							</a>
							<a href="#" class="list-group-item">Mitarbeiterdaten
							</a>
							<a href="#" class="list-group-item">Kontaktdaten
							</a>
							<a href="#" class="list-group-item">Bankdaten
							</a>
						</div>
					</div>
					
				</div>				

				<div class="col-lg-3">        
					<form role="form">
						<div class="form-group">
							<label>Person-ID</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Anrede</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Nachname*</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Geschlecht</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Staatsbürgerschaft*</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Familienstand</label>
							<input class="form-control" placeholder="Enter text">
						</div>

					</form>
					
				</div>

				<div class="col-lg-3">        
					
						<div class="form-group">
							<label>Ersatzkennzeichen</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Titel Pre</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Vorname</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>SVNR</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Geburtsnation</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Anzahl Kinder</label>
							<input class="form-control" placeholder="Enter text">
						</div>

				</div>

				<div class="col-lg-3">        
					
						<div class="form-group">
							<label>Titel Post</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Vornamen</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Geburtstag</label>
							<input class="form-control" placeholder="Enter text">
						</div>

						<div class="form-group">
							<label>Sprache</label>
							<input class="form-control" placeholder="Enter text">
						</div>

				</div>

			</div>

			

		
	</div>
</body>

<?php $this->load->view('templates/FHC-Footer'); ?>

