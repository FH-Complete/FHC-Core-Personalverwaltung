import { Modal } from '../Modal.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';

export const StaleEmployees = {
    components: {
        "datepicker": VueDatePicker,
        "p-skeleton": primevue.skeleton,
        'p-progressbar': primevue.progressbar,
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
            cancelAction.value = false;
            for (let index = 1; index <= selectedData.value.length; index++) {
                progressValue.value = Math.round(index/selectedData.value.length*100);
                // TODO API call
                await sleep(300);
                if (cancelAction.value) {
                    return;
                }
            }
            modalRef.value.hide();
        }

        const cancelHandler = async () => {
            cancelAction.value = true;
            modalRef.value.hide();
            // await fetchData();
        }

        Vue.onMounted(async () => {
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
                { title: 'PNr', field: "personalnummer", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true,width:50 } },
                { title: 'UID', field: "uid", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true} },
                { title: 'Vorname', field: "vorname", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true} },
                { title: 'Nachname', field: "nachname", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
                { title: 'Letzter Lehrauftrag', field: "letzter_lehrauftrag", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
                
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
       
        <div v-else class="flex-grow-1 d-flex flex-column" style="width:100%"  >
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
                    <p-progressbar :value="progressValue"></p-progressbar>
                </div>
            </template>
            <template #footer>                
                <button class="btn btn-primary"  @click="cancelHandler()">Abbrechen</button>
            </template>
        </Modal>
    `
}