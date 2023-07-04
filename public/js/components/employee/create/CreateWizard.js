import { Modal } from '../../Modal.js';
import { SearchExistingDialog  } from "./SearchExistingDialog.js";
import { CreateEmployeeFrm } from './CreateEmployeeFrm.js';
import Step from './stepper/Step.js'
import Steps from './stepper/Steps.js';

export const CreateWizard = {
    components: {
        Modal,
        Steps,
        Step,
        SearchExistingDialog,
        CreateEmployeeFrm,
    },
    props: {
        
    },
    expose: ['showModal'],
    setup( props ) {

        // Modal 
        const { watch, ref } = Vue;
        const modalRef = ref();
        const stepsRef = ref();
        const searchExistingRef = ref();
        const schnellanlageRef = ref();
        const currentValue = ref();
        const isFetching = ref(false);
        let _resolve;
        let _reject;

        

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
            
            /*
            postData()
                .then((r) => {
                    if (r.error == 0) {
                        console.log('employee successfully saved');
                        showToast();
                    }                       
                }
                )
                .catch((error) => {
                    console.log(error.message);
                });
            */
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
            });

            
            
        }

        
        const cancelHandler = () =>  {
            hideModal();
            _resolve(false);
        }

        const showCreateHandler = () => {
            stepsRef.value.selectStep('Schnellanlage')
        }

        const getSelectedTitle = () => {
            if (stepsRef.value != undefined)
                return stepsRef.value.selectedTitle;
            return '-';
        }

        const searchCriteriaHandler = (e) => {
            currentValue.value = e;
        }


        const postData = async () => {
            isFetching.value = true
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            const endpoint =
                `${full}/extensions/FHC-Core-Personalverwaltung/api/createEmployee`;

            const res = await fetch(endpoint,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentValue.value),
            });    

            if (!res.ok) {
                isFetching.value = false;
                const message = `An error has occured: ${res.status}`;
                throw new Error(message);
            }
            let response = await res.json();
        
            isFetching.value = false;
            return response;

        };

    
        return { modalRef, stepsRef, searchExistingRef, schnellanlageRef, showModal, hideModal, 
            okHandler,cancelHandler, currentValue, showCreateHandler, getSelectedTitle,
            searchCriteriaHandler };
    },
    template: `
        <Modal :title="'Mitarbeiter anlegen'" ref="modalRef" id="createWizardModal">
            <template #body>
            
                <Steps  ref="stepsRef">
                    <Step title="Suche">
                        <search-existing-dialog ref="searchExistingRef" @change="searchCriteriaHandler" @select="cancelHandler" />
                    </Step>
                    <Step title="Schnellanlage" >
                        <create-employee-frm ref="schnellanlageRef" :defaultval="currentValue" />
                    </Step>                    
                </Steps>

                

            </template>
            <template #footer>
                <div class="float-start">
                    <button type="button" class="btn btn-outline-secondary" @click="stepsRef.selectStep('Suche')" v-if="getSelectedTitle() != 'Suche'" >
                        <i class="fa fa-chevron-left"></i> Zurück
                    </button>
                </div>
                <div class="float-start">
                    <button type="button" class="btn btn-primary" @click="okHandler()" v-if="getSelectedTitle() != 'Suche'" >
                        Mitarbeiter anlegen
                    </button>
                    <button type="button" class="btn btn-primary"  :disabled="currentValue==null || currentValue.surname == ''"  @click="showCreateHandler()" v-if="getSelectedTitle() != 'Schnellanlage'">
                        Person anlegen
                    </button>
                </div>
            </template>

        </Modal>`


}


