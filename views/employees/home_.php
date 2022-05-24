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
						<li class="active"> Übersicht</li>
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
						<a href="#" class="btn btn-default active">Überblick</a>
						<a href="<?php echo site_url('extensions/FHC-Core-Personalverwaltung/Employees/person'); ?>" class="btn btn-default">Person</a>
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

				<div class="col-lg-4">        
					
					<div class="panel panel-default">
					<div class="panel-heading"><b>Dienstverhältnis</b><br><small>Letztes DV, Funktion & Gehalt</small></div>
					<div class="panel-body">
						<div class="table-responsive">
							<table class="table table-bordered table-hover tablesorter">
								
								<tbody>
									<tr>
										<td>Art DV</td>
										<td>unbefristet</td>
									</tr>
									
									<tr>
										<td>Eintrittsdatum</td>
										<td>1.5.2015</td>
									</tr>
									<tr>
										<td>Beginn DV</td>
										<td>1.5.2017</td>
									</tr>
									<tr>
										<td>Funktion</td>
										<td>StudiengangsleiterIn</td>
									</tr>
									<tr>
										<td>Grundgehalt</td>
										<td>5.470,11</td>
									</tr>
									

								</tbody>
							</table>
						</div>
					</div>
					</div>
					
				</div>				

				<div class="col-lg-4">        
					
					<div class="panel panel-default">
					<div class="panel-heading"><b>COVID Zertifikat</b><br><small>Nachweis über COVID Status</small></div>
					<div class="panel-body">
						Gültig bis 15.7.2022
					</div>
					</div>
					<div class="panel panel-info">
					<div class="panel-heading"><b>Home Office</b><br><small>Jänner 2022</small></div>
					<div class="panel-body">
					<div class="table-responsive">
									<table class="table table-bordered table-hover table-striped tablesorter">
										<thead>
										<tr>
											<th>Datum <i class="fa fa-sort"></i></th>
											<th>Zeit <i class="fa fa-sort"></i></th>
											
										</tr>
										</thead>
										<tbody>
											<tr>
												<td>12.1.2022</td>
												<td>6h</td>																							
											</tr>
											<tr>
												<td>19.1.2022</td>
												<td>6h</td>	
											</tr>
											<tr>
												<td>26.1.2022</td>
												<td>6h</td>	
											</tr>
											

										</tbody>
									</table>
								</div>
					</div>
					<div class="panel-footer">Export</div>
					</div>
				</div>

				<div class="col-lg-4">        
					
					<div class="panel panel-info">
						<div class="panel-heading"><b>Lehre</b><br><small>Gesamtstunden SS2022</small></div>
						<div class="panel-body">

								<div class="table-responsive">
									<table class="table table-bordered table-hover table-striped tablesorter">
										<thead>
										<tr>
											<th>Semester</th>
											<th>Stg</th>
											<th>SWS</th>
											<th>LV</th>
										</tr>
										</thead>
										<tbody>
											<tr>
												<td>WS2021</td>
												<td>BIF</td>
												<td>0,60</td>
												<td>113979 Wissenschaftliche Projektbegleitung (BE)
											</tr>
											
											<tr>
												<td>WS2021</td>
												<td>BIF</td>
												<td>0,60</td>
												<td>113979 Wissenschaftliche Projektbegleitung (EXAM)
											</tr>
										</tbody>
									</table>
								</div>
						</div>
					</div>
					<div class="panel panel-info">
						<div class="panel-heading"><b>Urlaub/Krankenstand</b><br><small>2022</small></div>
						<div class="panel-body">
							
								<div class="table-responsive">
									<table class="table table-bordered table-hover table-striped tablesorter">
										<thead>
										<tr>
											<th>Von <i class="fa fa-sort"></i></th>
											<th>Bis <i class="fa fa-sort"></i></th>
											<th>Bezeichnung <i class="fa fa-sort"></i></th>
											
										</tr>
										</thead>
										<tbody>
											<tr>
												<td>31.1.2022</td>
												<td>5.2.2022</td>
												<td>Krankenstand</td>
												
											</tr>
											<tr>
												<td>10.6.2022</td>
												<td>24.6.2022</td>
												<td>Urlaub</td>
												
											</tr>
											

										</tbody>
									</table>
								</div>


						</div>
						<a href="#">
						<div class="panel-footer announcement-bottom">
						<div class="row">
							<div class="col-xs-6">
							Export
							</div>
							<div class="col-xs-6 text-right">
							<i class="fa fa-arrow-circle-right"></i>
							</div>
						</div>
						</div>
					</a>
					</div>
				</div>

			</div>

			

		
	</div>
</body>

<?php $this->load->view('templates/FHC-Footer'); ?>

