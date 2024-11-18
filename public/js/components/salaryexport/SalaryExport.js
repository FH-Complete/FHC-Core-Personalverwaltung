import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';
import { progressbar } from '../Progressbar.js';
import { CoreFilterCmpt } from "../../../../../js/components/filter/Filter.js";
import { dateFilter } from '../../../../../js/tabulator/filters/Dates.js';
import {formatter} from '../bulk/valorisationformathelper.js';
import { Toast } from '../Toast.js';


export const SalaryExport = {
    components: {
        "datepicker": VueDatePicker,
        "p-skeleton": primevue.skeleton,
        'progressbar': progressbar,
        Modal,
        ModalDialog,
        CoreFilterCmpt,
        Toast,
    },
    props: {
       
    },
    setup( props, context ) {

        const { toRefs, ref } = Vue
        const salaryExportList = ref([])
        const currentBetrag = ref();
        const isFetching = ref(false);
        const jobRunning = ref(false);
        const { t } = usePhrasen();
        const modalRef = ref();
        const cancelAction = ref(false);
        const progressValue = ref(0);

        const tableRef = ref(null); // reference to your table element
        const tabulator = ref(null); // variable to hold your table
        const selectedData = ref([]);

        const abrechnungExists = ref(true);


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
              const response = await Vue.$fhcapi.SalaryExport.getAll(filterPerson.value, getFilterInterval(), true);        
              
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


        const fetchAbrechnungExists = async (date) => {
            try {
                let i = getFilterInterval();
                const res = await Vue.$fhcapi.SalaryExport.abrechnungExists(i[0]);  
                if (res.data.error !==1) {                    
                    abrechnungExists.value = false;
                  } else {
                    abrechnungExists.value = res.data.retval.length > 0;
                  }   
            } catch (error) {
                 console.log(error)              
            } 
        }

        const fetchData = async () => {
            
            isFetching.value = true
            try {
              if (salaryTableRef.value != null) {
                salaryTableRef.value.tabulator.dataLoader.alertLoader();
              }
              const res = await Vue.$fhcapi.SalaryExport.getAll(filterPerson.value, getFilterInterval(), false);         
              if (res.data.error !==1) {
                salaryExportList.value = res.data.retval;
                fetchAbrechnungExists();
              } else {
                salaryExportList.value = [];
              }              
            } catch (error) {
              console.log(error)              
            } finally {
                isFetching.value = false
                if (salaryTableRef.value != null) {
                    salaryTableRef.value.tabulator.dataLoader.clearAlert();
                }
            }
        }
        
        const runAbrechnungJob = async() => {
            jobRunning.value = true
            try {
               let i = getFilterInterval();
              const res = await Vue.$fhcapi.SalaryExport.runAbrechnungJob(i[0]);                                
            } catch (error) {
              console.log(error)              
            } finally {
                jobRunning.value = false               
            }
        }
        
        Vue.onMounted(async () => {
        })

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
            fetchData();
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

      const salaryTableColumnsDef = [
        { title: 'P#', field: "personalnummer", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible:false, download:true },        
        { title: 'Vorname', field: "vorname", hozAlign: "left", sorter:"string", headerFilter: true, width:250, visible:false, download:true }, 
        { title: 'Nachname', field: "nachname", hozAlign: "left", sorter:"string", headerFilter: true, width:250, visible:false, download:true }, 
        { title: 'Vertrag', field: "vertragsart_bezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:100 }, 
        { title: 'DV Von', field: "dv_von", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'DV Bis', field: "dv_bis", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'Gehaltstyp', field: "gehaltstyp_bezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:150 },
        { title: 'WS', field: "wochenstunden", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money", 
            formatterParams:moneyFormatterParams, width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, accessorDownload: sumsDownload },    
        { title: 'Von', field: "von", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'Bis', field: "bis", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'Betrag', field: "grundbetr_decrypted", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money", 
            formatterParams:moneyFormatterParams, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true},  accessorDownload: sumsDownload },  
        { title: 'Betrag val.', field: "betr_valorisiert_decrypted", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money", 
            formatterParams:moneyFormatterParams, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true}, accessorDownload: sumsDownload },    
        { title: 'Karenz Von', field: "karenz_von", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'Karenz Bis', field: "karenz_bis", hozAlign: "center",sorter:"string", formatter: formatDate, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates', accessorDownload: formatter.formatDateGerman },
        { title: 'SVNr.', field: "svnr", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true}, visible:false, download:true },
        { title: 'Kst. Typ', field: "ksttypbezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:100 }, 
        { title: 'Kst. Bez.', field: "kstorgbezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:150 }, 
      ];

      // Options

      const salaryTabulatorOptions = Vue.reactive({
          reactiveData: true,
          data: salaryExportList.value,
          index: 'gehaltsband_betrag_id', // TODO custom index column
          layout: 'fitColumns',
          columns: salaryTableColumnsDef,
          groupBy:function(data) { return data.personalnummer + " " + data.name_gesamt + " (" + data.svnr + ") " },
      })

      const salaryTabulatorEvents = Vue.computed(() => [
        {
            event: 'cellEdited',            
        },
        {
            event: 'tableBuilt',
            handler: () => {
                fetchData();
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
                

        return { t, isFetching, salaryTableRef, tableRef, tabulator, currentDate, filterDate, filterMonth, exportSalarylist,
            formatDateISO, filterDateHandler, modalRef, downloadconfig,
            salaryTabulatorEvents, salaryTabulatorOptions, 
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
                        <label for="filterPerson" >Person: </label>
                        <input type="text" class="form-control form-control-sm"  id="filterPerson" maxlength="32" v-model="filterPerson">

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

                        <button  type="button" class="btn btn-sm btn-primary me-2 text-nowrap" :disabled="filterMonth==null || abrechnungExists || jobRunning" @click="runAbrechnungJob">Abrechnung erzeugen</button>


                    </div>

				</div>
			</template>
		</core-filter-cmpt>
    `
}
