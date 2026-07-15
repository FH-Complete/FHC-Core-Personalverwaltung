import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import ApiSearchbar from  '../../../../js/api/factory/searchbar.js';
import {searchbaroptions} from "./common.js";
import Phrasen from '../../../../js/plugins/Phrasen.js';
import { DeadlineIssueTable } from '../components/home/DeadlineIssueTable.js';
import { BirthdayCountCard } from '../components/home/BirthdayCountCard.js';
import { ContractCountCard } from '../components/home/ContractsCountCard.js';
import { IssuesCountCard } from '../components/home/IssuesCountCard.js';

const pvApp = Vue.createApp(	{
	name: 'PV21Home',
	components: {
		CoreNavigationCmpt,	
		ContractCountCard,
		BirthdayCountCard,
		IssuesCountCard,
		DeadlineIssueTable,
		searchbar,
	},
	setup() {
		const $api = Vue.inject('$api');
		const searchfunction = (params) => $api.call(ApiSearchbar.search(params));
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
pvApp.use(Phrasen);
pvApp.mount('#wrapper');