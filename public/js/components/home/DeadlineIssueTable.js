import { Toast } from "../Toast.js";
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import { CoreFilterCmpt } from "../../../../../js/components/filter/Filter.js";

export const DeadlineIssueTable = {    
  components: {
    Toast,
  },
  props: {
  },
  setup(props, { emit }){

      const isFetching = Vue.ref(false);
      const fristen = Vue.ref([]);
      const fristStatus = Vue.ref([])

      const { t } = usePhrasen();

      const tableRef = Vue.ref(null); // reference to your table element
      const tabulator = Vue.ref(null); // variable to hold your table

      const current_status_kurzbz = Vue.ref("");

      const dateFormatter = (cell) => {
        return cell.getValue()?.replace(/(.*)-(.*)-(.*)/, '$3.$2.$1');
      }
      
      const selectedData = Vue.ref([]);
      
      const redirect = (issue_id) => {
        console.log('issue_id', person_id);
        emit('issueSelected', person_id);
        // window.location.href = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/summary?person_id=${person_id}`;
      }   
      
      const fetchList = async () => {
        try {
          isFetching.value = true;
          const res = await Vue.$fhcapi.Deadline.all();
          fristen.value = res.data;		          	  
          isFetching.value = false;                        
        } catch (error) {const columnsDef = [
          { title: 'Ereignis', field: "ereignis_bezeichnung", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
          { title: 'MitarbeiterIn', field: "nachname", hozAlign: "left", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
          { title: 'Deadline', field: "datum", headerFilter:"list", headerFilterFunc:customHeaderFilter },
          { title: 'To Do', field: "bezeichnung", hozAlign: "right", width: 140, headerFilter:true, headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
          { title: 'Status', field: "status_bezeichnung", hozAlign: "center", formatter: dateFormatter, width: 140, sorter:"string", headerFilter:true, headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
        ];
  
        function customHeaderFilter(headerValue, rowValue, rowData, filterParams){
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
          console.log(error);
          isFetching.value = false;           
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

      const updateDeadlines = async () => {
        try {
          isFetching.value = true;
          const res = await Vue.$fhcapi.Deadline.updateFristenListe();
          isFetching.value = false;              
          fetchList();		            
          showRefreshToast();
        } catch (error) {
          console.log(error);
          isFetching.value = false;           
        }		
      }
  
      Vue.onMounted(async () => {
          fetchFristStatus();
          await fetchList();

          const maFormatter = (cell) => {

            const person_id = cell.getRow().getData().person_id;
            const uid = cell.getRow().getData().mitarbeiter_uid;
            const maName = cell.getRow().getData().ma_name;
            const protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	
            const url = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${person_id}/${uid}/summary`;

            return cell.getValue() != null ? `<a href="${url}">${maName}</a>` : '';
          }


          const rowFormatter = (row) => {
            let data = row.getData();
            let now = new Date(new Date().setHours(0, 0, 0, 0));
        
            if(data.status_kurzbz == "erledigt"){
                //row.getElement().childNodes[5].style.backgroundColor = "#0080004d"
                row.getElement().childNodes[5].style.color = "#198754"
            } else if (Date.parse(data.datum) <= now) {
                row.getElement().childNodes[5].style.color = "#871919"
                row.getElement().childNodes[5].style.fontWeight = "bold"
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
            { title: 'Ereignis', field: "ereignis_bezeichnung", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
            { title: 'MitarbeiterIn', field: "ma_name", formatter: maFormatter, hozAlign: "left", headerFilter:true, headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
            { title: 'Deadline', field: "datum", hozAlign: "center", headerFilter:true,formatter: dateFormatter, headerFilterFunc:customHeaderFilter },
            { title: 'To Do', field: "bezeichnung", hozAlign: "right", width: 140, headerFilter:true, headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
            { title: 'Status', field: "status_bezeichnung", hozAlign: "center", width: 140, sorter:"string", 
                headerFilter:"list",
                headerFilterParams: {valuesLookup:() => fristStatus.value.map((element) => ({label: element.bezeichnung, value: element.status_kurzbz })) },
            },
          ];    

          let tabulatorOptions = {
            maxHeight:"400px", 
            layout: "fitColumns",
            movableColumns: true,
            reactiveData: true,
            columns: columnsDef,
            data: fristen.value,
            footerElement: '<div>&sum; <span id="search_count"></span> / <span id="total_count"></span></div>',
            rowFormatter: rowFormatter,
          };
    
          tabulator.value = new Tabulator(
            tableRef.value,
            tabulatorOptions
          );
          tabulator.value.on("rowSelectionChanged", data => {
            selectedData.value = data;
          });
          tabulator.value.on("dataFiltered", (filters, data) => {
            var el = document.getElementById("search_count");
            el.innerHTML = data.length;
          });
          tabulator.value.on("dataLoaded", data => {
            var el = document.getElementById("total_count");
            el.innerHTML = data.length;
          })

          // Workaround to update tabulator
          Vue.watch(fristen, (newVal, oldVal) => {
              console.log('fristenList changed');
              tabulator.value?.setData(fristen.value);
          }, {deep: true})          
    
          function customHeaderFilter(headerValue, rowValue, rowData, filterParams){
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
      })

      const updateStatus = async () => {          
          let fristen = selectedData.value.map((element) => parseInt(element.frist_id))
          console.log('fristen', fristen) 
          try  {
            isFetching.value = true
            const res = await Vue.$fhcapi.Deadline.batchUpdateFristStatus(fristen, current_status_kurzbz.value);    
            fetchList();
            showToast();     
          } catch (error) {
              console.log(error);                
          } finally {
              isFetching.value = false;
          }     

      }

      const onPersonSelect = (uid, person_id) => {
        let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	
        window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${person_id}/${uid}/summary`;
      }

      const formatDate = (d) => {
        if (d != null && d != '') {
        return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
        } else {
            return ''
        }
      }

      // Toast 
      const updateStatusToastRef = Vue.ref()
      const refreshDeadlinesToastRef = Vue.ref()

      const showToast = () => {
        updateStatusToastRef.value.show()
      }

      const showRefreshToast = () => {
        refreshDeadlinesToastRef.value.show()
      }

      return { onPersonSelect, fristen, formatDate, updateDeadlines, tabulator, tableRef, isFetching, fristStatus, current_status_kurzbz, 
        updateStatus, updateStatusToastRef, refreshDeadlinesToastRef, t, selectedData }
    },
  template: `

    <div class="toast-container position-absolute z-3 top-0 end-0 pt-4 pe-2">
      <Toast ref="updateStatusToastRef">
          <template #body><h4>{{ t('fristenmanagement','fristStatusGespeichert') }}</h4></template>
      </Toast>
    </div>

    <div class="toast-container position-fixed top-0 end-0 pt-5 pe-2">
      <Toast ref="refreshDeadlinesToastRef">
          <template #body><h4>{{ t('fristenmanagement','fristenAktualisiert') }}</h4></template>
      </Toast>
    </div>

    <div id="master" class="d-flex flex-column  pt-4 pb-1 mb-1">
                        
      <div class="me-auto">
        <h4 class="h4">Termine & Fristen<span v-if="fristen != null  && fristen.length > 0"> ({{ fristen.length }})</span>           
        </h4>   
        
        
      </div>

      <div class="d-flex align-items-start flex-column">        
        <div class="d-grid d-sm-flex gap-2 mb-2 mt-4 flex-nowrap align-items-center">
          <button type="button" class="btn btn-sm btn-primary " @click="updateDeadlines"><i class="fas fa-sync"></i></button>
          <div style="flex-shrink: 0">Mit {{ selectedData.length }} ausgewählten: </div>
          <select  id="status_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="current_status_kurzbz" >
              <option value="">- Status -</option>
              <option v-for="(item, index) in fristStatus" :value="item.status_kurzbz" >
                  {{ item.bezeichnung }}
              </option>
          </select>
          <button type="button" class="btn btn-sm btn-primary me-2 text-nowrap" @click="updateStatus" :class="{'disabled':current_status_kurzbz==''}">
            <i class="fas fa-pencil"></i>
            setzen
          </button> 
        </div>
      </div>
  </div>

  <!-- TABULATOR -->
  <div v-show="fristen != null && fristen.length > 0" style="flex: 1; position: relative">
    <div ref="tableRef" class="filter-table-dataset"></div>

  </div>
  <div v-if="fristen != null && fristen.length == 0 && !isFetching" >0 Datensätze vorhanden.</div>
  
  `
}