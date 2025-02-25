import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';
import searchbar from "../../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions, searchfunction } from "../../apps/common.js";
import {Modal} from '../Modal.js';
import {formatter} from './valorisationformathelper.js';

export const ValorisationCheck = {
	props: {
		dienstverhaeltnis_id: { type: Number, required: true }
	},
	components: {
		searchbar,
		CoreNavigationCmpt,
		Modal
	},
	inject: ['$fhcApi', '$fhcAlert'],
	data() {
		return 	{
			searchbaroptions: searchbaroptions,
			searchfunction: searchfunction,
			appSideMenuEntries: {},
			valorisierungCheckData: {},
			dvData: {},
			viewedValorisierungMethod: {},
			formatter: formatter
		};
	},
	created: function() {
		this.getAllData();
	},
	methods: {
		getAllData: function() {
			this.getDvData();
			this.getValorisierungCheckData();
		},
		getDvData: function() {
			const res = this.$fhcApi.factory.ValorisierungCheck.getDvData(this.dienstverhaeltnis_id)
				.then((response) => {
					this.dvData = response.data;
				})
				.catch(this.handleErrors);
		},
		getValorisierungCheckData: function() {
			const res = this.$fhcApi.factory.ValorisierungCheck.getValorisierungCheckData(this.dienstverhaeltnis_id)
				.then((response) => {
					this.valorisierungCheckData = response.data;
				})
				.catch(this.handleErrors);
		},
		redoValorisation: function() {
			const res = this.$fhcApi.factory.ValorisierungCheck.redoValorisation(this.dienstverhaeltnis_id)
				.then((response) => {
					this.getAllData();
				})
				.catch(this.handleErrors);
		},
		showMethodenInfo: function(event, valorisierung) {
			this.viewedValorisierungMethod = valorisierung;
			this.$refs.infoModalRef.show();
		},
		newSideMenuEntryHandler: function(payload) {
				this.appSideMenuEntries = payload;
		},
		handleErrors: function(response) {
			if (response.hasOwnProperty('response') && response.response?.data?.errors) {
				for (let error of response.response.errors) {
					this.$fhcAlert.handleSystemError(error);
				}
			}
			else {
				this.$fhcAlert.handleSystemError(response);
			}
		}
	},
	computed: {
		valorisierungCheckDataArr: function() {
			let dataArr = [];
			for (let gehaltsbestandteil_id in this.valorisierungCheckData)
			{
				let va = this.valorisierungCheckData[gehaltsbestandteil_id];
				va.gehaltsbestandteil_id = gehaltsbestandteil_id;
				dataArr.push(va);
			}
			dataArr.sort(function(a, b){
				if (a.valorisierung == true && b.valorisierung == false) return -1;
				if (a.bis == null && b.bis != null) return -1;
				if (a.bis != null && b.bis == null) return 1;
				return b.von.localeCompare(a.von)
			});
			return dataArr;
		},
		finalCalculatedValorisations: function() {
			let valorisations = {};
			for (let gehaltsbestandteil_id in this.valorisierungCheckData)
			{
				let va = this.valorisierungCheckData[gehaltsbestandteil_id]['valorisation_methods'];

				// initialize with Grundbetrag
				valorisations[gehaltsbestandteil_id] = parseFloat(this.valorisierungCheckData[gehaltsbestandteil_id]['grundbetrag']);

				if (va == null) continue;

				// get last calculated amount
				let latestDate = Object.keys(va).reduce((a, b) => va[a] > va[b] ? a : b);
				let lastBetrag = parseFloat(va[latestDate].calculated_betrag_valorisiert);
				if (!lastBetrag) continue;
				valorisations[gehaltsbestandteil_id] = lastBetrag;
			}

			return valorisations;
		},
		dienstverhaeltnisInfo: function() {
			let dienstverhaeltnisInfo = {};
			if (this.dvData.length > 0)
			{
				let dv = this.dvData[0];
				dienstverhaeltnisInfo = {
					'von': dv.von,
					'vertragsart': dv.vertragsart,
					'vorname': dv.vorname,
					'nachname': dv.nachname,
					'unternehmen': dv.unternehmen
				};
			}

			return dienstverhaeltnisInfo;
		},
		dienstverhaeltnisSums: function() {
			let sums = {
				saved: 0,
				calculated: 0
			};

			for (let gehaltsbestandteil_id in this.valorisierungCheckData)
			{
				sums.saved += parseFloat(this.valorisierungCheckData[gehaltsbestandteil_id].final_betrag_valorisiert);
			}

			if (Object.keys(this.finalCalculatedValorisations).length <= 0) return sums;

			sums.calculated = Object.values(this.finalCalculatedValorisations).reduce((a, b) => a + b);

			return sums;
		},
		valorisierungValid: function() {
			for (let gehaltsbestandteil_id in this.valorisierungCheckData) {
				let valData = this.valorisierungCheckData[gehaltsbestandteil_id];

				// if saved betrag valorisiert different from calculated - invalid
				if (valData['final_betrag_valorisiert'] != this.finalCalculatedValorisations[gehaltsbestandteil_id]) return false;

				for (let methodIdx in valData['valorisation_methods']) {
					let method = valData['valorisation_methods'][methodIdx];

					// if history betrag valorisiert different from calculated - invalid
					if (method.historie_betrag_valorisiert != method.calculated_betrag_valorisiert) return false;
				}
			}
			return true;
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
			<h1 class="h2">
				Valorisierungscheck {{dienstverhaeltnisInfo.vorname+' '+dienstverhaeltnisInfo.nachname}},
				{{ dienstverhaeltnisInfo.unternehmen }}, {{ dienstverhaeltnisInfo.vertragsart }},
				{{ this.formatter.formatDateGerman(dienstverhaeltnisInfo.von) }}
			</h1>
			<div class="btn-toolbar mb-2 mb-md-0">
			<div class="btn-group me-2">
				<!--button type="button" class="btn btn-sm btn-outline-secondary" @click="expandAllHandler">Expand</button>
				<button type="button" class="btn btn-sm btn-outline-secondary" @click="collapseAllHandler">Collapse</button-->
			</div>
			</div>
		</div>

		<div class="row">

			<div class="col-6">
				<div class="d-flex mb-3 align-items-center" v-if="valorisierungValid">
					<label class="text-success"><i class="fa fa-check"></i>&nbsp;Valorisierung korrekt gespeichert</label>&nbsp;
				</div>

				<div class="d-flex mb-3 align-items-center" v-else>
					<label class="text-danger"><i class="fa fa-x"></i>&nbsp;Gespeicherte Valorisierung weicht von berechneter Valorisierung ab!</label>&nbsp;
					<button type="button" class="btn btn-primary ml-auto" @click="redoValorisation">Valorisierung neu berechnen und speichern</button>
				</div>
			</div>

			<div class="col-6 mb-3 text-end fw-bold fs-5">
				&sum; gespeichert: {{ this.formatter.formatCurrencyGerman(dienstverhaeltnisSums.saved) }};
				&sum; berechnet: {{ this.formatter.formatCurrencyGerman(dienstverhaeltnisSums.calculated) }}
			</div>

		</div>

		<div class="mh-100 pb-5">
			<div class="row" v-for="method in valorisierungCheckDataArr">
				<h1 class="h3">
					Gehaltsbestandteil {{ method.gehaltstyp }},
					{{ this.formatter.formatDateGerman(method.von) }}<span v-if="method.bis != null"> - {{ this.formatter.formatDateGerman(method.bis) }}</span>, Betrag valorisiert:
					<span
						v-bind:class="finalCalculatedValorisations[method.gehaltsbestandteil_id] != method.final_betrag_valorisiert ? 'text-danger' : ''">
						{{ this.formatter.formatCurrencyGerman(method.final_betrag_valorisiert) }}
					</span>,
					Valorisierung:
					{{ method.valorisierung ? 'Ja' : 'Nein' }}
				</h1>
				<div class="col-6">
					<table class="table table-condensed table-bordered">
						<thead>
							<tr class="text-center">
								<th colspan="3">Historie</th>
							</tr>
							<tr>
								<th>Valorisierungsdatum</th>
								<th>Bezeichnung</th>
								<th>Betrag valorisiert</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td></td>
								<td>Grundbetrag</td>
								<td>{{ this.formatter.formatCurrencyGerman(method.grundbetrag) }}</td>
							</tr>
							<tr v-for="(valorisierung, valorisierungsdatum) in method.valorisation_methods"
								v-bind:class="valorisierung.calculated_betrag_valorisiert != valorisierung.historie_betrag_valorisiert ? 'table-danger' : ''">
								<td>{{ this.formatter.formatDateGerman(valorisierungsdatum) }}</td>
								<td>{{ valorisierung.valorisierung_kurzbz }}</td>
								<td>{{ this.formatter.formatCurrencyGerman(valorisierung.historie_betrag_valorisiert) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="col-6">
					<table class="table table-condensed table-bordered">
						<thead>
							<tr class="text-center">
								<th colspan="4">Berechnet</th>
							</tr>
							<tr>
								<th>Valorisierungsdatum</th>
								<th>Bezeichnung</th>
								<th>Methode</th>
								<th>Betrag valorisiert</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td></td>
								<td>Grundbetrag</td>
								<td>-</td>
								<td>{{ this.formatter.formatCurrencyGerman(method.grundbetrag) }}</td>
							</tr>
							<tr v-for="(valorisierung, valorisierungsdatum) in method.valorisation_methods"
								v-bind:class="valorisierung.calculated_betrag_valorisiert != valorisierung.historie_betrag_valorisiert ? 'table-danger' : ''">
								<td>{{ this.formatter.formatDateGerman(valorisierungsdatum) }}</td>
								<td>{{ valorisierung.valorisierung_kurzbz }}</td>
								<td>{{ valorisierung.valorisierung_methode_kurzbz }}&nbsp;
									<i class="fa fa-info-circle fa-lg" role="button" @click="showMethodenInfo($event, valorisierung)"></i>
								</td>
								<td>{{ this.formatter.formatCurrencyGerman(valorisierung.calculated_betrag_valorisiert) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

	</main>

	</div>
	</div>
	<!-- detail modal -->
	<Modal :title="'Valorisierungsmethode Information'" ref="infoModalRef" v-model="viewedValorisierungMethod">
		<template #body>
			<table class="table table-bordered">
				<tbody>
					<tr>
						<th>Bezeichnung</th>
						<td>{{viewedValorisierungMethod.valorisierung_methode_kurzbz}}</td>
					</tr>
					<tr>
						<th>Beschreibung</th>
						<td>{{viewedValorisierungMethod.valorisierung_methode_beschreibung}}</td>
					</tr>
					<tr>
						<th>Parameter</th>
						<td><pre>{{JSON.stringify(this.viewedValorisierungMethod.valorisierung_methode_parameter, null, 2)}}</pre></td>
					</tr>
				</tbody>
			</table>
		</template>
	</Modal>
	`
};
