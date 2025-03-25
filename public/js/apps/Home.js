import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions} from "./common.js";
import pv21apifactory from "../api/api.js";
import FhcApi from '../../../../js/plugin/FhcApi.js';
import Phrasen from '../../../../js/plugin/Phrasen.js';
import { DeadlineIssueTable } from '../components/home/DeadlineIssueTable.js';

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
		const $fhcApi = Vue.inject('$fhcApi');
		const searchfunction = $fhcApi.factory.search.search;
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
});

pvApp.use(primevue.config.default);
pvApp.use(FhcApi, {factory: pv21apifactory})
pvApp.use(Phrasen);
pvApp.mount('#wrapper');