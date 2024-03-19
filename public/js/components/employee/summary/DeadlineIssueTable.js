
import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import { DeadlineIssueDialog } from './DeadlineIssueDialog.js';
import { Toast } from '../../Toast.js';
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';

export const DeadlineIssueTable = {    
  components: {
    ModalDialog,
    Toast,
    "p-skeleton": primevue.skeleton,
    DeadlineIssueDialog,
  },
  props: {
    uid: String,
  },
  setup(props, { emit }){

      const { watch, ref, toRefs, onMounted } = Vue; 
      const { t } = usePhrasen();
      const isFetching = ref(false);
      const isFristFetching = ref(false);
      const currentUID = toRefs(props).uid
      const currentFrist = ref(null); 
      const fristen = ref([]);
      const fristStatus = ref([])
      const fristEreignisse = ref([])
      const dialogRef = ref();
      const confirmDeleteRef = ref();

      const redirect = (issue_id) => {
        console.log('issue_id', person_id);
        emit('issueSelected', person_id);
        // window.location.href = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/summary?person_id=${person_id}`;
      }   
      
      const fetchList = async () => {
        if (currentUID.value == null) {
          return;
        }
        try {
          isFristFetching.value = true;
          const res = await Vue.$fhcapi.Deadline.allByPerson(currentUID.value);
          fristen.value = res.data;			  
          isFristFetching.value = false;                        
        } catch (error) {
          console.log(error);
          isFristFetching.value = false;           
        }		
      }

      const fetchFristStatus = async () => {
        try {
            isFetching.value = true;
            const res = await Vue.$fhcapi.Deadline.getFristenStatus();
            fristStatus.value = res.data;			  
            isFetching.value = false;                        
        } catch (error) {
            console.log(error);
            isFetching.value = false;           
        }	
      }

      const fetchFristEreignisse = async () => {
        try {
            isFetching.value = true;
            const res = await Vue.$fhcapi.Deadline.getFristenEreignisse();
            fristEreignisse.value = res.data;			  
            isFetching.value = false;                        
        } catch (error) {
            console.log(error);
            isFetching.value = false;           
        }	
      }

      const createFristShape = (mitarbeiter_uid) => {
        return {
            frist_id: 0,
            ereignis_kurzbz: "manuell",
            bezeichnung: "",
            datum: null,
            status_kurzbz: "neu",
            mitarbeiter_uid: mitarbeiter_uid,
        }
      }

      const getFristEreignisBezeichnung = (ereignis_kurzbz) => {
        if (ereignis_kurzbz == null) return '';
        return fristEreignisse.value.find((item) => item.ereignis_kurzbz == ereignis_kurzbz).bezeichnung
      }

      const updateDeadlines = async () => {
        try {
          isFetching.value = true;
          const res = await Vue.$fhcapi.Deadline.updateFristenListe();
          isFetching.value = false;              
          fetchList();		  
        } catch (error) {
          console.log(error);
          isFetching.value = false;           
        }		
      }

      const showDeleteModal = async (id) => {
        currentFrist.value = fristen.value.find((frist) => frist.frist_id == id);
        const ok = await confirmDeleteRef.value.show();
        
        if (ok) {   

            try {
                const res = await Vue.$fhcapi.Deadline.deleteFrist(id);                    
                if (res.data.error == 0) {
                    fristen.value = fristen.value.filter((frist) => frist.frist_id != id);
                    showDeletedToast();
                }
            } catch (error) {
                console.log(error)              
            } finally {
                  isFetching.value = false
            }                  
            
        }
    }

      watch(
        currentUID,
        () => {
          fetchList();
        }
      )
  
      onMounted(() => {
        fetchFristStatus()
        fetchFristEreignisse()
        fetchList()
      })

      const onPersonSelect = (uid, person_id) => {
        let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	
        window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${person_id}/${uid}/summary`;
      }

      const statusChanged = async (frist_id) => {
        console.log(frist_id);
        const frist = fristen.value.filter((frist) => frist.frist_id == frist_id)[0];
        try  {
          isFetching.value = true
          const res = await Vue.$fhcapi.Deadline.updateFristStatus(frist_id, frist.status_kurzbz);    
          showToast();     
        } catch (error) {
            console.log(error);                
        } finally {
            isFetching.value = false;
        }     

      }

      const formatDate = (d) => {
        if (d != null && d != '') {
        return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
        } else {
            return ''
        }
      }

      const addDeadline = async () => {        
        const res = await dialogRef.value.showModal(createFristShape(currentUID.value));
        
        if (res.type == 'OK') {   
          let fristPayload = res.payload;
          console.log('addDeadline', fristPayload)
          try  {
            isFetching.value = true
            const res = await Vue.$fhcapi.Deadline.upsertFrist(fristPayload);    
            showCreateToast();     
            fetchList();
          } catch (error) {
              console.log(error);                
          } finally {
              isFetching.value = false;
          }    
        }
        
      }

      // Toast 
      const toastRef = Vue.ref();
      const createToastRef = Vue.ref();
      const deleteToastRef = Vue.ref();
      
      const showToast = () => {
          toastRef.value.show();
      }

      const showCreateToast = () => {
        createToastRef.value.show();
      }

      const showDeletedToast = () => {
          deleteToastRef.value.show();
      }

      return { t, confirmDeleteRef, currentFrist, getFristEreignisBezeichnung, showDeleteModal, onPersonSelect, 
               fristen, formatDate, updateDeadlines, currentUID, fristStatus, fristEreignisse, statusChanged, addDeadline,
               toastRef, createToastRef, deleteToastRef, dialogRef, isFetching, isFristFetching }
    },
  template: `

    <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
      <Toast ref="toastRef">
          <template #body><h4>{{ t('person','fristStatusGespeichert') }}</h4></template>
      </Toast>
    </div>

    <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
      <Toast ref="createToastRef">
          <template #body><h4>{{ t('person','fristGespeichert') }}</h4></template>
      </Toast>
    </div>

    <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
      <Toast ref="deleteToastRef">
          <template #body><h4>{{ t('person','fristGeloescht') }}</h4></template>
      </Toast>
    </div>

    <div id="master" class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-5 pb-2 mb-3">
                        
      <div class="flex-fill align-self-center">
        <h1 class="h2">Termine & Fristen 
          <button type="button" class="btn btn-sm btn-primary me-2" @click="addDeadline">
            <i class="fas fa-plus"></i>
            Termin/Frist  
          </button>
        </h1>       
      </div>
    </div>

    <div id="collapseTable"  >
      <p-skeleton style="width:100%" v-if="isFristFetching"></p-skeleton>
      <p-skeleton style="width:100%;margin-top:10px" v-if="isFristFetching"></p-skeleton>
      <table id="tableComponent" class="table table-sm table-hover table-striped" v-if="fristen != null && fristen.length > 0">
          <thead>
          <tr>
              <th scope="col" class="col-1"> 
                Ereignis
              </th>

              <th scope="col" class="col-1"> 
                Deadline
              </th>                                             

              <th scope="col" class="col-2"> 
                To Do
              </th>
              
              <th scope="col" class="col-2"> 
                Status
              </th>
          </tr>
          </thead>
          <tbody>
              <tr v-for="frist in fristen" >
                <td>
                  {{ frist.ereignis_bezeichnung }}
                </td>                
                <td>
                  {{ formatDate(frist.datum) }}
                </td>

                <td>
                  {{ frist.bezeichnung }}
                </td>
                
                <td>
                  <select  id="status_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="frist.status_kurzbz" @change="statusChanged(frist.frist_id)">
                        <option v-for="(item, index) in fristStatus" :value="item.status_kurzbz" >
                            {{ item.bezeichnung }}
                        </option>
                  </select>
                </td>
                <td>
                  <div class="d-grid gap-2 d-md-flex ">
                      <!--button type="button" class="btn btn-outline-dark btn-sm">
                          <i class="fa fa-minus"></i>
                      </button-->
                      <button type="button" class="btn btn-outline-dark btn-sm" @click="showDeleteModal(frist.frist_id)">
                        <i class="fa fa-xmark"></i>
                      </button>
                  </div>
                </td>
              </tr>
          </tbody>
      </table> 
      <div v-else-if="!isFristFetching" >0 Datensätze vorhanden.</div>
    </div>   
    
    <ModalDialog :title="t('global','warnung')" ref="confirmDeleteRef">
        <template #body>
            {{ t('person','frist') }} '{{ getFristEreignisBezeichnung(currentFrist?.ereignis_kurzbz) }} {{ formatDate(currentFrist?.datum) }}' {{ t('person','wirklichLoeschen') }}?
        </template>
    </ModalDialog>

    <DeadlineIssueDialog ref="dialogRef"></DeadlineIssueDialog>
  `
}