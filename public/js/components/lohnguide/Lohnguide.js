import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import {OrgChooser} from "../organisation/OrgChooser.js";
import { usePhrasen } from '../../../../../js/mixins/Phrasen.js';
import { progressbar } from '../Progressbar.js';
import { CoreFilterCmpt } from "../../../../../js/components/filter/Filter.js";
import { dateFilter } from '../../../../../js/tabulator/filters/Dates.js';
import {formatter} from '../bulk/valorisationformathelper.js';
import ApiLohnguide from '../../api/factory/lohnguide.js';

export const Lohnguide = {
	name: 'Lohnguide',
    components: {
        "datepicker": VueDatePicker,
        "p-skeleton": primevue.skeleton,
        'progressbar': progressbar,
        Modal,
        ModalDialog,
        CoreFilterCmpt,
        OrgChooser,
    },
    props: {
       
    },
    setup( props, context ) {

        const { ref, inject } = Vue
        const lohnguideExportList = ref([])
        const currentBetrag = ref();
        const isFetching = ref(false);
        const jobRunning = ref(false);
        const { t } = usePhrasen();
        const modalRef = ref();
        const cancelAction = ref(false);
        const progressValue = ref(0);
        const currentOrgID = ref();
        const listType = ref('live');

        const tableRef = ref(null); // reference to your table element
        const tabulator = ref(null); // variable to hold your table
        const selectedData = ref([]);

        const abrechnungExists = ref(true);

        const $api = Vue.inject('$api');
        const $fhcAlert = inject('$fhcAlert');


        const formatDateISO = (ds) => {
            let padNum = (n) => {
                if (n<10) return '0' + n;
                return n;
            }
            if (ds == null) return '';
            var d = new Date(ds);
            return d.getFullYear() + "-" + padNum((d.getMonth()+1)) + "-" + padNum(d.getDate());
        }

        const formatDateGerman = (d) => {
            if (d != null && d != '') {
                return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
            } else {
                return ''
            }
        }
        // Modal 
        const confirmDeleteRef = Vue.ref();
        const currentDate = ref(formatDateISO(new Date()));
        const filterDate = ref();
        const filterPerson = ref('');
        const stichtag = ref('');

        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;

        const truncateDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

        const exportList = async () => {
            isFetching.value = true
            try {
              const response = await $api.call(ApiLohnguide.getAll(filterPerson.value, getFilterInterval(), true));     
              
             /*  // create file link in browser's memory
              const href = URL.createObjectURL(response.data);
                      
              // create "a" HTML element with href to file & click
              const link = document.createElement('a');
              link.href = href;
              link.setAttribute('download', 'gehaltsliste.csv'); //or any other extension
              document.body.appendChild(link);
              link.click();
                      
              // clean up "a" element & remove ObjectURL
              document.body.removeChild(link);
              URL.revokeObjectURL(href); */

            } catch (error) {
              console.log(error)              
            } finally {
                isFetching.value = false
            }
        }

        const filterDateHandler = (d) => {            
            console.log('stichtag set: ', d);
            stichtag.value = d;
            fetchData()
            
        }

        const dateFormatter = (cell) => {
            return cell.getValue()?.replace(/(.*)-(.*)-(.*)/, '$3.$2.$1');
        }

        const formatDate = function(cell, formatterParams, onRendered) {
            return formatter.formatDateGerman(cell.getValue());
        };

        const formatNumber = function(cell) {
            const value = cell.getValue();      
            if (value == null) return "";

            return Number(value).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        const sumsDownload = function(value, data, type, params, column){
            return value != null ? value.toString().replace('.', ',') : '';
        }

        const dateDownload = function(value, data, type, params, column){
            if (!value) return "";
            const d = new Date(value);
            return d.toLocaleDateString("de-AT"); 
        }

		const arr2string = function(value, data, type, params, column){
            return value.join(', ');
        }

        // sucht z.B. Basisgehalt
        function getProperty(data, propName, propVal) {
            if (!Array.isArray(data)) return null;

            for (const item of data) {
                const val = item[propName];

                let match = false;

                if (Array.isArray(val)) {
                    match = val.some(v =>
                        v?.toLowerCase().includes(propVal.toLowerCase())
                    );
                } else if (typeof val === "string") {
                    match = val.toLowerCase().includes(propVal.toLowerCase());
                }

                if (match) {
                    return item.betr_valorisiert_decrypted ?? null;
                }
            }

            return null;
        }

        function funktionszulageMutator(value, data) {
            const daten = data.daten;
            if (!Array.isArray(daten)) return null;

            
            let sum = 0.0;

            for (const item of daten) {
                const val = item.benutzerfunktion_id;
                if (Array.isArray(val) && val.length>0 && item.betr_valorisiert_decrypted > 0) {
                    sum += item.betr_valorisiert_decrypted;
                } 
            }

            return sum > 0 ? sum : null;
        }

        function funktionzulagenFormatter(cell) {
            const value = cell.getValue(); 
            return value > 0 ? formatter.formatCurrencyGerman(value) : '';
        }

        function checkProperty(data, propName, propVal) {
            if (!Array.isArray(data)) return false;

            return data.some(item => {
                const val = item[propName];

                if (Array.isArray(val)) {
                    return val.some(v =>
                        v?.toLowerCase().includes(propVal)
                    );
                }

                return val?.toLowerCase().includes(propVal);
            })
        }      

        function allInMutator(value, data){
            const daten = data.daten;
            return checkProperty(daten,'freitexttyp_kurzbz','allin');
        }        

        function allInFormatter(cell) {
            const value = cell.getValue();            
            const tickElement = '<i class="fas fa-check text-success"></i>';
            return value ? tickElement : '';
        }

        function allInDownload(value) {
            return value ? 'ja':'nein';
        }

        function beschaeftigungsausmassMutator(value,data) {
            return (data.wochenstunden / 38.5 * 100).toFixed(1);
        }

        

        function berechneZeitspanneInJahren(vonDatum, stichtag) {
            const von = new Date(vonDatum);
            const bis = new Date(stichtag);

            let jahre = bis.getFullYear() - von.getFullYear();

            // Noch nicht im gleichen Kalendermonat/-tag angekommen → ein Jahr abziehen
            const monatErreicht = bis.getMonth() > von.getMonth() ||
                (bis.getMonth() === von.getMonth() && bis.getDate() >= von.getDate());

            if (!monatErreicht) jahre--;

            return jahre;
        }

        function berufserfahrungMutator(value, data) {
            const vonDatum = data.lg_von
            if (vonDatum === null) return null
            return (data.vordienstzeit ?? 0) + berechneZeitspanneInJahren(vonDatum, stichtag.value)
        }

        function grundgehaltMutator(value, data) {
            const d = data.daten
            const basisgehalt = getProperty(d,'gehaltstyp_kurzbz','basisgehalt')
            const grundgehalt = getProperty(d,'gehaltstyp_kurzbz','grundgehalt')
            return !!basisgehalt ? basisgehalt : grundgehalt
        }

        function sonstigeZulagenMutator(value, data) {
            const d = data.daten
            const valAllIn = getProperty(d,'freitexttyp_kurzbz','allin')
            const valATZ = getProperty(d,'gehaltstyp_kurzbz','lohnausgleichatz')
            return (valAllIn ?? 0) + (valATZ ?? 0)
        }

        function ueberstundenpauschaleMutator(value, data) {
            const d = data.daten
            const val = getProperty(d,'gehaltstyp_kurzbz','ueberstundenpauschale')
            return val
        }

        function sachbezugMutator(value, data) {
            const d = data.daten
            const val = getProperty(d,'gehaltstyp_kurzbz','sachbezug_pkw')
            return val
        }

        function praemieMutator(value, data) {
            const d = data.daten
            const val = getProperty(d,'gehaltstyp_kurzbz','praemie')
            return val
        }

        const presetDates = ref([
            { label: 'Heute', value: new Date() },
            { label: 'Ende letztes Quartal', value: (() => {
                const now = new Date();
                const quarter = Math.floor(now.getMonth() / 3);
                return new Date(now.getFullYear(), quarter * 3, 0);
            })() }
          ]);

        const fetchData = async () => {
            
            isFetching.value = true
            try {
              if (lohnguideTableRef.value.tabulator != null) {
                lohnguideTableRef.value.tabulator.dataLoader.alertLoader();
              }
              
              const res = await $api.call(ApiLohnguide.getAll(currentOrgID.value, stichtag.value, false)); 
              // merge live and history value into one field 
              let value = null;
              let source = '';
              
              // helper to select the right value and add the index field
              // priority:
              // 1. use data from history table              
              // 2. use data from valorisierung_historie
              // 3. use data from gehaltsbestandteil
              const selectValue = (r, index) => {
                if (r.hbetrag_decrypted !== undefined && r.hbetrag_decrypted != null && r.hbetrag_decrypted != "") {
                    // history data
                    value = r.hbetrag_decrypted
                    source = 'h'    
                } else if (r.betrag_valorisiert_historie_decrypted != null && r.betrag_valorisiert_historie_decrypted != "") {
                    // live data
                    value = r.betrag_valorisiert_historie_decrypted
                    source = 'v'             
                } else if (r.betr_valorisiert_decrypted	 != null && r.betr_valorisiert_decrypted != "") {
                    // live data
                    value = r.betr_valorisiert_decrypted	
                    source = 'l'
                }

				return {index, ...r, betrag: value, source}
              }

              let list = res.data.map((row, index) => selectValue(row, index) )

              if (res.meta.status == "success") {
                lohnguideExportList.value = list // res.retval.map((item, index) => ({index, ...item}));
                //lohnguideExportList.value = res.retval;
                //fetchAbrechnungExists();
              } else {
                lohnguideExportList.value = [];
              }              
            } catch (error) {
              console.log(error)              
            } finally {
                isFetching.value = false
                if (lohnguideTableRef.value.tabulator != null) {
					lohnguideTableRef.value.tabulator.setData(lohnguideExportList.value);
                    lohnguideTableRef.value.tabulator.dataLoader.clearAlert();
                }
            }
        }
        
       

       
        Vue.watch(filterPerson, () => {
            if (filterDate.value == null) return;
            //fetchData();
			fetchAbrechnungExists();
        })

        Vue.watch(listType, () => {
            console.log('listType changed', listType.value);
            //fetchData();
			fetchAbrechnungExists();
        })

      // ---------------------------------
      // Tabulator & Filter Component
      // ---------------------------------

      const lohnguideTableRef = ref(null);   

      const sexformatter = function(cell, formatterParams, onRendered) {
			const map = {
                'm': 'männlich',
                'w': 'weiblich', 
                'x': 'divers',
                'u': 'unbekannt'
            };
            return map[cell.getValue()] ?? cell.getValue();
		};
      
      const moneyFormatterParams = {
        decimal: ",",
        thousand: ".",
        symbol: false,
        symbolAfter: false,
        negativeSign: "-",
        precision: 2
      };


      const lohnguideTableColumnsDef =  [        
        { title: 'P#', field: "personalnummer", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible:true, download:true },        
		{ title: 'DVID', field: "dienstverhaeltnis_id", hozAlign: "left", sorter:"number", headerFilter: true, width:150, visible:false, download:false }, 
        { title: 'Vorname', field: "vorname", hozAlign: "left", sorter:"string", headerFilter: true, width:150, visible:true, download:true }, 
        { title: 'Nachname', field: "nachname", hozAlign: "left", sorter:"string", headerFilter: true, width:150, visible:true, download:true }, 
        { title: 'Geschlecht', field: "geschlecht", visible:true, download:true, hozAlign: "center", sorter:"string", formatter:sexformatter, headerFilter:"list", headerFilterParams: {values:{'': 'Alle','m':'männlich','w':'weiblich','x':'divers','u':'unbekannt'},clearable:true}, width:100  },        
        { title: 'Geburtsdatum', field: "gebdatum", formatter: formatDate, headerFilter:dateFilter, headerFilterFunc: 'dates', hozAlign: "center", sorter:"string", width:100, accessorDownload: dateDownload }, 
        { title: 'Eintrittsdatum', field: "dv_von", formatter: formatDate, headerFilter: dateFilter, headerFilterFunc: 'dates', hozAlign: "center", sorter:"string", width:100, accessorDownload: dateDownload }, 
        { title: 'AllIn-Gehalt', field: "daten_allIn", hozAlign: "center",  mutatorData: allInMutator, formatter: allInFormatter, headerFilter:"tickCross", headerFilterParams: {tristate: true,indeterminate: true}, headerFilterEmptyCheck:function(value){return value === null}, width:100, accessorDownload: allInDownload}, 
        { title: 'Beschäftigungsausmaß', field: "daten_beschaeftigung", hozAlign: "center", mutatorData: beschaeftigungsausmassMutator,sorter:"number",  headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120, formatter: (cell) => cell.getValue() + " %", accessorDownload: sumsDownload },
        { title: 'KV-Gruppe', field: "kv_gruppe", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120 },
        { title: 'KV-Stufe', field: "kv_stufe", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 },
		{ title: 'KV-Jahre', field: "kv_jahre", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 },
        { title: 'Org.-Einheit (Allgm.)', field: "oe_bezeichnung_hr", sorter:"string", headerFilter:"list",hozAlign: "left", 
             width:150, headerFilterParams: {valuesLookup:true, autocomplete:true}},    
        { title: 'Org.-Einheit (Detail)', field: "kstorgbezeichnung", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 },
        { title: 'Stellenbezeichnung (intern)', field: "stellenbezeichnung", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120 },
        { title: 'Fachrichtung', field: "fachrichtung", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120 },
        { title: 'Fachrichtung Code', field: "fachrichtung_kurzbz", sorter:"string", headerFilter:"list",hozAlign: "right", 
					width:150, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible: false, accessorDownload: sumsDownload,download:true },  
        { title: 'Jobfamilie', field: "jobfamilie", sorter:"string", headerFilter:"list",hozAlign: "left", 
             width:150, headerFilterParams: {valuesLookup:true, autocomplete:true},  accessorDownload: sumsDownload },          
        { title: 'Modellfunktion', field: "modellfunktion", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120 },
        { title: 'Modellstelle', field: "modellstelle", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120 },
        { title: 'Modellstelle Code', field: "modellstelle_kurzbz", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120 },
        { title: 'Berufserfahrung', field: "daten_berufserfahrung", hozAlign: "center", mutatorData:berufserfahrungMutator, headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120 },
        { title: 'Grundgehalt', field: "daten_grundgehalt", hozAlign: "right", mutatorData: grundgehaltMutator, formatterParams:moneyFormatterParams,formatter:"money",headerFilter:true, headerFilterFunc: ">=", width:150, visible:true, download:true, accessorDownload: sumsDownload },
       
        { title: 'Prämie', field: "daten_praemie", mutatorData:praemieMutator, formatterParams:moneyFormatterParams, formatter:"money", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible:true, download:true, accessorDownload: sumsDownload },
        { title: 'Funktionszulage', field: "daten_funktionszulage", hozAlign: "right", sorter:"string", mutatorData: funktionszulageMutator, formatter: funktionzulagenFormatter, headerFilter:true, headerFilterFunc: ">=", width:150 }, 
        { title: 'Sachbezug', field: "sachbezug", hozAlign: "right", mutatorData:sachbezugMutator, formatterParams:moneyFormatterParams, formatter:"money", sorter:"number", headerFilter:true, headerFilterFunc: ">=", width:150, accessorDownload: sumsDownload }, 
        { title: 'Sonst. Gehaltsbestandteile', field: "sonst_gehaltsbst", mutatorData:sonstigeZulagenMutator, formatterParams:moneyFormatterParams, formatter:"money", hozAlign: "right", headerFilter:true, headerFilterFunc: ">=", width:150, accessorDownload: sumsDownload }, 
        { title: 'Überstundenpauschale/Durchschn. Überstunden in €', field: "daten_ueberstundenpauschale", mutatorData:ueberstundenpauschaleMutator, formatterParams:moneyFormatterParams, formatter:"money", hozAlign: "left", sorter:"number", headerFilter:true, headerFilterFunc: ">=", width:150, accessorDownload: sumsDownload }, 
        { title: 'Leistungsbeurteilung in Punkten', field: "leistungsbeurteilung", hozAlign: "left", width:150, download:true }, 
        { title: 'Kommentar zur Person', field: "kommentar_person", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 }, 
        { title: 'Kommentar zur Modellstelle', field: "kommentar_modellstelle", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 }, 
        { title: 'Standort', field: "standort", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 }, 
      ];

      // Options

      const lohnguideTabulatorOptions = Vue.reactive({
          height: "calc(100vh - 200px)",
          reactiveData: true,
          data: lohnguideExportList.value,
		  index: 'dienstverhaeltnis_id',
		  persistenceID: 'pv21_lohnguide_2026042202',
          layout: 'fitColumns',
		  footerElement: '<div>&sum; <span id="search_count"></span> / <span id="total_count"></span></div>',
		  movableColumns: false,
          columns: lohnguideTableColumnsDef,
        //  rowFormatter: rowFormatter,
         // groupBy: "personalnummer",
         // groupHeader:function(value, count, data, group) { return data[0].personalnummer + " " + data[0].name_gesamt + " (" + data[0].svnr + ") " },
          initialSort:[
            {column:"nachname", dir:"asc"}, //sort by this first
            // {column:"vorname", dir:"asc"}, //then sort by this second -> wrong sort order tabulator bug?
          ]
      })

      const lohnguideTabulatorEvents = Vue.computed(() => [
        {
            event: 'cellEdited',            
        },
        {
            event: 'tableBuilt',
            handler: () => {
                //fetchData();
				//fetchAbrechnungExists();
            }
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
      ]);

      const downloadconfig = {
            'csv': {
                formatter:'csv',
                file: 'pv21_lohnguide.csv',
                options: {
                    delimiter: ';',
                    bom: true,
                 //   rowGroups: true,
                }
            },            
        }

        const orgSelectedHandler = (orgID) => {
			currentOrgID.value = orgID;
            if (!!stichtag.value) {
				fetchData();
			}
        }

        

        return { t, isFetching, lohnguideTableRef, tableRef, tabulator, currentDate, filterDate, stichtag, exportList,
            formatDateISO, filterDateHandler, modalRef, downloadconfig, orgSelectedHandler, 
            lohnguideTabulatorEvents, lohnguideTabulatorOptions, listType, 
            currentBetrag, filterPerson, jobRunning, presetDates,
            formatDateGerman, progressValue, abrechnungExists }

    },
    template: `            

        <core-filter-cmpt 
			ref="lohnguideTableRef"
			table-only
			:side-menu="false"
			:tabulator-options="lohnguideTabulatorOptions"
            :tabulator-events="lohnguideTabulatorEvents"		
            :download="downloadconfig"	
			>
			<template #actions>				
			 	<div class="d-flex gap-2 align-items-baseline">					
          
                    <div class="d-grid d-sm-flex gap-1 mb-2 flex-nowrap">       
                        <label for="orgchooser" class="ms-1">Organisation: </label>
                        <org-chooser  @org-selected="orgSelectedHandler" class="form-control form-select-sm" id="orgchooser"></org-chooser>                       
                        <label for="filter_zeitraum" class="ms-1">Stichtag: </label>
                        <datepicker id="filter" :modelValue="stichtag" 
                            @update:model-value="filterDateHandler"                            
                            :clearable="true"     
                            :preset-dates="presetDates"                                  
                            auto-apply 
                            locale="de"
                            format="dd.MM.yyyy"
                            model-type="yyyy-MM-dd"
                            input-class-name="dp-custom-input"
                            style="max-width:150px;min-width:150px" 
                            text-input >
                        </datepicker>
                       
                    </div>

				</div>
			</template>
		</core-filter-cmpt>

    `
}
