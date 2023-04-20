<?php
	$includesArray = array(
		'title' => 'Issue Viewer',
		'axios027' => true,
		'bootstrap5' => true,
		'fontawesome6' => true,
		'vue3' => true,
		'filtercomponent' => true,
		'navigationcomponent' => true,
		'tabulator5' => true,
		//~ 'phrases' => array(
			//~ 'global' => array('mailAnXversandt'),
			//~ 'ui' => array('bitteEintragWaehlen')
		//~ ),
		'customJSModules' => array('public/extensions/FHC-Core-Personalverwaltung/js/apps/IssueViewer.js')
	);

	$this->load->view('templates/FHC-Header', $includesArray);
?>

	<div id="main">

		<!-- Navigation component -->
		<core-navigation-cmpt v-bind:add-side-menu-entries="appSideMenuEntries"></core-navigation-cmpt>

		<div id="content">
			<div>
				<!-- Filter component -->
				<core-filter-cmpt
					title="Issue Viewer"
					filter-type="IssueViewer"
					:tabulator-options="issueViewerTabulatorOptions"
					:tabulator-events="issueViewerTabulatorEventHandlers"
					@nw-new-entry="newSideMenuEntryHandler"
>
				</core-filter-cmpt>
			</div>
		</div>
	</div>

<?php $this->load->view('templates/FHC-Footer', $includesArray); ?>
