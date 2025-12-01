import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import { Toast } from '../../Toast.js';
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import { FileManager } from './FileManager.js';
import ApiSalaryRange from '../../../api/factory/salaryrange.js';

export const EmployeeTrainingDialog = {
	name: 'EmployeeTrainingDialog',
    components: {
        Modal,
        ModalDialog,
        Toast,
        FileManager,
        "datepicker": VueDatePicker
    },
    props: {
        hauptkategorien: {
          type: Array,
        },
        statistik: {
          type: Array,
        }
    },  
    setup(props) {

        const { watch, ref, inject, toRefs, onMounted, defineExpose, toRaw, reactive } = Vue; 
        const { t } = usePhrasen();
        const mainCatList = ref([])     
        const subCatList = ref([])     
        const isFetching = ref(false)

        const $api = Vue.inject('$api');
        const fhcAlert = inject('$fhcAlert');

        // Modal 
        let modalRef = ref()
        let _resolve
        let _reject

        const createShape = () => {
            return { "training_id" : 1, 
                "main_category_id":"", 
                "sub_category_id":"", 
                "stunden":0, 
                "datum_von":"", 
                "datum_bis":"", 
                "expires":"", 
                "bezeichnung":"",
                "beantragt":false,
                "intern_extern":false,
                "hrfreigabe":false,
                "dokumente": []
            } 
        }

        const currentValue = ref(createShape());
        const preservedValue = ref(createShape());        

        const showModal = (f) => {    
            if (f !== undefined)        
                currentValue.value = f
            else
                currentValue.value = createShape()
            preservedValue.value = {...currentValue.value};
            // reset form state
            frmState.vonBlurred = false;
            frmState.bisBlurred = false;
            frmState.expiresBlurred = false;
            frmState.applicationBlurred = false;
            frmState.approvedBlurred = false;
            frmState.gehaltsbandKurzbzBlurred = false;
            // call bootstrap show function
            modalRef.value.show()

            return new Promise((resolve, reject) => {
                _resolve = resolve
                _reject = reject
            })
        }        

        const hideModal = () => {
            modalRef.value.hide();
        }

        const fetchMainCatList = async () => {
            try {
                isFetching.value = true;
                // const res = await $api.call(ApiSalaryRange.getSalaryRangeList());  
                // salaryRangeList.value = res.meta.status == 'success' ? res.data : [] 
                mainCatList.value = [{kurzbz:'KAT01',bezeichnung:'Kategorie 1'}];
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
        }

        const fetchSubCatList = async () => {
            try {
                isFetching.value = true;
                // const res = await $api.call(ApiSalaryRange.getSalaryRangeList());  
                // salaryRangeList.value = res.meta.status == 'success' ? res.data : [] 
                subCatList.value = [{kurzbz:'SUBKAT01',bezeichnung:'Sub-Kategorie 1'}];
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
        }
    

        onMounted(async () => {
            /* fetchMainCatList()
            fetchSubCatList() */
            //fetchFristEreignisse()            
        })

        // -------------
        // form handling
        // -------------

        const trainingDialogFrm = Vue.ref();

        const frmState = Vue.reactive({ mainCategoryBlurred: false, subCategoryBlurred: false, vonBlurred: false, bisBlurred: false, 
            betragVonBlurred: false, betragBisBlurred: false, wasValidated: false });

        const validInput = (input) => {
            if (input === undefined || input === '')
                return false;
            return true;
        }

        const validBezeichnung = (n) => {
            return !!n && n.trim() != "";
        }

        const validDatum = (n) => {
            return !!n && n.trim() != "";
        }

        const checkDates = (beginn, ende) => {

			if (beginn !== '' && ende !== '' && ende !== null && beginn !== null)
			{
				beginn = new Date(beginn);
				ende = new Date(ende);

				if (ende >= beginn)
				{
					frmState.bisBlurred = false;
					return true;
				}
				else
				{
					frmState.bisBlurred = true;
					return false;
				}
			}
			else
			{
				frmState.bisBlurred = false;
				return true;
			}

		}

        const checkSalaries = (von, bis) => {
            if (von !== '' && bis !== '' && bis !== null && von !== null)
			{
				if (bis >= von)
				{
					frmState.bisBlurred = false;
					return true;
				}
				else
				{
					frmState.bisBlurred = true;
					return false;
				}
			}
			else
			{
				frmState.bisBlurred = false;
				return true;
			}
        }

        const validate = () => {
            frmState.vonBlurred = true;
            frmState.bisBlurred = true;
            frmState.stundenBlurred = true;
            frmState.expiresBlurred = true;
            frmState.applicationBlurred = true;
            frmState.approvedBlurred = true;
            frmState.mainCategoryBlurred = true;
            if (validBezeichnung(currentValue.value?.main_cat) && 
                validDatum(currentValue.value?.von) &&
                validInput(currentValue.value?.betrag_von) &&
                validInput(currentValue.value?.betrag_bis) &&
                checkSalaries(currentValue.value.betrag_von, currentValue.value.betrag_bis) &&
                checkDates(currentValue.value.von, currentValue.value.bis)) {
                return true;
            }
            return false;
        }        

        const hasChanged = Vue.computed(() => {
            return Object.keys(currentValue.value).some(field => currentValue.value[field] !== preservedValue.value[field])
        });

        const okHandler = async () => {
            if (!validate()) {

                console.log("form invalid");

            } else {

                // submit
                try {
                    _resolve({type: 'OK', payload: currentValue.value })
                } catch (error) {
                    console.log(error)              
                } finally {
                    isFetching.value = false
                    hideModal()
                }
                
                
            }
        }

        return { modalRef, mainCatList, subCatList, trainingDialogFrm, currentValue, t, showModal, hideModal, 
            validInput, validDatum, validBezeichnung, frmState, okHandler, hasChanged }
    },
    template: `
    <Modal :title="t('peron','weiterbildung')" ref="modalRef">
        <template #body>
            <form class="row g-3" v-if="currentValue != null"  ref="trainingDialogFrm" id="trainingDialogFrm">
                        
                <div class="col-md-6">
                    <label for="weiterbildung_hauptkategorie_id" class="form-label required">Hauptkategorie</label>
                    <select  id="weiterbildung_hauptkategorie_id" class="form-select form-select-sm" aria-label=".form-select-sm " 
                        @blur="frmState.mainCategoryBlurred = true"   v-model="currentValue.weiterbildung_hauptkategorie_id" 
                        :class="{'is-invalid': !validBezeichnung(currentValue.weiterbildung_hauptkategorie_id) && frmState.mainCategoryBlurred}">
                        <option v-for="(item, index) in hauptkategorie" :value="item.weiterbildung_hauptkategorie_id" >
                            {{ item.bezeichnung }}
                        </option>
                    </select>

                </div>    

                <div class="col-md-6">
                    <label for="weiterbildung_statistik_id" class="form-label required">Statistikkategorie</label>
                    <select  id="weiterbildung_statistik_id" class="form-select form-select-sm" aria-label=".form-select-sm " 
                        @blur="frmState.subCategoryBlurred = true"   v-model="currentValue.weiterbildung_statistik_id" 
                        :class="{'is-invalid': !validBezeichnung(currentValue.weiterbildung_statistik_id) && frmState.subCategoryBlurred}">
                        <option v-for="(item, index) in statistik" :value="item.weiterbildung_statistik_id" >
                            {{ item.bezeichnung }}
                        </option>
                    </select>

                </div>

                <div class="col-md-3">
                    <label for="von" class="form-label">Von</label>
                    <datepicker id="von" 
                        :teleport="true" 
                        @blur="frmState.vonBlurred = true" 
                        :input-class-name="(!validDatum(currentValue.von) && frmState.vonBlurred) ? 'dp-invalid-input' : ''"  
                        v-model="currentValue.von"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div> 
                
                <div class="col-md-3">
                    <label for="bis" class="form-label">Bis</label>
                    <datepicker id="bis" 
                        :teleport="true" 
                        @blur="frmState.bisBlurred = true"                         
                        v-model="currentValue.bis"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>

                <div class="col-md-3">
                    <label for="expires" class="form-label">Ablaufdatum</label>
                    <datepicker id="expires" 
                        :teleport="true" 
                        @blur="frmState.bisBlurred = true"                         
                        v-model="currentValue.bis"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>

                <div class="col-md-3">
                    
                </div>

                <div class="col-md-3">
                    <label for="betrag_von" class="form-label">Stunden</label>
                    <input type="number" 
                        class="form-control form-control-sm" :class="{ 'is-invalid': !validInput(currentValue.betrag_von) && frmState.betragVonBlurred}"  
                        id="betrag_von" maxlength="256" min="0" step="0.01"
                        @blur="frmState.betragVonBlurred = true" 
                        v-model="currentValue.betrag_von">
                </div>

                <div class="col-md-3">
                    <label for="intern" class="form-label">Intern</label>
                    <div>
                        <input class="form-check-input" type="checkbox" id="intern" v-model="currentValue.intern">
                    </div>    
                </div>

                <div class="col-md-3">
                    <label for="betrag_bis" class="form-label">Beantragt</label>
                    <datepicker id="von" 
                        :teleport="true" 
                        @blur="frmState.vonBlurred = true" 
                        :input-class-name="(!validDatum(currentValue.von) && frmState.vonBlurred) ? 'dp-invalid-input' : ''"  
                        v-model="currentValue.von"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>

                <div class="col-md-3">
                    <label for="betrag_von" class="form-label">HR-Freigabe</label>
                    <datepicker id="von" 
                        :teleport="true" 
                        @blur="frmState.vonBlurred = true" 
                        :input-class-name="(!validDatum(currentValue.von) && frmState.vonBlurred) ? 'dp-invalid-input' : ''"  
                        v-model="currentValue.von"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>
                                                
                <div class="col-8" v-if="currentValue.frist_id != 0">
                    <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
                </div>
            </form>  
            
            <FileManager />

        </template>
        <template #footer>
            <button type="button" class="btn btn-primary" :disabled="!hasChanged"  @click="okHandler()" >
                {{ t('ui','speichern') }}
            </button>
        </template>
    </Modal>
    `
}