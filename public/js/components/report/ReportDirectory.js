const PivotReport = {
	name: 'ReportDirectory',
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

       


        
        Vue.onMounted(() => {
            console.log('report directory mounted');
        })

        return {  }

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