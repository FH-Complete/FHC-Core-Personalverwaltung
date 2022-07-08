import searchbar from "../../../../js/components/searchbar/searchbar.js";
import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";

Vue.$fhcapi = fhcapifactory;

const pvApp = Vue.createApp(	{
	components: {
		Sidebar,	
		ContractCountCard,
		BirthdayCountCard,
		DeadlineIssueTable,
		searchbar,
	},
	setup() {

		let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	 

		const searchbaroptions = {
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
						//alert('person defaultaction ' + JSON.stringify(data)); 
						//window.location.href = data.profil;						
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
					  "action": function(data) { 						
						window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees?person_id=${data.person_id}`;
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

		const searchbaroptions2 = {
			"types": [
			  "raum",
			  "organisationunit"
			],
			"actions": {
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
	  

		const searchfunction = (searchsettings) =>  {
			return Vue.$fhcapi.Search.search(searchsettings);  
		}
		
		const searchfunctiondummy = (searchsettings) => {
			return Vue.$fhcapi.Search.searchdummy(searchsettings);  
		}

		Vue.onMounted(() => {
		})

		return {
			searchfunction, searchfunctiondummy, searchbaroptions, searchbaroptions2,
		}
	}
}).mount('#wrapper');
