import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import { Toast } from '../../Toast.js';
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';

export const AddressData = {
    components: {
        Modal,
        ModalDialog,
        Toast,
    },
    props: {

    },  
    setup(props) {
        const frist = Vue.ref()

        // Modal 
        let modalRef = Vue.ref()
        let _resolve
        let _reject

        const fristStatusDef = Vue.ref()

        const showModal = () => {
            frist.value = createFristShape();
            // reset form state
            /* frmState.plzBlured=false;
            frmState.ortBlured=false;
            frmState.typBlured=false; */
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
                const res = await Vue.$fhcapi.Deadline.getFristStatus();
                fristStatus.value = res.data;			  
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
        }

        const fetchFristEreignis = async () => {
            try {
                isFetching.value = true;
                const res = await Vue.$fhcapi.Deadline.getFristEreignis();
                fristEreignis.value = res.data;			  
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
        }

        Vue.onMounted(async () => {
            if (currentUID.value == null) {
              return;
            }
            fetchFristStatus()
            fetchFristEreignis()
        })

        Vue.defineExpose({
            showModal,
            hideModal
        })

        return { modalRef, frist }
    },
    template: `
    <Modal :title="'Termin/Frist'" ref="modalRef">
        <template #body>
            <form class="row g-3" v-if="frist != null"  ref="fristDataFrm" >
                                       
                <div class="col-md-6">
                    <label for="status_kurzbz" class="form-label">Status</label>
                    <select  id="status_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="frist.status_kurzbz" >
                        <option v-for="(item, index) in frist_status_list" :value="item.status_kurzbz" >
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