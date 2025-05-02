import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';
import ApiSalaryRange from '../../api/factory/salaryrange.js';

export const BetragDialog = {
	name: 'BetragDialog',
    components: {
        Modal,
        ModalDialog,
        Toast,
        "datepicker": VueDatePicker
    },
    props: {
    },  
    setup(props) {

        const { watch, ref, inject, toRefs, onMounted, defineExpose, toRaw, reactive } = Vue; 
        const { t } = usePhrasen();
        const salaryRangeList = ref([])        
        const isFetching = ref(false)

        const $api = Vue.inject('$api');
        const fhcAlert = inject('$fhcAlert');

        // Modal 
        let modalRef = ref()
        let _resolve
        let _reject

        const createShape = () => {
            return {
                gehaltsband_betrag_id: 0,                
                gehaltsband_kurzbz: "",
                von: "",
                bis: "",
                betrag_von: 0,
                betrag_bis: 0,  
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

        const fetchSalaryRangeList = async () => {
            try {
                isFetching.value = true;
                const res = await $api.call(ApiSalaryRange.getSalaryRangeList());  
                salaryRangeList.value = res.error !== 1 ? res.retval : [] 
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
          }
    

        onMounted(async () => {
            fetchSalaryRangeList()
            //fetchFristEreignisse()            
        })

        // -------------
        // form handling
        // -------------

        const salaryRangeDataFrm = Vue.ref();

        const frmState = Vue.reactive({ bezeichnungBlurred: false, vonBlurred: false, bisBlurred: false, 
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
            frmState.betragVonBlurred = true;
            frmState.betragBisBlurred = true;
            frmState.gehaltsbandKurzbzBlurred = true;
            if (validBezeichnung(currentValue.value?.gehaltsband_kurzbz) && 
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

        return { modalRef, salaryRangeList, salaryRangeDataFrm, currentValue, t, showModal, hideModal, 
            validInput, validDatum, validBezeichnung, frmState, okHandler, hasChanged }
    },
    template: `
    <Modal :title="t('gehaltsband','gehaltsband')" ref="modalRef">
        <template #body>
            <form class="row g-3" v-if="currentValue != null"  ref="salaryRangeDataFrm" id="salaryRangeDataFrm">
                        
                <div class="col-md-6">
                    <label for="gehaltsband_kurzbz" class="form-label required">Bezeichnung</label>
                    <select  id="gehaltsband_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " 
                        @blur="frmState.gehaltsbandKurzbzBlurred = true"   v-model="currentValue.gehaltsband_kurzbz" 
                        :class="{'is-invalid': !validBezeichnung(currentValue.gehaltsband_kurzbz) && frmState.gehaltsbandKurzbzBlurred}">
                        <option v-for="(item, index) in salaryRangeList" :value="item.gehaltsband_kurzbz" >
                            {{ item.bezeichnung }}
                        </option>
                    </select>

                </div>    

                <div class="col-md-6"></div>

                <div class="col-md-3">
                    <label for="von" class="required form-label">{{ t('gehaltsband','gueltig_von') }}</label>
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
                    <label for="bis" class="form-label">{{ t('gehaltsband','gueltig_bis') }}</label>
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

                <div class="col-md-6"></div>

                <div class="col-md-3">
                    <label for="betrag_von" class="required form-label">{{ t('gehaltsband','betrag_von') }}</label>
                    <input type="number" 
                        class="form-control form-control-sm" :class="{ 'is-invalid': !validInput(currentValue.betrag_von) && frmState.betragVonBlurred}"  
                        id="betrag_von" maxlength="256" min="0" step="0.01"
                        @blur="frmState.betragVonBlurred = true" 
                        v-model="currentValue.betrag_von">
                </div>

                <div class="col-md-3">
                    <label for="betrag_bis" class="required form-label">{{ t('gehaltsband','betrag_bis') }}</label>
                    <input type="number" 
                        class="form-control form-control-sm" :class="{ 'is-invalid': !validInput(currentValue.betrag_bis) && frmState.betragBisBlurred}"  
                        id="betrag_bis" maxlength="256" min="0" step="0.01"
                        @blur="frmState.betragBisBlurred = true" 
                        v-model="currentValue.betrag_bis">
                </div>
                                                
                <div class="col-8" v-if="currentValue.frist_id != 0">
                    <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
                </div>
            </form>        

        </template>
        <template #footer>
            <button type="button" class="btn btn-primary" :disabled="!hasChanged"  @click="okHandler()" >
                {{ t('ui','speichern') }}
            </button>
        </template>
    </Modal>
    `
}