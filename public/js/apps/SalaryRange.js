import Phrasen from '../../../../js/plugins/Phrasen.js';
import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import ApiSearchbar from  '../../../../js/api/factory/searchbar.js';
import {searchbaroptions} from "./common.js";
import {SalaryRange} from '../components/salaryrange/SalaryRange.js';

const pvApp = Vue.createApp(	{
	name: 'PV21SalaryRange',
	components: {
		searchbar,			
		CoreNavigationCmpt,
		SalaryRange,
	},
	inject: ['$api', '$fhcAlert'],
	data() {
		return 	{
			searchbaroptions: searchbaroptions,
			searchfunction: (params) => this.$api.call(ApiSearchbar.search(params)),
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
pvApp.use(Phrasen);
pvApp.mount('#wrapper');


