import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import ApiEmployee from '../../../api/factory/employee.js';

export const EmployeeContractInfo = {
	name: 'EmployeeContractInfo',
    components: {

    
    },
    props: {
        personID: Number,
        personUID: String,
    },
    setup(props, { emit }) {
        const { watch, ref, reactive, computed, inject } = Vue;
        const dvList = ref([]);
        const currentDVID = ref(null);
        const currentDV = ref(null);
        const currentVBS = reactive({
            funktion: {
                zuordnung: [],
                taetigkeit: []
            },
            zeitaufzeichnung: [],
            kuendigungsfrist: [],
            stunden: [],
            allIn: [],
            befristung: [],
            urlaubsanspruch: [],
            zusatzvereinbarung: [],
            karenz: [],
        });
        const isFetching = ref(false);
        const numberFormat = new Intl.NumberFormat();

        const karenztypen = Vue.inject('karenztypen');
        const vertragsarten = inject('vertragsarten');
        const $api = Vue.inject('$api');

        const fetchData = async (uid) => {
            if (uid == null) {
                dvList.value = [];
                vertragList.value = [];
                return;
            }
            isFetching.value = true
            try {
                const res = await $api.call(ApiEmployee.dvInfoByPerson(uid));
                dvList.value = res.data.dvList;
                isFetching.value = false;                   
            } catch (error) {
                console.log(error)
                isFetching.value = false
            }
            
        }

        fetchData(props.personUID);
        watch(
            () => props.personUID,
            (newVal) => {
                fetchData(newVal);
            }
        )

        const formatDate = (d) => {
            if (d != null && d != '') {
                return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
            } else {
                return ''
            }
        }

        const formatVertragsart = (item) => {
            let va = vertragsarten.value.find(kt => kt.value == item);
            return va != undefined ? va.label : item;
        }

        const formatKarenztyp = (item) => {
            let karenztyp = karenztypen.value.find(kt => kt.value == item);
            return karenztyp != undefined ? karenztyp.label : item;
        }

        const formatNumber = (num) => {
            return numberFormat.format(parseFloat(num));
        }

        const getVBStunden = (vbList) => {
            let va = vbList.find(item => item.vertragsbestandteiltyp_kurzbz == 'stunden');
            return va != undefined ? va : null;
        }

        const getVBKarenz = (vbList) => {
            let va = vbList.find(item => item.vertragsbestandteiltyp_kurzbz == 'karenz');
            return va != undefined ? va : null;
        }

        return { dvList, isFetching, formatDate, formatVertragsart, formatKarenztyp, getVBStunden, formatNumber, getVBKarenz }
        
       
    },
    template: `
        <div class="row pt-md-4" >      
            <div class="col">
                <div class="card">
                   <div class="card-header">
                       <div class="h5 mb-0"><h5>Dienstverhältnis</h5></div>
                   </div>
                   <div class="card-body">
                       <template v-if="!isFetching">
                            <div v-if="dvList.length > 0">
                                 <table class="table">
                                     <thead><tr><th>Typ</th><th>DV-Zeitraum</th><th>Wochenstunden</th><th>Karenz</th></tr></thead>
                                     <tbody>
                                        <tr v-for="item in dvList">
                                            <td>{{ formatVertragsart(item.dv.vertragsart_kurzbz) }}</td>
                                            <td>{{ formatDate(item.dv.von) }} -  {{ formatDate(item.dv.bis) }}</td>
                                            <td><span v-if="getVBStunden(item.vb) != null">{{ formatNumber(getVBStunden(item.vb).wochenstunden) }} ( {{ formatDate(getVBStunden(item.vb).von) }} - {{ formatDate(getVBStunden(item.vb).bis) }})</span><span v-else>-</span></td>
                                            <td><span v-if="getVBKarenz(item.vb) != null">{{ formatKarenztyp(getVBKarenz(item.vb).karenztyp_kurzbz) }} ( {{ formatDate(getVBKarenz(item.vb).von) }} - {{ formatDate(getVBKarenz(item.vb).bis) }})</span><span v-else>-</span></td></tr>
                                     </tbody>
                                 </table>
                            </div>
                            <div v-else>kein Dienstverhältnis zum aktuellen Datum vorhanden</div>
                        </template>
                   </div>
                </div>
            </div>
        </div>        
    `
}