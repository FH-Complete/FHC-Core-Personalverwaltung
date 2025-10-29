import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';
import CoreBaseLayout from '../../../../../js/components/layout/BaseLayout.js';
import CoreVerticalSplit from '../../../../../js/components/verticalsplit/verticalsplit.js';
import {CoreFilterCmpt} from "../../../../../js/components/filter/Filter.js";
import AppMenu from "../../../../../js/components/AppMenu.js";
import { EmployeeHeader } from '../../components/employee/EmployeeHeader.js';
import { ContactData } from '../../components/employee/contact/ContactData.js';
import { EmployeeContractInfo } from "../../components/employee/contract/EmployeeContractInfo.js";
import JobFunction from "../../components/employee/JobFunction.js";
import ApiCommon from '../../api/factory/common.js';
import ApiDV from "../../api/factory/dv.js";

export default {
	name: "Kontaktdatenverwaltung",
	components: {
		CoreNavigationCmpt,
		CoreBaseLayout,
		CoreVerticalSplit,
		CoreFilterCmpt,
		AppMenu,
		EmployeeHeader,
		EmployeeContractInfo,
		JobFunction,
		ContactData
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
			tabulatorOptions:
			{
				persistenceID: "kontaktdatenverwaltung_20250724_v1",
				layout: 'fitColumns',
				footerElement: '<div>&sum; <span id="search_count"></span> / <span id="total_count"></span></div>',
				columns: [
					{title: "UID", field: "UID", headerFilter: true},
					{title: "Person ID", field: "PersonId", headerFilter: true},
					{title: "Vorname", field: "Vorname", headerFilter: true},
					{title: "Nachname", field: "Nachname", headerFilter: true},
					{title: "Unternehmen", field: "Unternehmen", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}},
					{title: "Vertragsart", field: "Vertragsart", headerFilter: false},
					{title: "DV_von", field: "DV_von", headerFilter: true},
					{title: "DV_bis", field: "DV_bis", headerFilter: true},
					{title: "Disziplinäre Zuordnung", field: "Disziplinaere_Zuordnung", headerFilter: "list", headerFilterFunc:"=", headerFilterParams: {valuesLookup:true, autocomplete: true, sort: "asc"}},
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
			this.personData = {
				personID: this.personid,
			}
		}
	},
	template: /* html */`
	<!-- Navigation -->
	<aside id="appMenu" class="bg-light offcanvas offcanvas-start col-md p-md-0 h-100">
		<div class="offcanvas-header">
			Kontaktdatenverwaltung
			<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" :aria-label="$p.t('ui/schliessen')"></button>
		</div>
		<div class="offcanvas-body">
			<app-menu app-identifier="cdv" />
		</div>
	</aside>

	<header class="navbar navbar-expand-lg navbar-dark bg-dark flex-md-nowrap p-0 shadow">
		<div class="col-md-4 col-lg-3 col-xl-2 d-flex align-items-center">
			<button
				class="btn btn-outline-secondary border-0 m-1 collapsed"
				type="button"
				data-bs-toggle="offcanvas"
				data-bs-target="#appMenu"
				aria-controls="appMenu"
				aria-expanded="false"
				:aria-label="$p.t('ui/toggle_nav')"
			>
				<span class="svg-icon svg-icon-apps"></span>
			</button>
			<a class="navbar-brand me-0">Kontaktdatenverwaltung</a>
		</div>
	</header>

	<div class="content">
		<core-vertical-split>
			<template #top>
				<div class="d-flex flex-column" style="height: 100%;">
					<core-filter-cmpt
						filter-type="Kontaktdatenverwaltung"
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
				
				<div v-if="personid!=null">
					<contact-data :model-value="personData"></contact-data>
				</div>
   
			</template>
		</core-vertical-split>
	</div>

	`
};