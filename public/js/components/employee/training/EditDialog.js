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
        const { watch, ref, reactive, computed, inject } = Vue;
        const modalRef = ref();
        const frmRef = ref(null);
        const fileFrmRef = ref(null);
        const searchExistingRef = ref();
        const schnellanlageRef = ref();
        const currentValue = ref({});
        const currentFileDataValue = ref({fileData: []});
        const activeIndex = ref(0);
        const $api = inject('$api')
        const $fhcAlert = inject('$fhcAlert');
        const isFetching = ref(false);

        let _resolve;
        let _reject;
        let mode = 'CREATE';
        

        

        const showModal = (f) => {
            currentValue.value = f
            currentFileDataValue.value = {fileData: []};
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
            if (activeIndex.value == 0) {
                // form submit
                console.log(currentValue);
                // call submit of subcomponent
                frmRef?.value.submit();
            } else {
                // document submit
                // call submit of subcomponent
                fileFrmRef?.value.submit();
            }
            
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

        const handleFileSubmit = async (val) => {
            console.log('handleFileSubmit',val);
            const formData = new FormData();
            for (const file of val.fileData) {
                formData.append("files[]", file);
            }
			//formData.append('data', JSON.stringify(val.fileData));
			//Object.entries(val).forEach(([k, v]) => formData.append(k, v));

            try {
                const res = await $api.call(ApiWeiterbildung.updateDokumente(currentValue.value.weiterbildung_id, formData)); 
                if (res?.meta?.status == 'success') {
                    $fhcAlert.alertSuccess('Dokumente gespeichert.');
                    currentValue.value = res.data[0];
                    emit('changed');
                } else {
                    //
                }              
            } catch (error) {
                $fhcAlert.handleSystemError(error)           
            } finally {
                isFetching.value = false
            }

        }
        

        return { modalRef, searchExistingRef, schnellanlageRef, showModal, hideModal, 
            okHandler,cancelHandler, currentValue, currentFileDataValue, formSubmit, activeIndex, frmRef, fileFrmRef,
            searchCriteriaHandler, takeHandler, mode, modalTitle, handleSubmit, handleFileSubmit };
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
                            <FileManager ref="fileFrmRef" @submit="handleFileSubmit" v-model="currentFileDataValue"/>
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
                        {{ activeIndex == 0 ? 'Weiterbildung' : 'Dokumente' }} {{ currentValue?.weiterbildung_id > 0 ? 'speichern' : 'anlegen' }} <i class="fa fa-chevron-right" v-if="activeIndex == 0"></i>
                    </button>
                </div>
            </template>

        </Modal>`
}