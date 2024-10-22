import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';
import { progressbar } from '../Progressbar.js';
import { CoreFilterCmpt } from "../../../../../js/components/filter/Filter.js";
import { dateFilter } from '../../../../../js/tabulator/filters/Dates.js';
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
        const { t } = usePhrasen();
        const modalRef = ref();
        const cancelAction = ref(false);
        const progressValue = ref(0);

        const tableRef = ref(null); // reference to your table element
        const tabulator = ref(null); // variable to hold your table
        const selectedData = ref([]);


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
            const _date = new Date(currentDate.value);
            _date.setDate(1);
            _date.setHours(0, 0, 0, 0);
            return _date;
        }
        const endOfMonth = () => {
            const _date = new Date(currentDate.value);
            const month = _date.getMonth();
            _date.setFullYear(_date.getFullYear(), month + 1, 0);
            _date.setHours(23, 59, 59, 999);
            return _date;
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

        const addMonths = (date, amount, isEndDate) => {
            const _date = new Date(date);
            if (isNaN(amount)) return _date;
            if (!amount) {
              return _date;
            }
            const dayOfMonth = _date.getDate();
            const endOfDesiredMonth = new Date(date);
            endOfDesiredMonth.setMonth(_date.getMonth() + amount + 1, 0);
            const daysInMonth = endOfDesiredMonth.getDate();
            if (dayOfMonth >= daysInMonth || isEndDate) {
                // If we're already at the end of the month, then this is the correct date
                // and we're done.
                return endOfDesiredMonth;
            } else {
                _date.setFullYear(
                    endOfDesiredMonth.getFullYear(),
                    endOfDesiredMonth.getMonth(),
                    dayOfMonth,
                  );
                return _date;
            }            
        }
        

        const presetDates = ref([
            { label: 'Heute', value: [new Date(), new Date()] },
            { label: 'Aktuelles Monat', value: [startOfMonth(new Date()), endOfMonth(new Date())] },                  
            { label: 'Aktuelles Jahr', value: [startOfYear(new Date()), endOfYear(new Date())] },
          ]);

        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;

        const truncateDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

        const exportSalarylist = async () => {
            isFetching.value = true
            try {
              const response = await Vue.$fhcapi.SalaryExport.getAll(filterPerson.value, filterDate.value, true);        
              
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
            if (d == null) {
                filterDate.value = null;
            } else {
                filterDate.value = d; //truncateDate(new Date(d));
            }
            fetchData()
        }

        const fetchData = async () => {
            
            isFetching.value = true
            try {
              const res = await Vue.$fhcapi.SalaryExport.getAll(filterPerson.value, filterDate.value, false);         
              if (res.data.error !==1) {
                salaryExportList.value = res.data.retval;
              } else {
                salaryExportList.value = [];
              }              
            } catch (error) {
              console.log(error)              
            } finally {
                isFetching.value = false
            }
        }
        

        const dateFormatter = (cell) => {
            return cell.getValue()?.replace(/(.*)-(.*)-(.*)/, '$3.$2.$1');
        }

        const addDays = (date, amount) => {
            const _date = new Date(date);
            _date.setDate(_date.getDate() + amount);
            return _date;
        }

        const diffInMonths = (_dateLeft, _dateRight) => {
            const yearDiff = _dateLeft.getFullYear() - _dateRight.getFullYear();
            const monthDiff = _dateLeft.getMonth() - _dateRight.getMonth();

            return yearDiff * 12 + monthDiff;
        }

        const decFilter = () => {
            let startDate = new Date(filterDate.value[0])
            let endDate = new Date(filterDate.value[1])
            let diffMonths = diffInMonths(startDate, endDate)
            if (diffMonths == -11) {
                // decrement year
                startDate = addMonths(startDate, -12, false)
                endDate = addMonths(endDate, -12, true)
                filterDate.value = [formatDateISO(startDate), formatDateISO(endDate)]
            } else if (diffMonths == 0 && startDate.getDate() == endDate.getDate()) {
                // decrement day
                startDate = addDays(startDate, -1)
                endDate = addDays(endDate, -1)
                filterDate.value = [formatDateISO(startDate), formatDateISO(endDate)]
            } else {
                // decrement month
                filterDate.value = [formatDateISO(addMonths(startDate, -1, false)),formatDateISO(addMonths(endDate, -1, true))]
            }
            fetchData()
        }

        const incFilter = () => {
            let startDate = new Date(filterDate.value[0])
            let endDate = new Date(filterDate.value[1])
            let diffMonths = diffInMonths(startDate, endDate)
            if (diffMonths == -11) {
                // increment year
                startDate = addMonths(startDate, 12, false)
                endDate = addMonths(endDate, 12, true)
                filterDate.value = [formatDateISO(startDate), formatDateISO(endDate)]
            } else if (diffMonths == 0 && startDate.getDate() == endDate.getDate()) {
                // decrement day
                startDate = addDays(startDate, 1)
                endDate = addDays(endDate, 1)
                filterDate.value = [formatDateISO(startDate), formatDateISO(endDate)]
            } else {
                // increment month
                filterDate.value = [formatDateISO(addMonths(startDate, 1, false)),formatDateISO(addMonths(endDate, 1, true))]
            }
            fetchData()
        }

        Vue.onMounted(async () => {

            
            await fetchData()
            
            const columnsDef = [
                /* { title: 'P#', field: "personalnummer", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true} },
                { title: 'Name', field: "name_gesamt", hozAlign: "left", sorter:"string", headerFilter: true, width:250 },
                { title: 'Vertrag', field: "vertragsart_bezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:100 }, */
                { title: 'Gehaltstyp', field: "gehaltstyp_bezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:150 },
                { title: 'Von', field: "von", hozAlign: "center",sorter:"string", formatter: dateFormatter, headerFilter: dateFilter, width:150, headerFilterFunc: 'dates', width:150 },
                { title: 'Bis', field: "bis", hozAlign: "center",sorter:"string", formatter: dateFormatter, headerFilter: dateFilter, width:150, headerFilterFunc: 'dates', width:150 },
                { title: 'Gehalt', field: "betrag_valorisiert", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money", 
                    formatterParams:{
                        decimal:",",
                        thousand:".",
                        negativeSign:true,
                        precision:2,
                    }, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true} },                
                /*{ title: 'SVNr.', field: "svnr", hozAlign: "center", sorter:"string", headerFilter:true, width:150 },                
                 { title: 'Wochenstunden', field: "betrag_bis", sorter:"string", headerFilter:"list", hozAlign: "right", formatter:"money", 
                    formatterParams:{
                        decimal:",",
                        thousand:".",
                        negativeSign:true,
                        precision:2,
                    }, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true} }, */
              ];
    
            let tabulatorOptions = {
                height:"100%",
                width: "100%",
                layout: "fitColumns",
                //rowHeader:{headerSort:false, resizable: false, minWidth:30, width:30, rowHandle:true, formatter:"handle"},
                //movableRows: true,
                reactiveData: true,
                selectable: true,
                index: 'gehaltsband_betrag_id', // TODO custom index column
                columns: columnsDef,
                data: salaryExportList.value,
                groupBy:function(data) { return data.personalnummer + " " + data.name_gesamt + " (" + data.svnr + "), " + data.vertragsart_bezeichnung}
            };
    
            /* tabulator.value = new Tabulator(
                tableRef.value,
                tabulatorOptions
            );
            tabulator.value.on("rowSelectionChanged", data => {
				selectedData.value = data;
			}); */

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

      const salaryTableColumnsDef = [
        /* { title: 'P#', field: "personalnummer", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true} },
        { title: 'Name', field: "name_gesamt", hozAlign: "left", sorter:"string", headerFilter: true, width:250 }, */
        { title: 'Vertrag', field: "vertragsart_bezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:100 }, 
        { title: 'DV Von', field: "dv_von", hozAlign: "center",sorter:"string", formatter: dateFormatter, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates'  },
        { title: 'DV Bis', field: "dv_bis", hozAlign: "center",sorter:"string", formatter: dateFormatter, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates' },
        { title: 'Gehaltstyp', field: "gehaltstyp_bezeichnung", hozAlign: "left", sorter:"string", headerFilter:true, width:150 },
        { title: 'Von', field: "von", hozAlign: "center",sorter:"string", formatter: dateFormatter, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates' },
        { title: 'Bis', field: "bis", hozAlign: "center",sorter:"string", formatter: dateFormatter, headerFilter: dateFilter, width:120, headerFilterFunc: 'dates' },
        { title: 'Gehalt', field: "betrag_valorisiert", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money", 
            formatterParams:{
                decimal:",",
                thousand:".",
                negativeSign:true,
                precision:2,
            }, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true} },                
        /*{ title: 'SVNr.', field: "svnr", hozAlign: "center", sorter:"string", headerFilter:true, width:150 },                
         { title: 'Wochenstunden', field: "betrag_bis", sorter:"string", headerFilter:"list", hozAlign: "right", formatter:"money", 
            formatterParams:{
                decimal:",",
                thousand:".",
                negativeSign:true,
                precision:2,
            }, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true} }, */
            
      ];

      // Options

      const salaryTabulatorOptions = Vue.reactive({
          reactiveData: true,
          data: salaryExportList.value,
          index: 'gehaltsband_betrag_id', // TODO custom index column
          layout: 'fitColumns',
          columns: salaryTableColumnsDef,
          groupBy:function(data) { return data.personalnummer + " " + data.name_gesamt + " (" + data.svnr + ") " }
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
                

        return { t, isFetching, salaryTableRef, tableRef, tabulator, currentDate, presetDates, filterDate, exportSalarylist,
            formatDateISO, filterDateHandler, modalRef, 
            salaryTabulatorEvents, salaryTabulatorOptions, 
            currentBetrag, decFilter, incFilter, filterPerson,
            formatDateGerman, progressValue, startOfMonth, startOfYear, endOfMonth, endOfYear }

    },
    template: `    


        <div v-if="isFetching" class="d-flex justify-content-center container-fluid px-0 " >
            <div  class="spinner-border"  role="status">
                <span class="visually-hidden">Loading...</span>
            </div>           
        </div>
       


        <core-filter-cmpt 
			ref="salaryTableRef"
			table-only
			:side-menu="false"
			:tabulator-options="salaryTabulatorOptions"
            :tabulator-events="salaryTabulatorEvents"			
			>
			<template #actions>				
			 	<div class="d-flex gap-2 align-items-baseline">					
          
                    <button type="button" class="btn btn-sm btn-primary me-2 text-nowrap" @click="exportSalarylist()"><i class="fa fa-file-csv"></i> Export</button>
                    <div class="d-grid d-sm-flex gap-1 mb-2 flex-nowrap">      
                        <label for="filterPerson" class="ms-5">Person: </label>
                        <input type="text" class="form-control form-control-sm"  id="filterPerson" maxlength="32" v-model="filterPerson">

                        <label for="filter_zeitraum" class="ms-1">Zeitraum: </label>
                        <button type="button" class="btn btn-sm btn-primary" @click="decFilter()"  :disabled="filterDate==null"><i class="fa fa-minus"></i></button>  
                        <datepicker id="filter" :modelValue="filterDate" 
                            @update:model-value="filterDateHandler"
                            v-bind:enable-time-picker="false"   
                            :clearable="true"                                 
                            range :preset-dates="presetDates"
                            auto-apply 
                            locale="de"
                            format="dd.MM.yyyy"
                            model-type="yyyy-MM-dd"
                            input-class-name="dp-custom-input"
                            style="max-width:240px;min-width:240px" >
                            
                            <template #preset-date-range-button="{ label, value, presetDate }">
                                <span 
                                    role="button"
                                    :tabindex="0"
                                    @click="presetDate(value)"
                                    @keyup.enter.prevent="presetDate(value)"
                                    @keyup.space.prevent="presetDate(value)">
                                {{ label }}
                                </span>
                            </template>
                        </datepicker>
                        <button type="button" class="btn btn-sm btn-primary me-2" @click="incFilter()" :disabled="filterDate==null"><i class="fa fa-plus"></i></button>  
                    </div>

				</div>
			</template>
		</core-filter-cmpt>
    `
}
