/**
 * Copyright (C) 2022 fhcomplete.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

//import {LogsViewerTabulatorOptions} from './TabulatorSetup.js';
//import {LogsViewerTabulatorEventHandlers} from './TabulatorSetup.js';
import fhcapifactory from "../../../../../js/apps/api/fhcapifactory.js";
import pv21apifactory from "../../api/vbform/api.js";

import {CoreFilterCmpt} from '../../../../../js/components/filter/Filter.js';
import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';

import CoreVerticalsplitCmpt from '../../../../../js/components/verticalsplit/verticalsplit.js';
import {EmailTelData} from '../../components/employee/contact/EmailTelData.js';
import Betriebsmittel from "../../../../../js/components/Betriebsmittel/Betriebsmittel.js";

import Phrasen from '../../../../../js/plugin/Phrasen.js';
import * as typeDefinition from '../../helpers/typeDefinition/loader.js';

Vue.$fhcapi = {...fhcapifactory, ...pv21apifactory};

const handyVerwaltungApp = Vue.createApp({
	data: function() {
		return {
                    personid: -1,
                    personuid: 'keine'
		};
	},
	components: {
		CoreNavigationCmpt,
		CoreFilterCmpt,
                CoreVerticalsplitCmpt,
                EmailTelData,
                Betriebsmittel
	},
    setup() {

		// init shared data

        const fetchHelper = (fetchFunction) => {
            let temp = Vue.ref([])
            fetchFunction().then( r => temp.value = r )
            return temp
        }

		const sprache = fetchHelper(typeDefinition.fetchSprache);
		const nations = fetchHelper(typeDefinition.fetchNations);
		const standorte = fetchHelper(typeDefinition.fetchStandorteIntern);
		const orte = fetchHelper(typeDefinition.fetchOrte);
		const kontakttyp = fetchHelper(typeDefinition.fetchKontakttyp);
		const adressentyp = fetchHelper(typeDefinition.fetchAdressentyp);

		Vue.provide("sprache",sprache);
		Vue.provide("nations",nations);
		Vue.provide("standorte",standorte);
		Vue.provide("orte",orte);
		Vue.provide("kontakttyp",kontakttyp);
		Vue.provide("adressentyp",adressentyp);
		Vue.provide("cisRoot", CIS_ROOT)
	},
	methods: {
            personselected: function() {
                alert('personselected');
            }
	},
        computed: {
            employeesTabulatorEvents: function() {
		const employeesTabulatorEvents = [
			{
				event: "rowClick",
				handler: this.personselected
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
                return employeesTabulatorEvents;
            },            
            employeesTabulatorOptions: function() {
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
                        persistenceID: 'handyverwaltung_20240604_01',
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
				{title: "Raum", field: "Raum", headerFilter: "list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"}},
				{title: "Geschlecht", field: "Geschlecht", formatter:sexformatter, headerFilter: "list", headerFilterParams: {values:{'m':'männlich','w':'weiblich','x':'divers','u':'unbekannt'}, autocomplete: true, sort: "asc"}},
				{title: "Durchwahl", field: "Durchwahl", headerFilter: true},
				{title: "Standardkostenstelle", field: "Standardkostenstelle", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}}, 
				{title: "Disziplinäre Zuordnung", field: "Disziplinäre Zuordnung", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}},
				{title: "OE Key", field: "OE Key", headerFilter: true},
			]
		};
                return employeesTabulatorOptions;
            }
        },
        template: `
		<!-- Navigation component -->
		<core-navigation-cmpt></core-navigation-cmpt>

		<div id="content">
			<core-verticalsplit-cmpt>
                            <template #top>
                                <p><label for="personid">personid</label><input id="personid" v-model="personid"></p>
                                <p><label for="personuid">personuid</label><input id="personuid" v-model="personuid"></p>
    
                            <!-- Filter component -->
                            <core-filter-cmpt
                            filter-type="Handyverwaltung"
                                :sideMenu="false"
                                :tabulator-options="employeesTabulatorOptions"
                                :tabulator-events="employeesTabulatorEvents"
                                :new-btn-show="false">
                            </core-filter-cmpt>
    
                            </template>
    
                            <template #bottom>
                                <div class="row pt-md-4">      
                                     <div class="col">
                                         <div class="card">
                                            <div class="card-header">
                                                <div class="h5 mb-0"><h5>{{ $p.t('global', 'kontakt') }}</h5></div>
                                            </div>
                                            <div class="card-body">
                                                <email-tel-data :personID="personid"></email-tel-data>
                                            </div>
                                         </div>
                                     </div>
                                </div>                                
    
                                <div class="row pt-md-4">      
                                     <div class="col">
                                         <div class="card">
                                            <div class="card-header">
                                                <div class="h5 mb-0"><h5>{{ $p.t('ui', 'betriebsmittel') }}</h5></div>        
                                            </div>
                                            <div class="card-body">
                                                <Betriebsmittel :person_id="personid" :uid="personuid" />
                                            </div>
                                         </div>
                                     </div>
                                </div>
    
                            </template>
                        </core-verticalsplit-cmpt>
		</div>    
`
});

handyVerwaltungApp.use(Phrasen).mount('#main');
handyVerwaltungApp.provide("cisRoot", CIS_ROOT);

