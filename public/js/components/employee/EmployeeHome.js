import {CoreFilterCmpt} from '../../../../../js/components/filter/Filter.js';
import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';

import verticalsplit from "../../../../../js/components/verticalsplit/verticalsplit.js";
import searchbar from "../../../../../js/components/searchbar/searchbar.js";
import fhcapifactory from "../../../../../js/apps/api/fhcapifactory.js";
import EmployeeEditor from "./EmployeeEditor.js";

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

export default {
    components: {
		Sidebar,
		CoreNavigationCmpt,
    	CoreFilterCmpt,
		EmployeeEditor,		
		verticalsplit,
		searchbar,
	},
    setup() {

		const router = VueRouter.useRouter();
    	const route = VueRouter.useRoute();

		const isEditorOpen = Vue.ref(false);
		const currentPersonID = Vue.ref(null);
		const currentPersonUID = Vue.ref(null);
		const appSideMenuEntries = Vue.ref({});
		const verticalsplitRef = Vue.ref(null);

		Vue.watch(
			() => route.params,
			params => {
				currentPersonID.value = params.id;
				currentPersonUID.value = params.uid;	
				console.log('*** EmployeeHome params changed', currentPersonID.value);
			}
		)

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

		const personSelectedHandler = (id, uid) => {
			console.log('personSelected: ', id);

			if (verticalsplitRef.value.isCollapsed() == 'bottom') {
				verticalsplitRef.value.showBoth();
				//isEditorOpen.value=true;
			}

			let url = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/${id}/${uid}`
			router.push(url);
		}

		//personSelectedRef.callback = personSelectedHandler;

		const closeEditorHandler = () => {
			//isEditorOpen.value=false;
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
			personSelectedHandler(row.getData().PersonId, row.getData().UID);
		}

		const employeesTabulatorEvents = [
			{
				event: "rowClick",
				handler: selectRecordHandler
			}
		];

		const sexformatter = function(cell, formatterParams, onRendered) {
			var value = cell.getValue();
			if( value === 'm') {
				return 'männlich';
			} else if( value === 'w' ) {
				return 'weiblich';
			} else if( value === 'x' ) {
				return 'divers';
			} else if( value === 'u' ) {
				return 'unbekannt';
			} else {
				return value;
			}
		};

		const employeesTabulatorOptions = {
			maxHeight: "100%",
			minHeight: 50,
			layout: 'fitColumns',
			columns: [
				{title: "UID", field: "UID", headerFilter: true},
				{title: "Person ID", field: "PersonId", headerFilter: true},
				{title: "Personalnummer", field: "Personalnummer", headerFilter: true},
				{title: "Vorname", field: "Vorname", headerFilter: true},
				{title: "Nachname", field: "Nachname", headerFilter: true},
				{title: "Titel pre", field: "TitelPre", headerFilter: true},
				{title: "Titel post", field: "TitelPost", headerFilter: true},
				{title: "Alias", field: "Alias", headerFilter: true},
				{title: "Geburtsdatum", field: "Geburtsdatum", headerFilter: true},
				{title: "Aktiv", field: "Aktiv", formatter:"tickCross",  headerFilter:"tickCross", headerFilterParams:{"tristate":true,elementAttributes:{"value":"true"}}, headerFilterEmptyCheck:function(value){return value === null}},
				{title: "Fixangestellt", field: "Fixangestellt", headerFilter: true},
				{title: "SVNR", field: "SVNR", headerFilter: true},
				{title: "Raum", field: "Raum", headerFilter: "list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"}},
				{title: "Geschlecht", field: "Geschlecht", formatter:sexformatter, headerFilter: "list", headerFilterParams: {values:{'m':'männlich','w':'weiblich','x':'divers','u':'unbekannt'}, autocomplete: true, sort: "asc"}},
				{title: "DW", field: "Durchwahl", headerFilter: true},
				{title: "Standardkostenstelle", field: "Standardkostenstelle", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}}, 
				{title: "Disziplinäre Zuordnung", field: "Disziplinäre Zuordnung", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}},
			]
		};

		Vue.onMounted(() => {
			let person_id = route.params.id;
			let person_uid = route.params.uid;
			console.log('EMPLOYEE APP CREATED; person_id=',person_id);
			if (person_id != null) {
				currentPersonID.value = parseInt(person_id);
				currentPersonUID.value = person_uid;
				//personSelectedHandler(parseInt(person_id));
				isEditorOpen.value = true;
				verticalsplitRef.value.collapseTop();
			} else {
				verticalsplitRef.value.collapseBottom();
			}
		})
		
		VueRouter.onBeforeRouteUpdate((to, from) => {
			/*console.log('onBeforeUpdate',to,from);
			const answer = window.confirm(
			  'Do you really want to leave? you have unsaved changes! (' + to + ', ' + from + ')' 
			)
			// cancel the navigation and stay on the same page
			if (!answer) return false*/
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
			currentPersonUID,
			appSideMenuEntries,
			searchbaroptions,
			employeesTabulatorEvents,
			employeesTabulatorOptions,
			verticalsplitRef,
			route,
		}

	},
    template: `
        <header class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
            <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="${FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router}">FHComplete [PV21]</a>
            <button class="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div id="chooser" class="w-100">
            <searchbar :searchoptions="searchbaroptions" :searchfunction="searchfunction"></searchbar>
            </div>
            <div class="navbar-nav">
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle px-3" data-bs-toggle="dropdown" href="#" id="navbarDropdownMenuLink">Häufige Funktionen</a>
                <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    <li><a class="dropdown-item" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                </ul>
            </div>
            </div>
        </header>

        <div class="container-fluid">
            <div class="row">
                
            <core-navigation-cmpt :add-side-menu-entries="appSideMenuEntries" hide-top-menu=true  noheader left-nav-css-classes="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"></core-navigation-cmpt>

            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-3">
                        
                <verticalsplit id="macombined" ref="verticalsplitRef">
                    <template #top>
                        <div class="d-flex  flex-column" style="height:100%"  >
                        <div id="master" class="flex-shrink-0 d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                    
                            <div class="flex-fill align-self-center">
                            <h1 class="h2" style="margin-bottom:0" > Mitarbeiter </h1>
                            </div>
                            <div class="btn-toolbar mb-2 mb-md-0" style="margin-right:1.75rem">
                                <button type="button" class="btn btn-outline-secondary" ><i class="fa fa-plus"></i></button>
                            </div>
                        </div>
                            <!-- Filter component -->
                            <core-filter-cmpt
                            filter-type="EmployeeViewer"
                            :tabulator-options="employeesTabulatorOptions"
                            :tabulator-events="employeesTabulatorEvents"
                            @nw-new-entry="newSideMenuEntryHandler">
                            </core-filter-cmpt>
                        </div>
                    </template>
                    <template #bottom>
                        <employee-editor  v-if="currentPersonID!=null" :personid="currentPersonID" :personuid="currentPersonUID" :open="isEditorOpen" @person-selected="(e) => personSelectedHandler(e.person_id, e.uid)" @close-editor="closeEditorHandler"></employee-editor>
                    </template>
                </verticalsplit> 
                            
            </main>
            </div>
        </div>            
    
    `
}