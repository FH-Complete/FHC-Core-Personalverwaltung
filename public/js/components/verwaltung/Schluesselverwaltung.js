import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';
import CoreBaseLayout from '../../../../../js/components/layout/BaseLayout.js';
import CoreVerticalSplit from '../../../../../js/components/verticalsplit/verticalsplit.js';
import {CoreFilterCmpt} from "../../../../../js/components/filter/Filter.js";
import { EmployeeHeader } from '../../components/employee/EmployeeHeader.js';
import { EmployeeContractInfo } from "../../components/employee/contract/EmployeeContractInfo.js";
import JobFunction from "../../components/employee/JobFunction.js";
import Betriebsmittel from "../../../../../js/components/Betriebsmittel/Betriebsmittel.js";

import ApiCommon from '../../api/factory/common.js';
import ApiDV from "../../api/factory/dv.js";
import ApiBetriebsmittelperson from '../../../../../js/api/factory/betriebsmittel/person.js';



export default {
	name: "Schluesselverwaltung",
	components: {
		CoreNavigationCmpt,
		CoreBaseLayout,
		CoreVerticalSplit,
		CoreFilterCmpt,
		EmployeeHeader,
		EmployeeContractInfo,
		JobFunction,
		Betriebsmittel
	},
	props: {
		betriebsmittelTypes: Array,
		filterByProvidedTypes: Boolean
	},
	provide()
	{
		return {
			sprache: Vue.computed(() => this.sprache),
			vertragsarten: Vue.computed(() => this.vertragsarten),
			nations: Vue.computed(() => this.nations),
			ausbildung: Vue.computed(() => this.ausbildung),
			orte: Vue.computed(() => this.orte),
			standorte: Vue.computed(() => this.standorte),
			kontakttyp: Vue.computed(() => this.kontakttyp),
			adressentyp: Vue.computed(() => this.adressentyp),
			sachaufwandtyp: Vue.computed(() => this.sachaufwandtyp),
			karenztypen: Vue.computed(() => this.karenztypen),
			gehaltstypen: Vue.computed(() => this.gehaltstypen),
			vertragsbestandteiltypen: Vue.computed(() => this.vertragsbestandteiltypen),
			freitexttypen: Vue.computed(() => this.freitexttypen),
			teilzeittypen: Vue.computed(() => this.teilzeittypen),
			hourlyratetypes: Vue.computed(() => this.hourlyratetypes),
			unternehmen: Vue.computed(() => this.unternehmen),
			beendigungsgruende: Vue.computed(() => this.beendigungsgruende),
			cisRoot: CIS_ROOT
		}
	},
	data () {
		return {
			sprache: {},
			vertragsarten: {},
			nations: {},
			ausbildung: {},
			orte: {},
			standorte: {},
			kontakttyp: {},
			adressentyp: {},
			sachaufwandtyp: {},
			karenztypen: {},
			gehaltstypen: {},
			vertragsbestandteiltypen: {},
			freitexttypen: {},
			teilzeittypen: {},
			hourlyratetypes: {},
			unternehmen: {},
			beendigungsgruende: {},

			personid: null,
			betriebsmittelEndpoint: ApiBetriebsmittelperson,
			tabulatorOptions:
			{
				persistenceID: "schluesselverwaltung_20250722_v2",
				layout: 'fitColumns',

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
			},
			tabulatorEvents: [
				{
					event: 'rowClick',
					handler: this.onRowClick
				},
				{
					event: "dataFiltered",
					handler: function(filters, rows) {
						let el = document.getElementById("search_count");
						el.innerHTML = rows.length;
					}
				},
				{
					event: 'dataLoaded',
					handler: function(data) {
						let el = document.getElementById("total_count");
						el.innerHTML = data.length;
					}
				}
			],
		}
	},
	created()
	{
		this.$api.call(ApiCommon.getSprache())
			.then(result => {
				this.sprache = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getVertragsarten())
			.then(result => {
				this.vertragsarten = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getNations())
			.then(result => {
				this.nations = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getAusbildung())
			.then(result => {
				this.ausbildung = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getOrte())
			.then(result => {
				this.orte = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getStandorteIntern())
			.then(result => {
				this.standorte = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getKontakttyp())
			.then(result => {
				this.kontakttyp = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getAdressentyp())
			.then(result => {
				this.adressentyp = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getSachaufwandTyp())
			.then(result => {
				this.sachaufwandtyp = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getKarenztypen())
			.then(result => {
				this.karenztypen = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);


		this.$api.call(ApiCommon.getTeilzeittypen())
			.then(result => {
				this.teilzeittypen = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);


		this.$api.call(ApiCommon.getGehaltstypen())
			.then(result => {
				this.gehaltstypen = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getVertragsbestandteiltypen())
			.then(result => {
				this.vertragsbestandteiltypen = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getFreitexttypen())
			.then(result => {
				this.freitexttypen = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiCommon.getStundensatztypen())
			.then(result => {
				this.hourlyratetypes = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiDV.getUnternehmen())
			.then(result => {
				this.unternehmen = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);

		this.$api.call(ApiDV.getDvEndeGruende())
			.then(result => {
				this.beendigungsgruende = result.data
			})
			.catch(this.$fhcAlert.handleSystemError);
	},
	methods: {
		onRowClick(e, row) {
			this.personid = row.getData().PersonId;
			this.personuid = row.getData().UID;
		}
	},
	template: `
	<!-- Navigation -->
	<core-navigation-cmpt></core-navigation-cmpt>

	<div class="content">
		<core-vertical-split>
			<template #top>
				<div class="d-flex flex-column" style="height: 100%;">
					<core-filter-cmpt
						filter-type="Schluesselverwaltung"
						ref="table"
						:tabulator-options="tabulatorOptions"
						:tabulator-events="tabulatorEvents"
						:side-menu="false"
						:reload=false
					>
					</core-filter-cmpt>
				</div>
			</template>
			<template #bottom>
				<employee-header v-if="personid != null" ref="employeeHeaderRef"  :personID="personid" :personUID="personuid" restricted ></employee-header> 
				<employee-contract-info v-if="personid != null" ref="contractInfoRef" :personID="personid" :personUID="personuid" />
				 <div v-if="personid!=null">
					<job-function :readonlyMode="true" :personID="personid" :personUID="personuid"></job-function>
				</div>
				<div class="row pt-md-4" v-if="personid!=null">      
					<div class="col">
						<div class="card">
							<div class="card-header">
								<div class="h5 mb-0"><h5>{{ $p.t('ui', 'betriebsmittel') }}</h5></div>        
							</div>
							<div class="card-body">
								<betriebsmittel 
									:endpoint="betriebsmittelEndpoint"
									type-id="person_id"
									:id="personid"
									:uid="personuid"
									:betriebsmittelTypes="betriebsmittelTypes"
									:filterByProvidedTypes="filterByProvidedTypes"
									
								/>
							</div>
						</div>
					</div>
				</div>
			</template>
		</core-vertical-split>
	</div>

	`
};