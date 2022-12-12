

export const EmployeeContract = {
    components: {	
		
	},
    props: {        
        writePermission: { type: Boolean, required: false },  // TODO needs change
    },
    setup( ) {

        const { watch, ref } = Vue;
        const route = VueRouter.useRoute();
        const dvList = ref([]);
        const vertragList = ref([]);
        const isFetching = ref(false);
        const currentDVID = ref(null);
        const currentVertragID = ref(null);
        const dvSelectedIndex = ref(1);
  
        const generateDVEndpointURL = (uid) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/dvByPerson?uid=${uid}`;
        };

        const generateVertragEndpointURL = (dv_id) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/vertragByDV?dv_id=${dv_id}`;
        };

        const fetchData = async (uid) => {
            if (uid==null) {
                dvList.value = [];
                vertragList.value = [];
                return;
            }
            let urlDV = generateDVEndpointURL(uid);
            isFetching.value = true
            try {
              const res = await fetch(urlDV);
              let response = await res.json();
              isFetching.value = false;
              console.log(response.retval);
              dvList.value = response.retval;
              if (dvList.value.length>0) {
                currentDVID.value = dvList.value[0].dienstverhaeltnis_id;
              }
            } catch (error) {
              console.log(error)
              isFetching.value = false
            }
        }

        const fetchVertrag = async (dv_id) => {
            let urlVertrag = generateVertragEndpointURL(dv_id);
            isFetching.value = true
            try {
              const res = await fetch(urlVertrag);
              let response = await res.json();
              isFetching.value = false;
              console.log(response.retval);
              vertragList.value = response.retval;
              if (vertragList.value.length>0) {
                currentVertragID.value = vertragList.value[0].vertragsbestandteil_id;
              }
            } catch (error) {
              console.log(error)
              isFetching.value = false
            }
        }


        
        fetchData(route.params.uid);
        watch(
              ()=> route.params.uid,
              (newVal) => {                    
                  fetchData(newVal);
              }
        )
        watch(
            currentDVID,
            (newVal) => {
                fetchVertrag(newVal);
            }
        )

        const dvSelectedHandler = (e) => {
            console.log("DV selected: ", e.target);
            dvSelectedIndex.value = e.target.selectedIndex+1;
        }

        const formatDate = (d) => {
            if (d != null && d != '') {
		        return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
            } else {
                return ''
            }
        }

        return { isFetching, dvList, vertragList, currentDVID, dvSelectedHandler, formatDate, dvSelectedIndex }
    },
    template: `
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid px-1">

            <div class="row">

                <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
                    <Toast ref="toastRef">
                        <template #body><h4>Vertrag gespeichert.</h4></template>
                    </Toast>
                </div>

                <div class="d-md-flex bd-highlight pt-1">            
                    <div class="flex-grow-1 bd-highlight">
                        <div class="d-grid gap-2 d-md-flex ">
                            <h4>Dienstverhältnis <span style="font-size:0.5em;font-style:italic" v-if="dvList?.length>0">({{ dvSelectedIndex }} von {{ dvList.length }})</span> </h4> 
                        </div>
                    </div>        
                    <div class="d-grid d-sm-flex gap-2 mb-2 align-middle flex-nowrap">        

                            <select class="form-select form-select-sm" v-model="currentDVID" @change="dvSelectedHandler" aria-label="DV auswählen">
                                    <option v-for="(item, index) in dvList" :value="item.dienstverhaeltnis_id"  :key="item.dienstverhaeltnis_id">
                                        {{ formatDate(item.von) }} - {{ formatDate(item.bis) }}
                                    </option> 
                            </select> 

                            <button v-if="readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()">
                                <i class="fa fa-plus"></i>
                            </button>
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()"><i class="fa fa-plus"></i></button>
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="save()"><i class="fa fa-minus"></i></button>
                    </div>
                </div>

            </div>
            
            
            <div class="row">

                <div class="col-lg-12">        
                
                    <!--div class="table-responsive">
                        <table class="table table-bordered table-hover table-striped tablesorter">
                            <thead>
                            <tr>
                                <th>Von <i class="fa fa-sort"></i></th>
                                <th>Bis <i class="fa fa-sort"></i></th>
                                <th>Änderungsdatum <i class="fa fa-sort"></i></th>
                                <th>Art <i class="fa fa-sort"></i></th>
                                <th>Stunden <i class="fa fa-sort"></i></th>
                                <th>Betrag <i class="fa fa-sort"></i></th>
                                <th>Ist <i class="fa fa-sort"></i></th>
                            </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1.2.2020</td>
                                    <td></td>
                                    <td>5.3.2021</td>
                                    <td>unbefristet</td>
                                    <td>38,5</td>
                                    <td>2345,67</td>
                                    <td>2445,00</td>
                                </tr>
                                <tr>
                                    <td>1.2.2021</td>
                                    <td></td>
                                    <td>5.3.2021</td>
                                    <td>Sideletter</td>
                                    <td>38,5</td>
                                    <td>2545,67</td>
                                    <td>2545,67</td>
                                </tr>
                                <tr>
                                    <td>31.1.2019</td>
                                    <td>31.1.2020</td>
                                    <td>5.3.2021</td>
                                    <td>befristet</td>
                                    <td>38,5</td>
                                    <td>2345,67</td>
                                    <td>2345,67</td>
                                </tr>									
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>

                            </tbody>
                        </table>
                    </div-->  <!-- table -->

                    <div class="accordion" id="accordionExample">
                        <div v-for="(item, index) in vertragList" class="accordion-item" :key="item.vertragsbestandteil_id">
                            <h2 class="accordion-header" :id="'heading'+index">
                            <button class="accordion-button" :class="{ 'collapsed': index !== 0 }" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index" aria-expanded="true" :aria-controls="'collapse' + index">
                                {{ formatDate(item.von) }} - {{ formatDate(item.bis) }} | {{ item.stundenausmass }}h
                            </button>
                            </h2>
                            <div :id="'collapse' + index" class="accordion-collapse collapse" :aria-labelledby="'heading' + index" data-bs-parent="#accordionExample" :class="{ 'show': index === 0 }">
                            <div class="accordion-body">
                                <!-- -->    
                                <div class="row pt-md-4">

                                    <div class="col">
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="mb-0">Details</h5>
                                            </div>
                                            <div class="card-body" style="text-align:center">
                                                    <table class="table table-bordered">
                                                    <tbody>
                                                        <tr><th scope="row">Zeitraum: </th><td>{{ formatDate(item.von) }} - {{ formatDate(item.bis) }}</td></tr>
                                                        <tr><th scope="row">Lektor:</th><td>{{ item.lektor }}</td></tr>
                                                        <tr><th scope="row">Art</th><td>{{ item.vertragsart_kurzbz }}</td></tr>
                                                        <tr v-for="(salaryItem, salaryIndex) in item.gehaltsbestandteile" :key="salaryItem.gehaltsbestandteil_id">
                                                            <th scope="row">{{ salaryItem.gehaltstyp_bezeichnung }}:</th><td>€ {{ new Intl.NumberFormat().format(parseFloat(salaryItem.betrag_valorisiert)) }}</td>
                                                        </tr>
                                                        <tr><th scope="row">Funktion:</th><td></td></tr>
                                                    </tbody>
                                                    </table>
                                            </div>
                                        </div>

                                    </div>          

                                    <div class="col">
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="mb-0">Notizen</h5>
                                            </div>
                                            <div class="card-body" style="text-align:center">
                                                ...
                                            </div>
                                        </div>

                                        <br/>
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="mb-0">Dokumente</h5>
                                            </div>
                                            <div class="card-body" style="text-align:center">
                                                    ...
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col">
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="mb-0">Gehalt</h5>
                                            </div>
                                            <div class="card-body" style="text-align:center">
                                                ...
                                            </div>
                                        </div>

                                        
                                    </div>

                                </div>

                                <!-- -->
                            </div>
                            </div>
                        </div>
                        
                    </div>

                    
                </div> <!-- --> 

            </div>
        </div>

    </div>




    `
}