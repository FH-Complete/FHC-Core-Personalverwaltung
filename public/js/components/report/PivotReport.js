const PivotReport = {
	name: 'PivotReport',
    components : {
      "p-datatable": primevue.datatable,
      "p-column": primevue.column,
    },
    props: {
      report: { type: String, required: true },
    },
    setup(props, context) {
        const { toRefs, ref } = Vue;
        let { report } = toRefs(props);
        const fromDate = ref();
        const toDate = ref();
        const isFetching = ref(false);
        const reportData = ref();

        const initDate = () => {
            const date = new Date();
            fromDate.value = date2String(new Date(date.getFullYear(), date.getMonth()-1, 1));
            toDate.value = date2String(new Date(date.getFullYear(), date.getMonth(), 0));
            console.log(fromDate, toDate);
        }

        const date2String = (d) => {          
          let month = (d.getMonth() + 1).toString().padStart(2, '0');
          let day = d.getDate().toString().padStart(2, '0');
          let year = d.getFullYear();
          return [year, month, day].join('-');
        }

        const fetchReport = async () => {
            try {
       
              let protocol_host =
                location.protocol + "//" +
                location.hostname + ":" +
                location.port;                 

              const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getReportData`;
        
              
              const param = [];              
              param.push({name: 'DatumVon', value: fromDate.value});
              param.push({name: 'DatumBis', value: toDate.value});

              const payload = {report: report.value, filter: param};

              isFetching.value = true  
              const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              })
              let response = await res.json()   
              reportData.value=response.retval; 
              isFetching.value = false                          
              return { response };
            } catch (error) {
              console.log(error)        
              isFetching.value = false        
            }	
        }

        const calculateTotal = (uid) => {
          let total = 0;

          if (reportData.value) {
              for (let employee of reportData.value) {
                  if (employee.uid === uid) {
                      total++;
                  }
              }
          }

          return total;
      };

        
        Vue.onMounted(() => {
            console.log('pivot report mounted');
            initDate();
            fetchReport();
        })

        return { fromDate, toDate, reportData, calculateTotal }

    },
    template: `
    <div class=" row">
      <h4>Home-Office</h4>
    </div>
    <div class="mb-3 row">
          <div class="col-md-2">
                <label for="fromDate" class="form-label">Von</label>
                <input type="date"   class="form-control"  id="fromDate" v-model="fromDate">
          </div>
          <div class="col-md-2">
                <label for="toDate" class="form-label">Bis</label>
                <input type="date"   class="form-control"  id="toDate" v-model="toDate">
          </div>
    </div>
    <div class="mb-3 row">

      <p-datatable :value="reportData" row-group-mode="subheader" group-rows-by="uid"
          sort-mode="single" sort-field="Nachname" :sort-order="1" scrollable scroll-height="flex">
          <p-column field="uid" header="UID"></p-column>
          <p-column field="Vorname" header="Vorname" style="min-width:200px"></p-column>          
          <p-column field="Nachname" header="Nachname" style="min-width:200px"></p-column>          
          <p-column field="Tag" header="Datum" style="min-width:200px"></p-column>
          <p-column field="Status Monatsliste" header="Status Monatsliste" style="min-width:200px">              
          </p-column>
          <template #groupheader="slotProps">
              <span class="image-text">{{slotProps.data.Nachname + ', ' + slotProps.data.Vorname}}</span>
          </template>
          <template #groupfooter="slotProps">
              <td style="min-width: 80%">
                  <div style="text-align: right; width: 100%">Summe</div>
              </td>
              <td style="width: 20%">{{calculateTotal(slotProps.data.uid)}}</td>
          </template>
      </p-datatable>
    </div>
    
    
    `
}