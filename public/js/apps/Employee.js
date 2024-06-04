import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";
import pv21apifactory from "../api/vbform/api.js";
import {default as EmployeeHome} from "../components/employee/EmployeeHome.js";
import {default as EmployeeHomeRestricted} from "../components/employee/EmployeeHomeRestricted.js";
import {EmployeePerson} from "../components/employee/EmployeePerson.js";
import {EmployeeContract} from "../components/employee/contract/EmployeeContract.js";
import {EmployeeSummary } from "../components/employee/summary/EmployeeSummary.js";
import {EmployeeTime} from "../components/employee/time/EmployeeTime.js";
import { EmployeeLifeCycle } from "../components/employee/lifecycle/EmployeeLifeCycle.js";
import { EmployeeDocument } from "../components/employee/document/EmployeeDocument.js";
import {CoreRESTClient} from '../../../../js/RESTClient.js';
import Phrasen from '../../../../js/plugin/Phrasen.js';
import FhcAlert from '../../../../js/plugin/FhcAlert.js';
import * as typeDefinition from '../helpers/typeDefinition/loader.js';

Vue.$fhcapi = {...fhcapifactory, ...pv21apifactory};

var personSelectedRef = { callback: () => {}};

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

const router = VueRouter.createRouter(
	{
		history: VueRouter.createWebHistory(),
		routes: [
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees`, component: EmployeeHome }, // /index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/:id/:uid`, component: EmployeeHome,
				children: [					
					{ path: '', 
					  component: EmployeePerson, 
					  name: 'person',
					  props: route => ({ id: parseInt(route.params.id), uid: route.params.uid, restricted: false })  },
					{ path: 'contract', 
					  component: EmployeeContract,
					  props: route => ({ id: parseInt(route.params.id), uid: route.params.uid, restricted: false }) },
					{ path: 'contract/:dienstverhaeltnis_id', 
					  component: EmployeeContract,
					  props: route => ({ id: parseInt(route.params.id), uid: route.params.uid, dienstverhaeltnis_id: route.params.dienstverhaeltnis_id, restricted: false })		
					 },
					{ path: 'time', component: EmployeeTime, name: 'time' },
					{ path: 'lifecycle', component: EmployeeLifeCycle, name: 'lifecycle' },
					{ path: 'document', component: EmployeeDocument, name: 'document' },
					{ path: 'summary', component: EmployeeSummary, name: 'summary', props: route => ({ date: route.query.d })},
				]
		    },
			// restricted views
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/restricted/Employees`, component: EmployeeHomeRestricted }, 
			{ path: `/${ciPath}/extensions/FHC-Core-Personalverwaltung/restricted/Employees/:id/:uid`, component: EmployeeHomeRestricted,
				children: [					
					{ path: '', 
					  component: EmployeePerson, 
					  name: 'personRestricted', 
					  props: route => ({ id: parseInt(route.params.id), uid: route.params.uid, restricted: true }) 
					},
					{ path: 'contract', 
					  component: EmployeeContract,
					  props: route => ({ id: parseInt(route.params.id), uid: route.params.uid, restricted: true })
					},
					{ path: 'contract/:dienstverhaeltnis_id', 
					  component: EmployeeContract,
					  props: route => ({ id: parseInt(route.params.id), uid: route.params.uid, restricted: true })
					},					
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
		const karenztypen = Vue.ref([]);
        const teilzeittypen = Vue.ref([]);
		const vertragsarten = Vue.ref([]);
		const vertragsbestandteiltypen = Vue.ref([]);
		const freitexttypen = Vue.ref([]);
		const gehaltstypen = Vue.ref([]);
		const hourlyratetypes = Vue.ref([]);
		const unternehmen = Vue.ref([]);

		const currentDate = Vue.ref('2022-03-04');

		typeDefinition.fetchSprache().then((r) => {
			sprache.value = r;
		})

		typeDefinition.fetchNations().then((r) => {
			nations.value = r;
		})

		typeDefinition.fetchAusbildung().then((r) => {
			ausbildung.value = r;
		})

		typeDefinition.fetchOrte().then((r) => {
			orte.value = r;
		})

		typeDefinition.fetchStandorteIntern().then((r) => {
			standorte.value = r;
		})

		typeDefinition.fetchKontakttyp().then((r) => {
			kontakttyp.value = r;
		})

		typeDefinition.fetchAdressentyp().then((r) => {
			adressentyp.value = r;
		})

		typeDefinition.fetchSachaufwandTyp().then((r) => {
			sachaufwandtyp.value = r;
		})

		typeDefinition.fetchKarenztypen().then((r) => {
			karenztypen.value = r;
		})

		typeDefinition.fetchTeilzeittypen().then((r) => {
			teilzeittypen.value = r;
		})

		typeDefinition.fetchVertragsarten().then((r) => {
			vertragsarten.value = r;
		})

		typeDefinition.fetchGehaltstypen().then((r) => {
			gehaltstypen.value = r;
		})

		typeDefinition.fetchVertragsbestandteiltypen().then((r) => {
			vertragsbestandteiltypen.value = r;
		})

		typeDefinition.fetchFreitexttypen().then((r) => {
			freitexttypen.value = r;
		})

		typeDefinition.fetchHourlyratetypes().then((r) => {
			hourlyratetypes.value = r;
		})

		typeDefinition.fetchUnternehmen().then((r) => {
			unternehmen.value = r;
		})

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
		Vue.provide("cisRoot", CIS_ROOT)
	}
}).use(router);

pvApp.use(primevue.config.default);
pvApp.use(highchartsPlugin, {tagName: 'highcharts'});
pvApp.use(Phrasen);
pvApp.use(FhcAlert);
pvApp.mount('#wrapper');

