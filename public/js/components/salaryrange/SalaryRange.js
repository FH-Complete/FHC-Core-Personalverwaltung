import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';
import { progressbar } from '../Progressbar.js';
import { BetragDialog } from './BetragDialog.js';
import { dateFilter } from '../../../../../js/tabulator/filters/Dates.js';
import { Toast } from '../Toast.js';
import ApiSalaryRange from '../../api/factory/salaryrange.js';


export const SalaryRange = {
	name: 'SalaryRange',
    components: {
        "datepicker": VueDatePicker,
        "p-skeleton": primevue.skeleton,
        'progressbar': progressbar,
        Modal,
        ModalDialog,
        BetragDialog,
        Toast,
    },
    props: {
       
    },
    setup( props, context ) {

        const { toRefs, ref, inject } = Vue
        const betragDialogRef = ref();
        const deleteToastRef = ref();
        const createToastRef = ref();
        const updateToastRef = ref();
        const salaryRangeList = ref([])
        const currentBetrag = ref();
        const isFetching = ref(false);
        const { t } = usePhrasen();
        const modalRef = ref();
        const confirmDeleteRef = ref();
        const cancelAction = ref(false);
        const progressValue = ref(0);

        const tableRef = ref(null); // reference to your table element
        const tabulator = ref(null); // variable to hold your table
        const selectedData = ref([]);

        const $api = Vue.inject('$api');
        const fhcAlert = inject('$fhcAlert');

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
              const res = await $api.call(ApiSalaryRange.getAll(filterDate.value));  
              if (res?.meta?.status == 'success') {
                salaryRangeList.value = res.data;
              } else {
                salaryRangeList.value = [];
              }              
            } catch (error) {
              fhcAlert.handleSystemError(error)
            } finally {
                isFetching.value = false
            }
        }

        const addSalaryRange = async () => {
            const dialogRes = await betragDialogRef.value.showModal();
            if (dialogRes.type == 'OK') {
                console.log("dialogRes=", dialogRes);
                
                try {
                    const res = await $api.call(ApiSalaryRange.upsertSalaryRange(dialogRes.payload)); 
                    if (res?.meta?.status == 'success') {
                        fetchData();
                        createToastRef.value.show();
                      // salaryRangeList.value = res.data.retval;
                    } else {
                     // salaryRangeList.value = [];
                    }              
                  } catch (error) {
                    console.log(error)              
                  } finally {
                      isFetching.value = false
                  }

            } else {
                return
            }
        }

        const editSalaryRange = async (currentRow) => {
            let val = {...currentRow}
            const dialogRes = await betragDialogRef.value.showModal(val);
            if (dialogRes.type == 'OK') {
                console.log("dialogRes=", dialogRes);
                
                try {
                    const res = await $api.call(ApiSalaryRange.upsertSalaryRange(dialogRes.payload));      
                    if (res?.meta?.status == 'success') {
                        fetchData();
                        updateToastRef.value.show();
                    } else {
                     // salaryRangeList.value = [];
                    }              
                  } catch (error) {
                    console.log(error)              
                  } finally {
                      isFetching.value = false
                  }

            } else {
                return
            }
        }
        

        const cancelHandler = async () => {
            cancelAction.value = true;
            modalRef.value.hide();
            // await fetchData();
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
                { title: 'Bezeichnung', field: "bezeichnung", sorter:"string", headerFilter:"list", width:250, headerFilterParams: {valuesLookup:true, autocomplete:true} },
                { title: 'Gültig von', field: "von", hozAlign: "center", sorter:"string", formatter: dateFormatter, headerFilter: dateFilter, width:150, headerFilterFunc: 'dates' },
                { title: 'Gültig bis', field: "bis", hozAlign: "center", sorter:"string", formatter: dateFormatter, headerFilter: dateFilter, width:150, headerFilterFunc: 'dates' },
                { title: 'Betrag von', field: "betrag_von", sorter:"string", headerFilter:"list",hozAlign: "right", formatter:"money", 
                    formatterParams:{
                        decimal:",",
                        thousand:".",
                        negativeSign:true,
                        precision:2,
                    }, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true} },
                { title: 'Betrag bis', field: "betrag_bis", sorter:"string", headerFilter:"list", hozAlign: "right", formatter:"money", 
                    formatterParams:{
                        decimal:",",
                        thousand:".",
                        negativeSign:true,
                        precision:2,
                    }, width:150, headerFilterParams: {valuesLookup:true, autocomplete:true} },
                { title: 'Aktionen',
                    field: 'actions',
                    width: 145,	// Ensures Action-buttons will be always fully displayed
                    minWidth: 105,	// Ensures Action-buttons will be always fully displayed
                    maxWidth: 145,	// Ensures Action-buttons will be always fully displayed
                    formatter: (cell, formatterParams, onRendered) => {
                        let container = document.createElement('div');
                        container.className = "d-flex gap-2";            

                        let button = document.createElement('button');
                        button.className = 'btn btn-sm btn-outline-secondary';
                        button.innerHTML = '<i class="fa fa-edit"></i>';
                        button.addEventListener('click', (event) =>
                            editSalaryRange(cell.getRow().getData())
                        );
                        container.append(button);
                        button = document.createElement('button');
                        button.className = 'btn btn-sm btn-outline-secondary';
                        button.innerHTML = '<i class="fa fa-xmark"></i>';
                        button.addEventListener('click', () =>
                            //deleteData(cell.getRow().getIndex())
                            showDeleteModal(cell.getRow().getIndex())
                        );
                        container.append(button);
                        return container
                    }
                }
              ];
    
            let tabulatorOptions = {
                height:"100%",
                width: "100%",
                layout: "fitColumns",
                //rowHeader:{headerSort:false, resizable: false, minWidth:30, width:30, rowHandle:true, formatter:"handle"},
                //movableRows: true,
                reactiveData: true,
                selectable: true,
                index: 'gehaltsband_betrag_id',
                columns: columnsDef,
                data: salaryRangeList.value,
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
        Vue.watch(salaryRangeList, (newVal, oldVal) => {
            console.log('salaryRangeList changed');
            tabulator.value?.setData(salaryRangeList.value);
        }, {deep: true})   
        
        const showDeleteModal = async (id) => {
            currentBetrag.value = salaryRangeList.value.find((item) => item.gehaltsband_betrag_id == id);
            const ok = await confirmDeleteRef.value.show();
            
            if (ok) {   
    
                try {
                    const res = await $api.call(ApiSalaryRange.deleteSalaryRange(id));             
                    if (res?.meta?.status == 'success') {
                        salaryRangeList.value = salaryRangeList.value.filter((item) => item.gehaltsband_betrag_id != id);
                        deleteToastRef.value.show();
                    }
                } catch (error) {
                    console.log(error)              
                } finally {
                      isFetching.value = false
                }                  
                
            }
        }

        return { t, isFetching, tableRef, tabulator, currentDate, presetDates, filterDate, 
            formatDateISO, filterDateHandler, modalRef, confirmDeleteRef, deleteToastRef, 
            createToastRef, updateToastRef, currentBetrag, addSalaryRange, betragDialogRef, decFilter, incFilter,
            cancelHandler, formatDateGerman, progressValue, startOfMonth, startOfYear, endOfMonth, endOfYear }

    },
    template: `    

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="updateToastRef">
                <template #body><h4>{{ t('gehaltsband','gehaltsband_gespeichert') }}</h4></template>
            </Toast>
        </div>

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="createToastRef">
                <template #body><h4>{{ t('gehaltsband','gehaltsband_erstellt') }}</h4></template>
            </Toast>
        </div>

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="deleteToastRef">
                <template #body><h4>{{ t('gehaltsband','gehaltsband_geloescht') }}</h4></template>
            </Toast>
        </div>


        <div v-if="isFetching" class="d-flex justify-content-center container-fluid px-0 " >
            <div  class="spinner-border"  role="status">
                <span class="visually-hidden">Loading...</span>
            </div>           
        </div>
       
        <div class="flex-grow-1 d-flex flex-column" style="width:100%"  >
            <div class="d-flex">
                <div class="me-auto">
                    <button type="button" class="btn btn-sm btn-primary me-3" @click="addSalaryRange()"><i class="fa fa-plus"></i> hinzufügen</button>
                </div>
                <div class="d-grid d-sm-flex gap-2 mb-2 flex-nowrap">      
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
            <!-- TABULATOR -->
            <div ref="tableRef" class="fhc-tabulator" style="height:300px"></div>
        </div>

        <betrag-dialog  ref="betragDialogRef"></betrag-dialog>

        <ModalDialog :title="t('global','warnung')" ref="confirmDeleteRef">
            <template #body>
                {{ t('gehaltsband','gehaltsband') }} '{{ currentBetrag?.bezeichnung }} ({{ formatDateGerman(currentBetrag?.von) }}-{{ formatDateGerman(currentBetrag?.von) }})' {{ t('person','wirklichLoeschen') }}?
            </template>
        </ModalDialog>

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
