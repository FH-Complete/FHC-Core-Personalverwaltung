import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions, searchfunction } from "./common.js";

const pvApp = Vue.createApp(	{
	components: {
		searchbar,	
		Sidebar,
		PivotReport,
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
		closeEditorHandler() {
			this.isEditorOpen=false;
		},			
		newSideMenuEntryHandler: function(payload) {
			this.appSideMenuEntries = payload;
		}
	},
});

pvApp.use(primevue.config.default);
//pvApp.use(highchartsPlugin, {tagName: 'highcharts'});
//pvApp.use(primevue.toastservice);


pvApp.mount('#wrapper');


