import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";
import {default as EmployeeHome} from "../components/employee/EmployeeHome.js";
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
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/:id`, component: EmployeeHome },
		],
	}
);

const pvApp = Vue.createApp({}).use(router);

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

fetchSprache().then((r) => {
	pvApp.provide("sprache",r);
})

fetchNations().then((r) => {
	pvApp.provide("nations",r);
})

fetchKontakttyp().then((r) => {
	pvApp.provide("kontakttyp",r);
})


fetchAusbildung().then((r) => {
	console.log('Ausbildung fetched');
	pvApp.provide("ausbildung",r);
})

fetchStandorteIntern().then((r) => {
	pvApp.provide("standorte",r);
})

fetchOrte().then((r) => {
	pvApp.provide("orte",r);
})

fetchSachaufwandTyp().then((r) => {
	pvApp.provide("sachaufwandtyp",r);
})


pvApp.mount('#wrapper');


