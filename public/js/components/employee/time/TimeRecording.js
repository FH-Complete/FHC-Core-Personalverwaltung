import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import {OrgChooser} from "../../../components/organisation/OrgChooser.js";
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import ApiZeit from '../../../api/factory/zeit.js';

export const TimeRecording = {
	name: 'TimeRecording',
    components: {
        Modal,
        ModalDialog,
        OrgChooser,
        "datepicker": VueDatePicker
    },
    props: {
        personID: { type: [Number, null], required: true },
        personUID: { type: [String, null], required: true },
    },
    emits: ['updateHeader'],
    setup( props, { emit } ) {

        const $api = Vue.inject('$api');
        const readonly = Vue.ref(false);

        const { t } = usePhrasen();

        const { personID: currentPersonID , personUID: currentPersonUID  } = Vue.toRefs(props);

        const dialogRef = Vue.ref();

        const isFetching = Vue.ref(false);

        const unternehmen = Vue.ref();
        const jobfunctionDefList = Vue.ref([]);
        const orgUnitList = Vue.ref([{value: '', label: '-'}]);

        const calcWeekNumber = (date) => {
            let  startDate = new Date(date.getFullYear(), 0, 1);
            let days = Math.floor((date - startDate) /
                (24 * 60 * 60 * 1000));

            return Math.ceil(days / 7);
        }
        

        let currentDate = new Date();
        const currentYear = Vue.ref(currentDate.getFullYear());
        const currentWeek = Vue.ref(calcWeekNumber(currentDate));

        const timeRecordList = Vue.ref([]);
        const full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const route = VueRouter.useRoute();
        const currentValue = Vue.ref();

        Vue.watch([currentPersonID, currentPersonUID], ([id,uid]) => {
            fetchTimeRecordingList();
        });    

        Vue.watch([currentYear, currentWeek], ([y,w]) => {
            fetchTimeRecordingList();
        });
        
        const fetchTimeRecordingList = async () => {
            if (currentPersonUID.value == null) {
                return;
            }
            try {
              isFetching.value = true;
              const response = await $api.call(ApiZeit.personZeiterfassungByWeek(currentPersonUID.value, currentYear.value, currentWeek.value));
              isFetching.value = false;              
              if (response.data.length>0) {
                timeRecordList.value = response.data;
              } else {
                timeRecordList.value = [];
              }
            } catch (error) {
              console.log(error);
            } finally {
                isFetching.value = false;
            }	
        }

        Vue.onMounted(async () => {
            console.log('Time Recording view mounted', props.personID);

            await fetchTimeRecordingList();

            const dateFormatter = (cell) => {
                return cell.getValue()?.replace(/(.*)-(.*)-(.*)/, '$3.$2.$1');
            }
        })
            

        const formatDate = (d) => {
            if (d != null && d != '') {
		        return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
            } else {
                return ''
            }
        }

        const extractTime = (d) => {
            if (d != null) {
                const temp = new Date(d);
                return  (temp.getHours() < 9 ? '0' : '') + temp.getHours() + ':' + (temp.getMinutes() < 9 ? '0' : '') + temp.getMinutes();
            }
            return '';
        }

        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Intl.DateTimeFormat('de-AT', options);
        const getWeekday = (d) => {
            if (d != null) {
                const temp = new Date(d);
                return  temp.toLocaleDateString('de-AT', { weekday: 'long' });
            }
            return '';
        }
 
        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;

        return { 
            orgUnitList, 
            currentValue,
            currentYear,    
            currentWeek,   
            timeRecordList,     
            dialogRef,
            fullPath,
            route,            
            unternehmen,
            formatDate, 
            t, 
            extractTime,
            getWeekday,
         }
    },
    template: `
    <div class="row">
       
    </div>
    <div class="row pt-md-4">      
         <div class="col">
             <div class="card">
                <div class="card-header">
                    <div class="h5"><h5>{{ t('person','zeiterfassung') }}</h5></div>        
                </div>

                <div class="card-body">
                    <div class="d-grid d-md-flex justify-content-between pt-2 pb-3">
                        
                        <div class="mb-3 row">
                            <div class="col-auto">
                                <label for="yearFilter" class="col-form-label">Jahr</label>
                                <input type="number" class="form-control form-control-sm" id="yearFilter" style="max-width: 5rem" placeholder="Jahr" v-model="currentYear">
                            </div>
                            <div class="col-auto">
                                <label for="weekFilter" class="col-form-label">Woche</label>   
                                <input type="number" class="form-control form-control-sm" id="weekFilter" style="max-width: 5rem" min="1" max="53" placeholder="Woche" v-model="currentWeek">
                            </div>
                        </div>
                    </div>

                    <!-- TODO -->
                    <table class="table">
                        <thead>
                        <tr>
                            <th scope="col">Tag</th>
                            <th scope="col">Datum</th>
                            <th scope="col">Projekt</th>
                            <th scope="col">AP</th>
                            <th scope="col">OE</th>
                            <th scope="col">Aktivität</th>
                            <th scope="col">Start</th>
                            <th scope="col">Ende</th>
                            <th scope="col">Dauer</th>
                            <th scope="col">Beschreibung</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="record in timeRecordList"  :key="record.dates + record.zeitaufzeichnung_id">
                            <td>{{ getWeekday(record.dates) }}</td>
                            <td>{{ formatDate(record.dates) }}</td>
                            <td>{{ record.projekt_kurzbz }}</td>
                            <td></td>
                            <td>{{ record.oe_kurzbz }} </td>
                            <td>{{ record.aktivitaet_kurzbz }} </td>
                            <td>{{ extractTime(record.start) }} </td>
                            <td>{{ extractTime(record.ende) }} </td>
                            <td>{{ record.diff ? record.diff : '00:00' }} </td>
                            <td>{{ record.beschreibung }}</td>
                        </tr>
                        </tbody>




                    </table>
                
                </div>
             </div>
         </div>
    </div>
            

    
    `
}