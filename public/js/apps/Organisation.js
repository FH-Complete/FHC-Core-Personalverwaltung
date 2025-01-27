
import FhcApi from '../../../../js/plugin/FhcApi.js';
import pv21apifactory from "../api/api.js";
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions, searchfunction } from "./common.js";
import {OrgChooser} from "../components/organisation/OrgChooser.js";
import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';
import {OrgViewer} from '../components/organisation/OrgViewer.js';
import Phrasen from '../../../../js/plugin/Phrasen.js';

const pvApp = Vue.createApp(	{
	components: {	
		searchbar,	
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
			searchfunction: this.$fhcApi.factory.search.search,
			appSideMenuEntries: {},
			isCollapsed: true
		}
	},
	methods: {
		orgSelectedHandler(oeKurzbz) {
			console.log('org selected:', oeKurzbz);
			this.currentOrg = oeKurzbz;
		},
		expandAllHandler() {
			this.$refs.orgviewer.expandAll();
			this.isCollapsed = false;
		},
		collapseAllHandler() {
			this.$refs.orgviewer.collapseAll();
			this.isCollapsed = true;
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

//pvApp.use(highchartsPlugin, {tagName: 'highcharts'});
pvApp.use(primevue.config.default);
pvApp.use(FhcApi, {factory: pv21apifactory})
pvApp.use(Phrasen);
//pvApp.use(primevue.toastservice);


pvApp.mount('#wrapper');


