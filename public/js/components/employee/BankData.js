import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';

export const BankData = {
    components: {
        Modal,
        ModalDialog,
        Toast,
    },
    props: {
        modelValue: { type: Object, default: () => ({}), required: false},
        config: { type: Object, default: () => ({}), required: false},
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        personUID: { type: String, required: true },
        writePermission: { type: Boolean, required: false },
    },
    setup( props ) {

        const readonly = Vue.ref(false);
        const { personID } = Vue.toRefs(props);
        const { t } = usePhrasen();
        const dialogRef = Vue.ref();
        const isFetching = Vue.ref(false);
        const bankdataList = Vue.ref([]);

        const theModel = Vue.computed({  // Use computed to wrap the object
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        });

        const fetchData = async () => {
            if (theModel.value.personID==null && props.personID==null) {
                bankdataList.value = [];            
                return;
            }
            isFetching.value = true
            try {
              const res = await Vue.$fhcapi.Person.personBankData(theModel.value.personID || personID.value);                    
              bankdataList.value = res.data.retval;
            } catch (error) {
              console.log(error)              
            } finally {
                isFetching.value = false
            }
        }

        const createShape = (person_id) => {
            return {
                bankverbindung_id: 0,
                anschrift: "",
                person_id: person_id,
                name: "",
                iban: "",
                bic: "",  
                blz: "",
                kontonr: "",        
                typ: "p",
                verrechnung: true      
            } 
        }

        const currentValue = Vue.ref(createShape(theModel.value.personID || personID.value));
        const preservedValue = Vue.ref(createShape(theModel.value.personID || personID.value));

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
            currentValue.value = createShape(theModel.value.personID || personID.value);
            fetchData();
            
        })

        const bankdataListArray = Vue.computed(() => (bankdataList.value ? Object.values(bankdataList.value) : []));

        // Modal 
        const modalRef = Vue.ref();
        const confirmDeleteRef = Vue.ref();

        const showAddModal = () => {
            currentValue.value = createShape(theModel.value.personID || personID.value);
            // reset form state
            frmState.ibanBlured=false;
            frmState.bankBlured=false;
            // call bootstrap show function
            modalRef.value.show();
        }

        const hideModal = () => {
            modalRef.value.hide();
        }
        
        const showEditModal = (id) => {
            currentValue.value = { ...bankdataList.value[id] };
            modalRef.value.show();
        }

        const showDeleteModal = async (id) => {
            currentValue.value = { ...bankdataList.value[id] };
            const ok = await confirmDeleteRef.value.show();
            
            if (ok) {   

                isFetching.value = true
                try {
                  const res = await Vue.$fhcapi.Person.deletePersonBankData(id);                    
                  if (res.data.error == 0) {
                    delete bankdataList.value[id];
                    showDeletedToast();
                  }
                } catch (error) {
                    console.log(error)              
                } finally {
                    isFetching.value = false
                }
                
            }
        }


        const okHandler = async () => {
            // console.log('haschanged: ', hasChanged);
            // console.log('frmState: ', frmState);

            if (!validate()) {

                console.log("form invalid");

            } else {

                try {
                    const r = await Vue.$fhcapi.Person.upsertPersonBankData(currentValue.value);                    
                    if (r.data.error == 0) {
                        bankdataList.value[r.data.retval[0].bankverbindung_id] = r.data.retval[0];
                        console.log('bankdata successfully saved');
                        preservedValue.value = currentValue.value;
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

        // -------------
        // form handling
        // -------------

        const bankDataFrm = Vue.ref();

        const frmState = Vue.reactive({ ibanBlured: false, wasValidated: false });

        const validIban = (n) => {
            return !!n && n.trim() != "" && isChecksumValid(n.replace(/\s/g, ''));
        }

        // check iban
        // copy from https://stackoverflow.com/questions/29275649/javascript-iban-validation-check-german-or-austrian-iban
        const isChecksumValid = (x) => {
            if (x.length < 5) return false;
            if (!x.match(/[A-Z]{2}[0-9]{2}[A-Z0-9]+/)) return false;
            var ASCII_0 = "0".charCodeAt(0);
            var ASCII_A = "A".charCodeAt(0);
            var acc = 0;
            function add(n) {
                if (acc > 1000000) acc %= 97;
                acc = n < ASCII_A ? 10 * acc + n - ASCII_0 
                    : 100 * acc + n - ASCII_A + 10;
            }
            for (var i=4; i<x.length; ++i) add(x.charCodeAt(i));
            for (var i=0; i<4; ++i) add(x.charCodeAt(i));
            acc %= 97;
            return acc == 1;
        }


        const validate = () => {
            frmState.ibanBlured = true;
            if (validIban(currentValue.value.iban)) {
                return true;
            }
            return false;
        }

        const hasChanged = Vue.computed(() => {
            return Object.keys(currentValue.value).some(field => currentValue.value[field] !== preservedValue.value[field])
        });

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
            bankdataList, bankdataListArray,
            currentValue,
            readonly,
            frmState,
            dialogRef,
            toastRef, deleteToastRef,
            bankDataFrm,
            modalRef, 
            
            toggleMode,  
            validIban, 
            showToast, showDeletedToast,
            showAddModal, hideModal, okHandler, t,
            showDeleteModal, showEditModal, confirmDeleteRef,
         }
    },
    template: `
    <div class="row">

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
          <Toast ref="toastRef">
            <template #body><h4>{{ t('person','bankdatenGespeichert') }}</h4></template>
          </Toast>
        </div>

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="deleteToastRef">
                <template #body><h4>{{ t('person','bankdatenGeloescht') }}</h4></template>
            </Toast>
        </div>
    </div>

   <div class="row pt-md-4">      
         <div class="col">
             <div class="card">
                <div class="card-header">
                    <div class="h5"><h5>{{ t('person','bankdaten') }}</h5></div>        
                </div>
        
                <div class="card-body">
                    <div class="d-grid gap-2 d-md-flex justify-content-start py-2">
                        <button type="button" class="btn btn-sm btn-primary" @click="showAddModal()">
                            <i class="fa fa-plus"></i> {{ t('person','bankdaten') }}
                        </button>            
                    </div>
                    <div class="table-responsive">
                <table class="table table-hover table-sm">
                    <thead>                
                    <tr>
                        <th scope="col">{{ t('person','bank') }}</th>
                        <th scope="col">{{ t('person','anschrift') }}</th>
                        <th scope="col">{{ t('person','bic') }}</th>
                        <th scope="col">{{ t('person','iban') }}</th>
                        <th scope="col">{{ t('person','kontonr') }}</th>
                        <th scope="col">{{ t('person','verrechnung') }}</th>
                        <th scope="col">{{ t('ui','aktion') }}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="bankdata in bankdataListArray" :key="bankdata.bankverbindung_id">
                        <td class="align-middle">{{ bankdata.name }}</td>
                        <td class="align-middle">{{ bankdata.anschrift }}</td>
                        <td class="align-middle">{{ bankdata.bic }}</td>
                        <td class="align-middle">{{ bankdata.iban }}</td>
                        <td class="align-middle">{{ bankdata.kontonr }}</td>
                        <td class="align-middle">{{ bankdata.verrechnung == true ? "X" : "" }}</td>
                        <td class="align-middle" width="5%">
                            <div class="d-grid gap-2 d-md-flex align-middle">
                                <button type="button" class="btn btn-outline-secondary btn-sm" @click="showEditModal(bankdata.bankverbindung_id)">
                                    <i class="fa fa-pen"></i>
                                </button>
                                <button type="button" class="btn btn-outline-secondary btn-sm" @click="showDeleteModal(bankdata.bankverbindung_id)">
                                    <i class="fa fa-xmark"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
        
                    </tbody>
                </table>            
            </div>
                </div>
            </div>
        </div>
    </div>

    <!-- detail modal -->
    <Modal :title="t('person','bankverbindung')" ref="modalRef">
        <template #body>
            <form class="row g-3" ref="bankDataFrm">
                            
                <div class="col-md-8">
                    <label for="receiver" class="form-label">{{ t('global','empfaenger') }}</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="receiver" v-model="currentValue.anschrift" maxlength="128">
                </div>
                <div class="col-md-4"></div>
                <!--  -->
                <div class="col-md-4">
                    <label for="iban" class="required form-label" >{{ t('person','iban') }}</label>
                    <input type="text" required  @blur="frmState.ibanBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validIban(currentValue.iban) && frmState.ibanBlured}" id="iban" v-model="currentValue.iban"  maxlength="34"  >
                </div>
                <div class="col-md-4">
                    <label for="bic" class="form-label">{{ t('person','bic') }}</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="bic" maxlength="11" v-model="currentValue.bic">
                </div>
                <div class="col-md-4">
                </div>
                <!-- -->
                <div class="col-md-8">
                    <label for="uid" class="form-label">{{ t('person','bank') }}</label>
                    <input type="text"  :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="bank" maxlength="64"  v-model="currentValue.name">
                </div>
                <div class="col-md-4">
                </div>
                <!-- -->
                <div class="col-md-2">
                    <label for="blz" class="form-label">{{ t('person','blz') }}</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="blz" maxlength="16"  v-model="currentValue.blz">
                </div>
                <div class="col-md-4">
                    <label for="kontonr" class="form-label">{{ t('person','kontonr') }}</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="kontonr" maxlength="16"  v-model="currentValue.kontonr">
                </div>
                <div class="col-md-2">
                    <label for="verrechnung" class="form-label">{{ t('person','verrechnung') }}</label>
                    <div>
                        <input class="form-check-input" type="checkbox" id="verrechnung" v-model="currentValue.verrechnung">
                    </div>     
                </div>

                <!-- changes -->
                <div class="col-8">
                    <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
                </div>
                
            </form>
        </template>
        <template #footer>
            <button type="button" class="btn btn-primary" @click="okHandler()" >
            {{ t('ui','speichern') }}
            </button>
        </template>

    </Modal>

    <ModalDialog :title="t('global','warnung')" ref="dialogRef">
      <template #body>
        {{ t('person','bankdatenGeaendert') }}
      </template>
    </ModalDialog>

    <ModalDialog :title="t('global','warnung')" ref="confirmDeleteRef">
        <template #body>
            {{ t('person','bankdaten') }} '{{ currentValue?.iban }} {{ currentValue?.bic }}, {{ currentValue?.name }}' {{ t('person','wirklichLoeschen') }}?
        </template>
    </ModalDialog>
    `
}

export default BankData;