import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';
import ApiSearchbar from  '../../../../js/api/factory/searchbar.js';
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions} from "./common.js";
import Phrasen from '../../../../js/plugin/Phrasen.js';

const pvApp = Vue.createApp(	{
	name: 'PV21Report',
	components: {
		searchbar,	
		Sidebar,
		PivotReport,
		CoreNavigationCmpt,
	},
	inject: ['$api', '$fhcAlert'],
	data() {
		return 	{
			isEditorOpen: false,
			currentPersonID: null,	
			currentOrg: '',
			searchbaroptions: searchbaroptions,
			searchfunction: (params) => this.$api.call(ApiSearchbar.search(params)),
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
pvApp.use(Phrasen);
//pvApp.use(highchartsPlugin, {tagName: 'highcharts'});
//pvApp.use(primevue.toastservice);


pvApp.mount('#wrapper');


