import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";
import {default as EmployeeHome} from "../components/employee/EmployeeHome.js";
import {EmployeePerson} from "../components/employee/EmployeePerson.js";
import {EmployeeContract} from "../components/employee/contract/EmployeeContract.js";
import {EmployeeSummary } from "../components/employee/summary/EmployeeSummary.js";
import {CoreRESTClient} from '../../../../js/RESTClient.js';

Vue.$fhcapi = fhcapifactory;

var personSelectedRef = { callback: () => {}};

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

const router = VueRouter.createRouter(
	{
		history: VueRouter.createWebHistory(),
		routes: [
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees`, component: EmployeeHome }, // /index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/:id`, component: EmployeeHome,
				children: [					
					{ path: '', component: EmployeePerson, name: 'person' },
					{ path: 'contract', component: EmployeeContract },
					{ path: 'salary', component: EmployeeContract, name: 'salary' },
					{ path: 'summary', component: EmployeeSummary, name: 'summary'},
				]
		    },
		],
	}
);

const pvApp = Vue.createApp({
	setup() {

		// init shared data
		const sprache = Vue.ref([]);
		const nations = Vue.ref([]);
		const standorte = Vue.ref([]);
		const orte = Vue.ref([]);
		const ausbildung = Vue.ref([]);
		const kontakttyp = Vue.ref([]);
		const adressentyp = Vue.ref([]);
		const sachaufwandtyp  = Vue.ref([]);

		Vue.provide("sprache",sprache);
		Vue.provide("nations",nations);
		Vue.provide("standorte",standorte);
		Vue.provide("orte",orte);
		Vue.provide("ausbildung",ausbildung);
		Vue.provide("kontakttyp",kontakttyp);
		Vue.provide("adressentyp",adressentyp);
		Vue.provide("sachaufwandtyp",sachaufwandtyp);

		fetchSprache().then((r) => {
			sprache.value = r;
		})

		fetchNations().then((r) => {
			nations.value = r;
		})

		fetchAusbildung().then((r) => {
			ausbildung.value = r;
		})

		fetchOrte().then((r) => {
			orte.value = r;
		})

		fetchStandorteIntern().then((r) => {
			standorte.value = r;
		})


		fetchKontakttyp().then((r) => {
			kontakttyp.value = r;
		})

		fetchAdressentyp().then((r) => {
			adressentyp.value = r;
		})

		fetchSachaufwandTyp().then((r) => {
			sachaufwandtyp.value = r;
		})

	}
}).use(router);

const fetchNations = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getNations');
	return CoreRESTClient.getData(res.data);
}

const fetchSachaufwandTyp = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getSachaufwandtyp');
	return CoreRESTClient.getData(res.data);
}

const fetchKontakttyp = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getKontakttyp');
	return CoreRESTClient.getData(res.data);
}

const fetchAdressentyp = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getAdressentyp');
	return CoreRESTClient.getData(res.data);
}

const fetchSprache = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getSprache');
	return CoreRESTClient.getData(res.data);
}

const fetchAusbildung = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getAusbildung');
	return CoreRESTClient.getData(res.data);
}

const fetchStandorteIntern = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getStandorteIntern');
	return CoreRESTClient.getData(res.data);
}

const fetchOrte = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getOrte');
	return CoreRESTClient.getData(res.data);
}

pvApp.mount('#wrapper');
