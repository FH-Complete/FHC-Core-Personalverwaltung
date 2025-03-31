import FhcApi from '../../../../js/plugin/FhcApi.js';
import pv21apifactory from "../api/api.js";
import Phrasen from '../../../../js/plugin/Phrasen.js';
import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions} from "./common.js";
import {StaleEmployees} from '../components/bulk/StaleEmployees.js';

const pvApp = Vue.createApp(	{
	name: 'PV21Bulk',
	components: {
		searchbar,			
		CoreNavigationCmpt,
		StaleEmployees,
	},
	data() {
		return 	{
			searchbaroptions: searchbaroptions,
			searchfunction: this.$fhcApi.factory.search.search,
			appSideMenuEntries: {},
		}
	},
	methods: {		
		newSideMenuEntryHandler: function(payload) {
			this.appSideMenuEntries = payload;
		}
	},
});

pvApp.use(primevue.config.default);
pvApp.use(FhcApi, {factory: pv21apifactory});
pvApp.use(Phrasen);
pvApp.mount('#wrapper');


