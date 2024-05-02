import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";
import pv21apifactory from "../api/vbform/api.js";
import Phrasen from '../../../../js/plugin/Phrasen.js';
import {CoreNavigationCmpt} from '../../../../js/components/navigation/Navigation.js';
import {CoreFilterCmpt} from "../../../../js/components/filter/Filter.js";
import searchbar from "../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions, searchfunction } from "./common.js";
//test
Vue.$fhcapi = {...fhcapifactory, ...pv21apifactory};

const valApp = Vue.createApp(	{
    components: {
        searchbar,			
        CoreNavigationCmpt,
        CoreFilterCmpt
    },
    data() {
        return 	{
            searchbaroptions: searchbaroptions,
            searchfunction: searchfunction,
            appSideMenuEntries: {},
            valorisierungsinstanz_kurzbz: '',
            ajaxUrl: FHC_JS_DATA_STORAGE_OBJECT.app_root + 
                    FHC_JS_DATA_STORAGE_OBJECT.ci_router + 
                    '/extensions/FHC-Core-Personalverwaltung/apis/Valorisierung/doValorisation',
            lists: {
                valorisierungsinstanzen: []
            }
        };
    },
    created: function() {
        const res = Vue.$fhcapi.Valorisierung.getValorisierungsInstanzen()
                .then((response) => {
            const valinstanzen = response.data.data;
            valinstanzen.unshift({
                value: '',
                label: 'Valorisierungsinstanz wählen...',
                disabled: true
            });
            this.lists.valorisierungsinstanzen = valinstanzen;
        });      
    },
    methods: {		
        newSideMenuEntryHandler: function(payload) {
                this.appSideMenuEntries = payload;
        },
        doValorisation: function() {
            console.log('do Valorisation');
            console.log(this.valorisierungsinstanz_kurzbz);
            if( this.valorisierungsinstanz_kurzbz === '' ) {
                this.$fhcAlert.alertWarning('Keine ValorisierungsInstanz ausgewählt.');
                return;
            }
            this.$refs.valorisationTabulator.tabulator.dataLoader.alertLoader();
            const res = Vue.$fhcapi.Valorisierung.doValorisation(this.valorisierungsinstanz_kurzbz)
                    .then((response) => {
                console.log(response.data.data);
                this.$refs.valorisationTabulator.tabulator.setData(response.data.data);
                this.$refs.valorisationTabulator.tabulator.dataLoader.clearAlert();               
            });
        }
    },
    computed: {
        getFHCUrl: function() {
            return FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        },
        tabulatorOptions: function() {
            return {
                    height: '75vh',
                    // Unique ID
                    index: 'dienstverhaeltnis_id',

                    // @see: https://tabulator.info/docs/5.2/layout#layout
                    // This is the default option and can be omitted.
                    layout: 'fitDataStretch',
                    
                    footerElement: '<div><p>&sum; vor Valorisierung: <span id="sumpreval"></span></p><p>&sum; nach Valorisierung: <span id="sumpostval"></span></p><p>Differenz: <span id="valdifferenz"></span></p></div>',
                    
                    // Column definitions
                    columns: [
                    {title: 'Mitarbeiter', field: 'mitarbeiter', headerFilter: true, frozen: true, minwidth: 250},
                    {title: 'Summe Gehalt vor Valorisierung', field: 'sumsalarypreval', headerFilter: true, hozAlign: 'right', sorter: 'number'},
                    {title: 'Summe Gehalt nach Valorisierung', field: 'sumsalarypostval', headerFilter: true, hozAlign: 'right', sorter: 'number'},
                    {title: 'Valorisierungs-Methode', field: 'valorisierungmethode', headerFilter: true},
                    {title: 'Standard-Kostenstelle', field: 'stdkst', headerFilter: true},
                    {title: 'Diszpl. Zuordnung', field: 'diszplzuordnung', headerFilter: true},
                    {title: 'DVId', field: 'dienstverhaeltnis_id', visible: false},                    
                    {title: 'Vertragsart', field: 'vertragsart', headerFilter: true, frozen: true},
                    {title: 'Unternehmen', field: 'unternehmen', headerFilter: true, frozen: true},                    
                    {title: 'DV-Beginn', field: 'dvvon', headerFilter: true, hozAlign: 'center', frozen: true},
                    {title: 'DV-Ende', field: 'dvbis', headerFilter: true, hozAlign: 'center', frozen: true}
                ]
            };
        },
        tabulatorEvents: function() {
            return [
                {
                    "event": "tableBuilt",
                    "handler": function() {
                        console.log('valorisation table built');
                    }
                },
                {
                    "event": "dataFiltered",
                    "handler": function(filters, rows) {
                        var elsumpreval = document.getElementById("sumpreval");
                        var elsumpostval = document.getElementById("sumpostval");
                        var elvaldifferenz = document.getElementById("valdifferenz");
                        var sumpreval = 0;
                        var sumpostval = 0;
                        
                        for( var row of rows ) {
                            sumpreval += row.getData().sumsalarypreval;
                            sumpostval += row.getData().sumsalarypostval;
                        }
                        
                        elsumpreval.innerHTML = sumpreval.toFixed(2).replace('.', ',');
                        elsumpostval.innerHTML = sumpostval.toFixed(2).replace('.', ',');
                        elvaldifferenz.innerHTML = (sumpostval - sumpreval).toFixed(2).replace('.', ',');
                    }
                }
            ];
        }
    },
    template: `

    <header class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark flex-md-nowrap p-0 border-bottom">
	<a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" :href="getFHCUrl">FHComplete [PV21]</a>
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
        
	    <core-navigation-cmpt :add-side-menu-entries="appSideMenuEntries" hide-top-menu  noheader left-nav-css-classes="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"></core-navigation-cmpt>      

	    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4" style="height:100%">
		
		<div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
		    <h1 class="h2">Valorisierung</h1>
		    <div class="btn-toolbar mb-2 mb-md-0">
			<div class="btn-group me-2">
			    <!--button type="button" class="btn btn-sm btn-outline-secondary" @click="expandAllHandler">Expand</button>
			    <button type="button" class="btn btn-sm btn-outline-secondary" @click="collapseAllHandler">Collapse</button-->
			</div>
		    </div>
		</div>

		<div class="mh-100 pb-5" >
                    <core-filter-cmpt 
			ref="valorisationTabulator"
			table-only
			:side-menu="false"
			:tabulator-options="tabulatorOptions"
                        :tabulator-events="tabulatorEvents"
			>
			<template #actions>				
			 	<div class="d-flex gap-2 align-items-baseline">
					<select v-model="valorisierungsinstanz_kurzbz" class="form-select" aria-label="ValorisierungsInstanz">
                                            <option
                                              v-for="vi in lists.valorisierungsinstanzen"
                                              :value="vi.value"
                                              :disabled="vi.disabled">
                                              {{ vi.label }}
                                            </option>
					</select>
				</div>
                                <button class="btn btn-primary" @click="doValorisation">Valorisieren</button>
			</template>
                    </core-filter-cmpt>
		</div>

	    </main>
	    
	</div>
    </div>    
    `
});

valApp.use(primevue.config.default)
    .use(Phrasen)
    .mount('#wrapper');