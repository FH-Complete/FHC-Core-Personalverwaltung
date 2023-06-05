import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';

export const BankData = {
    components: {
        Modal,
        ModalDialog,
        Toast,
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        personUID: { type: String, required: true },
        writePermission: { type: Boolean, required: false },
    },
    setup( props ) {

        const readonly = Vue.ref(false);

        const { personID } = Vue.toRefs(props);

        const dialogRef = Vue.ref();

        const url = Vue.ref("");

        const isFetching = Vue.ref(false);

        const bankdataList = Vue.ref([]);

        const generateEndpointURL = (person_id) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/personBankData?person_id=${person_id}`;
        };

        const fetchData = async () => {
            if (personID.value==null) {    
                bankdataList.value = [];            
                return;
            }
            isFetching.value = true
            try {
              console.log('url',url.value);
              const res = await fetch(url.value);
              let response = await res.json()              
              bankdataList.value = response.retval;
              isFetching.value = false              
            } catch (error) {
              console.log(error)
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
            console.log('BankData mounted', props.personID);
            currentValue.value = createShape();
            url.value = generateEndpointURL(props.personID); 
            fetchData();
            
        })

        const bankdataListArray = Vue.computed(() => (bankdataList.value ? Object.values(bankdataList.value) : []));

        // Modal 
        const modalRef = Vue.ref();
        const confirmDeleteRef = Vue.ref();

        const showAddModal = () => {
            currentValue.value = createShape(personID);
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

                postDelete(id)
                    .then((r) => {
                        if (r.error == 0) {
                            delete bankdataList.value[id];
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
                            bankdataList.value[r.retval[0].bankverbindung_id] = r.retval[0];
                            console.log('bankdata successfully saved');
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

       /* if (!bankDataFrm.value.checkValidity()) {

            console.log("form invalid");

        } else {

*/

        // save
        const postData = async () => {
            console.log('haschanged: ', hasChanged);
            console.log('frmState: ', frmState);

            //if (!bankDataFrm.value.checkValidity()) {


              //  console.log("form invalid");

            //} else {

                // submit
                isFetching.value = true
                let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

                const endpoint =
                    `${full}/extensions/FHC-Core-Personalverwaltung/api/upsertPersonBankData`;

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
               
            //}

            //frmState.wasValidated  = true;  
        }

        const postDelete = async (id) => {
            isFetching.value = true
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            const endpoint =
                `${full}/extensions/FHC-Core-Personalverwaltung/api/deletePersonBankData`;

            const res = await fetch(endpoint,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({bankverbindung_id: id}),
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
            showAddModal, hideModal, okHandler,
            showDeleteModal, showEditModal, confirmDeleteRef,
         }
    },
    template: `
    <div class="row">

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
          <Toast ref="toastRef">
            <template #body><h4>Bankdaten gespeichert.</h4></template>
          </Toast>
        </div>

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="deleteToastRef">
                <template #body><h4>Bankdaten gelöscht.</h4></template>
            </Toast>
        </div>
    </div>

   <div class="row pt-md-4">      
         <div class="col">
             <div class="card">
                <div class="card-header">
                    <div class="h5"><h5>Bankdaten</h5></div>        
                </div>
        
                <div class="card-body">
                    <div class="d-grid gap-2 d-md-flex justify-content-end ">
                        <button type="button" class="btn btn-sm btn-outline-secondary" @click="showAddModal()">
                            <i class="fa fa-plus"></i>
                        </button>            
                    </div>
                    <div class="table-responsive">
                <table class="table table-hover table-sm">
                    <thead>                
                    <tr>
                        <th scope="col">Bank</th>
                        <th scope="col">Anschrift</th>
                        <th scope="col">BIC</th>
                        <th scope="col">IBAN</th>
                        <th scope="col">Kontonr</th>
                        <th scope="col">Verrechnung</th>
                        <th scope="col">Aktion</th>
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
                                <button type="button" class="btn btn-outline-secondary btn-sm" @click="showDeleteModal(bankdata.bankverbindung_id)">
                                    <i class="fa fa-xmark"></i>
                                </button>
                                <button type="button" class="btn btn-outline-secondary btn-sm" @click="showEditModal(bankdata.bankverbindung_id)">
                                    <i class="fa fa-pen"></i>
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
    <Modal title="Bankverbindung" ref="modalRef">
        <template #body>
            <form class="row g-3" ref="bankDataFrm">
                            
                <div class="col-md-8">
                    <label for="receiver" class="form-label">Empfänger</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="receiver" v-model="currentValue.anschrift" maxlength="128">
                </div>
                <div class="col-md-4"></div>
                <!--  -->
                <div class="col-md-4">
                    <label for="iban" class="required form-label" >IBAN</label>
                    <input type="text" required  @blur="frmState.ibanBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validIban(currentValue.iban) && frmState.ibanBlured}" id="iban" v-model="currentValue.iban" id="iban" maxlength="34" v-model="currentValue.iban" >
                </div>
                <div class="col-md-4">
                    <label for="bic" class="form-label">BIC</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="bic" maxlength="11" v-model="currentValue.bic">
                </div>
                <div class="col-md-4">
                </div>
                <!-- -->
                <div class="col-md-8">
                    <label for="uid" class="form-label">Bank</label>
                    <input type="text"  :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="bank" maxlength="64"  v-model="currentValue.name">
                </div>
                <div class="col-md-4">
                </div>
                <!-- -->
                <div class="col-md-2">
                    <label for="blz" class="form-label">BLZ</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="blz" maxlength="16"  v-model="currentValue.blz">
                </div>
                <div class="col-md-4">
                    <label for="kontonr" class="form-label">Kontonr</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="kontonr" maxlength="16"  v-model="currentValue.kontonr">
                </div>
                <div class="col-md-2">
                    <label for="verrechnung" class="form-label">Verrechnung</label>
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
        Bankdaten schließen? Geänderte Daten gehen verloren!
      </template>
    </ModalDialog>

    <ModalDialog title="Warnung" ref="confirmDeleteRef">
        <template #body>
            Bankdaten '{{ currentValue?.iban }} {{ currentValue?.bic }}, {{ currentValue?.name }}' wirklich löschen?
        </template>
    </ModalDialog>
    `
}