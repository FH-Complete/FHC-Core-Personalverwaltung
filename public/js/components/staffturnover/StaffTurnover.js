import { Modal } from '../Modal.js';
import { usePhrasen } from '../../../../../js/mixins/Phrasen.js';
import { progressbar } from '../Progressbar.js';
import ApiStaffTurnover from '../../api/factory/staffturnover.js';
import ApiDV from '../../api/factory/dv.js';
import { CoreFilterCmpt } from "../../../../../js/components/filter/Filter.js";
import {OrgChooser} from "../organisation/OrgChooser.js";
import ApiFunktion from  '../../../js/api/factory/funktion.js';

export const StaffTurnover = {
	name: 'StaffTurnover',
    components: {
        "datepicker": VueDatePicker,
        "p-skeleton": primevue.skeleton,
        'p-autocomplete': primevue.autocomplete,
        'progressbar': progressbar,
        CoreFilterCmpt,
        OrgChooser,
        Modal,
    },
    props: {
       
    },
    setup( props, context ) {

        const { toRefs, ref, inject } = Vue
        const departmentList = ref([])
        const isFetching = ref(false);
        const { t } = usePhrasen();
        const modalRef = ref();
        const cancelAction = ref(false);
        const progressValue = ref(0);
        const currentOrgID = ref();
        const orgets = ref([])
        const autocompleteOrgets = ref([])
        const orget = ref('')
        const selectedOrget = ref(null)

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
        const filterDate = ref();

        

        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;

        const filterDateHandler = (d) => {            
            console.log('filter date set: ', d);
            if (d == null) {
                filterDate.value = null;
            } else {
                filterDate.value = d; //truncateDate(new Date(d));
            }
            fetchData()
        }

        const buildTree = (rows) => {
            const nodes = new Map(rows.map(r => [r.oe_kurzbz, { ...r }]));
            const roots = [];

            for (const node of nodes.values()) {
                const parent = nodes.get(node.parent_kurzbz);
                if (parent) {
                    (parent._children ??= []).push(node);
                } else {
                    roots.push(node);
                }
            }
            return roots;
        }

        const fetchData = async () => {

            if (!selectedOrget.value) return

            isFetching.value = true
            try {
                if (tableRef.value.tabulator != null) {
                    tableRef.value.tabulator.dataLoader.alertLoader();
                }
                const res = await $api.call(ApiStaffTurnover.getRateByOrget(filterDate.value, currentOrgID.value, selectedOrget.value.value));     
                const tableDataNested = buildTree(res.data);            
                departmentList.value = tableDataNested;
            } catch (error) {
                console.log(error)              
            } finally {
                isFetching.value = false
                if (tableRef.value.tabulator != null) {					
                    tableRef.value.tabulator.setData(departmentList.value);
                    tableRef.value.tabulator.dataLoader.clearAlert();
                }
            }
        }

        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds));
        }
        const orgSelectedHandler = (orgID) => {
			currentOrgID.value = orgID;
            /* if (!!stichtag.value) {
				fetchData();
			} */
        }

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

        const diffInMonths = (_dateLeft, _dateRight) => {
            const yearDiff = _dateLeft.getFullYear() - _dateRight.getFullYear();
            const monthDiff = _dateLeft.getMonth() - _dateRight.getMonth();

            return yearDiff * 12 + monthDiff;
        }

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

        const presetDates = ref([
            { label: 'Heute', value: [new Date(), new Date()] },
            { label: 'Aktuelles Monat', value: [startOfMonth(new Date()), endOfMonth(new Date())] },                  
            { label: 'Aktuelles Jahr', value: [startOfYear(new Date()), endOfYear(new Date())] },
          ]);

        const updateReport = async () => {                 
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

        const moneyFormatterParams = {
            decimal: ",",
            thousand: ".",
            symbol: " %",
            symbolAfter: true,
            precision: 1,
        };
        
        const columnsDef = [
            //{ title: "OE", field: "oe_kurzbz" },
            { title: 'OE', field: "bezeichnung", sorter:"string", width:180, headerFilterParams: {valuesLookup:true, autocomplete:true } },
            { title: 'Anfangsbestand', field: "eigen_anfangsbestand", width:100 },
            { title: 'Zugänge', field: "eigen_zugaenge", width:100 },
            { title: 'Abgänge', field: "eigen_abgaenge", width:100 },
            { title: 'Fluktuation (%)', field: "eigen_fluktuation_prozent", width:120, formatter: "money", formatterParams:moneyFormatterParams},
            { title: 'Kum. Anfangsbestand', field: "gesamt_anfangsbestand", width:100},
            { title: 'Kum. Zugänge', field: "gesamt_zugaenge", width:100},
            { title: 'Kum. Abgänge', field: "gesamt_abgaenge", width:100},
            { title: 'Kum. Fluktuation (%)', field: "gesamt_fluktuation_prozent", width:120, formatter: "money", formatterParams:moneyFormatterParams },
                        
        ];

        const tabulatorOptions = {
            height: "calc(100vh - 200px)",
            width: "100%",
            layout: "fitColumns",
            dataTree: true,
            dataTreeStartExpanded: true,
            dataTreeChildField: "_children",
            // footerElement: '<div>&sum; ausgewählt <span id="select_count"></span> / gefiltert <span id="search_count"></span> / gesamt <span id="total_count"></span></div>',
            movableColumns: true,
            reactiveData: true,
            //selectable: false,
            columns: columnsDef,
            data: departmentList.value,
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
            /*{
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
            } */
        ]);


        // Workaround to update tabulator
        Vue.watch(departmentList, (newVal, oldVal) => {
            console.log('departmentList changed');
            tabulator.value?.setData(departmentList.value);
        }, {deep: true})  
        
        Vue.watch(currentOrgID, () => {
            getOrgetsForCompany()
        })
        
        const setAutocompleteOrget = () => {
            if (orget.value.length > 0 && autocompleteOrgets.value.length > 0) {
                selectedOrget.value = autocompleteOrgets.value.find((item) => orget.value === item.value)
            }
        }

        const getOrgetsForCompany = async () => {
            if (!currentOrgID.value) {
                return
            }

            const response = await $api.call(ApiFunktion.getOrgetsForCompany(currentOrgID.value))
            const result = response.data

            result.unshift({
                value: '',
                label: 'OrgEinheit wählen',
                disabled: true
            })

            orgets.value = result
            autocompleteOrgets.value = [...orgets.value]
            setAutocompleteOrget()
        }
        
        const orgetDropdownPlaceholder = Vue.computed(() => 
            currentOrgID.value ? 'OrgEinheit wählen' : 'Bitte zuerst ein Unternehmen auswählen'
        )

        const searchOrgets = (event) => {
            setTimeout(() => {
                const query = event.query.trim().toLowerCase()

                autocompleteOrgets.value = query.length
                ? orgets.value.filter((item) => item.label.toLowerCase().includes(query))
                : [...orgets.value]
            }, 250)
        }

        return { isFetching, tableRef, tabulatorOptions, currentDate, modalRef, updateReport, 
            cancelHandler, progressValue, tabulatorEvents, orgSelectedHandler, incFilter, decFilter, 
            filterDateHandler, filterDate, presetDates, orgetDropdownPlaceholder, searchOrgets,
            autocompleteOrgets, selectedOrget }

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
                        
                    <label for="orgchooser" class="ms-1">Organisation: </label>
                    <org-chooser  @org-selected="orgSelectedHandler" class="form-control form-select-sm" id="orgchooser"></org-chooser>

                    <div class="d-grid d-sm-flex gap-2 mb-2 flex-nowrap">
                        <label class="ms-1">Abteilung: </label>                        
                        <p-autocomplete 
                            v-model="selectedOrget" 
                            dropdown 
                            dropdownMode="current" 
                            :suggestions="autocompleteOrgets" 
                            @complete="searchOrgets"
                            optionLabel="label"
                            optionDisabled="disabled"
                            forceSelection                     
                            :placeholder="orgetDropdownPlaceholder"
                            style="max-width:240px;min-width:240px" 
                            :input-style="{ height: 'calc(1.5em + .5rem + 2px)', paddingTop: '.25rem', paddingBottom: '.25rem', fontSize: '.875rem' }"
                            input-class="p-inputtext-sm form-control form-control-sm"
                            :pt="{
                                root: { style: 'display: flex; align-items: stretch;' },
                                dropdownButton: {
                                root: { style: 'height: auto; padding: 0; width: 2rem; line-height: 1; box-sizing: border-box;' },
                                label: { style: 'display: none;' }
                                }
                            }"
                        ></p-autocomplete>                        
                    </div>


                    <div class="d-grid d-sm-flex gap-2 mb-2 flex-nowrap">      
                        <label for="filter" class="ms-1">Zeitraum: </label>
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
