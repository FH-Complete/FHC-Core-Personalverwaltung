import Phrasen from '../../../../js/plugins/Phrasen.js';
import FhcAlert from '../../../../js/plugins/FhcAlert.js';
//import * as typeDefinition from '../helpers/typeDefinition/loader.js';
import {ValorisationSelection} from "../components/bulk/ValorisationSelection.js";
import {ValorisationCheck} from "../components/bulk/ValorisationCheck.js";

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

const router = VueRouter.createRouter(
	{
		history: VueRouter.createWebHistory(),
		routes: [
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Valorisation`, component: ValorisationSelection },
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Valorisation/Check/:dienstverhaeltnis_id`, component: ValorisationCheck, props: route => ({ dienstverhaeltnis_id: parseInt(route.params.dienstverhaeltnis_id) })}
		],
	}
);

const valApp = Vue.createApp({
	name: 'PV21Valorisation'
}).use(router);

valApp.use(primevue.config.default);
valApp.use(Phrasen);
valApp.use(FhcAlert);
valApp.mount('#wrapper');

