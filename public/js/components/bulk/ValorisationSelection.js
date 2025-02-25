import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';
import {CoreFilterCmpt} from "../../../../../js/components/filter/Filter.js";
import searchbar from "../../../../../js/components/searchbar/searchbar.js";
import {searchbaroptions, searchfunction } from "../../apps/common.js";
import { Modal } from '../Modal.js';
import {formatter} from './valorisationformathelper.js';

export const ValorisationSelection = {
	components: {
			searchbar,
			CoreNavigationCmpt,
			CoreFilterCmpt,
			Modal
		},
		inject: ['$fhcApi', '$fhcAlert'],
		data() {
			return 	{
				searchbaroptions: searchbaroptions,
				searchfunction: searchfunction,
				appSideMenuEntries: {},
				alleValorisierungsinstanzen: [],
				valorisierungInfoData: [],
				valorisierungsinstanz_kurzbz: '',
				valorisierung_oe_kurzbz: '',
				valorisierungsdatum: '',
				ajaxUrl: FHC_JS_DATA_STORAGE_OBJECT.app_root +
						FHC_JS_DATA_STORAGE_OBJECT.ci_router +
						'/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/calculateValorisation',
				formatter: formatter,
                                downloadconfig: {
                                    'csv': {
                                        formatter:'csv',
                                        file: 'pv21_valorisation.csv',
                                        options: {
                                            delimiter: ';',
                                            bom: true
                                        }
                                    }
                                }
			};
		},
		created: function() {
			this.getValorisierungsInstanzen();
		},
		methods: {
			getValorisierungsInstanzen: function() {
				const res = this.$fhcApi.factory.Valorisierung.getValorisierungsInstanzen()
					.then((response) => {
						this.alleValorisierungsinstanzen = response.data;
						this.valorisierungsdatum = '';
						if (this.alleValorisierungsinstanzen.length > 0)
							this.valorisierung_oe_kurzbz = this.alleValorisierungsinstanzen[0].oe_kurzbz;
						else
							this.valorisierung_oe_kurzbz = '';
					})
					.catch(this.handleErrors);
			},
			newSideMenuEntryHandler: function(payload) {
					this.appSideMenuEntries = payload;
			},
			calculateValorisation: function() {
				if( this.valorisierungsinstanz_kurzbz === '' ) {
					this.$fhcAlert.alertWarning('Keine ValorisierungsInstanz ausgewählt.');
					return;
				}
				this.$refs.valorisationTabulator.tabulator.dataLoader.alertLoader();
				const res = this.$fhcApi.factory.Valorisierung.calculateValorisation(this.valorisierungsinstanz_kurzbz)
					.then((response) => {
						this.$refs.valorisationTabulator.tabulator.setData(response.data);
						this.$refs.valorisationTabulator.tabulator.dataLoader.clearAlert();
					})
					.catch(this.handleErrors);
			},
			doValorisation: function() {
				if( this.valorisierungsinstanz_kurzbz === '' ) {
					this.$fhcAlert.alertWarning('Keine ValorisierungsInstanz ausgewählt.');
					return;
				}
				this.$refs.valorisationTabulator.tabulator.dataLoader.alertLoader();
				const res = this.$fhcApi.factory.Valorisierung.doValorisation(this.valorisierungsinstanz_kurzbz)
					.then((response) => {
						this.$refs.valorisationTabulator.tabulator.setData([]);
						this.getValorisierungsInstanzen();
						this.$fhcAlert.alertSuccess('Valorisierung erfolgreich abgeschlossen');
						this.$refs.valorisationTabulator.tabulator.dataLoader.clearAlert();
					})
					.catch(this.handleErrors);
			},
			getValorisationInfo: function() {
				if( this.valorisierungsinstanz_kurzbz === '' ) {
					this.$fhcAlert.alertWarning('Keine ValorisierungsInstanz ausgewählt.');
					return;
				}
				const res = this.$fhcApi.factory.Valorisierung.getValorisationInfo(this.valorisierungsinstanz_kurzbz)
					.then((response) => {
						this.valorisierungInfoData = response.data;
						this.$refs.infoModalRef.show();
					})
					.catch(this.handleErrors);
			},
			oeChanged: function() {
				// reset Valorisierungdatum for correct dropdown display
				this.valorisierungsdatum = '';
			},
			datumChanged: function() {
				let valInstanzen = this.alleValorisierungsinstanzen.filter(vi => vi.valorisierungsdatum == this.valorisierungsdatum && vi.oe_kurzbz == this.valorisierung_oe_kurzbz);

				// set Valorisierungsinstanz to first in list when datum is changed
				if (valInstanzen.length > 0)
					this.valorisierungsinstanz_kurzbz = valInstanzen[0].value;
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
				this.$refs.valorisationTabulator.tabulator.dataLoader.clearAlert();
			}
		},
		computed: {
			getFHCUrl: function() {
				return FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
			},
			tabulatorOptions: function() {
				const moneyformatterparams = {
					decimal: ",",
					thousand: ".",
					symbol: false,
					symbolAfter: false,
					negativeSign: true,
					precision: 2
				};

                                const sumsDownload = function(value, data, type, params, column){
                                    return value.toString().replace('.', ',');
                                }

				const formatDate = function(cell, formatterParams, onRendered) {
					return formatter.formatDateGerman(cell.getValue());
				};

				return {
						height: '75vh',
						// Unique ID
						index: 'dienstverhaeltnis_id',

						// @see: https://tabulator.info/docs/5.2/layout#layout
						// This is the default option and can be omitted.
						layout: 'fitDataStretch',

						footerElement: '<div><p><span id="filteredrows_count"></span> von <span id="totalrows_count"></span></p><p>&sum; vor Valorisierung: <span id="sumpreval"></span></p><p>&sum; nach Valorisierung: <span id="sumpostval"></span></p><p>Differenz: <span id="valdifferenz"></span></p></div>',

						// Column definitions
						columns: [
						{title: 'Mitarbeiter', field: 'mitarbeiter', headerFilter: true, frozen: true, minwidth: 250},
                                                {title: 'Personalnummer', field: 'personalnummer', visible: false, download:true},
						{title: 'Summe Gehalt vor Valorisierung', field: 'sumsalarypreval', headerFilter: true, hozAlign: 'right', sorter: 'number', formatter:"money", formatterParams: moneyformatterparams, accessorDownload: sumsDownload},
						{title: 'Summe Gehalt nach Valorisierung', field: 'sumsalarypostval', headerFilter: true, hozAlign: 'right', sorter: 'number', formatter:"money", formatterParams: moneyformatterparams, accessorDownload: sumsDownload},
						{title: 'Valorisierungs-Methode', field: 'valorisierungmethode', headerFilter: true},
						{title: 'Standard-Kostenstelle', field: 'stdkst', headerFilter: true},
						{title: 'Diszpl. Zuordnung', field: 'diszplzuordnung', headerFilter: true},
						{title: 'OE-Pfad', field: 'oe_pfad', headerFilter: true, download:false},
						{title: 'DVId', field: 'dienstverhaeltnis_id', visible: false},
						{title: 'Vertragsart', field: 'vertragsart', headerFilter: true, frozen: true},
						{title: 'Unternehmen', field: 'unternehmen', headerFilter: true, frozen: true},
						{title: 'DV-Beginn', field: 'dvvon', headerFilter: true, hozAlign: 'center', frozen: true, formatter: formatDate, accessorDownload: formatter.formatDateGerman},
						{title: 'DV-Ende', field: 'dvbis', headerFilter: true, hozAlign: 'center', frozen: true, formatter: formatDate, accessorDownload: formatter.formatDateGerman}
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
							var elfiltered = document.getElementById("filteredrows_count");
							var elsumpreval = document.getElementById("sumpreval");
							var elsumpostval = document.getElementById("sumpostval");
							var elvaldifferenz = document.getElementById("valdifferenz");
							var sumpreval = 0;
							var sumpostval = 0;

							for( var row of rows ) {
								sumpreval += row.getData().sumsalarypreval;
								sumpostval += row.getData().sumsalarypostval;
							}

							const moneyformatter = this.modules.format.getFormatter('money');
							const moneyformatterparams = {
								decimal: ",",
								thousand: ".",
								symbol: "EUR ",
								symbolAfter: false,
								negativeSign: true,
								precision: 2
							};

							const sumpreval_wrapper = {
								getValue: function() {
									return sumpreval;
								}
							};

							const sumpostval_wrapper = {
								getValue: function() {
									return sumpostval;
								}
							};

							const differenz_wrapper = {
								getValue: function() {
									return (sumpostval - sumpreval);
								}
							};

							elfiltered.innerHTML = rows.length;
							elsumpreval.innerHTML = moneyformatter(sumpreval_wrapper, moneyformatterparams);
							elsumpostval.innerHTML = moneyformatter(sumpostval_wrapper, moneyformatterparams);
							elvaldifferenz.innerHTML = moneyformatter(differenz_wrapper, moneyformatterparams);
						}
					},
					{
							event: "dataLoaded",
							handler: function(data) {
								var el = document.getElementById("totalrows_count");
								el.innerHTML = (false !== data && typeof data != 'undefined') ? data.length : 0;
							}
					}
				];
			},
			valorisierungsOrganisationseinheiten: function() {
				let oes = [...new Map(
					this.alleValorisierungsinstanzen
						.map(vi => ({value: vi.oe_kurzbz, label: vi.oe_bezeichnung})) // get only oes
						.map(vi => [vi['value'], vi]) // filter unique
				).values()];

				oes.unshift({ // add default label
					value: '',
					label: 'Organisationseinheit wählen...',
					disabled: true
				});

				let idx = oes.findIndex(vi => vi.value === null);

				// set label for null value
				if (typeof idx !== 'undefined' && idx >= 0) oes[idx].label = '-- Nicht angegeben --';

				return oes;
			},
			valorisierungsDates: function() {
				let dates = this.alleValorisierungsinstanzen
					.filter((value, index, array) => value.oe_kurzbz == this.valorisierung_oe_kurzbz) // filter unique
					.map(vi => vi.valorisierungsdatum) // get only dates
					.filter((value, index, array) => array.indexOf(value) === index && value != '') // filter unique
					.map(date => ({value: date, label: formatter.formatDateGerman(date)})); // transform to object

				dates.unshift({ // add default label
					value: '',
					label: 'Datum wählen...',
					disabled: true
				});

				return dates;
			},
			datumValorisierungsinstanzen: function() {
				return this.alleValorisierungsinstanzen.filter(
					vi => vi.oe_kurzbz == this.valorisierung_oe_kurzbz && vi.valorisierungsdatum == this.valorisierungsdatum
				);
			},
			valorisierungInfo: function() {
				let valorisierungInfoObj = {};
				for (let infoData of this.valorisierungInfoData) {

					let valorisierungMethode =
					{
						"valorisierung_methode_kurzbz": infoData.valorisierung_methode_kurzbz,
						"valorisierung_methode_beschreibung": infoData.valorisierung_methode_beschreibung,
						"valorisierung_methode_parameter": infoData.valorisierung_methode_parameter
					};

					if (valorisierungInfoObj.hasOwnProperty("methoden"))
					{
						valorisierungInfoObj.methoden.push(valorisierungMethode);
					}
					else
					{
						valorisierungInfoObj =
						{
							"valorisierung_kurzbz": infoData.valorisierung_kurzbz,
							"valorisierung_oe_bezeichnung": infoData.oe_bezeichnung,
							"valorisierungsdatum": infoData.valorisierungsdatum,
							"valorisierung_instanz_beschreibung": infoData.valorisierung_instanz_beschreibung,
							"methoden": [valorisierungMethode]
						}
					}
				}

				return valorisierungInfoObj;
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
                                        :download="downloadconfig"
					table-only
					:side-menu="false"
					:tabulator-options="tabulatorOptions"
								:tabulator-events="tabulatorEvents">
					<template #actions>
						<div class="d-flex gap-2 align-items-baseline mb-4">
							<select v-model="valorisierung_oe_kurzbz" class="form-select w-auto" aria-label="ValorisierungsOe" @change="oeChanged">
								<option
									v-for="vo in valorisierungsOrganisationseinheiten"
									:value="vo.value"
									:disabled="vo.disabled">
									{{ vo.label }}
								</option>
							</select>
							<select v-model="valorisierungsdatum" class="form-select w-auto" aria-label="ValorisierungsDatum" @change="datumChanged">
								<option
									v-for="vd in valorisierungsDates"
									:value="vd.value"
									:disabled="vd.disabled">
									{{ vd.label }}
								</option>
							</select>
							<div v-show="valorisierungsdatum != ''">
								<div class="input-group mb-3">
								<select v-model="valorisierungsinstanz_kurzbz" class="form-select w-auto" aria-label="ValorisierungsInstanz">
									<option
										v-for="vi in datumValorisierungsinstanzen"
										:value="vi.value"
										:disabled="vi.disabled">
										{{ vi.label }}
									</option>
								</select>
								<button class="btn btn-outline-secondary" type="button" @click="getValorisationInfo">
									<i class="fa fa-info"></i>
								</button>
								</div>
							</div>
						</div>
						<button class="btn btn-primary" @click="calculateValorisation">Valorisierung berechnen</button>
						<button class="btn btn-primary ms-5" @click="doValorisation">Gewählte Valorisierung abschließen</button>
					</template>
				</core-filter-cmpt>
			</div>

		</main>

		</div>
		</div>
		<!-- detail modal -->
		<Modal :title="'Valorisierung Information'" ref="infoModalRef">
			<template #body>
				<table class="table table-bordered">
					<tbody>
						<tr>
							<th>Bezeichnung</th>
							<td>{{valorisierungInfo.valorisierung_kurzbz}}</td>
						</tr>
						<tr>
							<th>Beschreibung</th>
							<td>{{valorisierungInfo.valorisierung_instanz_beschreibung}}</td>
						</tr>
						<tr>
							<th>Unternehmen/Organisationseinheit</th>
							<td>{{valorisierungInfo.valorisierung_oe_bezeichnung}}</td>
						</tr>
						<tr>
							<th>Datum</th>
							<td>{{this.formatter.formatDateGerman(valorisierungInfo.valorisierungsdatum)}}</td>
						</tr>
						<tr>
							<th>Methoden</th>
							<td>
								<div v-for="(methode, index) in valorisierungInfo.methoden">
									<span v-if="index > 0">
										<br>
									</span>
									<b>{{methode.valorisierung_methode_kurzbz}}</b><br>
									Beschreibung: {{methode.valorisierung_methode_beschreibung}}<br>
									Parameter: <pre>{{JSON.stringify(JSON.parse(methode.valorisierung_methode_parameter), null, 2)}}</pre>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</template>
		</Modal>
	`
};
