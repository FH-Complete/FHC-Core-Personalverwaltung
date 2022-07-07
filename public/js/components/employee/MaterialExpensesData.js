import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';

export const MaterialExpensesData = {
    components: {
        Modal,
        ModalDialog,
        Toast,
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        writePermission: { type: Boolean, required: false },
    },
    setup( props ) {

        const readonly = Vue.ref(false);

        const { personID } = Vue.toRefs(props);

        const uid = Vue.ref("");

        const dialogRef = Vue.ref();

        const url = Vue.ref("");

        const isFetching = Vue.ref(false);

        const materialdataList = Vue.ref([]);

        const types = Vue.inject('sachaufwandtyp');

        const full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

        const generateEndpointURL = (person_id) => {           
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/personMaterialExpenses?person_id=${person_id}`;
        };

        const fetchData = async () => {
            if (personID.value==null) {    
                materialdataList.value = [];            
                return;
            }
            isFetching.value = true
 
            const urlMaterial = `${full}/extensions/FHC-Core-Personalverwaltung/api/personMaterialExpenses?person_id=${personID.value}`;
            const urlUID = `${full}/extensions/FHC-Core-Personalverwaltung/api/uidByPerson?person_id=${personID.value}`;
            try {
              const res = await fetch(urlMaterial);
              let response = await res.json()              
              materialdataList.value = response.retval;
              // get uid
              const resUID = await fetch(urlUID);
              let responseUID = await resUID.json();
              uid.value = responseUID.retval[0].uid;
              isFetching.value = false              
            } catch (error) {
              console.log(error)
              isFetching.value = false;
            }
        }

        const createShape = () => {
            return {
                sachaufwand_id: 0,
                mitarbeiter_uid: uid?.value,
                sachaufwandtyp_kurzbz: "",
                beginn: "",
                ende: "",  
                anmerkung: "",     
            } 
        }

        const currentValue = Vue.ref(createShape());
        const preservedValue = Vue.ref(createShape());

        Vue.watch(personID, (currentVal, oldVal) => {
            url.value = generateEndpointURL(currentVal);   
            fetchData();       
              
        });

        const toggleMode = async () => {
            if (!readonly.value) {
                // cancel changes?
                if (hasChanged.value) {
                  const ok = await dialogRef.value.show();
                  if (ok) {
                    console.log("ok=", ok);
                    currentValue.value = preservedValue.value;
                  } else {
                    return
                  }
                }
              } else {
                // switch to edit mode and preserve data
                preservedValue.value = {...currentValue.value};
              }
              readonly.value = !readonly.value;
        }

        Vue.onMounted(() => {
            console.log('MaterialData mounted', props.personID);
            currentValue.value = createShape();
            url.value = generateEndpointURL(props.personID); 
            fetchData();
            
        })

        const materialdataListArray = Vue.computed(() => (materialdataList.value ? Object.values(materialdataList.value) : []));

        // Modal 
        const modalRef = Vue.ref();
        const confirmDeleteRef = Vue.ref();

        const showAddModal = () => {
            currentValue.value = createShape();
            // reset form state
            frmState.beginnBlurred=false;
            // call bootstrap show function
            modalRef.value.show();
        }

        const hideModal = () => {
            modalRef.value.hide();
        }
        
        const showEditModal = (id) => {
            currentValue.value = { ...materialdataList.value[id] };
            modalRef.value.show();
        }

        const showDeleteModal = async (id) => {
            currentValue.value = { ...materialdataList.value[id] };
            const ok = await confirmDeleteRef.value.show();
            
            if (ok) {   

                postDelete(id)
                    .then((r) => {
                        if (r.error == 0) {
                            delete materialdataList.value[id];
                            showDeletedToast();
                        }
                    });
                
            }
        }


        const okHandler = () => {
            if (!validate()) {

                console.log("form invalid");

            } else {
                postData()
                    .then((r) => {
                        if (r.error == 0) {
                            materialdataList.value[r.retval[0].sachaufwand_id] = r.retval[0];
                            console.log('materialdata successfully saved');
                            showToast();
                        }                       
                    }
                    )
                    .catch((error) => {
                        console.log(error.message);
                    });
                
                hideModal();
            }
        }

        // -------------
        // form handling
        // -------------

        const materialDataFrm = Vue.ref();

        const frmState = Vue.reactive({ beginnBlurred: false, wasValidated: false });

        const validBeginn = (n) => {
            return !!n && n.trim() != "";
        }

        const validate = () => {
            frmState.beginnBlurred = true;
            if (validBeginn(currentValue.value.beginn)) {
                return true;
            }
            return false;
        }
        
        // save
        const postData = async () => {
            console.log('haschanged: ', hasChanged);
            console.log('frmState: ', frmState);

            // submit
            isFetching.value = true;

            const endpoint =
                `${full}/extensions/FHC-Core-Personalverwaltung/api/upsertPersonMaterialExpenses`;

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

            showToast();
            preservedValue.value = currentValue.value;
            return response;
               
         
        }

        const postDelete = async (id) => {
            isFetching.value = true

            const endpoint =
                `${full}/extensions/FHC-Core-Personalverwaltung/api/deletePersonMaterialExpenses`;

            const res = await fetch(endpoint,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({sachaufwand_id: id}),
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


        const hasChanged = Vue.computed(() => {
            return Object.keys(currentValue.value).some(field => currentValue.value[field] !== preservedValue.value[field])
        });

        const formatDate = (d) => {
            if (d != null && d != '') {
		        return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
            } else {
                return ''
            }
        }

        // Toast 
        const toastRef = Vue.ref();
        const deleteToastRef = Vue.ref();
        
        const showToast = () => {
            toastRef.value.show();
        }

        const showDeletedToast = () => {
            deleteToastRef.value.show();
        }

        return { 
            materialdataList, materialdataListArray,
            currentValue,
            readonly,
            frmState,
            dialogRef,
            toastRef, deleteToastRef,
            materialDataFrm,
            modalRef,
            types, 
            
            toggleMode,  validBeginn, formatDate,
            showToast, showDeletedToast,
            showAddModal, hideModal, okHandler,
            showDeleteModal, showEditModal, confirmDeleteRef,
         }
    },
    template: `
    <div class="row">

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
          <Toast ref="toastRef">
            <template #body><h4>Sachaufwand gespeichert.</h4></template>
          </Toast>
        </div>

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="deleteToastRef">
                <template #body><h4>Sachaufwand gelöscht.</h4></template>
            </Toast>
        </div>

        <div class="d-flex bd-highlight">
            <div class="flex-grow-1 bd-highlight"><h4>Sachaufwand</h4></div>        
            <div class="p-2 bd-highlight">
            <div class="d-grid gap-2 d-md-flex justify-content-end ">
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="showAddModal()">
                    <i class="fa fa-plus"></i>
                </button>            
            </div>
        </div>

      
    </div>


    <div class="table-responsive">
        <table class="table table-striped table-sm">
            <thead>                
            <tr>
                <th scope="col">Typ</th>
                <th scope="col">Von</th>
                <th scope="col">Bis</th>
                <th scope="col">Anmerkung</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="materialdata in materialdataListArray" :key="materialdata.sachaufwand_id">
                <td class="align-middle">{{ materialdata.sachaufwandtyp_kurzbz }}</td>
                <td class="align-middle">{{ formatDate(materialdata.beginn) }}</td>
                <td class="align-middle">{{ formatDate(materialdata.ende) }}</td>
                <td class="align-middle">{{ materialdata.anmerkung }}</td>
                <td class="align-middle" width="5%">
                    <div class="d-grid gap-2 d-md-flex align-middle">
                        <button type="button" class="btn btn-outline-dark btn-sm" @click="showDeleteModal(materialdata.sachaufwand_id)">
                            <i class="fa fa-minus"></i>
                        </button>
                        <button type="button" class="btn btn-outline-dark btn-sm" @click="showEditModal(materialdata.sachaufwand_id)">
                            <i class="fa fa-pen"></i>
                        </button>
                    </div>
                </td>
            </tr>

            </tbody>
        </table>            
    </div>

    <!-- detail modal -->
    <Modal title="Sachaufwand" ref="modalRef">
        <template #body>
            <form class="row g-3" ref="materialDataFrm">
                            
                <div class="col-md-8">
                    <label for="sachaufwandtyp_kurzbz" class="form-label">Typ</label><br>
                    <select v-if="!readonly" id="sachaufwandtyp_kurzbz" v-model="currentValue.sachaufwandtyp_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " >
                        <option v-for="(item, index) in types" :value="item.sachaufwandtyp_kurzbz">
                            {{ item.bezeichnung }}
                        </option>                       
                    </select>
                    <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="sachaufwandtyp_kurzbz" :value="currentValue.sachaufwandtyp_kurzbz">
                </div>
                <div class="col-md-4"></div>
                <!--  -->
                <div class="col-md-4">
                    <label for="beginn" class="required form-label">Von</label>
                    <input type="date" :readonly="readonly" @blur="frmState.beginnBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validBeginn(currentValue.beginn) && frmState.beginnBlurred}" id="beginn" v-model="currentValue.beginn">
                </div>
                <div class="col-md-4">
                    <label for="ende" class="form-label">Bis</label>
                    <input type="date" :readonly="readonly" @blur="frmState.endeBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="ende" v-model="currentValue.ende">
                </div>
                <div class="col-md-4">
                </div>
                <!-- -->
                <div class="col-md-8">
                    <label for="uid" class="form-label">Anmerkung</label>
                    <input type="text"  :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="bank" v-model="currentValue.anmerkung">
                </div>
                <div class="col-md-4">
                </div>
                
                <!-- changes -->
                <div class="col-8">
                    <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
                </div>
                
            </form>
        </template>
        <template #footer>
            <button type="button" class="btn btn-secondary" @click="hideModal()">
                Abbrechen
            </button>
            <button type="button" class="btn btn-primary" @click="okHandler()" >
                OK
            </button>
        </template>

    </Modal>

    <ModalDialog title="Warnung" ref="dialogRef">
      <template #body>
        Sachaufwand schließen? Geänderte Daten gehen verloren!
      </template>
    </ModalDialog>

    <ModalDialog title="Warnung" ref="confirmDeleteRef">
        <template #body>
            Sachaufwand '{{ currentValue?.sachaufwandtyp_kurzbz }} ({{ currentValue?.beginn }}-{{ currentValue?.ende }})' wirklich löschen?
        </template>
    </ModalDialog>
    `
}