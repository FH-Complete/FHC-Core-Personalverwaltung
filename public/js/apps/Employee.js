
import {CoreFilterCmpt} from '../../../../js/components/filter/Filter.js';
import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';
import {CoreRESTClient} from '../../../../js/RESTClient.js';
import verticalsplit from "../../../../js/components/verticalsplit/verticalsplit.js";
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";
import EmployeeEditor from "../components/employee/EmployeeEditor.js";

Vue.$fhcapi = fhcapifactory;

var personSelectedRef = { callback: () => {}};

const pvApp = Vue.createApp(	{
	components: {
		Sidebar,
		CoreNavigationCmpt,
    	CoreFilterCmpt,
		EmployeeEditor,		
		verticalsplit,
		searchbar,
	},
	setup() {

		const isEditorOpen = Vue.ref(false);
		const currentPersonID = Vue.ref(null);
		const appSideMenuEntries = Vue.ref({});
		const verticalsplitRef = Vue.ref(null);

		const searchbaroptions = Vue.ref({
			types: [
			  "person",
			  "raum",
			  "mitarbeiter",
			  "student",
			  "prestudent",
			  "document",
			  "cms",
			  "organisationunit"
			],
			actions: {
				person: {
					defaultaction: {
					  type: "link",
					  action: function(data) { 
						return data.profil;
					  }
					},
					childactions: [
						{
							label: "testchildaction1",
							icon: "fas fa-check-circle",
							type: "function",
							action: function(data) { 
								alert('person testchildaction 01 ' + JSON.stringify(data)); 
							}
						},
						{
							label: "testchildaction2",
							icon: "fas fa-file-csv",
							type: "function",
							action: function(data) { 
								alert('person testchildaction 02 ' + JSON.stringify(data)); 
							}
						}
					]
				},
				raum: {
					defaultaction: {
					  type: "function",
					  action: function(data) { 
						alert('raum defaultaction ' + JSON.stringify(data)); 
					  }
					},
					childactions: [                      
					   {
							label: "Rauminformation",
							icon: "fas fa-info-circle",
							type: "link",
							action: function(data) { 
								return data.infolink;
							}
						},
						{
							label: "Raumreservierung",
							icon: "fas fa-bookmark",
							type: "link",
							action: function(data) { 
								return data.booklink;
							}
						}
					]
				},
				employee: {
					defaultaction: {
					  type: "function",
					  action: (data) =>  { 
							return personSelectedHandler(data.person_id);
					  }
					},
					childactions: [
						{
							label: "testchildaction1",
							icon: "fas fa-address-book",
							type: "function",
							action: function(data) { 
								alert('employee testchildaction 01 ' + JSON.stringify(data)); 
							}
						},
						{
							label: "testchildaction2",
							icon: "fas fa-user-slash",
							type: "function",
							action: function(data) { 
								alert('employee testchildaction 02 ' + JSON.stringify(data)); 
							}
						},
						{
							label: "testchildaction3",
							icon: "fas fa-bell",
							type: "function",
							action: function(data) { 
								alert('employee testchildaction 03 ' + JSON.stringify(data)); 
							}
						},
						{
							label: "testchildaction4",
							icon: "fas fa-calculator",
							type: "function",
							action: function(data) { 
								alert('employee testchildaction 04 ' + JSON.stringify(data)); 
							}
						}
					]
				},
				organisationunit: {
					defaultaction: {
					  type: "function",
					  action: function(data) { 
						alert('organisationunit defaultaction ' + JSON.stringify(data)); 
					  }
					},
					childactions: []
				}
			}
		});

		const personSelectedHandler = (id) => {
			console.log('personSelected: ', id);

			if (!isEditorOpen.value) {
				verticalsplitRef.value.showBoth();
				isEditorOpen.value=true;
			}

			currentPersonID.value = id;
			let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
			let url = `${full}/extensions/FHC-Core-Personalverwaltung/Employees?person_id=${id}`
			history.pushState({}, "", url);
		}

		personSelectedRef.callback = personSelectedHandler;

		const closeEditorHandler = () => {
			isEditorOpen.value=false;
		}
		
		const newSideMenuEntryHandler = (payload) => {
			appSideMenuEntries.value = payload;
		}	
		
		const searchfunction = (searchsettings) => {
			return Vue.$fhcapi.Search.search(searchsettings);  
		}

		const searchfunctiondummy = (searchsettings) => {
			return Vue.$fhcapi.Search.searchdummy(searchsettings);  
		}

		const selectRecordHandler = (e, row) => { // Tabulator handler for the rowClick event
			personSelectedHandler(row.getData().PersonId);
		}

		const employeesTabulatorEvents = [
			{
				event: "rowClick",
				handler: selectRecordHandler
			}
		];

		const employeesTabulatorOptions = {
			height: "100vh",
			layout: 'fitColumns',
			columns: [
				{title: "UID", field: "UID", headerFilter: true},
				{title: "Person ID", field: "PersonId", headerFilter: true},
				{title: "Personal nummer", field: "Personalnummer", headerFilter: true},
				{title: "Kurzbz", field: "Kurzbz", headerFilter: true},
				{title: "Vorname", field: "Vorname", headerFilter: true},
				{title: "Vornamen", field: "Vornamen", headerFilter: true},
				{title: "Nachname", field: "Nachname", headerFilter: true},
				{title: "Titel pre", field: "TitelPre", headerFilter: true},
				{title: "Titel post", field: "TitelPost", headerFilter: true},
				{title: "Alias", field: "Alias", headerFilter: true},
				{title: "Geburtsdatum", field: "Geburtsdatum", headerFilter: true},
				{title: "Aktiv", field: "Aktiv", headerFilter: true},
				{title: "Fixangestellt", field: "Fixangestellt", headerFilter: true},
				{title: "SVNR", field: "SVNR", headerFilter: true},
				{title: "Raum", field: "Raum", headerFilter: true},
				{title: "Geschlecht", field: "Geschlecht", headerFilter: true},
				{title: "DW", field: "DW", headerFilter: true},
				{title: "Oe kurzbz", field: "OeKurzbz", headerFilter: true},
				{title: "Oe parent", field: "OeParent", headerFilter: true},
				{title: "Oe bezeichnung", field: "OeBezeichnung", headerFilter: true},
				{title: "Oe typ", field: "OeTyp", headerFilter: true}
			]
		};

		Vue.onMounted(() => {
			let params = new URLSearchParams(document.location.search);
			let person_id = params.get("person_id");
			console.log('EMPLOYEE APP CREATED; person_id=',person_id);
			if (person_id != null) {
				currentPersonID.value = parseInt(person_id);
				personSelectedHandler(parseInt(person_id));
				isEditorOpen.value = true;
				verticalsplitRef.value.collapseTop();
			} else {
				verticalsplitRef.value.collapseBottom();
			}
		})

		return {
			personSelectedHandler,
			closeEditorHandler,
			newSideMenuEntryHandler,
			searchfunction,
			selectRecordHandler,
			searchfunctiondummy,

			isEditorOpen,
			currentPersonID,
			appSideMenuEntries,
			searchbaroptions,
			employeesTabulatorEvents,
			employeesTabulatorOptions,
			verticalsplitRef
		}

	},

});

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


