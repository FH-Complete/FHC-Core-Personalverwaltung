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

import pv21apifactory from "../../api/api.js";
//import OldFhcApi from '../../../../../js/plugin/OldFhcApi.js';
import ApiCommon from '../../api/factory/common.js';
import ApiDV from  '../../api/factory/dv.js';

import {CoreFilterCmpt} from '../../../../../js/components/filter/Filter.js';
import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';

import CoreVerticalsplitCmpt from '../../../../../js/components/verticalsplit/verticalsplit.js';
import {EmailTelData} from '../../components/employee/contact/EmailTelData.js';

import BetriebsmittelPersonApi from '../../../../../js/api/factory/betriebsmittel/person.js';
import Betriebsmittel from "../../../../../js/components/Betriebsmittel/Betriebsmittel.js";

import JobFunction from "../../components/employee/JobFunction.js";
import { EmployeeHeader } from '../../components/employee/EmployeeHeader.js';
import { EmployeeContractInfo } from "../../components/employee/contract/EmployeeContractInfo.js";

import ApiPerson from '../../api/factory/person.js';

import Phrasen from '../../../../../js/plugins/Phrasen.js';
import FhcAlert from '../../../../../js/plugins/FhcAlert.js';
import FhcApi from "../../../../../js/plugins/Api.js";

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

const handyVerwaltungApp = Vue.createApp({
	name: 'Handyverwaltung',
	data: function() {
		return {
                    personid: null,
                    personuid: 'keine',
                    employeeData: null,
					betriebsmittelpersonapi: BetriebsmittelPersonApi,
                    isFetching: false,
                    readonly: false,
		};
	},
	components: {
		CoreNavigationCmpt,
		CoreFilterCmpt,
        CoreVerticalsplitCmpt,
        EmailTelData,
        Betriebsmittel,
        JobFunction,
        EmployeeHeader,
        EmployeeContractInfo,                
	},
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

        return {
            standorte
        };
	},
	methods: {
            // Tabulator handler for the rowClick event
            personselected: function(e, row) { 
                console.log('personselected', row)
                this.personid = row.getData().PersonId;
                this.personuid = row.getData().UID;

                this.fetchEmployeeData(this.personid);
                
                if( this.$refs['vsplit'].isCollapsed() !== false ) {
                    this.$refs['vsplit'].showBoth();
                }
            },
            fetchEmployeeData: async function(personID)  {
                if (personID==null) {                
                    return;
                }
                this.isFetching = true;
                try {
                    const res = await this.$api.call(ApiPerson.personEmployeeData(personID));
                    this.employeeData = res.data[0];
                } catch (error) {
                    this.$fhcAlert.handleSystemError(error)         
                } finally {
                    this.isFetching = false
                }   
            },
            saveEmployeeData: async function() {
                // submit
                try {
                    const response = await this.$api.call(ApiPerson.updatePersonPhoneExtension(this.employeeData));
                    this.showToast();
                    this.employeeData = response.data[0];
                    this.updateHeader();
                } catch (error) {
                    this.$fhcAlert.handleSystemError(error)              
                } finally {
                    this.isFetching = false
                }
                
            },
            showToast: function() {
                this.$fhcAlert.alertSuccess(this.$p.t('person','mitarbeiterdatenGespeichert'))
            },
            updateHeader: function() { if (this.$refs.employeeHeaderRef) { this.$refs.employeeHeaderRef.refresh(); } },
            
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
                        persistenceID: 'handyverwaltung_20240905_03',
                        footerElement: '<div>&sum; <span id="search_count"></span> / <span id="total_count"></span></div>',
			columns: [
				{title: "UID", field: "UID", headerFilter: true},
				{title: "Person ID", field: "PersonId", headerFilter: true},
				{title: "Vorname", field: "Vorname", headerFilter: true},
				{title: "Nachname", field: "Nachname", headerFilter: true},
				{title: "EMail", field: "EMail", headerFilter: true},
				{title: "Unternehmen", field: "Unternehmen", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}},
				{title: "Vertragsart", field: "Vertragsart", headerFilter: false},
				{title: "DV_von", field: "DV_von", headerFilter: true},
				{title: "DV_bis", field: "DV_bis", headerFilter: true},
				{title: "Wochenstunden", field: "Wochenstunden", headerFilter: true},
				{title: "WS_von", field: "WS_von", headerFilter: true},
				{title: "WS_bis", field: "WS_bis", headerFilter: true},
				{title: "Standardkostenstelle", field: "Standardkostenstelle", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}}, 
				{title: "Disziplinäre Zuordnung", field: "Disziplinäre Zuordnung", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}},
				{title: "Dienstverhaeltnis ID", field: "DienstverhaeltnisId", headerFilter: true},
                {title: "DV_status", field: "DV_status", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}},
			]
		};
                return employeesTabulatorOptions;
            },

            getStandortbez: function(standort_id) {
                if (!standort_id) return '';
                let result = this.standorte?.filter((item) => item.standort_id == standort_id);
                if (result?.length > 0)
                    return result[0].bezeichnung;
                return '';
            }

        },
        template: `
		<!-- Navigation component -->
		<core-navigation-cmpt></core-navigation-cmpt>

		<div id="content">
			<core-verticalsplit-cmpt ref="vsplit">
                            <template #top>
                                <div class="d-flex flex-column" style="height: 100%;">
                                    <!-- Filter component -->
                                    <core-filter-cmpt
                                        filter-type="Handyverwaltung"
                                        :sideMenu="false"
                                        :tabulator-options="employeesTabulatorOptions"
                                        :tabulator-events="employeesTabulatorEvents"
                                        :new-btn-show="false">
                                    </core-filter-cmpt>
                                </div>
                            </template>
    
                            <template #bottom>

                                <EmployeeHeader v-if="personid!=null" ref="employeeHeaderRef"  :personID="personid" :personUID="personuid" restricted ></EmployeeHeader> 

                                <EmployeeContractInfo v-if="personid!=null" ref="contractInfoRef"  :personID="personid" :personUID="personuid" />

                                <div v-if="personid!=null">
                                    <JobFunction :readonlyMode="true" :personID="personid" :personUID="personuid"></JobFunction>
                                </div>

                                <div class="row pt-md-4" v-if="personid!=null && employeeData!=null">      
                                     <div class="col">
                                         <div class="card">
                                            <div class="card-header">
                                                <div class="h5 mb-0"><h5>Durchwahl</h5></div>
                                            </div>
                                            <div class="card-body">
                                                <div class="col-md-12">
                                                    <div class="row gy-3">    
                                                        <div class="col-4">                 
                                                            <label for="standort" class="form-label">{{ $p.t('person','standort') }}</label>
                                                            <select  v-if="!readonly" id="standort" :readonly="readonly"  v-model="employeeData.standort_id" class="form-select form-select-sm" aria-label=".form-select-sm " >
                                                                <option value="0">-- {{ $p.t('fehlermonitoring', 'keineAuswahl') }} --</option>
                                                                <option v-for="(item, index) in standorte" :value="item.standort_id">
                                                                    {{ item.bezeichnung }}
                                                                </option>         
                                                            </select>
                                                            <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="standort" :value="getStandortbez(employeeData.standort_id) ">
                                                        </div>
                                                        <div class="col-2">
                                                            <label for="telefonklappe" class="form-label">{{ $p.t('person','telefonklappe') }}</label>
                                                            <input type="text" :readonly="readonly" class="form-control-sm" maxlength="8" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="telefonklappe" v-model="employeeData.telefonklappe">
                                                        </div>
                                                    
                                                        <div class="col-6 d-flex justify-content-end align-items-end v-if="!readonly">
                                                            <button
                                                                type="button"
                                                                class="btn btn-primary btn-sm"
                                                                @click="saveEmployeeData"
                                                            >
                                                                Speichern
                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>    



                                            </div>
                                         </div>
                                     </div>
                                </div>               

                                <div class="row pt-md-4" v-if="personid!=null">      
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
    
                                <div class="row pt-md-4" v-if="personid!=null">      
                                     <div class="col">
                                         <div class="card">
                                            <div class="card-header">
                                                <div class="h5 mb-0"><h5>{{ $p.t('ui', 'betriebsmittel') }}</h5></div>        
                                            </div>
                                            <div class="card-body">
                                                <Betriebsmittel :endpoint="betriebsmittelpersonapi" type-id="person_id" :id="personid" :uid="personuid" />
                                            </div>
                                         </div>
                                     </div>
                                </div>
    
                            </template>
                        </core-verticalsplit-cmpt>
		</div>    
`
});

