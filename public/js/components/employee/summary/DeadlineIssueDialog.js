import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import { Toast } from '../../Toast.js';
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import ApiDeadline from '../../../api/factory/deadline.js';


export const DeadlineIssueDialog = {
	name: 'DeadlineIssueDialog',
    components: {
        Modal,
        ModalDialog,
        Toast,
        "datepicker": VueDatePicker
    },
    props: {
    },  
    setup(props) {

        const { watch, ref, toRefs, onMounted, defineExpose, toRaw, reactive, inject } = Vue; 
        const { t } = usePhrasen();
        const frist = ref()
        const fristStatus = ref([])
        const fristEreignisse = ref([])
        const isFetching = ref(false)
        const $api = inject('$api')
        const fhcAlert = inject('$fhcAlert');

        // Modal 
        let modalRef = ref()
        let _resolve
        let _reject


        

        const showModal = (f) => {
            frist.value = f;
            // reset form state
            frmState.datumBlurred = false;
            frmState.bezeichnungBlurred = false;
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

        const fetchFristStatus = async () => {
            try {
                isFetching.value = true;	
                $api.call(
			        ApiDeadline.getFristenStatus())
			        .then(result => {
                        fristStatus.value = result.meta.status == "success" ? result.data : [];			        	
			        })
			        .catch(fhcAlert.handleSystemError);  	  
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
          }
    
        const fetchFristEreignisse = async () => {
            try {
                isFetching.value = true;
                $api.call(
			        ApiDeadline.getFristenEreignisseManuell())
			        .then(result => {
                        fristEreignisse.value = result.meta.status == "success" ? result.data : [];
			        })
			        .catch(fhcAlert.handleSystemError);  	  
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
        }

        onMounted(async () => {
            fetchFristStatus()
            fetchFristEreignisse()            
        })

        // -------------
        // form handling
        // -------------

        const fristDataFrm = Vue.ref();

        const frmState = Vue.reactive({ ereignisBlurred: false, bezeichnungBlurred: false, datumBlurred: false, wasValidated: false });

        const validEreignis = (n) => {
            return !!n && n != "";
        }

        const validBezeichnung = (n) => {
            return !!n && n.trim() != "";
        }

        const validDatum = (n) => {
            return !!n && n.trim() != "";
        }

        const validate = () => {
            frmState.ereignisBlurred = true;
            frmState.datumBlurred = true;
            frmState.bezeichnungBlurred = true;
            if (validEreignis(frist.value?.ereignis_kurzbz) && validDatum(frist.value?.datum) && validBezeichnung(frist.value?.bezeichnung)) {
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
                    _resolve({type: 'OK', payload: frist.value })
                } catch (error) {
                    console.log(error)              
                } finally {
                    isFetching.value = false
                    hideModal()
                }
                
                
            }
        }

        return { modalRef, fristDataFrm, frist, t, showModal, hideModal, fristStatus, fristEreignisse, 
            validEreignis, validDatum, validBezeichnung, frmState, okHandler }
    },
    template: `
    <Modal :title="t('fristenmanagement','termin_frist')" ref="modalRef">
        <template #body>
            <form class="row g-3" v-if="frist != null"  ref="fristDataFrm" >
                         
                <div class="col-md-6">
                    <label for="ereignis_kurzbz" class="form-label required">Ereignis</label>
                    <select  id="ereignis_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " 
                        @blur="frmState.ereignisBlurred = true"   v-model="frist.ereignis_kurzbz" 
                        :class="{'is-invalid': !validEreignis(frist.ereignis_kurzbz) && frmState.ereignisBlurred}">
                        <option v-for="(item, index) in fristEreignisse" :value="item.ereignis_kurzbz" >
                            {{ item.bezeichnung }}
                        </option>
                    </select>

                </div>    


                <div class="col-md-6">
                    <label for="bezeichnung" class="form-label required">{{ t('fristenmanagement','todo') }}</label>
                    <input type="text" class="form-control form-control-sm" @blur="frmState.bezeichnungBlurred = true"  
                        id="bezeichnung" 
                        v-model="frist.bezeichnung" 
                        maxlength="255"
                        :class="{ 'is-invalid': !validBezeichnung(frist.bezeichnung) && frmState.bezeichnungBlurred}"
                        >
                </div>

                <div class="col-md-6">
                    <label for="datum" class="required form-label">{{ t('fristenmanagement','frist') }}</label>
                    <datepicker id="datum" 
                        :teleport="true" 
                        @blur="frmState.datumBlurred = true" 
                        :input-class-name="(!validDatum(frist.datum) && frmState.datumBlurred) ? 'dp-invalid-input' : ''"  
                        v-model="frist.datum"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>

                <div class="col-md-6">
                    <label for="status_kurzbz" class="form-label">Status</label>
                    <select  id="status_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="frist.status_kurzbz" >
                        <option v-for="(item, index) in fristStatus" :value="item.status_kurzbz" >
                            {{ item.bezeichnung }}
                        </option>
                    </select>
                    
                </div>
                                                
                <div class="col-8" v-if="frist.frist_id != 0">
                    <div class="modificationdate">{{ frist.insertamum }}/{{ frist.insertvon }}, {{ frist.updateamum }}/{{ frist.updatevon }}</div>
                </div>
            </form>        

        </template>
        <template #footer>
            <button type="button" class="btn btn-primary" @click="okHandler()" >
                {{ t('ui','speichern') }}
            </button>
        </template>
    </Modal>
    `
}