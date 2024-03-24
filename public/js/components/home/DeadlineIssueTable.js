
const DeadlineIssueTable = {    
  components: {

  },
  props: {
  },
  setup(props, { emit }){

      const isFetching = Vue.ref(false);
      const fristen = Vue.ref([]);

      const tableRef = Vue.ref(null); // reference to your table element
      const tabulator = Vue.ref(null); // variable to hold your table

      const dateFormatter = (cell) => {
        return cell.getValue()?.replace(/(.*)-(.*)-(.*)/, '$3.$2.$1');
      }
      

      

      
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
  
  
        let tabulatorOptions = {
          height: "100%",
          layout: "fitColumns",
          movableColumns: true,
          reactiveData: true,
          columns: columnsDef,
          data: fristen.value,
        };
  
        tabulator.value = new Tabulator(
          tableRef.value,
          tabulatorOptions
        );
  
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
  
      Vue.onMounted(async () => {
          await fetchList();

          const maFormatter = (cell) => {

            const person_id = cell.getRow().getData().person_id;
            const uid = cell.getRow().getData().mitarbeiter_uid;
            const maName = cell.getRow().getData().ma_name;
            const protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	
            const url = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${person_id}/${uid}/summary`;

            return cell.getValue() != null ? `<a href="${url}">${maName}</a>` : '';
          }

          const columnsDef = [
            { title: 'Ereignis', field: "ereignis_bezeichnung", sorter:"string", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
            { title: 'MitarbeiterIn', field: "ma_name", formatter: maFormatter, hozAlign: "left", headerFilter:true, headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
            { title: 'Deadline', field: "datum", headerFilter:"list",formatter: dateFormatter, headerFilterFunc:customHeaderFilter },
            { title: 'To Do', field: "bezeichnung", hozAlign: "right", width: 140, headerFilter:true, headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
            { title: 'Status', field: "status_bezeichnung", hozAlign: "center", formatter: dateFormatter, width: 140, sorter:"string", headerFilter:true, headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
          ];    
    
          let tabulatorOptions = {
            height: "100%",
            layout: "fitColumns",
            movableColumns: true,
            reactiveData: true,
            columns: columnsDef,
            data: fristen.value,
          };
    
          tabulator.value = new Tabulator(
            tableRef.value,
            tabulatorOptions
          );
    
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

      return { onPersonSelect, fristen, formatDate, updateDeadlines, tabulator, tableRef, isFetching }
    },
  template: `
    <div id="master" class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-5 pb-2 mb-3">
                        
      <div class="flex-fill align-self-center">
        <h1 class="h2">Termine & Fristen 1<span v-if="fristen != null  && fristen.length > 0">({{ fristen.length }})</span> 
          <button type="button" class="btn btn-sm btn-outline btn-outline-secondary  ms-2" @click="updateDeadlines"><i class="fas fa-sync"></i></button>
        </h1>       
      </div>
  </div>

  <!-- TABULATOR -->
  <div v-if="fristen != null && fristen.length > 0">
    <div ref="tableRef" class="fhc-tabulator"></div>
  </div>
  <div v-else-if="!isFetching">0 Datensätze vorhanden.</div>
  
  `
}