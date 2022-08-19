
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions, searchfunction } from "./common.js";
import {OrgChooser} from "../components/organisation/OrgChooser.js";
import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';

const pvApp = Vue.createApp(	{
	components: {	
		searchbar,	
		Sidebar,
		OrgChooser,
        OrgViewer,
		CoreNavigationCmpt,
	},
	data() {
		return 	{
			isEditorOpen: false,
			currentPersonID: null,	
			currentOrg: '',
			searchbaroptions: searchbaroptions,
			searchfunction: searchfunction,
			appSideMenuEntries: {},
		}
	},
	methods: {
		orgSelectedHandler(oeKurzbz) {
			console.log('org selected:', oeKurzbz);
			this.currentOrg = oeKurzbz;
		},
		expandAllHandler() {
			this.$refs.orgviewer.expandAll();
		},
		collapseAllHandler() {
			this.$refs.orgviewer.collapseAll();
		},
		personSelectedHandler(id) {
			console.log('personSelected: ', id);
			this.isEditorOpen=true;
			this.currentPersonID = id;
		},
		closeEditorHandler() {
			this.isEditorOpen=false;
		},
		newSideMenuEntryHandler: function(payload) {
			this.appSideMenuEntries = payload;
		}			
	},
});

// 	pvApp.use(highchartsPlugin, {tagName: 'highcharts'});
pvApp.use(primevue.config.default);
pvApp.use(primevue.toastservice);


pvApp.mount('#wrapper');


