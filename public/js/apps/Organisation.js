
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions, searchfunction } from "./common.js";

const pvApp = Vue.createApp(	{
	components: {	
		searchbar,	
		Sidebar,
		OrgChooser,
        OrgViewer,
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
	},
});

// 	pvApp.use(highchartsPlugin, {tagName: 'highcharts'});
pvApp.use(primevue.config.default);
pvApp.use(primevue.toastservice);


pvApp.mount('#wrapper');


