import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import { Toast } from '../../Toast.js';
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import ApiPerson from '../../../api/factory/person.js';

export const EmailTelData = {
	name: 'EmailTelData',
    components: {
        Modal,
        ModalDialog,
        Toast,
    },
    props: {
        personID: { type: Number, required: true },
        writePermission: { type: Boolean, required: false },
    },  
    setup(props) {

        const $api = Vue.inject('$api');
        const { personID } = Vue.toRefs(props);

        const { t } = usePhrasen();

        const urlContactData = Vue.ref("");

        const contactList = Vue.ref([]);

        const isFetching = Vue.ref(false);

        const currentContact = Vue.ref();

        const confirmDeleteRef = Vue.ref();

        const kontakttyp = Vue.inject('kontakttyp');

        const readonly = Vue.ref(false);

        Vue.watch(personID, (currentValue, oldValue) => {
            console.log('ContactData watch',currentValue);
            fetchData();
        });


        const fetchData = async () => {
            if (personID.value==null) {
                contactList.value = [];
                return;
            }
            // submit
            try {
                const response = await $api.call(ApiPerson.personContactData(personID.value));
                contactList.value = response.retval;
            } catch (error) {
                console.log(error)              
            } finally {
                isFetching.value = false
            }
            
        }

        Vue.onMounted(() => {
            console.log('ContactData mounted', props.personID);                        
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
                zustellung: true, 
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

                try {
                    const res = await $api.call(ApiPerson.deletePersonContactData(id));
                    if (res.error == 0) {
                        delete contactList.value[id];
                        showDeleteToast();
                    }
                } catch (error) {
                    console.log(error)              
                } finally {
                      isFetching.value = false
                }   

            }
        }

        const hideModal = () => {
            modalRef.value.hide();
        }        

        const okHandler =  async() => {
            if (!validate()) {

                console.log("form invalid");

            } else {

                // submit
                try {
                    const r = await $api.call(ApiPerson.upsertPersonContactData(currentContact.value)); 
                    if (r.error == 0) {
                        contactList.value[r.retval[0].kontakt_id] = r.retval[0];
                        console.log('contact successfully saved');
                        showToast();
                    }  
                } catch (error) {
                    console.log(error)              
                } finally {
                    isFetching.value = false
                }
               
                
                hideModal();
            }
        }

        const getKontakttyp = (id) => {
            return kontakttyp.value.find(item => item.kontakttyp == id)
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
        const deleteToastRef = Vue.ref();
        
        const showToast = () => {
            toastRef.value.show();
        }

        const showDeleteToast = () => {
            deleteToastRef.value.show();
        }

        return {
            contactList, contactListArray, 
            currentContact, showEditModal, showAddModal, showDeleteModal, hideModal, modalRef,
            kontakttyp, confirmDeleteRef, okHandler, toastRef, deleteToastRef, t, getKontakttyp,
            // form handling
            validKontakt, frmState, contactDataFrm, readonly
        }
    },
    template: `
            <div class="row">

                <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
                    <Toast ref="toastRef">
                        <template #body><h4>{{ t('person','kontaktdatenGespeichert') }}</h4></template>
                    </Toast>
                </div>

                <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
                    <Toast ref="deleteToastRef">
                        <template #body><h4>{{ t('person','kontaktdatenGeloescht') }}</h4></template>
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
         
             
        <button type="button" class="btn btn-primary btn-sm my-2"  @click="showAddModal()">
                <i class="fa fa-plus"></i> {{ t('global','kontakt') }}
        </button>
        <div class="table-responsive">
            <table class="table table-hover table-sm">
                <thead>
                <tr>
                    <th scope="col">{{ t('global','typ') }}</th>
                    <th scope="col">{{ t('global','kontakt') }}</th>
                    <th scope="col">{{ t('person', 'zustellung') }}</th>
                    <th scope="col">{{ t('global', 'anmerkung') }}</th>
                    <th scope="col">{{ t('ui','aktion') }}</th>
                </tr>
                </thead>
                <tbody>               
                    <tr v-for="contact in contactListArray" :key="contact.kontakt_id">
                        <td class="align-middle">{{ getKontakttyp(contact.kontakttyp).beschreibung }}</td>
                        <td class="align-middle" v-if="contact.kontakttyp == 'email'"><a v-bind:href="[\'mailto:\' + contact.kontakt]">{{ contact.kontakt }}</a></td>
                        <td class="align-middle" v-else-if="contact.kontakttyp == 'mobil' || contact.kontakttyp == 'telefon' || contact.kontakttyp == 'firmenhandy'"><a v-bind:href="[\'tel:\' + contact.kontakt]">{{ contact.kontakt }}</a></td>
                        <td class="align-middle" v-else >{{ contact.kontakt }}</td>
                        <td class="align-middle">{{ contact.zustellung == true ? "X" : "" }}</td>
                        <td class="align-middle">{{ contact.anmerkung }}</td>
                        <td class="align-middle" width="5%">
                            <div class="d-grid gap-2 d-md-flex align-middle">           
                                <button type="button" class="btn btn-outline-secondary btn-sm" @click="showEditModal(contact.kontakt_id)">
                                    <i class="fa fa-pen"></i>
                                </button>
                                <button type="button" class="btn btn-outline-secondary btn-sm" @click="showDeleteModal(contact.kontakt_id)">
                                    <i class="fa fa-xmark"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Detail Modal -->
        <Modal :title="t('global','kontakt')" ref="modalRef">
            <template #body>
                <form class="row g-3" v-if="currentContact != null"  ref="contactDataFrm" >
                                
                    <div class="col-md-4">
                        <label for="kontakttyp" class="form-label">{{ t('global','typ') }}</label>
                        <select  id="kontakttyp" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="currentContact.kontakttyp" >
                            <option v-for="(item, index) in kontakttyp" :value="item.kontakttyp">
                                {{ item.beschreibung }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="kontakt" class="required form-label">{{ t('global','kontakt') }}</label>
                        <input type="text" @blur="frmState.kontaktBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validKontakt(currentContact.kontakt) && frmState.kontaktBlured}" id="kontakt" maxlength="128" v-model="currentContact.kontakt">
                    </div>
                    
                    <div class="col-md-2">                                             
                        <label for="zustellung" class="form-label">{{ t('person','zustellung') }}</label>
                        <div>
                            <input class="form-check-input" type="checkbox" id="zustellung" v-model="currentContact.zustellung">
                        </div>
                    </div>      
                    
                    <div class="col-md-8">
                        <label for="anmerkung" class="form-label">{{ t('global','anmerkung') }}</label>
                        <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="anmerkung" maxlength="64" v-model="currentContact.anmerkung">
                    </div>                                                            

                </form>        

            </template>
            <template #footer>
                <button type="button" class="btn btn-primary" @click="okHandler()" >
                {{ t('ui','speichern') }}
                </button>
            </template>
        </Modal>

        <ModalDialog :title="t('global','warnung')" ref="confirmDeleteRef">
            <template #body>
                {{ t('person','kontaktinformation') }} '{{ currentContact?.kontakt }}' {{ t('person','wirklichLoeschen') }}?
            </template>
        </ModalDialog>
    `
}