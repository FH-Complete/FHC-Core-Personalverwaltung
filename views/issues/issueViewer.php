<?php
	$includesArray = array(
		'title' => 'Issue Viewer',
		'axios027' => true,
		'bootstrap5' => true,
		'fontawesome6' => true,
		'vue3' => true,
		'filtercomponent' => true,
		'navigationcomponent' => true,
		'tabulator6' => true,
		'phrases' => array(
			'global' => array('mailAnXversandt'),
			'ui' => array('bitteEintragWaehlen')
		),
		'customJSModules' => array('public/extensions/FHC-Core-Personalverwaltung/js/apps/IssueViewer.js')
	);

	$this->load->view('templates/FHC-Header', $includesArray);
?>

	<div id="main">
		<issue-viewer></issue-viewer>
	</div>

<?php $this->load->view('templates/FHC-Footer', $includesArray); ?>
