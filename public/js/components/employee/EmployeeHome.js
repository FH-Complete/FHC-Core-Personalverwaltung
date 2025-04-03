import {CoreFilterCmpt} from '../../../../../js/components/filter/Filter.js';
import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';

import verticalsplit from "../../../../../js/components/verticalsplit/verticalsplit.js";
import searchbar from "../../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions} from "../../apps/common.js";
import EmployeeEditor from "./EmployeeEditor.js";
import { CreateWizard } from './create/CreateWizard.js';
import { Toast } from '../Toast.js';

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

export default {
	name: 'EmployeeHome',
    components: {
		Sidebar,
		CoreNavigationCmpt,
        CoreFilterCmpt,
		EmployeeEditor,		
		verticalsplit,
		searchbar,
		CreateWizard,
		Toast,
	},
    setup() {

		const { watch, ref, inject } = Vue;
		const router = VueRouter.useRouter();
		const route = VueRouter.useRoute();
		const isEditorOpen = ref(false);
		const currentPersonID = ref(null);
		const currentPersonUID = ref(null);
		const appSideMenuEntries = ref({});
		const verticalsplitRef = ref(null);
		const createWizardRef = ref();
		const toastEmployeeCreatedRef = ref();
		const toastEmployeeCreateFailedRef = ref();
		const currentDate = ref(null);
		const $fhcApi = inject("$fhcApi");

		watch(
			() => route.params,
			params => {
				currentPersonID.value = parseInt(params.id);
				currentPersonUID.value = params.uid;	
				console.log('*** EmployeeHome params changed', currentPersonID.value);
				if (verticalsplitRef.value.isCollapsed() == 'bottom') {
					isEditorOpen.value = true; // TODO check notwendig? was macht isEditorOpen?
					verticalsplitRef.value.collapseTop();
				}
			}
		)

		const personSelectedHandler = (id, uid, date) => {
			console.log('personSelected: ', id, uid, date);

			if (verticalsplitRef.value.isCollapsed() == 'bottom') {
				verticalsplitRef.value.showBoth();
				//isEditorOpen.value=true;
			}

			//let url = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/${id}/${uid}`;
			let url = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/${id}/${uid}/summary` +(date!=null?`?d=${date}`:'');

			router.push(url);
		}

		const openCreateWizard = () => {
			createWizardRef.value.showModal().then((action) => {

				if (action !== false && action.type != "CANCELED") {
					showEmployeeCreatedToast()
				} else if (action === false) {
					showEmployeeCreateFailedToast()
				}
			})
		}
		
		const newSideMenuEntryHandler = (payload) => {
			appSideMenuEntries.value = payload;
		}

		const selectRecordHandler = (e, row) => { // Tabulator handler for the rowClick event
			personSelectedHandler(row.getData().PersonId, row.getData().UID, null);
		}

		const employeesTabulatorEvents = [
			{
				event: "rowClick",
				handler: selectRecordHandler
			},
                        {
                                event: "dataFiltered",
                                handler: function(filters, rows) {
                                    var el = document.getElementById("search_count");
                                    el.innerHTML = rows.length;
                                }
                        },
                        {
                                event: "dataLoaded",
                                handler: function(data) {
                                    var el = document.getElementById("total_count");
                                    el.innerHTML = data.length;
                                }
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
			height: "100%",
			layout: 'fitColumns',
            footerElement: '<div>&sum; <span id="search_count"></span> / <span id="total_count"></span></div>',
			columns: [
				{title: "UID", field: "UID", headerFilter: true},
				{title: "Person ID", field: "PersonId", headerFilter: true},
				{title: "Personalnummer", field: "Personalnummer", headerFilter: true},
				{title: "Vorname", field: "Vorname", headerFilter: true},
				{title: "Nachname", field: "Nachname", headerFilter: true},
				{title: "TitelPre", field: "TitelPre", headerFilter: true},
				{title: "TitelPost", field: "TitelPost", headerFilter: true},
				{title: "Alias", field: "Alias", headerFilter: true},
				{title: "Geburtsdatum", field: "Geburtsdatum", headerFilter: true},
				{title: "Aktiv", field: "Aktiv", hozAlign: "center", formatter:"tickCross", formatterParams: {
						tickElement: '<i class="fas fa-check text-success"></i>',
						crossElement: '<i class="fas fa-times text-danger"></i>'
					},
					headerFilter:"tickCross", headerFilterParams: {
						"tristate":true,elementAttributes:{"value":"true"}
					}, headerFilterEmptyCheck:function(value){return value === null}},
				{title: "Fixangestellt", field: "Fixangestellt", headerFilter: true},
				{title: "SVNR", field: "SVNR", headerFilter: true},
				{title: "Raum", field: "Raum", headerFilter: "list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"}},
				{title: "Geschlecht", field: "Geschlecht", formatter:sexformatter, headerFilter: "list", headerFilterParams: {values:{'m':'männlich','w':'weiblich','x':'divers','u':'unbekannt'}, autocomplete: true, sort: "asc"}},
				{title: "Durchwahl", field: "Durchwahl", headerFilter: true},
				{title: "Standardkostenstelle", field: "Standardkostenstelle", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}}, 
				{title: "Disziplinäre Zuordnung", field: "Disziplinäre Zuordnung", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}},
				{title: "OE Key", field: "OE Key", headerFilter: true},
			]
		};

		const showEmployeeCreatedToast = () => {
            toastEmployeeCreatedRef.value.show();
        }

		const showEmployeeCreateFailedToast = () => {
			toastEmployeeCreateFailedRef.value.show();
		}

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

                searchbaroptions.actions.employee.defaultaction = {
                    type: "function",
                    action: (data) => {
                        return personSelectedHandler(data.person_id, data.uid);
                    }
                };
				
				const searchfunction = $fhcApi.factory.search.search;

		return {
			personSelectedHandler,
			newSideMenuEntryHandler,
			searchfunction,
			selectRecordHandler,
			openCreateWizard,			

			createWizardRef,
			isEditorOpen,			
			currentPersonID,
			currentPersonUID,
			appSideMenuEntries,
			searchbaroptions,
			employeesTabulatorEvents,
			employeesTabulatorOptions,
			verticalsplitRef,
			toastEmployeeCreatedRef,
			toastEmployeeCreateFailedRef,
			route,
		}

	},
    template: `

        <header class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark flex-md-nowrap p-0 border-bottom">
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
                
            <core-navigation-cmpt :add-side-menu-entries="appSideMenuEntries" hide-top-menu  left-nav-css-classes="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"></core-navigation-cmpt>

            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-3">
                        
                <verticalsplit id="macombined" ref="verticalsplitRef" >
                    <template #top>
                        <div class="d-flex  flex-column" style="height:100%"  >
                        <div id="master" class="flex-shrink-0 d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
                                    
                            <div class="flex-fill align-self-center">
                            <h1 class="h2" style="margin-bottom:0" > Mitarbeiter </h1>
                            </div>
							<div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
								<Toast ref="toastEmployeeCreatedRef">
									<template #body><h4>Mitarbeiter erstellt.</h4></template>
								</Toast>
								<Toast ref="toastEmployeeCreateFailedRef" type="error">
									<template #body><h4>Mitarbeiter anlegen fehlgeschlagen!</h4></template>
								</Toast>
							</div>
                        </div>
                            <!-- Filter component -->
                            <core-filter-cmpt
                            filter-type="EmployeeViewer"
                            :sideMenu="false"
                            :tabulator-options="employeesTabulatorOptions"
                            :tabulator-events="employeesTabulatorEvents"
                            :new-btn-label="'Mitarbeiter'"
                            :new-btn-show="true"
                            @nw-new-entry="newSideMenuEntryHandler"
							@click:new="openCreateWizard()">
                            </core-filter-cmpt>
                        </div>
                    </template>
                    <template #bottom>
                        <employee-editor  v-if="currentPersonID!=null" :personid="currentPersonID" :personuid="currentPersonUID" :open="isEditorOpen" @person-selected="(e) => personSelectedHandler(e.person_id, e.uid, e.date)" ></employee-editor>
                    </template>
                </verticalsplit> 
                            
            </main>
            </div>
        </div>      		
		
		<CreateWizard id="createWizard" ref="createWizardRef" ></CreateWizard>
    
    `
}
