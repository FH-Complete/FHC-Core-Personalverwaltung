import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import { Toast } from '../../Toast.js';
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';

export const DeadlineIssueDialog = {
    components: {
        Modal,
        ModalDialog,
        Toast,
        "datepicker": VueDatePicker
    },
    props: {
        uid: String,
    },  
    setup(props) {

        const { watch, ref, toRefs, onMounted, defineExpose } = Vue; 
        const { t } = usePhrasen();
        const currentUID = toRefs(props).uid
        const frist = ref()
        const fristStatus = ref([])
        const isFetching = ref(false)

        // Modal 
        let modalRef = ref()
        let _resolve
        let _reject


        

        const showModal = (frist) => {
            frist.value = frist;
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
                const res = await Vue.$fhcapi.Deadline.getFristenStatus();
                fristStatus.value = res.data;			  
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
          }
    
        const fetchFristEreignisse = async () => {
            try {
                isFetching.value = true;
                const res = await Vue.$fhcapi.Deadline.getFristenEreignisse();
                fristEreignisse.value = res.data;			  
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
        }

        onMounted(async () => {
            fetchFristStatus()
            fetchFristEreignisse()
            if (currentUID.value == null) {
              return;
            }
            
        })

        
        defineExpose({
            showModal,
            hideModal
        })

        // -------------
        // form handling
        // -------------

        const fristDataFrm = Vue.ref();

        const frmState = Vue.reactive({ bezeichnungBlurred: false, datumBlurred: false, wasValidated: false });


        const validBezeichnung = (n) => {
            return !!n && n.trim() != "";
        }

        const validDatum = (n) => {
            return !!n && n.trim() != "";
        }

        const validate = () => {
            frmState.datumBlurred = true;
            frmState.bezeichnungBlurred = true;
            if (validDatum(frist.value.datum) && validBezeichnung(frist.value.bezeichnung)) {
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
                    _resolve({type: 'CREATED', payload: { frist }})
                    /* const r = await Vue.$fhcapi.Person.upsertPersonMaterialExpenses(currentValue.value);                    
                    if (r.data.error == 0) {
                        materialdataList.value[r.data.retval[0].sachaufwand_id] = r.data.retval[0];
                        console.log('materialdata successfully saved');
                        showToast();
                    }   */
                } catch (error) {
                    console.log(error)              
                } finally {
                    isFetching.value = false
                    hideModal()
                }
                
                
            }
        }

        return { modalRef, fristDataFrm, frist, t, showModal, hideModal, fristStatus, validDatum, validBezeichnung, frmState, okHandler }
    },
    template: `
    <Modal :title="'Termin/Frist'" ref="modalRef">
        <template #body>
            <form class="row g-3" v-if="frist != null"  ref="fristDataFrm" >
                           
                <div class="col-md-6">
                    <label for="bezeichnung" class="form-label required">{{ t('person','bezeichnung') }}</label>
                    <input type="text" class="form-control form-control-sm" @blur="frmState.bezeichnungBlurred = true"  
                        id="bezeichnung" 
                        v-model="frist.bezeichnung" 
                        maxlength="255"
                        :class="{ 'is-invalid': !validBezeichnung(frist.bezeichnung) && frmState.bezeichnungBlurred}"
                        >
                </div>

                <div class="col-md-6">
                    <label for="datum" class="required form-label">{{ t('ui','deadline') }}</label>
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