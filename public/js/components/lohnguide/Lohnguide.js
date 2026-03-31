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
        const salaryExportList = ref([])
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

        const sumsDownload = function(value, data, type, params, column){
            return value != null ? value.toString().replace('.', ',') : '';
        }

		const arr2string = function(value, data, type, params, column){
            return value.join(', ');
        }

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
                salaryExportList.value = list // res.retval.map((item, index) => ({index, ...item}));
                //salaryExportList.value = res.retval;
                //fetchAbrechnungExists();
              } else {
                salaryExportList.value = [];
              }              
            } catch (error) {
              console.log(error)              
            } finally {
                isFetching.value = false
                if (lohnguideTableRef.value.tabulator != null) {
					lohnguideTableRef.value.tabulator.setData(salaryExportList.value);
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
      
      const moneyFormatterParams = {
        decimal: ",",
        thousand: ".",
        symbol: false,
        symbolAfter: false,
        negativeSign: true,
        precision: 2
      };


      const lohnguideTableColumnsDef =  [        
        { title: 'P#', field: "personalnummer", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible:true, download:true },        
		{ title: 'DVID', field: "dienstverhaeltnis_id", hozAlign: "left", sorter:"number", headerFilter: true, width:150, visible:false, download:true }, 
        { title: 'Nachname', field: "nachname", hozAlign: "left", sorter:"string", headerFilter: true, width:150, visible:true, download:true }, 
        { title: 'Vorname', field: "vorname", hozAlign: "left", sorter:"string", headerFilter: true, width:150, visible:true, download:true }, 
        { title: 'Geschlecht', field: "geschlecht", visible:true, download:true, hozAlign: "center", sorter:"string", headerFilter:true, width:100  },        
        { title: 'Geburtsdatum', field: "gebdatum", formatter: formatDate, hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:100 }, 
        { title: 'Eintrittsdatum', field: "dv_von", formatter: formatDate, hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:100, accessorDownload: arr2string }, 
        { title: 'AllIn-Gehalt', field: "betr_valorisiert_decrypted", hozAlign: "right", sorter:"string", formatter:"money", formatterParams:moneyFormatterParams, headerFilter:"list", width:100, accessorDownload: arr2string }, 
        { title: 'Beschäftigungsausmaß', field: "wochenstunden", hozAlign: "center",sorter:"string",  headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120,  accessorDownload: formatter.formatDateGerman },
        { title: 'KV-Gruppe', field: "kv_gruppe", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120,  accessorDownload: formatter.formatDateGerman },
        { title: 'KV-Stufe', field: "kv_stufe", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150, accessorDownload: arr2string },
		{ title: 'KV-Jahre', field: "kv_jahre", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150, accessorDownload: arr2string },
        { title: 'Org.-Einheit (Allgm.)', field: "ksttypbezeichnung", sorter:"string", headerFilter:"list",hozAlign: "left", 
             width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, accessorDownload: sumsDownload },    
        { title: 'Org.-Einheit (Detail)', field: "kstorgbezeichnung", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:100 },
        { title: 'Stellenbezeichnung (intern)', field: "stellenbezeichnung", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120,  accessorDownload: formatter.formatDateGerman },
        { title: 'Fachrichtung', field: "fachrichtung", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120,  accessorDownload: formatter.formatDateGerman },
        { title: 'Fachrichtung Code', field: "fachrichtung_kurzbz", sorter:"string", headerFilter:"list",hozAlign: "right", 
            width:150, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible: false, accessorDownload: sumsDownload },  
        { title: 'Jobfamilie', field: "jobfamilie", sorter:"string", headerFilter:"list",hozAlign: "left", 
             width:150, headerFilterParams: {valuesLookup:true, autocomplete:true},  accessorDownload: sumsDownload },          
        { title: 'Modellfunktion', field: "modellfunktion", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120,  accessorDownload: formatter.formatDateGerman },
        { title: 'Berufserfahrung', field: "berufserfahrung", hozAlign: "center",sorter:"string", headerFilterParams: {valuesLookup:true, autocomplete:true}, headerFilter:"list", width:120,  accessorDownload: formatter.formatDateGerman },
        { title: 'Grundgehalt', field: "grundgehalt", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:100, visible:true, download:true },
        { title: 'Prämie', field: "praemie", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible:false, download:true },
        { title: 'Funktionszulage', field: "funktionszulage", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:100 }, 
        { title: 'Sachbezug', field: "sachbezug", hozAlign: "left", sorter:"number", headerFilter:true, width:100 }, 
        { title: 'Sonst. Gehaltsbestandteile', field: "sonst_gehaltsbst", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 }, 
        { title: 'Überstundenpauschale/Durchschn. Überstunden in €', field: "ueberstundenpauschale", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 }, 
        { title: 'Kommentar zur Person', field: "kommentar_person", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 }, 
        { title: 'Kommentar zur Modellstelle', field: "kommentar_modellstelle", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 }, 
        { title: 'Standort', field: "standort", hozAlign: "left", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, listOnEmpty:true, autocomplete:true}, width:150 }, 
      ];

      // Options

      const lohnguideTabulatorOptions = Vue.reactive({
          height: "700px",
          reactiveData: true,
          data: salaryExportList.value,
		  index: 'dienstverhaeltnis_id',
		  persistenceID: 'pv21_lohnguide_2026031201',
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
            currentBetrag, filterPerson, jobRunning,
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
                            auto-apply 
                            locale="de"
                            format="dd.MM.yyyy"
                            model-type="yyyy-MM-dd"
                            input-class-name="dp-custom-input"
                            style="max-width:150px;min-width:150px" >
                            
                        </datepicker>
                       
                    </div>

				</div>
			</template>
		</core-filter-cmpt>

    `
}
