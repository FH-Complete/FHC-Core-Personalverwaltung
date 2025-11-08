import { Modal } from '../../Modal.js';
import { TrainingFrm } from './TrainingFrm.js';

export const EditDialog = {
	name: 'EditDialog',
    components: {
        Modal,
        "TabPanel": primevue.tabpanel,
        "TabView": primevue.tabview,
        TrainingFrm,
    },
    props: {
        
    },
    expose: ['showModal'],
    setup( props ) {

        // Modal 
        const { watch, ref, computed } = Vue;
        const modalRef = ref();
        const stepsRef = ref();
        const searchExistingRef = ref();
        const schnellanlageRef = ref();
        const currentValue = ref();
        const activeIndex = ref(0);
        let _resolve;
        let _reject;
        let mode = 'CREATE';
        

        const showModal = () => {
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
                console.log("employee successfully created")
                stepsRef.value.reset()
                currentValue.value = { surname: '', birthdate: null} 
                searchExistingRef.value.reset()  
                schnellanlageRef.value.reset()             
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

        const showCreateHandler = () => {
            stepsRef.value.selectStep('Schnellanlage')
        }

        const searchCriteriaHandler = (e) => {
            currentValue.value = e;
        }

        const modalTitle = computed(() => {
            if (mode != 'CREATE') return 'Weiterbildung bearbeiten'
            return 'Neue Weiterbildung anlegen'
        })

        

        return { modalRef, stepsRef, searchExistingRef, schnellanlageRef, showModal, hideModal, 
            okHandler,cancelHandler, currentValue, showCreateHandler, activeIndex,
            searchCriteriaHandler, takeHandler, mode, modalTitle };
    },
    template: `
        <Modal :title="modalTitle" ref="modalRef" id="createWizardModal">
            <template #body>

                
                <TabView v-model:activeIndex="activeIndex">
                    <TabPanel header="Weiterbildung">
                        <p class="m-0">
                            <TrainingFrm />
                        </p>
                    </TabPanel>
                    <TabPanel header="Dokumente" :disabled="true">
                        <p class="m-0">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                            ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                        </p>
                    </TabPanel>                    
                </TabView>


            </template>
            <template #footer>
                <div class="float-start">
                    <button type="button" class="btn btn-outline-secondary" @click="stepsRef.selectStep('Formular')" v-if="activeIndex != 0" >
                        <i class="fa fa-chevron-left"></i> Zurück
                    </button>
                </div>
                <div class="float-start">
                    <button type="button" class="btn btn-primary me-1" @click="hideModal()" v-if="activeIndex == 0 && mode == 'CREATE'" >
                        Abbrechen
                    </button>
                    <button type="button" class="btn btn-primary"  :disabled="currentValue==null || currentValue.surname == '' || currentValue.birthdate==null || currentValue.birthdate==''"  @click="showCreateHandler()" >
                        Weiterbildung anlegen <i class="fa fa-chevron-right"></i>
                    </button>
                </div>
            </template>

        </Modal>`
}