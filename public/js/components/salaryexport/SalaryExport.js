import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import {OrgChooser} from "../organisation/OrgChooser.js";
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';
import { progressbar } from '../Progressbar.js';
import { CoreFilterCmpt } from "../../../../../js/components/filter/Filter.js";
import { dateFilter } from '../../../../../js/tabulator/filters/Dates.js';
import {formatter} from '../bulk/valorisationformathelper.js';
import ApiSalaryExport from '../../api/factory/salaryexport.js';

export const SalaryExport = {
	name: 'SalaryExport',
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


        const startOfYear = () => {
            const cleanDate = new Date(currentDate.value);
            const _date = new Date(currentDate.value);
            _date.setFullYear(cleanDate.getFullYear(), 0, 1);
            _date.setHours(0, 0, 0, 0);
            return _date;
        }

        const endOfYear = () => {
            const _date = new Date(currentDate.value);
            const year = _date.getFullYear();
            _date.setFullYear(year + 1, 0, 0);
            _date.setHours(23, 59, 59, 999);
            return _date;
        }

        const startOfMonth = () => {
            const _date = new Date();
            _date.setFullYear(filterMonth.value.year, filterMonth.value.month, 1); 
            _date.setHours(0, 0, 0, 0);
            return _date;
        }

        const endOfMonth = () => {
            const _date = new Date();
            _date.setFullYear(filterMonth.value.year, filterMonth.value.month + 1, 0);
            _date.setHours(23, 59, 59, 999);
            return _date;
        }

        const getFilterInterval = () => {
            return [formatDateISO(startOfMonth()), formatDateISO(endOfMonth())]
        }

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
        const filterMonth = ref({
            month: new Date().getMonth(),
            year: new Date().getFullYear()
          });

        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;

        const truncateDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

        const exportSalarylist = async () => {
            isFetching.value = true
            try {
              const response = await $api.call(ApiSalaryExport.getAll(filterPerson.value, getFilterInterval(), true));     
              
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
            console.log('filter date set: ', d);
            filterMonth.value = d;
            if (d == null) {
                filterDate.value = null;
            } else {
                filterDate.value = d; 
            }
            //fetchData()
            fetchAbrechnungExists();
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


        const fetchAbrechnungExists = async () => {
            try {
                let i = getFilterInterval();
                const res = await $api.call(ApiSalaryExport.abrechnungExists(i[0], currentOrgID.value));  
                if (res.error !== 0) {                    
                    abrechnungExists.value = false;
                  } else {
                    abrechnungExists.value = res.retval.length > 0;
                  }
				if( abrechnungExists.value ) {
					listType.value = 'history';
				} else {
					listType.value = 'live';
				}
				fetchData();
            } catch (error) {
                 console.log(error)              
            } 
        }

        const fetchData = async () => {
            
            isFetching.value = true
            try {
              if (salaryTableRef.value.tabulator != null) {
                salaryTableRef.value.tabulator.dataLoader.alertLoader();
              }
              
              const res = await $api.call(ApiSalaryExport.getAll(listType.value, currentOrgID.value, filterPerson.value, getFilterInterval(), false)); 
              // merge live and history value into one field 
              let value = null;
              let source = '';
              // helper to select the right value and add the index field
              // priority:
              // 1. use data from history table
              // 2. use data from valorisierung table
              // 3. use data from gehaltsbestandteil ("live data")
              const selectValue = (r, index) => {
                if (r.hbetrag_decrypted !== undefined && r.hbetrag_decrypted !== "") {
                    // history data
                    value = r.hbetrag_decrypted
                    source = 'h'
                // TODO data from valorisierung table
                } else if (r.betr_valorisiert_decrypted !== "") {
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
                if (salaryTableRef.value.tabulator != null) {
                    salaryTableRef.value.tabulator.dataLoader.clearAlert();
                }
            }
        }
        
        const runAbrechnungJob = async() => {
            jobRunning.value = true
            try {
                if (salaryTableRef.value.tabulator != null) {
                    salaryTableRef.value.tabulator.dataLoader.alertLoader();
                }
               let i = getFilterInterval();
               const res = await $api.call(ApiSalaryExport.runAbrechnungJob(i[0]));  
//               if (listType.value != 'history') {
//                 listType.value = 'history';                          
//               } else {
//                 fetchData();                                 
//               }
               fetchAbrechnungExists();
            } catch (error) {
              console.log(error)              
            } finally {
                jobRunning.value = false    
                if (salaryTableRef.value.tabulator != null) {
                    salaryTableRef.value.tabulator.dataLoader.clearAlert();
                }           
            }
        }

        const deleteAbrechnung = async() => {
            jobRunning.value = true
            try {
                if (salaryTableRef.value.tabulator != null) {
                    salaryTableRef.value.tabulator.dataLoader.alertLoader();
                }
               let i = getFilterInterval();
               const res = await $api.call(ApiSalaryExport.deleteAbrechnung(i[0], currentOrgID.value));   
//               if (listType.value != 'history') {
//                 listType.value = 'history';                          
//               } else {
//                 fetchData();                                 
//               }
               fetchAbrechnungExists();
            } catch (error) {
              console.log(error)              
            } finally {
                jobRunning.value = false    
                if (salaryTableRef.value.tabulator != null) {
                    salaryTableRef.value.tabulator.dataLoader.clearAlert();
                }           
            }
        }
        

        // Workaround to update tabulator
        Vue.watch(salaryExportList, (newVal, oldVal) => {
            console.log('salaryExportList changed');
            //tabulator.value?.setData(salaryExportList.value);
            if( salaryTableRef.value?.tabulator !== null ) {
                salaryTableRef.value.tabulator.setData(salaryExportList.value);
            }
        }, {deep: true}) 
        
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

      const salaryTableRef = ref(null);   
      
      const moneyFormatterParams = {
        decimal: ",",
        thousand: ".",
        symbol: false,
        symbolAfter: false,
        negativeSign: true,
        precision: 2
      };

      const rowFormatter = (row) => {
        let data = row.getData();
        let now = new Date(new Date().setHours(0, 0, 0, 0));
    
        if(listType.value == 'history' && data.betr_valorisiert_decrypted != data.hbetrag_decrypted ){
            row.getElement().style.color = "#871919"
            row.getElement().style.fontWeight = "bold"
        }
      }


      const salaryTableColumnsDef =  [        
        { title: 'P#', field: "personalnummer", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible:false, download:true },        
        { title: 'GBSTID', field: "gehaltsbestandteil_id", hozAlign: "left", sorter:"string", headerFilter: true, width:150, visible:true, download:true }, 
        { title: 'Vorname', field: "vorname", hozAlign: "left", sorter:"string", headerFilter: true, width:150, visible:true, download:true }, 
        { title: 'Nachname', field: "nachname", hozAlign: "left", sorter:"string", headerFilter: true, width:150, visible:true, download:true }, 
        { title: 'Index', field: "index", visible:false, download:false, hozAlign: "left", sorter:"string", headerFilter:true, width:100  },        
        { title: 'Vertrag', field: "vertragsart_bezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:100 }, 
        { title: 'Freitext', field: "freitext_titel", hozAlign: "left", sorter:"string", headerFilter:true, width:100 }, 
        { title: 'DV Von', field: "dv_von", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'DV Bis', field: "dv_bis", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'Gehaltstyp', field: "gehaltstyp_bezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:150 },
        { title: 'WS', field: "wochenstunden", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money", 
            formatterParams:moneyFormatterParams, width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, accessorDownload: sumsDownload },    
        { title: 'Teilzeittyp', field: "teilzeittyp", hozAlign: "left", sorter:"string", headerFilter:true, width:100 },
        { title: 'Von', field: "von", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'Bis', field: "bis", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'Grundbetrag', field: "grundbetr_decrypted", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money", 
            formatterParams:moneyFormatterParams, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible: false, accessorDownload: sumsDownload },  
        { title: 'Betrag', field: "betrag", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money", 
            formatterParams:moneyFormatterParams, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true},  accessorDownload: sumsDownload },          
       /*  { title: 'Betrag val.', field: "betr_valorisiert_decrypted", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money", 
            formatterParams:moneyFormatterParams, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true}, accessorDownload: sumsDownload, visible: true, download: true }, 
        { title: 'H-Betrag val.', field: "hbetrag_decrypted", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money",
            formatterParams:moneyFormatterParams, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true}, accessorDownload: sumsDownload, visible: true, download: true },  */
        { title: 'Karenz Von', field: "karenz_von", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'Karenz Bis', field: "karenz_bis", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'Karenztyp', field: "karenztyp_bezeichnung", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible:true, download:true },
        { title: 'SVNr.', field: "svnr", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible:false, download:true },
        { title: 'Kst. Typ', field: "ksttypbezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:100 }, 
        { title: 'Kst. Bez.', field: "kstorgbezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:150 }, 
      ];

      // Options

      const salaryTabulatorOptions = Vue.reactive({
          height: "700px",
          reactiveData: true,
          data: salaryExportList.value,
         // index: 'index', 
          layout: 'fitColumns',
          columns: salaryTableColumnsDef,
          rowFormatter: rowFormatter,
          groupBy: "personalnummer",
          groupHeader:function(value, count, data, group) { return data[0].personalnummer + " " + data[0].name_gesamt + " (" + data[0].svnr + ") " },
          initialSort:[
            {column:"nachname", dir:"asc"}, //sort by this first
            // {column:"vorname", dir:"asc"}, //then sort by this second -> wrong sort order tabulator bug?
          ]
      })

      const salaryTabulatorEvents = Vue.computed(() => [
        {
            event: 'cellEdited',            
        },
        {
            event: 'tableBuilt',
            handler: () => {
                //fetchData();
				fetchAbrechnungExists();
            }
        }
      ]);

      const downloadconfig = {
            'csv': {
                formatter:'csv',
                file: 'pv21_gehaltsliste.csv',
                options: {
                    delimiter: ';',
                    bom: true,
                 //   rowGroups: true,
                }
            },            
        }

        const orgSelectedHandler = (orgID) => {
			currentOrgID.value = orgID;
            if (!!filterMonth.value.year) {
				fetchAbrechnungExists();
			}
        }

        const showDeleteModal = async () => {
            
            if (await $fhcAlert.confirm({
                    message: 'Gehaltshistorie von ' + filterMonth.month + '/' + filterMonth.year + ' ' + t('person','wirklichLoeschen'),
                    acceptLabel: 'Löschen',
				    acceptClass: 'p-button-danger'
                }) === false) {
                return;
            }    
            
            await deleteAbrechnung()
            $fhcAlert.alertSuccess(t('person','gehaltshistoriegeloescht'));
        }
                

        return { t, isFetching, salaryTableRef, tableRef, tabulator, currentDate, filterDate, filterMonth, exportSalarylist,
            formatDateISO, filterDateHandler, modalRef, downloadconfig, orgSelectedHandler, 
            salaryTabulatorEvents, salaryTabulatorOptions, listType, showDeleteModal,
            currentBetrag, filterPerson, jobRunning,
            formatDateGerman, progressValue, abrechnungExists, runAbrechnungJob }

    },
    template: `            

        <core-filter-cmpt 
			ref="salaryTableRef"
			table-only
			:side-menu="false"
			:tabulator-options="salaryTabulatorOptions"
            :tabulator-events="salaryTabulatorEvents"		
            :download="downloadconfig"	
			>
			<template #actions>				
			 	<div class="d-flex gap-2 align-items-baseline">					
          
                    <div class="d-grid d-sm-flex gap-1 mb-2 flex-nowrap">       
                        <label for="orgchooser" class="ms-1">Organisation: </label>
                        <org-chooser  @org-selected="orgSelectedHandler" class="form-control form-select-sm" id="orgchooser"></org-chooser>                       
                        <label for="filter_zeitraum" class="ms-1">Monat: </label>
                        <datepicker id="filter" :modelValue="filterMonth" 
                            @update:model-value="filterDateHandler"                            
                            :clearable="true"           
                            month-picker
                            auto-apply 
                            locale="de"
                            input-class-name="dp-custom-input"
                            style="max-width:150px;min-width:150px" >
                            
                        </datepicker>

                        <!--div class="btn-group btn-group-sm ms-2" role="group" aria-label="Gehaltsliste Button Group">
                            <input type="radio" class="btn-check" name="btnGListeTyp" id="btnGListeTypLive" autocomplete="off" value="live" v-model="listType"  >
                            <label class="btn btn-outline-primary" for="btnGListeTypLive">Live</label>

                            <input type="radio" class="btn-check" name="btnGListeTyp" id="btnGListeTypHistorie" autocomplete="off" value="history" v-model="listType">
                            <label class="btn btn-outline-primary" for="btnGListeTypHistorie">Historie</label>
                        </div-->

                        <button  type="button" class="btn btn-sm btn-primary ms-2 text-nowrap" :disabled="filterMonth==null || abrechnungExists || jobRunning">Gehaltshistorie erzeugen</button>
                        <button  v-if="false" type="button" class="btn btn-sm btn-primary ms-2 text-nowrap" :disabled="filterMonth==null || abrechnungExists || jobRunning" @click="runAbrechnungJob">Gehaltshistorie erzeugen</button>	
                        <button  v-if="false" type="button" class="btn btn-sm btn-secondary me-2 text-nowrap" :disabled="filterMonth==null || !abrechnungExists || jobRunning" @click="showDeleteModal">Gehaltshistorie löschen</button>

                    </div>

				</div>
			</template>
		</core-filter-cmpt>

    `
}
