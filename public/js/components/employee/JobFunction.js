import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';
import { usePhrasen } from '../../../../../../../../public/js/mixins/Phrasen.js';

export const JobFunction = {
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

        const { t } = usePhrasen();

        const { personID: currentPersonID , personUID: currentPersonUID  } = Vue.toRefs(props);

        const uid = Vue.ref("");

        const dialogRef = Vue.ref();

        const url = Vue.ref("");

        const isFetching = Vue.ref(false);

        const jobfunctionList = Vue.ref([]);

        const types = Vue.inject('sachaufwandtyp');

        const full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

        const fetchData = async () => {
            if (currentPersonID.value==null) {    
                jobfunctionList.value = [];            
                return;
            }
            isFetching.value = true
 
            const urlMaterial = `${full}/extensions/FHC-Core-Personalverwaltung/api/personMaterialExpenses?person_id=${currentPersonID.value}&person_uid=${currentPersonUID.value}`;
            const urlUID = `${full}/extensions/FHC-Core-Personalverwaltung/api/uidByPerson?person_id=${currentPersonID.value}&person_uid=${currentPersonUID.value}`;
            
            // submit
            try {
                const response = await Vue.$fhcapi.Funktion.getAllUserFunctions(currentPersonUID.value);                    
                jobfunctionList.value = response.data.retval;
            } catch (error) {
                console.log(error)              
            } finally {
                isFetching.value = false
            }
            
        }

        const createShape = () => {
            return {
                sachaufwand_id: 0,
                mitarbeiter_uid: currentPersonUID.value,
                sachaufwandtyp_kurzbz: "",
                beginn: "",
                ende: "",  
                anmerkung: "",     
            } 
        }

        const currentValue = Vue.ref(createShape());
        const preservedValue = Vue.ref(createShape());

        Vue.watch([currentPersonID, currentPersonUID], ([id,uid]) => {
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
            console.log('Job function mounted', props.personID);
            currentValue.value = createShape();
            fetchData();
            
        })

        const jobfunctionListArray = Vue.computed(() => (jobfunctionList.value ? Object.values(jobfunctionList.value) : []));

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
            currentValue.value = { ...jobfunctionList.value[id] };
            delete currentValue.value.bezeichnung;
            modalRef.value.show();
        }

        const showDeleteModal = async (id) => {
            currentValue.value = { ...jobfunctionList.value[id] };
            const ok = await confirmDeleteRef.value.show();
            
            if (ok) {   

                try {
                    const res = await Vue.$fhcapi.Person.deletePersonMaterialExpenses(id);                    
                    if (res.data.error == 0) {
                        delete jobfunctionList.value[id];
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
            if (!validate()) {

                console.log("form invalid");

            } else {

                // submit
                try {
                    const r = await Vue.$fhcapi.Person.upsertPersonMaterialExpenses(currentValue.value);                    
                    if (r.data.error == 0) {
                        jobfunctionList.value[r.data.retval[0].sachaufwand_id] = r.data.retval[0];
                        console.log('materialdata successfully saved');
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
            jobfunctionList, jobfunctionListArray,
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
            showDeleteModal, showEditModal, confirmDeleteRef, t,
         }
    },
    template: `
    <div class="row">

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
          <Toast ref="toastRef">
            <template #body><h4>{{ t('person','sachaufwandGespeichert') }}</h4></template>
          </Toast>
        </div>

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="deleteToastRef">
                <template #body><h4>{{ t('person', 'sachaufwandGeloescht') }}</h4></template>
            </Toast>
        </div>
    </div>
    <div class="row pt-md-4">      
         <div class="col">
             <div class="card">
                <div class="card-header">
                    <div class="h5"><h5>{{ t('person','funktionen') }}</h5></div>        
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
                                <th scope="col">{{ t('core','unternehmen') }}</th>
                                <th scope="col">{{ t('person','zuordnung') }}</th>
                                <th scope="col">{{ t('person','abteilung') }}</th>
                                <th scope="col">{{ t('person','fachbereich') }}</th>
                                <th scope="col">{{ t('person','hrrelevant') }}</th>
                                <th scope="col">{{ t('person','vertragsrelevant') }}</th>
                                <th scope="col">{{ t('ui','from') }}</th>
                                <th scope="col">{{ t('global','bis') }}</th>                                                                
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="jobfunction in jobfunctionListArray" :key="jobfunction.benutzerfunktion_id">
                                <td class="align-middle">{{ jobfunction.dienstverhaeltnis_unternehmen }}</td>
                                <td class="align-middle">{{ jobfunction.beschreibung }}</td>
                                <td class="align-middle">{{ jobfunction.funktion_oebezeichnung }}</td>
                                <td class="align-middle">{{ jobfunction.funktion_oebezeichnung }}</td>
                                <td></td>
                                <td></td>
                                <td class="align-middle">{{ formatDate(jobfunction.datum_von) }}</td>
                                <td class="align-middle">{{ formatDate(jobfunction.datum_bis) }}</td>

                                <td class="align-middle" width="5%">
                                    <div class="d-grid gap-2 d-md-flex align-middle">
                                        <button type="button" class="btn btn-outline-dark btn-sm" @click="showDeleteModal(jobfunction.benutzerfunktion_id)">
                                            <i class="fa fa-minus"></i>
                                        </button>
                                        <button type="button" class="btn btn-outline-dark btn-sm" @click="showEditModal(jobfunction.benutzerfunktion_id)">
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
    <Modal :title="t('person','funktion')" ref="modalRef">
        <template #body>
            <form class="row g-3" ref="materialDataFrm">
                            
                <div class="col-md-8">
                    <label for="sachaufwandtyp_kurzbz" class="form-label">{{ t('global','typ') }}</label><br>
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
                    <label for="beginn" class="required form-label">{{ t('ui','from') }}</label>
                    <input type="date" :readonly="readonly" @blur="frmState.beginnBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validBeginn(currentValue.beginn) && frmState.beginnBlurred}" id="beginn" v-model="currentValue.beginn">
                </div>
                <div class="col-md-4">
                    <label for="ende" class="form-label">{{ t('global','bis') }}</label>
                    <input type="date" :readonly="readonly" @blur="frmState.endeBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="ende" v-model="currentValue.ende">
                </div>
                <div class="col-md-4">
                </div>
                <!-- -->
                <div class="col-md-8">
                    <label for="uid" class="form-label">{{ t('global','anmerkung') }}</label>
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
                {{ t('ui','abbrechen') }}
            </button>
            <button type="button" class="btn btn-primary" @click="okHandler()" >
                {{ t('ui','ok') }}
            </button>
        </template>

    </Modal>

    <ModalDialog :title="t('global','warnung')" ref="dialogRef">
      <template #body>
        {{ t('person','sachaufwandNochNichtGespeichert') }}
      </template>
    </ModalDialog>

    <ModalDialog :title="t('global','warnung')" ref="confirmDeleteRef">
        <template #body>
            {{ t('person','sachaufwand') }} '{{ currentValue?.sachaufwandtyp_kurzbz }} ({{ currentValue?.beginn }}-{{ currentValue?.ende }})' {{ t('person', 'wirklichLoeschen') }}?
        </template>
    </ModalDialog>
    `
}