handyVerwaltungApp.use(primevue.config.default);
//handyVerwaltungApp.use(OldFhcApi, {factory: pv21apifactory});
handyVerwaltungApp
    .use(Phrasen)
    .use(FhcAlert)
	.use(FhcApi);
handyVerwaltungApp.mount('#main');
handyVerwaltungApp.provide("cisRoot", CIS_ROOT);


handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getSprache()).then((r) => {
    sprache.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getNations()).then((r) => {
    nations.value = r.data
})

handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getAusbildung()).then((r) => {
    ausbildung.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getOrte()).then((r) => {
    orte.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getStandorteIntern()).then((r) => {
    standorte.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getKontakttyp()).then((r) => {
    kontakttyp.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getAdressentyp()).then((r) => {
    adressentyp.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getSachaufwandTyp()).then((r) => {
    sachaufwandtyp.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getKarenztypen()).then((r) => {
    karenztypen.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getTeilzeittypen()).then((r) => {
    teilzeittypen.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getVertragsarten()).then((r) => {
    vertragsarten.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getGehaltstypen()).then((r) => {
    gehaltstypen.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getVertragsbestandteiltypen()).then((r) => {
    vertragsbestandteiltypen.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getFreitexttypen()).then((r) => {
    freitexttypen.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiCommon.getStundensatztypen()).then((r) => {
    hourlyratetypes.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiDV.getUnternehmen()).then((r) => {
    unternehmen.value = r.data
})
handyVerwaltungApp.config.globalProperties.$api.call(ApiDV.getDvEndeGruende()).then((r) => {
    beendigungsgruende.value = r.data
}) 

