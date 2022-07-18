
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions, searchfunction } from "./common.js";

const pvApp = Vue.createApp(	{
	components: {
		searchbar,	
		Sidebar,
		PivotReport,

	},
	data() {
		return 	{
			isEditorOpen: false,
			currentPersonID: null,	
			currentOrg: '',
			searchbaroptions: searchbaroptions,
			searchfunction: searchfunction,
		}
	},
	methods: {		
		closeEditorHandler() {
			this.isEditorOpen=false;
		},			
	},
});

// 	pvApp.use(highchartsPlugin, {tagName: 'highcharts'});
pvApp.use(primevue.config.default);
pvApp.use(primevue.toastservice);


pvApp.mount('#wrapper');


