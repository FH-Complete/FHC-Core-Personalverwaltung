import { Modal } from '../../Modal.js';
import { TrainingFrm } from './TrainingFrm.js';
import { FileManager } from './FileManager.js';
import ApiWeiterbildung from  '../../../api/factory/weiterbildung.js';


export const EditDialog = {
	name: 'EditDialog',
    components: {
        Modal,
        "TabPanel": primevue.tabpanel,
        "TabView": primevue.tabview,
        TrainingFrm,
        FileManager,
    },
    props: {
        kategorien: { type: Array },        
    },
    expose: ['showModal'],
    emits: ['changed'],
    setup( props, { emit } ) {

        // Modal 
        const { watch, ref, computed, inject } = Vue;
        const modalRef = ref();
        const frmRef = ref(null);
        const searchExistingRef = ref();
        const schnellanlageRef = ref();
        const currentValue = ref({});
        const activeIndex = ref(0);
        const $api = inject('$api');
        const $fhcAlert = inject('$fhcAlert');
        const isFetching = ref(false);

        let _resolve;
        let _reject;
        let mode = 'CREATE';
        

        

        const showModal = (f) => {
            currentValue.value = f
            // call bootstrap show function
            modalRef.value.show();
            return new Promise((resolve, reject) => {
                _resolve = resolve;
                _reject = reject;
            })
        }

        const hideModal = () => {
            modalRef.value.hide({type: 'CANCEL'});
        }
        

        const okHandler = () => {
            
            schnellanlageRef.value.save().then(() => {
                console.log("training successfully created")
                currentValue.value = { surname: '', birthdate: null} 
                hideModal()                            
                _resolve({type: 'CREATED', payload: { uid: 'dummy' }})
            })
            .catch((error) => {
                console.log(error.message);
                _reject(false);
            });

            
            
        }
                        

        const cancelHandler = () =>  {
            hideModal();
            _resolve({type: 'CANCELED', payload: { uid: 'dummy' }});
        }

        const takeHandler = () =>  {
            hideModal();
            _resolve({type: 'CREATED', payload: { uid: 'dummy' }});
        }

        const formSubmit = () => {
            console.log(currentValue);
            // call submit of subcomponent
            frmRef?.value.submit();
        }

        const searchCriteriaHandler = (e) => {
            currentValue.value = e;
        }

        Vue.watch(currentValue, (newVal, oldVal) => {
            console.log('EditDialog watch currentValue=', newVal)                    
        });

        const modalTitle = computed(() => {
            if (mode != 'CREATE') return 'Weiterbildung bearbeiten'
            return 'Neue Weiterbildung anlegen'
        })

        const handleSubmit = async (v) => {
            console.log('handleSubmit',v);
            try {
                const res = await $api.call(ApiWeiterbildung.upsertTraining(currentValue.value)); 
            if (res?.meta?.status == 'success') {
                $fhcAlert.alertSuccess('Weiterbildung gespeichert.');
                currentValue.value = res.data[0];
                emit('changed');
            } else {
                
            }              
            } catch (error) {
                $fhcAlert.handleSystemError(error)           
            } finally {
                isFetching.value = false
            }
        }
        

        return { modalRef, searchExistingRef, schnellanlageRef, showModal, hideModal, 
            okHandler,cancelHandler, currentValue, formSubmit, activeIndex, frmRef,
            searchCriteriaHandler, takeHandler, mode, modalTitle, handleSubmit };
    },
    template: `
        <Modal :title="modalTitle" ref="modalRef" id="createWizardModal">
            <template #body>

                
                <TabView v-model:activeIndex="activeIndex">
                    <TabPanel header="Weiterbildung">
                        <p class="m-0">
                            <TrainingFrm  ref="frmRef" id="trainingFrm" @submit="handleSubmit" :kategorien="kategorien" v-model="currentValue" />
                        </p>
                    </TabPanel>
                    <TabPanel header="Dokumente" :disabled="currentValue.weiterbildung_id == 0">
                        <p class="m-0">
                            <FileManager />
                        </p>
                    </TabPanel>                    
                </TabView>


            </template>
            <template #footer>
                <div class="float-start">
                    <button type="button" class="btn btn-outline-secondary" @click="activeIndex = 0" v-if="activeIndex != 0" >
                        <i class="fa fa-chevron-left"></i> Zurück
                    </button>
                </div>
                <div class="float-start">
                    <button type="button" class="btn btn-primary me-1" @click="hideModal()" v-if="activeIndex == 0 && mode == 'CREATE'" >
                        Schließen
                    </button>
                    <button type="button" class="btn btn-primary"  :disabled="currentValue==null || currentValue?.bezeichnung == '' || currentValue?.kategorien?.length == 0"  @click="formSubmit()" >
                        Weiterbildung {{ currentValue?.weiterbildung_id > 0 ? 'speichern' : 'anlegen' }} <i class="fa fa-chevron-right"></i>
                    </button>
                </div>
            </template>

        </Modal>`
}