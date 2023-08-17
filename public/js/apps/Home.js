import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions, searchfunction } from "./common.js";
import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";

Vue.$fhcapi = fhcapifactory;

const pvApp = Vue.createApp(	{
	components: {
		CoreNavigationCmpt,	
		ContractCountCard,
		BirthdayCountCard,
		IssuesCountCard,
		DeadlineIssueTable,
		searchbar,
	},
	setup() {

		let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	 

		const appSideMenuEntries = Vue.ref({});

		const newSideMenuEntryHandler = (payload) => {
			appSideMenuEntries.value = payload;
		}

		Vue.onMounted(() => {
		})

		return {
			searchfunction, searchbaroptions, 
			appSideMenuEntries, newSideMenuEntryHandler,
		}
	}
}).mount('#wrapper');
