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

        // detail table
        const detailTableRef = ref(null);
        const detailList = ref([]);
        const isDetailFetching = ref(false);
        // { oe_kurzbz, bezeichnung } 
        const detailSelection = ref(null);        
        let selectedRowComponent = null;

        //
        const layoutRef = ref(null);
        const TOP_SHARE = 0.55;      // tree height in %
        const MIN_TABLE_HEIGHT = 150;
        const BOTTOM_MARGIN = 16;   
        let topBuilt = false;
        let detailBuilt = false;



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
                selectedRowComponent = null;
            }

            if (detailSelection.value) {
                fetchDetailData();
            }

        }

        const fetchDetailData = async () => {
 
            if (!detailSelection.value) return
 
            isDetailFetching.value = true
            try {
                if (detailTableRef.value?.tabulator != null) {
                    detailTableRef.value.tabulator.dataLoader.alertLoader();
                }
                const res = await $api.call(ApiStaffTurnover.getEmployeesByOrget(
                    filterDate.value,
                    currentOrgID.value,
                    detailSelection.value.oe_kurzbz                    
                ));
                detailList.value = res.data;
            } catch (error) {
                console.log(error)              
            } finally {
                isDetailFetching.value = false
                if (detailTableRef.value?.tabulator != null) {					
                    detailTableRef.value.tabulator.setData(detailList.value);
                    detailTableRef.value.tabulator.dataLoader.clearAlert();
                }
            }
        }
 
        const resetDetail = () => {
            detailSelection.value = null;
            detailList.value = [];
            detailTableRef.value?.tabulator?.setData([]);
        }

        const resetAll = () => {
            selectedOrget.value = null;
            orgets.value = [];
            autocompleteOrgets.value = [];
            departmentList.value = [];
            selectedRowComponent = null;
            tableRef.value?.tabulator?.setData([]);
            resetDetail();
        }



        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds));
        }
        const orgSelectedHandler = (orgID) => {
			if (orgID === currentOrgID.value) return;
            resetAll();
			currentOrgID.value = orgID;
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
             window.addEventListener('resize', onWindowResize);
        })

        Vue.onUnmounted(() => {
            window.removeEventListener('resize', onWindowResize);
            clearTimeout(resizeTimer);
        })

        const moneyFormatterParams = {
            decimal: ",",
            thousand: ".",
            symbol: " %",
            symbolAfter: true,
            precision: 1,
        };



        const layoutTables = () => {

            if (!topBuilt || !detailBuilt) return;

            const top = tableRef.value?.tabulator;
            const bottom = detailTableRef.value?.tabulator;
            const wrapper = layoutRef.value;
            if (!top || !bottom || !wrapper) return;

            // Platz vom oberen Rand des Wrappers bis zum unteren Fensterrand
            const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
            const available = window.innerHeight - wrapperTop - BOTTOM_MARGIN;

            // Höhe von allem, was nicht Tabelle ist (Actions-Leisten, Überschrift, Abstände)
            const overhead = wrapper.offsetHeight - top.element.offsetHeight - bottom.element.offsetHeight;

            const tableSpace = available - overhead;
            const topHeight = Math.max(MIN_TABLE_HEIGHT, Math.floor(tableSpace * TOP_SHARE));
            const bottomHeight = Math.max(MIN_TABLE_HEIGHT, tableSpace - topHeight);

            top.setHeight(topHeight);
            bottom.setHeight(bottomHeight);
        }

        let resizeTimer = null;

        const onWindowResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(layoutTables, 100);
        }
        
        const columnsDef = [
            { title: 'OE', field: "bezeichnung", sorter: "string", minWidth: 180, widthGrow: 3 },
            { title: 'Anfangsbestand', field: "eigen_anfangsbestand", minWidth: 100, widthGrow: 1, hozAlign: "right" },
            { title: 'Zugänge', field: "eigen_zugaenge", minWidth: 100, widthGrow: 1, hozAlign: "right" },
            { title: 'Abgänge', field: "eigen_abgaenge", minWidth: 100, widthGrow: 1, hozAlign: "right" },
            { title: 'Fluktuation (%)', field: "eigen_fluktuation_prozent", minWidth: 120, widthGrow: 1, hozAlign: "right", formatter: "money", formatterParams: moneyFormatterParams },
            { title: 'Kum. Anfangsbestand', field: "gesamt_anfangsbestand", minWidth: 100, widthGrow: 1, hozAlign: "right" },
            { title: 'Kum. Zugänge', field: "gesamt_zugaenge", minWidth: 100, widthGrow: 1, hozAlign: "right" },
            { title: 'Kum. Abgänge', field: "gesamt_abgaenge", minWidth: 100, widthGrow: 1, hozAlign: "right" },
            { title: 'Kum. Fluktuation (%)', field: "gesamt_fluktuation_prozent", minWidth: 120, widthGrow: 1, hozAlign: "right", formatter: "money", formatterParams: moneyFormatterParams },
        ];

        const tabulatorOptions = {
            selectableRows: 1,
            height: "calc(50vh - 140px)",           
            layout: "fitColumns",
            dataTree: true,
            dataTreeStartExpanded: true,
            dataTreeChildField: "_children",
            // footerElement: '<div>&sum; ausgewählt <span id="select_count"></span> / gefiltert <span id="search_count"></span> / gesamt <span id="total_count"></span></div>',
            movableColumns: true,
            reactiveData: true,
            selectable: true,
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
                    topBuilt = true;
                    fetchData();
                    Vue.nextTick(layoutTables);
                }
            },
            {
                event: 'cellClick',
                handler: function(e, cell) {         
                    // ignore +/- click
                    if (e.target.closest('.tabulator-data-tree-control')) return;
        
                    const row = cell.getRow();
                    const data = row.getData();
        
                    detailSelection.value = {
                        oe_kurzbz: data.oe_kurzbz,
                        bezeichnung: data.bezeichnung,
                    };

                    setTimeout(() => {
                        row.getTable().deselectRow();   // ohne Argument: alle abwählen
                        row.select();
                    });

                    selectedRowComponent = row;
        
                    fetchDetailData();
                }
            },
            
        ]);

        // detail table

        const dateFormatter = (cell) => {
            const v = cell.getValue();
            return v ? formatDateGerman(v) : '';
        }

        const isTrue = (v) => v === true || v === 't' || v === 'true' || v === 1 || v === '1';
 
        const boolFormatter = (cell) => {
            return isTrue(cell.getValue())
                ? '<i class="fa fa-check text-success"></i>'
                : '';
        }

        
        const employeeFormatter = (cell) => {
            const d = cell.getRow().getData();
            const url = fullPath + d.person_id + '/' + d.uid;
            return `<a href="${url}">${cell.getValue() ?? ''}</a>`;
        }


        const detailColumnsDef = [
            { title: 'Nachname', field: "nachname", sorter: "string", minWidth: 180, widthGrow: 2, formatter: employeeFormatter },
            { title: 'Vorname', field: "vorname", sorter: "string", minWidth: 120, widthGrow: 2 },
            // { title: 'UID', field: "uid", minWidth: 90, widthGrow: 1 },
            // { title: 'OE im Zeitraum', field: "oe_im_zeitraum", minWidth: 140, widthGrow: 2 },
            // { title: 'Erster Eintritt', field: "erster_eintritt", minWidth: 110, widthGrow: 1, formatter: dateFormatter },
            // { title: 'Letzter Austritt', field: "letzter_austritt", minWidth: 110, widthGrow: 1, formatter: dateFormatter },
            { title: 'Anfangsbestand', field: "anfangsbestand", minWidth: 100, widthGrow: 1, hozAlign: "center", formatter: boolFormatter },
            { title: 'Zugang', field: "zugang_datum", minWidth: 110, widthGrow: 1, formatter: dateFormatter },
            { title: 'Abgang', field: "abgang_datum", minWidth: 110, widthGrow: 1, formatter: dateFormatter },
        ];

        const detailSummary = Vue.computed(() => {
            const rows = detailList.value ?? [];
            const anfangsbestand = rows.filter(r => isTrue(r.anfangsbestand)).length;
            const zugaenge = rows.filter(r => !!r.zugang_datum).length;
            const abgaenge = rows.filter(r => !!r.abgang_datum).length;
            const basis = anfangsbestand + zugaenge;
            const fluktuation = basis > 0 ? abgaenge / basis * 100 : null;
            return { anfangsbestand, zugaenge, abgaenge, fluktuation };
        });
 
        const formatPercent = (v) => v == null
            ? '–'
            : v.toLocaleString('de-AT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
 
        const updateDetailFooter = () => {
            const el = detailTableRef.value?.tabulator?.element?.querySelector('.st-detail-footer');
            if (!el) return;
            if (!detailSelection.value) {
                el.innerHTML = '';
                return;
            }
            const s = detailSummary.value;
            el.innerHTML =
                `Anfangsbestand: <b>${s.anfangsbestand}</b>` +
                ` &nbsp;·&nbsp; Zugänge: <b>${s.zugaenge}</b>` +
                ` &nbsp;·&nbsp; Abgänge: <b>${s.abgaenge}</b>` +
                ` &nbsp;·&nbsp; Fluktuation: <b>${formatPercent(s.fluktuation)}</b>`;
        }
 
        Vue.watch([detailSummary, detailSelection], updateDetailFooter);


        const detailTabulatorEvents = Vue.computed(() => [
            {
                event: 'tableBuilt',
                handler: () => {
                    detailBuilt = true;
                    updateDetailFooter();
                    Vue.nextTick(layoutTables);
                }
            },
        ]);
 
        const detailTabulatorOptions = {
            height: "calc(50vh - 140px)",
            layout: "fitColumns",
            movableColumns: true,
            placeholder: "Bitte oben eine Abteilung anklicken",
            columns: detailColumnsDef,
            data: detailList.value,
            footerElement: '<div class="st-detail-footer text-start w-100 px-1"></div>',
            rowFormatter: (row) => {
                const d = row.getData();
                const el = row.getElement();
                if (d.abgang_datum) {
                    el.style.backgroundColor = '#f8d7da';
                } else if (d.zugang_datum) {
                    el.style.backgroundColor = '#d1e7dd';
                } else {
                    el.style.backgroundColor = '';
                }
            },
        };

        const detailTitle = Vue.computed(() => {
            const sel = detailSelection.value;
            if (!sel) return 'Mitarbeiter:innen';
            return `Mitarbeiter:innen – ${sel.bezeichnung}`;
        });
 
        const detailDownloadconfig = {
            'csv': {
                formatter:'csv',
                file: 'fluktuation_mitarbeiter.csv',
                options: {
                    delimiter: ';',
                    bom: true,
                }
            },
        }

        Vue.watch(selectedOrget, () => {
            resetDetail()
        })



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

        const downloadconfig = {
            'csv': {
                formatter:'csv',
                file: 'fluktuation.csv',
                options: {
                    delimiter: ';',
                    bom: true,
                 //   rowGroups: true,
                }
            },            
        }

        return { isFetching, tableRef, tabulatorOptions, currentDate, modalRef, updateReport, 
            cancelHandler, progressValue, tabulatorEvents, orgSelectedHandler, incFilter, decFilter, 
            filterDateHandler, filterDate, presetDates, orgetDropdownPlaceholder, searchOrgets,
            autocompleteOrgets, selectedOrget, downloadconfig, fetchData,
            detailTableRef, detailTabulatorOptions, detailDownloadconfig, detailTabulatorEvents,
            detailTitle, isDetailFetching, layoutRef }

    },
    template: `    
        <div ref="layoutRef">
            <core-filter-cmpt 
                ref="tableRef"
                table-only
                :side-menu="false"
                :tabulator-options="tabulatorOptions"
                :tabulator-events="tabulatorEvents"
                :download="downloadconfig"
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

                            <button type="button" class="btn btn-sm btn-primary me-2"
                                    @click="fetchData()"
                                    :disabled="!selectedOrget"
                                >
                                <i class="fa fa-sync" :class="{ 'fa-spin': isFetching }"></i>
                            </button>
                        </div>

                    </div>
                </template>
            </core-filter-cmpt>

            <div class="mt-5">
                <h6 class="mb-2 ms-1">
                    {{ detailTitle }}                
                </h6>
                <core-filter-cmpt
                    ref="detailTableRef"
                    table-only
                    :side-menu="false"
                    :tabulator-options="detailTabulatorOptions"
                    :tabulator-events="detailTabulatorEvents"
                    :download="detailDownloadconfig"
                    >
                </core-filter-cmpt>
            </div>
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
