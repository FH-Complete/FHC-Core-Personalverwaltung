
import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import { DeadlineIssueDialog } from './DeadlineIssueDialog.js';
import { Toast } from '../../Toast.js';
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import { CoreFilterCmpt } from "../../../../../../js/components/filter/Filter.js";


export const DeadlineIssueTable = {    
  components: {
    ModalDialog,
    Toast,
    "p-skeleton": primevue.skeleton,
    DeadlineIssueDialog,
    CoreFilterCmpt,
  },
  props: {
    uid: String,
  },
  setup(props, { emit }){

      const { watch, ref, toRefs, onMounted, inject } = Vue; 
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
      const modalContainer = ref();
      const fhcApi = inject('$fhcApi');

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
          if( fristenTable.value?.tabulator !== null ) {
            fristenTable.value.tabulator.dataLoader.alertLoader();
          }
          isFristFetching.value = true;
          //const res = await Vue.$fhcapi.Deadline.allByPerson(currentUID.value, deadline_filter_all.value);
          const res = await fhcApi.factory.Deadline.allByPerson(currentUID.value, deadline_filter_all.value);
          fristen.value = res.data;			  
          isFristFetching.value = false;                        
        } catch (error) {
          console.log(error);
          isFristFetching.value = false;           
        } finally {
            if( fristenTable.value?.tabulator !== null ) {
                fristenTable.value.tabulator.dataLoader.clearAlert();
            }
        }		
      }

      const fetchFristStatus = async () => {
        try {
            isFetching.value = true;
            const res = await fhcApi.factory.Deadline.getFristenStatus();
            fristStatus.value = res.data;		
            isFetching.value = false;                        
        } catch (error) {
            console.log(error);
            isFetching.value = false;           
        }	
      }

      
      const fristStatusList = Vue.computed(() => {
        // let res = fristStatus.value.map((element) => ({label: element.bezeichnung, value: element.status_kurzbz }) )
        let result = fristStatus.value.reduce((res, x) => {
          res[x.status_kurzbz] = x.bezeichnung;
          return res;
        }, {});
        console.log(result);
        return result
      })

      const fetchFristEreignisse = async () => {
        try {
            isFetching.value = true;
            const res = await fhcApi.factory.Deadline.getFristenEreignisse();
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
          const res = await fhcApi.factory.Deadline.updateFristenListe();
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
                const res = await fhcApi.factory.Deadline.deleteFrist(id);                    
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
          const res = await fhcApi.factory.Deadline.updateFristStatus(frist_id, frist.status_kurzbz);    
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
            const res = await fhcApi.factory.Deadline.upsertFrist(fristPayload);    
            showCreateToast();     
            fetchList();
          } catch (error) {
              console.log(error);                
          } finally {
              isFetching.value = false;
          }    
        }
        
      }

      const editDeadline = async (frist) => {   
        let fristClone = {...frist} 
        const res = await dialogRef.value.showModal(fristClone);
        
        if (res.type == 'OK') {   
          let fristPayload = res.payload;
          delete fristPayload.status_bezeichnung
          delete fristPayload.ma_name
          delete fristPayload.ereignis_bezeichnung 
          delete fristPayload.person_id
          delete fristPayload.manuell
          console.log('editDeadline', fristPayload)
          try  {
            isFetching.value = true
            const res = await fhcApi.factory.Deadline.upsertFrist(fristPayload);    
            showCreateToast();     
            fetchList();
          } catch (error) {
              console.log(error);                
          } finally {
              isFetching.value = false;
          }    
        }
        
      }

      // ------------------------
      // Tabulator
      // ------------------------

      const fristenTable = ref(null);
      const modalTitel = ref('');
      const current_status_kurzbz = ref('');
      const deadline_filter_all = ref('false');

      const handleDeadlineFilterAllChanged = () => {
          fetchList();
      }

      // Methods

      const onTableCellEdited = async (cell) => {
        console.log('onTableCellEdited', cell.getValue(), cell.getRow().getIndex())
        try  {
          isFetching.value = true
          const res = await fhcApi.factory.Deadline.updateFristStatus(cell.getRow().getIndex(), cell.getValue());    
          showToast();     
        } catch (error) {
            console.log(error);                
        } finally {
            isFetching.value = false;
        }   
      }

      const dateFormatter = (cell) => {
        return cell.getValue()?.replace(/(.*)-(.*)-(.*)/, '$3.$2.$1');
      }

      const customHeaderFilter = (headerValue, rowValue, rowData, filterParams) => {
          //headerValue - the value of the header filter element
          //rowValue - the value of the column in this row
          //rowData - the data for the row being filtered
          //filterParams - params object passed to the headerFilterFuncParams property
        
          const validDate = function(d){
              return d instanceof Date && isFinite(d);
          }

          const date1 = new Date(rowValue);
          date1.setHours(0,0,0,0);
          let [day, month, year] = headerValue.split('.')
          if (year < 1000) return true;  // prevents dates like 17.5.2
          const date2 = new Date(+year, +month - 1, +day);

          return  !(validDate(date2)) || ((date2 - date1) == 0); //must return a boolean, true if it passes the filter.
      }
         

      const addData = () => {
        //modalTitel.value = 'Datensatz anlegen';
        //smodalContainer.value.show();
        addDeadline();
      }
      const manipulateData = (id) => {
        Vue.$fhcAlert.alertInfo('ID' + id + ' do some Action');
      }
      const deleteData = async (id) => {
        if (await Vue.$fhcAlert.confirmDelete() === false)
          return;
        Vue.$fhcAlert.alertSuccess('ID' + id + ' deleted');
      }      

      const updateStatus = async () => {
        let selectedData = fristenTable.value.tabulator.getSelectedData();
        let fristen = selectedData.map((element) => parseInt(element.frist_id))
        console.log('fristen', fristen) 
        try  {
          isFetching.value = true
          const res = await fhcApi.factory.Deadline.batchUpdateFristStatus(fristen, current_status_kurzbz.value);    
          fetchList();
          showToast();     
        } catch (error) {
            console.log(error);                
        } finally {
            isFetching.value = false;
        }     

      }

      const rowFormatter = (row) => {
        let data = row.getData();
        let now = new Date(new Date().setHours(0, 0, 0, 0));
    
        if(data.status_kurzbz == "erledigt"){
            //row.getElement().childNodes[5].style.backgroundColor = "#0080004d"
            row.getElement().childNodes[4].style.color = "#198734"
        } else if (Date.parse(data.datum) <= now) {
            row.getElement().childNodes[4].style.color = "#871919"
            row.getElement().childNodes[4].style.fontWeight = "bold"
        }
      }



      const columnsDef = [
        {
          formatter: 'rowSelection',
          titleFormatter: 'rowSelection',
          titleFormatterParams:{
            rowRange:"active" //only toggle the values of the active filtered rows
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
          headerSort: false,
          width: 40,
          maxWidth: 40,
          minWidth: 40,
        },
        { title: 'Ereignis', field: "ereignis_bezeichnung", sorter:"string",  width: 140, headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
        { title: 'Deadline', field: "datum", hozAlign: "center",  width: 140, headerFilter:true,formatter: dateFormatter, headerFilterFunc:customHeaderFilter },
        { title: 'To Do', field: "bezeichnung", hozAlign: "left", headerFilter:true, headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
        { title: 'Status', field: "status_kurzbz", hozAlign: "center", width: 140, sorter:"string", 
          headerFilter:"list",
          headerFilterParams: {valuesLookup:() => fristStatus.value.map((element) => ({label: element.bezeichnung, value: element.status_kurzbz })) },
          editor: "list", 
          editorParams:{
            values:fristStatusList
          },
          formatter: (cell) => {
            return fristStatus.value.find((element) => element.status_kurzbz == cell.getValue())?.bezeichnung
          }
        },
        {
          title: 'Aktionen',
          field: 'actions',
          width: 145,	// Ensures Action-buttons will be always fully displayed
          minWidth: 105,	// Ensures Action-buttons will be always fully displayed
          maxWidth: 145,	// Ensures Action-buttons will be always fully displayed
          formatter: (cell, formatterParams, onRendered) => {
            let container = document.createElement('div');
            container.className = "d-flex gap-2";            

            if (cell.getRow().getData().manuell === 't' ) {
              let button = document.createElement('button');
              button.className = 'btn btn-sm btn-outline-secondary';
              button.innerHTML = '<i class="fa fa-edit"></i>';
              button.addEventListener('click', (event) =>
                editDeadline(cell.getRow().getData())
              );
              container.append(button);

              button = document.createElement('button');
              button.className = 'btn btn-sm btn-outline-secondary';
              button.innerHTML = '<i class="fa fa-xmark"></i>';
              button.addEventListener('click', () =>
                //deleteData(cell.getRow().getIndex())
                showDeleteModal(cell.getRow().getIndex())
              );
              container.append(button);
            }

            return container;
          },
          frozen: true
        }
      ];   

      // Options

      const tabulatorOptions = Vue.reactive({
        //return {
          reactiveData: true,
          data: fristen.value,
          
          // Unique ID
          index: 'frist_id',
          
          // @see: https://tabulator.info/docs/5.2/layout#layout
          // This is the default option and can be omitted.
          layout: 'fitColumns',
          
          // Column definitions
          columns: columnsDef,

          rowFormatter: rowFormatter,
        //}
      })

      const tabulatorEvents = Vue.computed(() => [
        {
            event: 'cellEdited',
            handler: onTableCellEdited
        },
        {
            event: 'tableBuilt',
            handler: () => {
                fetchList();
            }
        }
      ]);

      Vue.watch(fristen, (newVal, oldVal) => {
        console.log('fristenList changed');
        if( fristenTable.value?.tabulator !== null ) {
            fristenTable.value.tabulator.setData(fristen.value);
        }
      }, {deep: true})

    /*   Vue.watch(fristStatusList, (newVal, oldVal) => {
        let colDefs = fristenTable.value?.tabulator.getColumnDefinitions()
        let statusCol = colDefs.find(col => col.field === 'status_kurzbz')
        if (statusCol !== undefined) {
          statusCol.headerFilterParams.values = newVal;
        }
      }) */


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

      return { t, confirmDeleteRef, currentFrist, getFristEreignisBezeichnung, showDeleteModal, onPersonSelect, onTableCellEdited,
               fristen, formatDate, updateDeadlines, currentUID, fristStatus, fristEreignisse, statusChanged, addDeadline,
               toastRef, createToastRef, deleteToastRef, dialogRef, isFetching, isFristFetching, updateStatus,
               fristenTable, tabulatorOptions, tabulatorEvents, addData, editDeadline,  deleteData, manipulateData, modalContainer, modalTitel,
               current_status_kurzbz, deadline_filter_all, handleDeadlineFilterAllChanged }
    },
  template: `

    <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
      <Toast ref="toastRef">
          <template #body><h4>{{ t('fristenmanagement','fristStatusGespeichert') }}</h4></template>
      </Toast>
    </div>

    <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
      <Toast ref="createToastRef">
          <template #body><h4>{{ t('fristenmanagement','fristGespeichert') }}</h4></template>
      </Toast>
    </div>

    <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
      <Toast ref="deleteToastRef">
          <template #body><h4>{{ t('fristenmanagement','fristGeloescht') }}</h4></template>
      </Toast>
    </div>

    <div id="master" class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-5 pb-2 mb-3">
                        
      <div class="flex-fill align-self-center">
        <h1 class="h2">Termine & Fristen</h1>       
      </div>
    </div>
    
    <ModalDialog :title="t('global','warnung')" ref="confirmDeleteRef">
        <template #body>
            {{ t('fristenmanagement','frist') }} '{{ getFristEreignisBezeichnung(currentFrist?.ereignis_kurzbz) }} {{ formatDate(currentFrist?.datum) }}' {{ t('person','wirklichLoeschen') }}?
        </template>
    </ModalDialog>

    <DeadlineIssueDialog ref="dialogRef"></DeadlineIssueDialog>

    <core-filter-cmpt 
			ref="fristenTable"
			table-only
			:side-menu="false"
			:tabulator-options="tabulatorOptions"
                        :tabulator-events="tabulatorEvents"
			new-btn-label="Termin/Frist"
			new-btn-show
			new-btn-class="btn-primary"
			@click:new="addDeadline"			
			>
			<template #actions>				
			 	<div class="d-flex gap-2 align-items-baseline">					
          <select  id="status_kurzbz" class="form-select form-select-sm"  v-model="current_status_kurzbz" >
              <option value="">- Status -</option>
              <option v-for="(item, index) in fristStatus" :value="item.status_kurzbz" >
                  {{ item.bezeichnung }}
              </option>
          </select>
          <button type="button" class="btn  btn-primary btn-primary-sm me-2 text-nowrap" @click="updateStatus" :class="{'disabled':current_status_kurzbz==''}">
            <i class="fas fa-pencil"></i>
            setzen
          </button>

          <label for="deadline_filter_all" class="ms-5">Filter: </label>
          <select id="deadline_filter_all" class="form-select form-select-sm deadline_filter_all" 
                v-model="deadline_filter_all" @change="handleDeadlineFilterAllChanged">
              <option value="false">vergangene erledigte ausblenden</option>
              <option value="true">alle anzeigen</option>
          </select>

				</div>
			</template>
		</core-filter-cmpt>
		
  `
}