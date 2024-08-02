import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';
import searchbar from "../../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions, searchfunction } from "../../apps/common.js";

export const ValorisationCheck = {
    props: {
       dienstverhaeltnis_id: { type: Number, required: true }
    },
	components: {
		searchbar,
		CoreNavigationCmpt
	},
	data() {
		return 	{
			searchbaroptions: searchbaroptions,
			searchfunction: searchfunction,
			appSideMenuEntries: {},
			valorisierungCheckData: {},
			dvGehaltData: {}
		};
	},
	created: function() {
		this.getAllData();
	},
	methods: {
		getAllData: function() {
			this.getGehaltDvData();
			this.getValorisierungCheckData();
		},
		getGehaltDvData: function() {
			const res = Vue.$fhcapi.ValorisierungCheck.getDvGehaltData(this.dienstverhaeltnis_id)
				.then((response) => {
					this.dvGehaltData = response.data.data;
				})
				.catch(this.handleErrors);
		},
		getValorisierungCheckData: function() {
			const res = Vue.$fhcapi.ValorisierungCheck.getValorisierungCheckData(this.dienstverhaeltnis_id)
				.then((response) => {
					this.valorisierungCheckData = response.data.data;
				})
				.catch(this.handleErrors);
		},
		redoValorisation: function() {
			const res = Vue.$fhcapi.ValorisierungCheck.redoValorisation(this.dienstverhaeltnis_id)
				.then((response) => {
					//this.redoData = response.data.data;
					this.getAllData();
				})
				.catch(this.handleErrors);
		},
		newSideMenuEntryHandler: function(payload) {
				this.appSideMenuEntries = payload;
		},
		handleErrors: function(response) {
			if (response.hasOwnProperty('response') && response.response?.data?.errors) {
				for (let error of response.response.data.errors) {
					this.$fhcAlert.handleSystemError(error);
				}
			}
			else {
				this.$fhcAlert.handleSystemError(response);
			}
		}
	},
	computed: {
		finalCalculatedValorisations: function() {
			let valorisations = {};
			for (let gehaltsbestandteil_id in this.valorisierungCheckData)
			{
				let va = this.valorisierungCheckData[gehaltsbestandteil_id]['valorisation_methods'];

				// get last calculated amount
				let latestDate = Object.keys(va).reduce((a, b) => va[a] > va[b] ? a : b);
				valorisations[gehaltsbestandteil_id] = va[latestDate].calculated_betrag_valorisiert;
			}

			return valorisations;
		},
		dienstverhaeltnisInfo: function() {
			let dienstverhaeltnisInfo = {};
			if (this.dvGehaltData.length > 0)
			{
				let dv = this.dvGehaltData[0];
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
		gehaltsbestandteilInfo: function() {
			let gehaltsbestandteile = {};
			for (let dv of this.dvGehaltData)
			{
				gehaltsbestandteile[dv.gehaltsbestandteil_id] = {
					'gehaltstyp': dv.gehaltstyp,
					'von': dv.gehaltsbestandteil_von,
					'grundbetrag': dv.grund_betrag_decrypted
				}
			}

			return gehaltsbestandteile;
		},
		valorisierungValid: function() {
			for (let gehaltsbestandteil_id in this.valorisierungCheckData) {
				let valData = this.valorisierungCheckData[gehaltsbestandteil_id];

				// if saved betrag valorisiert different from calculated - invalid
				if (valData['final_betrag_valorisiert'] != this.finalCalculatedValorisations[gehaltsbestandteil_id]) return false;

				for (let methodIdx in valData['valorisation_methods']) {
					let method = valData['valorisation_methods'][methodIdx];

					// if history betrag valorisiert different from calculated - invalid
					if (method.historie_betrag_valorisiert != method.calculated_betrag_valorisiert)
						return false;
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
				{{ dienstverhaeltnisInfo.unternehmen }}, {{ dienstverhaeltnisInfo.vertragsart }}, {{ dienstverhaeltnisInfo.von }}
			</h1>
			<div class="btn-toolbar mb-2 mb-md-0">
			<div class="btn-group me-2">
				<!--button type="button" class="btn btn-sm btn-outline-secondary" @click="expandAllHandler">Expand</button>
				<button type="button" class="btn btn-sm btn-outline-secondary" @click="collapseAllHandler">Collapse</button-->
			</div>
			</div>
		</div>

		<div class="d-flex mb-3 align-items-center" v-if="valorisierungValid">
			<label class="text-success"><i class="fa fa-check"></i>&nbsp;Valorisierung korrekt gespeichert</label>&nbsp;
		</div>

		<div class="d-flex mb-3 align-items-center" v-else>
			<label class="text-danger"><i class="fa fa-x"></i>&nbsp;Falsche Valorisierung gespeichert</label>&nbsp;
			<button type="button" class="btn btn-primary ml-auto" @click="redoValorisation">Valorisierung neu berechnen und speichern</button>
		</div>

		<div class="mh-100 pb-5" >
			<div class="row" v-for="(method, gehaltsbestandteil_id) in valorisierungCheckData">
				<h1 class="h3">
					Gehaltsbestandteil {{ gehaltsbestandteilInfo[gehaltsbestandteil_id]['gehaltstyp'] }},
					{{ gehaltsbestandteilInfo[gehaltsbestandteil_id]['von'] }},
					Betrag valorisiert:
					<span
						v-bind:class="finalCalculatedValorisations[gehaltsbestandteil_id] != method.final_betrag_valorisiert ? 'text-danger' : ''">
						{{ method.final_betrag_valorisiert }}
					</span>
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
								<td>{{ gehaltsbestandteilInfo[gehaltsbestandteil_id].grundbetrag }}</td>
							</tr>
							<tr v-for="(valorisierung, valorisierungsdatum) in method.valorisation_methods"
								v-bind:class="valorisierung.calculated_betrag_valorisiert != valorisierung.historie_betrag_valorisiert ? 'table-danger' : ''">
								<td>{{ valorisierungsdatum }}</td>
								<td>{{ valorisierung.valorisierung_kurzbz }}</td>
								<td>{{ valorisierung.historie_betrag_valorisiert }}</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="col-6">
					<table class="table table-condensed table-bordered">
						<thead>
							<tr class="text-center">
								<th colspan="3">Berechnet</th>
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
								<td>{{ gehaltsbestandteilInfo[gehaltsbestandteil_id].grundbetrag }}</td>
							</tr>
							<tr v-for="(valorisierung, valorisierungsdatum) in method.valorisation_methods"
								v-bind:class="valorisierung.calculated_betrag_valorisiert != valorisierung.historie_betrag_valorisiert ? 'table-danger' : ''">
								<td>{{ valorisierungsdatum }}</td>
								<td>{{ valorisierung.valorisierung_kurzbz }}</td>
								<td>{{ valorisierung.calculated_betrag_valorisiert }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

	</main>

	</div>
	</div>
	`
};
