import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";
import pv21apifactory from "../api/api.js";
import FhcApi from '../../../../js/plugin/FhcApi.js';
import {CoreRESTClient} from '../../../../js/RESTClient.js';
import Phrasen from '../../../../js/plugin/Phrasen.js';
import FhcAlert from '../../../../js/plugin/FhcAlert.js';
//import * as typeDefinition from '../helpers/typeDefinition/loader.js';
import {ValorisationSelection} from "../components/bulk/ValorisationSelection.js";
import {ValorisationCheck} from "../components/bulk/ValorisationCheck.js";

Vue.$fhcapi = {...fhcapifactory, ...pv21apifactory};

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

const router = VueRouter.createRouter(
	{
		history: VueRouter.createWebHistory(),
		routes: [
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Valorisation`, component: ValorisationSelection },
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Valorisation/Check/:dienstverhaeltnis_id`, component: ValorisationCheck, props: true}
		],
	}
);

const valApp = Vue.createApp({
}).use(router);

valApp.use(primevue.config.default);
valApp.use(FhcApi, {factory: pv21apifactory});
valApp.use(Phrasen);
valApp.use(FhcAlert);
valApp.mount('#wrapper');

