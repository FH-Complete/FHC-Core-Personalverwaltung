
import {CoreFilterCmpt} from '../../../../js/components/Filter.js';
import {CoreNavigationCmpt} from '../../../../js/components/Navigation.js';
import verticalsplit from "../../../../js/components/verticalsplit/verticalsplit.js";
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";

Vue.$fhcapi = fhcapifactory;

const pvApp = Vue.createApp(	{
	components: {
		Sidebar,
		CoreNavigationCmpt: CoreNavigationCmpt,
    	CoreFilterCmpt: CoreFilterCmpt,
		EmployeeEditor,
		EmployeeTable,
		verticalsplit,
		searchbar,
	},
	data() {
		return 	{
			tabledata: tableData,
			isEditorOpen: false,
			currentPersonID: null,	

			appSideMenuEntries: {},

			searchbaroptions: {
				"types": [
				  "person",
				  "raum",
				  "mitarbeiter",
				  "student",
				  "prestudent",
				  "document",
				  "cms",
				  "organisationunit"
				],
				"actions": {
					"person": {
						"defaultaction": {
						  "type": "link",
						  "action": function(data) { 
							return data.profil;
						  }
						},
						"childactions": [
							{
								"label": "testchildaction1",
								"icon": "fas fa-check-circle",
								"type": "function",
								"action": function(data) { 
									alert('person testchildaction 01 ' + JSON.stringify(data)); 
								}
							},
							{
								"label": "testchildaction2",
								"icon": "fas fa-file-csv",
								"type": "function",
								"action": function(data) { 
									alert('person testchildaction 02 ' + JSON.stringify(data)); 
								}
							}
						]
					},
					"raum": {
						"defaultaction": {
						  "type": "function",
						  "action": function(data) { 
							alert('raum defaultaction ' + JSON.stringify(data)); 
						  }
						},
						"childactions": [                      
						   {
								"label": "Rauminformation",
								"icon": "fas fa-info-circle",
								"type": "link",
								"action": function(data) { 
									return data.infolink;
								}
							},
							{
								"label": "Raumreservierung",
								"icon": "fas fa-bookmark",
								"type": "link",
								"action": function(data) { 
									return data.booklink;
								}
							}
						]
					},
					"employee": {
						"defaultaction": {
						  "type": "function",
						  "action": (data) =>  { 
								return this.personSelectedHandler(data.person_id);
						  }
						},
						"childactions": [
							{
								"label": "testchildaction1",
								"icon": "fas fa-address-book",
								"type": "function",
								"action": function(data) { 
									alert('employee testchildaction 01 ' + JSON.stringify(data)); 
								}
							},
							{
								"label": "testchildaction2",
								"icon": "fas fa-user-slash",
								"type": "function",
								"action": function(data) { 
									alert('employee testchildaction 02 ' + JSON.stringify(data)); 
								}
							},
							{
								"label": "testchildaction3",
								"icon": "fas fa-bell",
								"type": "function",
								"action": function(data) { 
									alert('employee testchildaction 03 ' + JSON.stringify(data)); 
								}
							},
							{
								"label": "testchildaction4",
								"icon": "fas fa-calculator",
								"type": "function",
								"action": function(data) { 
									alert('employee testchildaction 04 ' + JSON.stringify(data)); 
								}
							}
						]
					},
					"organisationunit": {
						"defaultaction": {
						  "type": "function",
						  "action": function(data) { 
							alert('organisationunit defaultaction ' + JSON.stringify(data)); 
						  }
						},
						"childactions": []
					}
				}
			}
		}
	},
	methods: {
		personSelectedHandler(id) {
			console.log('personSelected: ', id);
			this.isEditorOpen=true;
			this.currentPersonID = id;
			history.pushState({}, "", "/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees?person_id="+id);
		},
		closeEditorHandler() {
			this.isEditorOpen=false;
		},		
		newSideMenuEntryHandler: function(payload) {
			this.appSideMenuEntries = payload;
		},	
		searchfunction: function(searchsettings) {
			return Vue.$fhcapi.Search.search(searchsettings);  
		},
		searchfunctiondummy: function(searchsettings) {
			return Vue.$fhcapi.Search.searchdummy(searchsettings);  
		},
		selectRecordHandler(r) {
			this.personSelectedHandler(r.PersonId);
		}
	},
	mounted() {
		
		let params = new URLSearchParams(document.location.search);
		let person_id = params.get("person_id");
		console.log('EXMPLOYEE APP CREATED; person_id=',person_id);
		if (person_id != null) {
			this.personSelectedHandler(parseInt(person_id));
		}
	}
});

const protocol_host = location.protocol +	"//" +
			location.hostname +	":" + location.port; 

const fetchNations = async () => {
	try {
	  const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getNations`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  console.log(response.retval);	  
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchSachaufwandTyp = async () => {
	try {
	  const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getSachaufwandTyp`;
	  const res = await fetch(url)
	  let response = await res.json()              
	  console.log(response.retval);	  
	  return response.retval;
	} catch (error) {
		console.log(error)              
	}	
}

const fetchKontakttyp = async () => {
	try {
	  const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getKontakttyp`;
	  const res = await fetch(url)
	  let response = await res.json()              
	  console.log(response.retval);	  
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchSprache = async () => {
	try {
	  const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getSprache`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  console.log(response.retval);	  
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchAusbildung = async () => {
	try {
	  const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getAusbildung`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchStandorteIntern = async () => {
	try {
	  const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getStandorteIntern`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchOrte = async () => {
	try {
	  const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getOrte`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

fetchSprache().then((r) => {
	pvApp.provide("sprache",r.retval);
})

fetchNations().then((r) => {
	pvApp.provide("nations",r.retval);
})

fetchKontakttyp().then((r) => {
	pvApp.provide("kontakttyp",r.retval);
})

fetchAusbildung().then((r) => {
	pvApp.provide("ausbildung",r.retval);
})

fetchStandorteIntern().then((r) => {
	pvApp.provide("standorte",r.retval);
})

fetchOrte().then((r) => {
	pvApp.provide("orte",r.retval);
})

fetchSachaufwandTyp().then((r) => {
	pvApp.provide("sachaufwandtyp",r.retval);
})

pvApp.mount('#wrapper');


