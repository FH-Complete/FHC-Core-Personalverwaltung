import { Modal } from '../../Modal.js';
import { SearchExistingDialog  } from "./SearchExistingDialog.js";

export const CreateWizard = {
    components: {
        Modal,
        SearchExistingDialog,
    },
    props: {
        
    },
    setup( props ) {

        // Modal 
        const { watch, ref } = Vue;
        const modalRef = ref();
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
            modalRef.value.hide();
        }
        

       

        const okHandler = () => {
            if (!frmState.bisBlured && currentValue.value.befristet) {
                frmState.bisBlured = true;;
            }
            if (!dienstvehaeltnisFrm.value.checkValidity()) {

                console.log("form invalid");        

            } else {

                console.log("form valid");
                
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
                
                hideModal();
                _resolve(true);
            }
        }

        
        const cancelHandler = () =>  {
            hideModal();
            _resolve(false);
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

        
        Vue.defineExpose({ showModal });

        return { modalRef, showModal, hideModal, okHandler,cancelHandler, currentValue };
    },
    template: `
        <Modal :title="'Mitarbeiter anlegen'" ref="modalRef" id="createWizardModal">
            <template #body>

                <search-existing-dialog />

            </template>
            <template #footer>
                <button type="button" class="btn btn-secondary" @click="cancelHandler()">
                    Abbrechen
                </button>
                <button type="button" class="btn btn-primary" @click="okHandler()" >
                    OK
                </button>
            </template>

        </Modal>`


}


