import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';

export const MaterialExpensesData = {
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

        const materialdataList = Vue.ref([]);

        const types = Vue.inject('sachaufwandtyp');

        const full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

        const fetchData = async () => {
            if (currentPersonID.value==null) {    
                materialdataList.value = [];            
                return;
            }
            isFetching.value = true
 
            const urlMaterial = `${full}/extensions/FHC-Core-Personalverwaltung/api/personMaterialExpenses?person_id=${currentPersonID.value}&person_uid=${currentPersonUID.value}`;
            const urlUID = `${full}/extensions/FHC-Core-Personalverwaltung/api/uidByPerson?person_id=${currentPersonID.value}&person_uid=${currentPersonUID.value}`;
            
            // submit
            try {
                const response = await Vue.$fhcapi.Person.personMaterialExpenses(currentPersonID.value, currentPersonUID.value);                    
                materialdataList.value = response.data.retval;
            } catch (error) {
                console.log(error)              
            } finally {
                isFetching.value = false
            }
            
            /*
            try {
              
              // get uid
              const resUID = await fetch(urlUID);
              let responseUID = await resUID.json();
              uid.value = responseUID.retval[0].uid;
              isFetching.value = false              
            } catch (error) {
              console.log(error)
              isFetching.value = false;
            }*/
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
            console.log('MaterialData mounted', props.personID);
            currentValue.value = createShape();
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
            delete currentValue.value.bezeichnung;
            modalRef.value.show();
        }

        const showDeleteModal = async (id) => {
            currentValue.value = { ...materialdataList.value[id] };
            const ok = await confirmDeleteRef.value.show();
            
            if (ok) {   

                try {
                    const res = await Vue.$fhcapi.Person.deletePersonMaterialExpenses(id);                    
                    if (res.data.error == 0) {
                        delete materialdataList.value[id];
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
                        materialdataList.value[r.data.retval[0].sachaufwand_id] = r.data.retval[0];
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
                    <div class="h5"><h5>{{ t('person','sachaufwand') }}</h5></div>        
                </div>

                <div class="card-body">
                    <div class="d-grid d-md-flex justify-content-start py-2">
                        <button type="button" class="btn btn-sm btn-primary" @click="showAddModal()">
                        <i class="fa fa-plus"></i> {{ t('person','sachaufwand') }}
                        </button>            
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover table-sm">
                            <thead>                
                            <tr>
                                <th scope="col">{{ t('global','typ') }}</th>
                                <th scope="col">{{ t('ui','from') }}</th>
                                <th scope="col">{{ t('global','bis') }}</th>
                                <th scope="col">{{ t('global','anmerkung') }}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="materialdata in materialdataListArray" :key="materialdata.sachaufwand_id">
                                <td class="align-middle">{{ materialdata.bezeichnung }}</td>
                                <td class="align-middle">{{ formatDate(materialdata.beginn) }}</td>
                                <td class="align-middle">{{ formatDate(materialdata.ende) }}</td>
                                <td class="align-middle">{{ materialdata.anmerkung }}</td>
                                <td class="align-middle" width="5%">
                                    <div class="d-grid gap-2 d-md-flex align-middle">
                                        <button type="button" class="btn btn-outline-secondary btn-sm" @click="showEditModal(materialdata.sachaufwand_id)">
                                            <i class="fa fa-pen"></i>
                                        </button>
                                        <button type="button" class="btn btn-outline-secondary btn-sm" @click="showDeleteModal(materialdata.sachaufwand_id)">
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
    <Modal :title="t('person','sachaufwand')" ref="modalRef">
        <template #body>
            <form class="row g-3" ref="materialDataFrm">
                            
                <div class="col-md-4">
                    <label for="sachaufwandtyp_kurzbz" class="form-label">{{ t('global','typ') }}</label><br>
                    <select v-if="!readonly" id="sachaufwandtyp_kurzbz" v-model="currentValue.sachaufwandtyp_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " >
                        <option v-for="(item, index) in types" :value="item.sachaufwandtyp_kurzbz">
                            {{ item.bezeichnung }}
                        </option>                       
                    </select>
                    <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="sachaufwandtyp_kurzbz" :value="currentValue.sachaufwandtyp_kurzbz">
                </div>
                <!--  -->
                <div class="col-md-3">
                    <label for="beginn" class="required form-label">{{ t('ui','from') }}</label>
                    <input type="date" :readonly="readonly" @blur="frmState.beginnBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validBeginn(currentValue.beginn) && frmState.beginnBlurred}" id="beginn" v-model="currentValue.beginn">
                </div>
                <div class="col-md-3">
                    <label for="ende" class="form-label">{{ t('global','bis') }}</label>
                    <input type="date" :readonly="readonly" @blur="frmState.endeBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="ende" v-model="currentValue.ende">
                </div>
                <div class="col-md-2">
                </div>
                <!-- -->
                <div class="col-md-10">
                    <label for="uid" class="form-label">{{ t('global','anmerkung') }}</label>
                    <input type="text"  :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="bank" v-model="currentValue.anmerkung">
                </div>
                <div class="col-md-2">
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