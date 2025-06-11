import {default as EmployeeHome} from "../components/employee/EmployeeHome.js";
import {EmployeePerson} from "../components/employee/EmployeePerson.js";
import {EmployeeContract} from "../components/employee/contract/EmployeeContract.js";
import {EmployeeSummary } from "../components/employee/summary/EmployeeSummary.js";
import {EmployeeTime} from "../components/employee/time/EmployeeTime.js";
import { EmployeeLifeCycle } from "../components/employee/lifecycle/EmployeeLifeCycle.js";
import { EmployeeDocument } from "../components/employee/document/EmployeeDocument.js";
import Phrasen from '../../../../js/plugins/Phrasen.js';
import FhcAlert from '../../../../js/plugins/FhcAlert.js';
import * as typeDefinition from '../helpers/typeDefinition/loader.js';
import {ValorisationCheck} from "../components/bulk/ValorisationCheck.js";
import ApiCommon from '../api/factory/common.js';
import ApiDV from  '../api/factory/dv.js';

var personSelectedRef = { callback: () => {}};

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

const router = VueRouter.createRouter(
	{
		history: VueRouter.createWebHistory(),
		routes: [
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees`, component: EmployeeHome }, // /index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/:id/:uid`, component: EmployeeHome, name: 'Employee',
				children: [					
					{ path: '', 
					  component: EmployeePerson, 
					  name: 'person',
					  props: route => ({ id: parseInt(route.params.id), uid: route.params.uid })  },
					{ path: 'contract',
					  component: EmployeeContract,
					  props: route => ({ id: parseInt(route.params.id), uid: route.params.uid, openhistory: location.href.indexOf("#dvhistory") != -1}) },
					{ path: 'contract/:dienstverhaeltnis_id',
					  component: EmployeeContract,
					  props: route => ({ id: parseInt(route.params.id), uid: route.params.uid, dienstverhaeltnis_id: parseInt(route.params.dienstverhaeltnis_id) })
					 },
					{ path: 'time', component: EmployeeTime, name: 'time' },
					{ path: 'lifecycle', component: EmployeeLifeCycle, name: 'lifecycle' },
					{ path: 'document', component: EmployeeDocument, name: 'document' },
					{ path: 'summary', component: EmployeeSummary, name: 'summary', props: route => ({ date: route.query.d })},
				]
		    },
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Valorisation/Check/:dienstverhaeltnis_id`, component: ValorisationCheck, props: route => ({ dienstverhaeltnis_id: parseInt(route.params.dienstverhaeltnis_id) })}
		],
	}
);

Highcharts.setOptions({
	lang: {
		thousandsSep: '.',
		decimalPoint: ',',
		dateFormat: 'dd.mm.YYYY'
	}
  })

const sprache = Vue.ref([]);
const nations = Vue.ref([]);
const standorte = Vue.ref([]);
const orte = Vue.ref([]);
const ausbildung = Vue.ref([]);
const kontakttyp = Vue.ref([]);
const adressentyp = Vue.ref([]);
const sachaufwandtyp  = Vue.ref([]);
const karenztypen = Vue.ref([]);
const teilzeittypen = Vue.ref([]);
const vertragsarten = Vue.ref([]);
const vertragsbestandteiltypen = Vue.ref([]);
const freitexttypen = Vue.ref([]);
const gehaltstypen = Vue.ref([]);
const hourlyratetypes = Vue.ref([]);
const unternehmen = Vue.ref([]);
const beendigungsgruende = Vue.ref([]);

const pvApp = Vue.createApp({
	name: 'PV21Employee',
	setup() {
		// init shared data
		

		Vue.provide("sprache",sprache);
		Vue.provide("nations",nations);
		Vue.provide("standorte",standorte);
		Vue.provide("orte",orte);
		Vue.provide("ausbildung",ausbildung);
		Vue.provide("kontakttyp",kontakttyp);
		Vue.provide("adressentyp",adressentyp);
		Vue.provide("sachaufwandtyp",sachaufwandtyp);
		Vue.provide("karenztypen",karenztypen);
		Vue.provide("teilzeittypen",teilzeittypen);
		Vue.provide("vertragsarten",vertragsarten);
		Vue.provide("vertragsbestandteiltypen",vertragsbestandteiltypen);
		Vue.provide("gehaltstypen",gehaltstypen);
		Vue.provide("freitexttypen",freitexttypen);
		Vue.provide("hourlyratetypes",hourlyratetypes);
		Vue.provide("unternehmen",unternehmen);
		Vue.provide('beendigungsgruende',beendigungsgruende);
	}
}).use(router);


pvApp.use(primevue.config.default);
pvApp.use(highchartsPlugin, {tagName: 'highcharts'});
pvApp.use(Phrasen);
pvApp.use(FhcAlert);
pvApp.mount('#wrapper');

pvApp.config.globalProperties.$api.call(ApiCommon.getSprache()).then((r) => {
	sprache.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getNations()).then((r) => {
	nations.value = r.data
})

pvApp.config.globalProperties.$api.call(ApiCommon.getAusbildung()).then((r) => {
	ausbildung.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getOrte()).then((r) => {
	orte.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getStandorteIntern()).then((r) => {
	standorte.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getKontakttyp()).then((r) => {
	kontakttyp.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getAdressentyp()).then((r) => {
	adressentyp.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getSachaufwandTyp()).then((r) => {
	sachaufwandtyp.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getKarenztypen()).then((r) => {
	karenztypen.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getTeilzeittypen()).then((r) => {
	teilzeittypen.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getVertragsarten()).then((r) => {
	vertragsarten.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getGehaltstypen()).then((r) => {
	gehaltstypen.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getVertragsbestandteiltypen()).then((r) => {
	vertragsbestandteiltypen.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getFreitexttypen()).then((r) => {
	freitexttypen.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiCommon.getStundensatztypen()).then((r) => {
	hourlyratetypes.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiDV.getUnternehmen()).then((r) => {
	unternehmen.value = r.data
})
pvApp.config.globalProperties.$api.call(ApiDV.getDvEndeGruende()).then((r) => {
	beendigungsgruende.value = r.data
}) 



