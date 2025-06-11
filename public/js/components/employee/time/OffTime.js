import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import { Toast } from '../../Toast.js';
import {OrgChooser} from "../../../components/organisation/OrgChooser.js";
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import ApiZeit from '../../../api/factory/zeit.js';

export const OffTime = {
	name: 'OffTime',
    components: {
        Modal,
        ModalDialog,
        Toast,
        OrgChooser,
        "datepicker": VueDatePicker
    },
    props: {
        personID: { type: [Number, null], required: true },
        personUID: { type: [String, null], required: true },
    },
    emits: ['updateHeader'],
    setup( props, { emit } ) {

        const readonly = Vue.ref(false);

        const { t } = usePhrasen();
        const $api = Vue.inject('$api');

        const { personID: currentPersonID , personUID: currentPersonUID  } = Vue.toRefs(props);

        const dialogRef = Vue.ref();

        const isFetching = Vue.ref(false);

        const unternehmen = Vue.ref();
        const offTimeList = Vue.ref([]);
        const jobfunctionDefList = Vue.ref([]);
        const orgUnitList = Vue.ref([{value: '', label: '-'}]);

        let currentDate = new Date();
        const currentYear = Vue.ref(currentDate.getFullYear());


        const offTimeTable = Vue.ref(null); // reference to your table element
        const tabulator = Vue.ref(null); // variable to hold your table
        const route = VueRouter.useRoute();
        const currentValue = Vue.ref();

        Vue.watch([currentPersonID, currentPersonUID], ([id,uid]) => {
            fetchOffTimeList();
        });

        Vue.watch(currentYear, (newVal, oldVal) => {            
            fetchOffTimeList();             
        });     
        
        const dateFormatter = (cell) => {
            return cell.getValue()?.replace(/(.*)-(.*)-(.*)/, '$3.$2.$1')
        }

        const dateFromHourFormatter = (cell) => {
            return dateFormatter(cell) + 
                (cell.getRow().getData().vonstunde != null ? ' (' + cell.getRow().getData().vonstunde + ')' : '');
        }

        const dateToHourFormatter = (cell) => {
            return dateFormatter(cell) + 
                (cell.getRow().getData().bisstunde != null ? ' (' + cell.getRow().getData().bisstunde + ')' : '');
        }

        const fetchOffTimeList = async () => {
            if (currentPersonUID.value == null) {
                return;
            }
            try {
              isFetching.value = true;
              const response = await $api.call(ApiZeit.personAbwesenheitenByYear(currentPersonUID.value, currentYear.value));
              isFetching.value = false;              
              console.log('abwesenheiten', response.data);	  
              if (response.data.length>0) {
                offTimeList.value = response.data;
              } else {
                offTimeList.value = [];
              }
            } catch (error) {
              console.log(error);
            } finally {
                isFetching.value = false;
            }	
        }

        Vue.onMounted(async () => {
            console.log('Off time view mounted', props.personID);

            await fetchOffTimeList();

            const dateFormatter = (cell) => {
                return cell.getValue()?.replace(/(.*)-(.*)-(.*)/, '$3.$2.$1');
            }

            const columnsDef = [
                { title: t('ui','bezeichnung'), field: "bezeichnung", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
                { title: t('person','grund'), field: "zeitsperretyp", hozAlign: "left", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
                { title: t('ui','from'), field: "vondatum", hozAlign: "center", formatter: dateFromHourFormatter, width: 140, sorter:"string", headerFilter:true, headerFilterFunc:customHeaderFilter },
                { title: t('global','bis'), field: "bisdatum", hozAlign: "center", formatter: dateToHourFormatter, width: 140, sorter:"string", headerFilter:true, headerFilterFunc:customHeaderFilter },
                { title: t('person','vertretung'), field: "vertretung_uid", hozAlign: "left", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
                { title: t('person','erreichbarkeit'), field: "erreichbarkeit", hozAlign: "left", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },                
              ];            

            let tabulatorOptions = {
				height: "100%",
				layout: "fitColumns",
				movableColumns: true,
				reactiveData: true,
                columns: columnsDef,
                //data: tableData.value,
                data: offTimeList.value,
			};

            tabulator.value = new Tabulator(
				offTimeTable.value,
				tabulatorOptions
			);
            
            function customHeaderFilter(headerValue, rowValue, rowData, filterParams){
                //headerValue - the value of the header filter element
                //rowValue - the value of the column in this row
                //rowData - the data for the row being filtered
                //filterParams - params object passed to the headerFilterFuncParams property
            
                const validDate = function(d){
                    return d instanceof Date && isFinite(d);
                }

                const date1 = new Date(rowValue);
                date1.setHours(0,0,0,0);
                let [day, month, year] = headerValue.split('.')
                if (year < 1000) return true;  // prevents dates like 17.5.2
                const date2 = new Date(+year, +month - 1, +day);
                
                return  !(validDate(date2)) || ((date2 - date1) == 0); //must return a boolean, true if it passes the filter.
            }
            
        })

        Vue.watch(offTimeList, (newVal, oldVal) => {
            console.log('offTimeList changed');
            tabulator.value?.setData(offTimeList.value);
        }, {deep: true})

        const formatDate = (d) => {
            if (d != null && d != '') {
		        return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
            } else {
                return ''
            }
        }
 
        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

        return { 
            offTimeList, orgUnitList, 
            jobfunctionDefList,
            currentValue,
            currentYear,            
            dialogRef,
            route,            
            unternehmen,
            tabulator,
            offTimeTable,            
            formatDate, 
            t, 
         }
    },
    template: `
    <div class="row">
       
    </div>
    <div class="row pt-md-4">      
         <div class="col">
             <div class="card">
                <div class="card-header">
                    <div class="h5"><h5>{{ t('person','abwesenheiten') }}</h5></div>        
                </div>

                <div class="card-body">
                    <div class="d-grid d-md-flex justify-content-between pt-2 pb-3">
                        
                        <div class="mb-3 row">
                            <div class="col-auto">
                                <label for="yearFilter" class="col-form-label">Jahr</label>
                            </div>
                            <div class="col-auto w-50">
                                <input type="number" class="form-control" id="yearFilter" placeholder="Jahr" v-model="currentYear">
                            </div>
                        </div>
                    </div>

                    <!-- TABULATOR -->
                    <div ref="offTimeTable" class="fhc-tabulator"></div>
                
                </div>
             </div>
         </div>
    </div>
            

    
    `
}