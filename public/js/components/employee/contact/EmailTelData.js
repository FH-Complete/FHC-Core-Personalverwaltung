import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import { Toast } from '../../Toast.js';

export const EmailTelData = {
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
    setup(props) {

        const { personID } = Vue.toRefs(props);

        const urlContactData = Vue.ref("");

        const contactList = Vue.ref([]);

        const isFetching = Vue.ref(false);

        const currentContact = Vue.ref();

        const confirmDeleteRef = Vue.ref();

        const kontakttyp = Vue.inject('kontakttyp');

        Vue.watch(personID, (currentValue, oldValue) => {
            console.log('ContactData watch',currentValue);
            urlContactData.value = generateContactDataEndpointURL(currentValue);
            fetchData();
        });

        const generateContactDataEndpointURL = (person_id) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/personContactData?person_id=${person_id}`;
        };

        const fetchData = async () => {
            if (personID.value==null) {
                contactList.value = [];
                return;
            }
            isFetching.value = true
            try {
              const res = await fetch(urlContactData.value)
              let response = await res.json()
              isFetching.value = false
              console.log(response.retval);
              contactList.value = response.retval;
            } catch (error) {
              console.log(error)
              isFetching.value = false
            }
          }

        Vue.onMounted(() => {
            console.log('ContactData mounted', props.personID);            
            urlContactData.value = generateContactDataEndpointURL(props.personID); 
            fetchData();
            
        })


        const contactListArray = Vue.computed(() => Object.values(contactList.value));

    
        const createContactShape = (person_id) => {
            return {
                kontakt_id: 0,
                person_id: person_id,  
                kontakttyp: 'email', 
                anmerkung: '',  
                kontakt: '',    
                zustellung: false, 
                updateamum: '',
                updatevon: '',  
                insertamum: '', 
                insertvon: '',  
                ext_id: null,     
                standort_id: null,

            }
        }

        // Modal 
        let modalRef = Vue.ref();
        
        const showEditModal = (id) => {
            currentContact.value = { ...contactList.value[id] };
            modalRef.value.show();
        }

        const showAddModal = () => {
            currentContact.value = createContactShape(personID);
            // reset form state
            frmState.kontaktBlured=false;
            // call bootstrap show function
            modalRef.value.show();
        }

        const showDeleteModal = async (id) => {
            currentContact.value = { ...contactList.value[id] };
            const ok = await confirmDeleteRef.value.show();
            
            if (ok) {

                postDelete(id)
                    .then((r) => {
                        if (r.error == 0) {
                            delete contactList.value[id];
                        }
                    });
                
            }
        }

        const hideModal = () => {
            modalRef.value.hide();
        }

        const postData = async () => {
            isFetching.value = true
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            const endpoint =
                `${full}/extensions/FHC-Core-Personalverwaltung/api/upsertPersonContactData`;

            const res = await fetch(endpoint,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentContact.value),
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
            

        const postDelete = async (id) => {
            isFetching.value = true
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            const endpoint =
                `${full}/extensions/FHC-Core-Personalverwaltung/api/deletePersonContactData`;

            const res = await fetch(endpoint,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({kontakt_id: id}),
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

        const okHandler = () => {
            if (!validate()) {

                console.log("form invalid");

            } else {
                postData()
                    .then((r) => {
                        if (r.error == 0) {
                            contactList.value[r.retval[0].kontakt_id] = r.retval[0];
                            console.log('contact successfully saved');
                            showToast();
                        }                        
                    })
                    .catch((error) => {
                        console.log(error.message);
                    });
                
                hideModal();
            }
        }

        // -------------
        // form handling
        // -------------

        const contactDataFrm = Vue.ref();

        const frmState = Vue.reactive({ kontaktBlured: false, wasValidated: false });

        const validKontakt = (n) => {
            return !!n && n.trim() != "";
        }     

        const validate = () => {
            frmState.kontaktBlured = true;
            if (validKontakt(currentContact.value.kontakt)) {
                return true;
            }
            return false;
        }

        // Toast 
        const toastRef = Vue.ref();
        
        const showToast = () => {
            toastRef.value.show();
        }

        return {
            contactList, contactListArray, 
            currentContact, showEditModal, showAddModal, showDeleteModal, hideModal, modalRef,
            kontakttyp, confirmDeleteRef, okHandler, toastRef,
            // form handling
            validKontakt, frmState, contactDataFrm, 
        }
    },
    template: `
            <div class="row">

                <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
                    <Toast ref="toastRef">
                        <template #body><h4>Kontaktdaten gespeichert.</h4></template>
                    </Toast>
                </div>

                <!--div class="d-flex bd-highlight">
                    <div class="flex-grow-1 bd-highlight"></div>        
                    <div class="p-2 bd-highlight">                   
                        <button type="button" class="btn btn-outline-dark btn-sm"  @click="showAddModal()" style="margin-right:1.85rem;">
                            <i class="fa fa-plus"></i>
                        </button>
                    </div>
                </div-->
            </div>
        <div class="table-responsive">
            <table class="table table-striped table-sm">
                <thead>
                <tr>
                    <th colspan="4"></th>                    
                    <th scope="col">
                        <button type="button" class="btn btn-outline-dark btn-sm"  @click="showAddModal()" style="margin-right:1.85rem;">
                            <i class="fa fa-plus"></i>
                        </button>
                    </th>
                </tr>
                <tr>
                    <th scope="col">Typ</th>
                    <th scope="col">Kontakt</th>
                    <th scope="col">Zustellung</th>
                    <th scope="col">Anmerkung</th>
                    <th scope="col">Aktion</th>
                </tr>
                </thead>
                <tbody>               
                    <tr v-for="contact in contactListArray" :key="contact.kontakt_id">
                        <td class="align-middle">{{ contact.kontakttyp }}</td>
                        <td class="align-middle" v-if="contact.kontakttyp == 'email'"><a v-bind:href="[\'mailto:\' + contact.kontakt]">{{ contact.kontakt }}</a></td>
                        <td class="align-middle" v-else-if="contact.kontakttyp == 'mobil' || contact.kontakttyp == 'telefon' || contact.kontakttyp == 'firmenhandy'"><a v-bind:href="[\'tel:\' + contact.kontakt]">{{ contact.kontakt }}</a></td>
                        <td class="align-middle" v-else >{{ contact.kontakt }}</td>
                        <td class="align-middle">{{ contact.zustellung == true ? "X" : "" }}</td>
                        <td class="align-middle">{{ contact.anmerkung }}</td>
                        <td class="align-middle" width="5%">
                            <div class="d-grid gap-2 d-md-flex align-middle">
                                <button type="button" class="btn btn-outline-dark btn-sm" @click="showDeleteModal(contact.kontakt_id)">
                                    <i class="fa fa-minus"></i>
                                </button>
                                <button type="button" class="btn btn-outline-dark btn-sm" @click="showEditModal(contact.kontakt_id)">
                                    <i class="fa fa-pen"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Detail Modal -->
        <Modal title="Kontakt" ref="modalRef">
            <template #body>
                <form class="row g-3" v-if="currentContact != null"  ref="contactDataFrm" >
                                
                    <div class="col-md-4">
                        <label for="kontakttyp" class="form-label">Typ</label>
                        <select  id="kontakttyp" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="currentContact.kontakttyp" >
                            <option v-for="(item, index) in kontakttyp" :value="item.kontakttyp">
                                {{ item.beschreibung }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="kontakt" class="required form-label">Kontakt</label>
                        <input type="text" @blur="frmState.kontaktBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validKontakt(currentContact.kontakt) && frmState.kontaktBlured}" id="kontakt" maxlength="128" v-model="currentContact.kontakt">
                    </div>
                    
                    <div class="col-md-2">                                             
                        <label for="zustellung" class="form-label">Zustellung</label>
                        <div>
                            <input class="form-check-input" type="checkbox" id="zustellung" v-model="currentContact.zustellung">
                        </div>
                    </div>      
                    
                    <div class="col-md-8">
                        <label for="anmerkung" class="form-label">Anmerkung</label>
                        <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="anmerkung" maxlength="64" v-model="currentContact.anmerkung">
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

        <ModalDialog title="Warnung" ref="confirmDeleteRef">
            <template #body>
                Kontaktinformation '{{ currentContact?.kontakt }}' wirklich löschen?
            </template>
        </ModalDialog>
    `
}