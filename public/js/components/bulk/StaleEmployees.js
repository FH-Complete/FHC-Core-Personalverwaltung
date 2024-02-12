import { Modal } from '../Modal.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';
import { progressbar } from '../Progressbar.js';

export const StaleEmployees = {
    components: {
        "datepicker": VueDatePicker,
        "p-skeleton": primevue.skeleton,
        'progressbar': progressbar,
        Modal,
    },
    props: {
       
    },
    setup( props, context ) {

        const { toRefs, ref } = Vue
        const employeeList = ref([])
        const isFetching = ref(false);
        const { t } = usePhrasen();
        const modalRef = ref();
        const cancelAction = ref(false);
        const progressValue = ref(0);

        const tableRef = ref(null); // reference to your table element
        const tabulator = ref(null); // variable to hold your table
        const selectedData = ref([]);
        
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
              const res = await Vue.$fhcapi.Employee.getEmployeesWithoutContract();                    
              employeeList.value = res.data.retval;
            } catch (error) {
              console.log(error)              
            } finally {
                isFetching.value = false
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
            for (let index = 1; index <= selectedData.value.length; index++) {
                progressValue.value = Math.round(index/selectedData.value.length*100);
                const payload = { 
                    dienstverhaeltnisid: selectedData.value[index-1].dienstverhaeltnis_id,
                    gueltigkeit: { data: { gueltig_bis: currentDate.value} }
                }
                
                // API call
                try {
                    const response = await Vue.$fhcapi.DV.endDV(payload)
                    console.log(response.data);
                    if (response.data.error === 1) {
                            console.log(response.data.retval)
                    }
                    
                    if (cancelAction.value) {
                        await fetchData();
                        return;
                    }
                } catch (error) {
                  console.log(error)              
                } 
                
            }

            await fetchData()
            modalRef.value.hide();
        }

        const cancelHandler = async () => {
            cancelAction.value = true;
            modalRef.value.hide();
            // await fetchData();
        }

        Vue.onMounted(async () => {

            const dvFormatter = (cell) => {
                const rowData = cell.getRow().getData()
                const url = fullPath + rowData.person_id + '/' + rowData.uid + '/contract/' + rowData.dienstverhaeltnis_id;
                return cell.getValue() != null ? 
                    `<a href="${url}">${cell.getValue()}</a> (${formatDateGerman(rowData.von)} - ${rowData.bis ? formatDateGerman(rowData.bis) : '?' })` 
                    : '' ;
            }

            await fetchData()
            
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
    
            let tabulatorOptions = {
                height:"100%",
                width: "100%",
                layout: "fitColumns",
                movableColumns: true,
                reactiveData: true,
                selectable: true,
                columns: columnsDef,
                data: employeeList.value,
            };
    
            tabulator.value = new Tabulator(
                tableRef.value,
                tabulatorOptions
            );
            tabulator.value.on("rowSelectionChanged", data => {
				selectedData.value = data;
			});

        })

        // Workaround to update tabulator
        Vue.watch(employeeList, (newVal, oldVal) => {
            console.log('employeeList changed');
            tabulator.value?.setData(employeeList.value);
        }, {deep: true})        

        return { isFetching, tableRef, tabulator, currentDate, modalRef, finishContract, cancelHandler, progressValue }

    },
    template: `    
        <div v-if="isFetching" class="d-flex justify-content-center container-fluid px-0 " >
            <div  class="spinner-border"  role="status">
                <span class="visually-hidden">Loading...</span>
            </div>           
        </div>
       
        <div class="flex-grow-1 d-flex flex-column" style="width:100%"  >
            <div class="d-grid d-md-flex align-items-start pt-2 pb-3">
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
            <!-- TABULATOR -->
            <div ref="tableRef" class="fhc-tabulator" style="height:300px"></div>
        </div>

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