import { createApp, ref, provide } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import PrimeVue from 'primevue/config';
import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";
import pv21apifactory from "../api/vbform/api.js";
import {default as EmployeeHome} from "../components/employee/EmployeeHome.js";
import {EmployeePerson} from "../components/employee/EmployeePerson.js";
import {EmployeeContract} from "../components/employee/contract/EmployeeContract.js";
import {EmployeeSummary } from "../components/employee/summary/EmployeeSummary.js";
import {EmployeeTime} from "../components/employee/time/EmployeeTime.js";
import { EmployeeLifeCycle } from "../components/employee/lifecycle/EmployeeLifeCycle.js";
import { EmployeeDocument } from "../components/employee/document/EmployeeDocument.js";
import {CoreRESTClient} from '../../../../js/RESTClient.js';
import Phrasen from '../../../../js/plugin/Phrasen.js';
import FhcAlert from '../../../../js/plugin/FhcAlert.js';
import highchartsPlugin from '../highchartsVue.js';

import 'tabulator-tables/dist/css/tabulator_simple.min.css';

var personSelectedRef = { callback: () => {}};

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

const router = createRouter(
	{
		history: createWebHistory(),
		routes: [
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees`, component: EmployeeHome }, // /index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/:id/:uid`, component: EmployeeHome,
				children: [					
					{ path: '', component: EmployeePerson, name: 'person' },
					{ path: 'contract', component: EmployeeContract },
					{ path: 'contract/:dienstverhaeltnis_id', component: EmployeeContract },
					{ path: 'time', component: EmployeeTime, name: 'time' },
					{ path: 'lifecycle', component: EmployeeLifeCycle, name: 'lifecycle' },
					{ path: 'document', component: EmployeeDocument, name: 'document' },
					{ path: 'summary', component: EmployeeSummary, name: 'summary', props: route => ({ date: route.query.d })},
				]
		    },
		],
	}
);

Highcharts.setOptions({
	lang: {
		thousandsSep: '.',
		decimalPoint: ',',
		dateFormat: 'dd.mm.YYYY', 
	}
  })

const pvApp = createApp({
	setup() {

		// init shared data
		const sprache = ref([]);
		const nations = ref([]);
		const standorte = ref([]);
		const orte = ref([]);
		const ausbildung = ref([]);
		const kontakttyp = ref([]);
		const adressentyp = ref([]);
		const sachaufwandtyp  = ref([]);
		const karenztypen = ref([]);
        const teilzeittypen = ref([]);
		const vertragsarten = ref([]);
		const vertragsbestandteiltypen = ref([]);
		const freitexttypen = ref([]);
		const gehaltstypen = ref([]);
		const hourlyratetypes = ref([]);
		const unternehmen = ref([]);

		const currentDate = ref('2022-03-04');

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

		fetchKarenztypen().then((r) => {
			karenztypen.value = r;
		})

		fetchTeilzeittypen().then((r) => {
			teilzeittypen.value = r;
		})

		fetchVertragsarten().then((r) => {
			vertragsarten.value = r;
		})

		fetchGehaltstypen().then((r) => {
			gehaltstypen.value = r;
		})

		fetchVertragsbestandteiltypen().then((r) => {
			vertragsbestandteiltypen.value = r;
		})

		fetchFreitexttypen().then((r) => {
			freitexttypen.value = r;
		})

		fetchHourlyratetypes().then((r) => {
			hourlyratetypes.value = r;
		})

		fetchUnternehmen().then((r) => {
			unternehmen.value = r;
		})

		provide("sprache",sprache);
		provide("nations",nations);
		provide("standorte",standorte);
		provide("orte",orte);
		provide("ausbildung",ausbildung);
		provide("kontakttyp",kontakttyp);
		provide("adressentyp",adressentyp);
		provide("sachaufwandtyp",sachaufwandtyp);
		provide("karenztypen",karenztypen);
		provide("teilzeittypen",teilzeittypen);
		provide("vertragsarten",vertragsarten);
		provide("vertragsbestandteiltypen",vertragsbestandteiltypen);
		provide("gehaltstypen",gehaltstypen);
		provide("freitexttypen",freitexttypen);
		provide("hourlyratetypes",hourlyratetypes);
		provide("unternehmen",unternehmen);
                provide("fhcapi", {...fhcapifactory, ...pv21apifactory});
	}
}).use(router);

//pvApp.config.globalProperties.$fhcapi = {...fhcapifactory, ...pv21apifactory};

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
const fetchKarenztypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getKarenztypen');
	return CoreRESTClient.getData(res.data);
}
const fetchGehaltstypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getGehaltstypen');
	return CoreRESTClient.getData(res.data);
}
const fetchVertragsarten = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getVertragsarten');
	return CoreRESTClient.getData(res.data);
}
const fetchVertragsbestandteiltypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getVertragsbestandteiltypen');
	return CoreRESTClient.getData(res.data);
}
const fetchTeilzeittypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getTeilzeittypen');
	return CoreRESTClient.getData(res.data);
}
const fetchFreitexttypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getFreitexttypen');
	return CoreRESTClient.getData(res.data);
}

const fetchHourlyratetypes = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getStundensatztypen');
	return CoreRESTClient.getData(res.data);
}

const fetchUnternehmen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getUnternehmen');
	return CoreRESTClient.getData(res.data);
}

pvApp.use(PrimeVue);
pvApp.use(highchartsPlugin, {tagName: 'highcharts'});
pvApp.use(Phrasen);
pvApp.use(FhcAlert);
pvApp.mount('#wrapper');

