import { Modal } from '../Modal.js';
import { usePhrasen } from '../../../../../js/mixins/Phrasen.js';
import { progressbar } from '../Progressbar.js';
import ApiEmployee from '../../api/factory/employee.js';
import ApiDV from '../../api/factory/dv.js';
import { CoreFilterCmpt } from "../../../../../js/components/filter/Filter.js";

export const StaleEmployees = {
	name: 'StaleEmployees',
    components: {
        "datepicker": VueDatePicker,
        "p-skeleton": primevue.skeleton,
        'progressbar': progressbar,
        CoreFilterCmpt,
        Modal,
    },
    props: {
       
    },
    setup( props, context ) {

        const { toRefs, ref, inject } = Vue
        const employeeList = ref([])
        const isFetching = ref(false);
        const { t } = usePhrasen();
        const modalRef = ref();
        const cancelAction = ref(false);
        const progressValue = ref(0);

        const tableRef = ref(null); // reference to your table element
        const tabulator = ref(null); // variable to hold your table
        const selectedData = ref([]);

        const $api = Vue.inject('$api');
        const fhcAlert = inject('$fhcAlert');
        
        const formatDateISO = (ds) => {
            let padNum = (n) => {
                if (n<10) return '0' + n;
                return n;
            }
            if (ds == null) return '';
            var d = new Date(ds);
            return d.getFullYear() + "-" + padNum((d.getMonth()+1)) + "-" + padNum(d.getDate());
        }

        const formatDateGerman = (date) => date.substring(8, 10) + "." + date.substring(5, 7) + "." + date.substring(0, 4)

        const currentDate = ref(formatDateISO(new Date()));

        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;

        const fetchData = async () => {
            
            isFetching.value = true
            try {
                if (tableRef.value.tabulator != null) {
                    tableRef.value.tabulator.dataLoader.alertLoader();
                }
                const res = await $api.call(ApiEmployee.getEmployeesWithoutContract());                 
                employeeList.value = res.data;
            } catch (error) {
                console.log(error)              
            } finally {
                isFetching.value = false
                if (tableRef.value.tabulator != null) {					
                    tableRef.value.tabulator.setData(employeeList.value);
                    tableRef.value.tabulator.dataLoader.clearAlert();
                }
            }
        }

        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds));
        }

        const finishContract = async () => {                 
            progressValue.value = 0;            
            modalRef.value.show();
            //await sleep(500);
            cancelAction.value = false;
            let promises = [];
            for (let index = 1; index <= selectedData.value.length; index++) {
                progressValue.value = Math.round(index/selectedData.value.length*100);
                const payload = { 
                    dienstverhaeltnis_id: selectedData.value[index-1].dienstverhaeltnis_id,
                    gueltig_bis: currentDate.value 
                }
                
                // API call
                try {
                    promises.push(
                        $api.call(ApiDV.deactivateDV(payload))                            
                    );	 
                    //await sleep(20); 
                    
                    
                    if (cancelAction.value) {
                        await fetchData();
                        return;
                    }
                } catch (error) {
                  console.log(error)              
                } 
                
            }
            Promise.all(promises).then(result => {
                if (result.error === 1) {
                    console.log(result)
                    fhcAlert.handleSystemError(result)
                }
            })
            .catch(fhcAlert.handleSystemError)

            await fetchData()
            modalRef.value.hide();
        }

        const cancelHandler = async () => {
            cancelAction.value = true;
            modalRef.value.hide();
            // await fetchData();
        }


        const dvFormatter = (cell) => {
            const rowData = cell.getRow().getData()
            const url = fullPath + rowData.person_id + '/' + rowData.uid + '/contract/' + rowData.dienstverhaeltnis_id;
            return cell.getValue() != null ? 
                `<a href="${url}">${cell.getValue()}</a> (${formatDateGerman(rowData.von)} - ${rowData.bis ? formatDateGerman(rowData.bis) : '?' })` 
                : '' ;
        }

        Vue.onMounted(async () => {
            //await fetchData();
        })
        
        const columnsDef = [
            {
                formatter: 'rowSelection',
                titleFormatter: 'rowSelection',
                hozAlign: 'center',
                headerHozAlign: 'center',
                headerSort: false,
                width: 40,
                maxWidth: 40,
                minWidth: 40,
                },
            { title: 'PNr', field: "personalnummer", sorter:"string", headerFilter:"list", width:80, headerFilterParams: {valuesLookup:true, autocomplete:true } },
            { title: 'UID', field: "uid", sorter:"string", headerFilter:"list", width:100, headerFilterParams: {valuesLookup:true, autocomplete:true} },
            { title: 'Vorname', field: "vorname", sorter:"string", headerFilter:"list", width:200, headerFilterParams: {valuesLookup:true, autocomplete:true} },
            { title: 'Nachname', field: "nachname", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
            { title: 'Letzter Lehrauftrag', field: "letzter_lehrauftrag", headerFilter:"list", width:250, 
                    sorter:function(a, b, aRow, bRow, column, dir, sorterParams){
                        if (a === null || a === '') return ( b===0 || b === '') ? 0 : -1
                        if (b === null || b === '') return 1
                        try {
                            const yearA = parseInt(a.substring(2))
                            const yearB = parseInt(b.substring(2))
                            const isSummerA = a.substring(0,2) == 'SS' 
                            const isSummerB = b.substring(0,2) == 'SS' 
                            if (yearA != yearB) {
                                return yearA - yearB
                            } else if (isSummerA && !isSummerB) {
                                return -1
                            } else if (!isSummerA && isSummerB) {
                                return 1
                            }
                        } catch(e)  {
                            console.error(e)
                        }
                        return 0
                    },
                    headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
            { title: 'DV/Unternehmen', field: "dv_unternehmen", formatter: dvFormatter, sorter:"string", headerFilter:"list", width:380,
                    cellClick:function(e, cell){
                        // hack to prevent row selection
                        let currRow = cell.getRow();
                        if (currRow.isSelected()) {
                            currRow.deselect();
                        } else {
                            currRow.select();
                        }
                    }, headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
            
            
            ];

        const tabulatorOptions = {
            height: "calc(100vh - 200px)",
            width: "100%",
            layout: "fitColumns",
            footerElement: '<div>&sum; ausgewählt <span id="select_count"></span> / gefiltert <span id="search_count"></span> / gesamt <span id="total_count"></span></div>',
            movableColumns: true,
            reactiveData: true,
            selectable: true,
            columns: columnsDef,
            data: employeeList.value,
        };

        const tabulatorEvents = Vue.computed(() => [
            {
                event: 'cellEdited',            
            },
            {
                event: 'tableBuilt',
                handler: () => {
                    fetchData();
                }
            },
            {
                event: "dataFiltered",
                handler: function(filters, rows) {
                    const el = document.getElementById("search_count");
                    el.innerHTML = rows.length;
                }
            },
            {
                event: "dataLoaded",
                handler: function(data) {
                    const el = document.getElementById("total_count");
                    el.innerHTML = data.length;
                    // init
                    const el_select = document.getElementById("select_count");
                    el_select.innerHTML = '0';
                }
            },
            {
                event : "rowSelectionChanged",
                handler: function(data) {
                    selectedData.value = data;
                    const el = document.getElementById("select_count");
                    el.innerHTML = data.length;
                }
            }
        ]);


        // Workaround to update tabulator
        Vue.watch(employeeList, (newVal, oldVal) => {
            console.log('employeeList changed');
            tabulator.value?.setData(employeeList.value);
        }, {deep: true})        

        return { isFetching, tableRef, tabulatorOptions, currentDate, modalRef, finishContract, cancelHandler, progressValue, tabulatorEvents }

    },
    template: `    
        <div v-if="isFetching" class="d-flex justify-content-center container-fluid px-0 " >
            <div  class="spinner-border"  role="status">
                <span class="visually-hidden">Loading...</span>
            </div>           
        </div>
       

        <core-filter-cmpt 
			ref="tableRef"
			table-only
			:side-menu="false"
			:tabulator-options="tabulatorOptions"
            :tabulator-events="tabulatorEvents"
			>
			<template #actions>				
			 	<div class="d-flex gap-2 align-items-baseline">					
          
                    <div class="d-grid d-sm-flex gap-1 mb-2 flex-nowrap">       
                        <datepicker id="currentDateSelect" 
                            v-model="currentDate"
                            v-bind:enable-time-picker="false"   
                            :clearable="false"                                 
                            six-weeks
                            auto-apply 
                            locale="de"
                            format="dd.MM.yyyy"
                            model-type="yyyy-MM-dd"
                            input-class-name="dp-custom-input"
                            style="max-width:140px;min-width:140px;margin-right:3px" >
                        </datepicker>
                        <button type="button" class="btn btn-sm btn-primary me-3" @click="finishContract()"><i class="fa fa-plus"></i> DV beenden</button>                       
                    </div>

				</div>
			</template>
		</core-filter-cmpt>

        <Modal title="DV beenden" ref="modalRef">
            <template #body>
                <div >
                    <progressbar :percent="progressValue" bgType="bg-info"></progressbar>
                </div>
            </template>
            <template #footer>                
                <button class="btn btn-primary"  @click="cancelHandler()">Abbrechen</button>
            </template>
        </Modal>
    `
}
