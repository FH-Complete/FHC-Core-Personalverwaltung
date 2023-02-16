import {DVDialog} from './DVDialog.js';


export const EmployeeContract = {
    components: {	
		DVDialog,
       
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
        const currentDV = ref(null);
        const currentVertragID = ref(null);
        const dvSelectedIndex = ref(1);
        const currentWS = ref(null);
        const dienstverhaeltnisDialogRef = ref();
        const currentDate = ref();
  
        const generateDVEndpointURL = (uid) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/dvByPerson?uid=${uid}`;
        };

        const generateVertragEndpointURL = (dv_id) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/vertragByDV?dv_id=${dv_id}`;
        };

        const chartOptions = {

              chart: {
                type: 'line'
              },
              title: {
                text: 'Gehalt'
              },
              series: [{
                data: [4711, 4823, 4931, 5060, 5200, 5270, 5390],
                color: '#6fcd98'
              }]
            
        }
        

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
              dvList.value = response.retval;
              if (dvList.value.length>0) {
                currentDVID.value = dvList.value[0].dienstverhaeltnis_id;
                currentDV.value = dvList.value[0];
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
              vertragList.value = response;
              if (vertragList.value.length>0) {
                currentVertragID.value = vertragList.value[0].vertragsbestandteil_id;
                getCurrentVertragsbestandteil();
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
            currentDV.value = dvList.value[e.target.selectedIndex];
            currentDVID.value = currentDV.value.dienstverhaeltnis_id;
        }

        const formatDate = (d) => {
            if (d != null && d != '') {
		        return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
            } else {
                return ''
            }
        }

        const filterVertragsbestandteil = (vertragsbestandteile, kurzbz) => {
            let ws = vertragsbestandteile.filter(value => value.vertragsbestandteiltyp_kurzbz==kurzbz);
            return ws;
        }

        const createDVDialog = async () => {
            const result = await dienstverhaeltnisDialogRef.value.showModal(route.params.uid);

            if (result) {
                console.log(result);
            } else {
                console.log("Dialog cancelled");
            }
        }

        const getCurrentVertragsbestandteil = () => {
            let ws = filterVertragsbestandteil(vertragList.value, 'stunden');
            currentWS.value = ws[0].wochenstunden;
        }

        return { isFetching, dvList, vertragList, currentDV, currentDVID, currentWS, dvSelectedHandler, 
            dienstverhaeltnisDialogRef, createDVDialog, formatDate, dvSelectedIndex, currentDate, chartOptions }
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
                            <h4>Dienstverhältnis <span style="font-size:0.5em;font-style:italic" v-if="dvList?.length>0">({{ dvSelectedIndex }} von {{ dvList.length }})  id={{currentDVID}}</span></h4> 
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
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="createDVDialog()"><i class="fa fa-plus"></i></button>
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click=""><i class="fa fa-pen"></i></button>
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="save()"><i class="fa fa-minus"></i></button>
                    </div>
                </div>

            </div>
            
            
            <div class="col-lg-12">

                <div class="row pt-md-4">

                    <div class="col">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Details</h5>
                            </div>
                            <div class="card-body" style="text-align:left">

                                <form  ref="baseDataFrm" v-if="currentDV != null">

                                    <div class="row mb-1">
                                        <label for="zeitraum" class="col-sm-3 col-form-label">Zeitraum</label>
                                        <div class="col-sm-8">
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  id="dvZeitraum" :value="formatDate(currentDV.von) + '-' + formatDate(currentDV.bis)">
                                        </div>
                                        <div class="col-sm-1">
                                            <button type="button" class="btn btn-sm btn-outline-secondary">
                                                <i class="fa fa-pen"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="row mb-1">
                                        <label for="dvArt" class="col-sm-3 col-form-label">Art</label>
                                        <div class="col-sm-8">
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvArt" :value="currentDV.vertragsart_kurzbz">
                                        </div>
                                    </div>

                                    <div class="row mb-1">
                                        <label for="art" class="col-sm-3 col-form-label">Befristet</label>
                                        <div class="col-sm-8">
                                            <input class="form-check-input mt-2" type="checkbox" id="befristetCheck">
                                        </div>
                                        <div class="col-sm-1">
                                            <button type="button" class="btn btn-sm btn-outline-secondary">
                                                <i class="fa fa-pen"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="row mb-1">
                                        <label for="dvStunden" class="col-sm-3 col-form-label">Stunden</label>
                                        <div class="col-sm-8">
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvStunden"  :value="currentWS">
                                        </div>
                                        <div class="col-sm-1">
                                            <button type="button" class="btn btn-sm btn-outline-secondary">
                                                <i class="fa fa-pen"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="row mb-1">
                                        <label for="dvLehre" class="col-sm-3 col-form-label">Lehre</label>
                                        <div class="col-sm-8">
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvLehre">
                                        </div>
                                        <div class="col-sm-1">
                                            <button type="button" class="btn btn-sm btn-outline-secondary">
                                                <i class="fa fa-pen"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="row mb-1">
                                        <label for="dvKuendigungsfrist" class="col-sm-3 col-form-label">Kündigungsfrist</label>
                                        <div class="col-sm-8">
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvKuendigungsfrist">
                                        </div>
                                        <div class="col-sm-1">
                                            <button type="button" class="btn btn-sm btn-outline-secondary">
                                                <i class="fa fa-pen"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="row mb-1">
                                        <label for="dvUrlaubsanspruch" class="col-sm-3 col-form-label">Urlaubsanspruch</label>
                                        <div class="col-sm-8">
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvUrlaubsanspruch">
                                        </div>
                                        <div class="col-sm-1">
                                            <button type="button" class="btn btn-sm btn-outline-secondary">
                                                <i class="fa fa-pen"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="row mb-1">
                                        <label for="dvFunktion" class="col-sm-3 col-form-label">Funktion</label>
                                        <div class="col-sm-8">
                                            
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Zeitraum</th>
                                                    <th scope="col">Typ</th>
                                                    <th scope="col">Zuordnung</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <th scope="row">1.12.2015-</th>
                                                    <td>Disziplinär</td>
                                                    <td>Virtual Technologies & Sensor Systems</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">1.12.2015-</th>
                                                    <td>Fachlich</td>
                                                    <td>Virtual Technologies & Sensor Systems</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">1.12.2015-</th>
                                                    <td>Std.Kst.</td>
                                                    <td>Virtual Technologies & Sensor Systems</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">1.12.2015-</th>
                                                    <td>OE-Zuordnung</td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">1.12.2015-</th>
                                                    <td>LektorIn</td>
                                                    <td></td>
                                                </tr>
                                                
                                            </tbody>
                                        </table>


                                        </div>
                                        <div class="col-sm-1">
                                            <button type="button" class="btn btn-sm btn-outline-secondary">
                                                <i class="fa fa-pen"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="row mb-1">
                                        <label for="dvFreitext" class="col-sm-3 col-form-label">Freitext</label>
                                        <div class="col-sm-8">
                                            <b>1.2.2015-</b><br>
                                            <textarea type="text" readonly rows="5"
                                                class="form-control-sm form-control-plaintext" id="dvFreitext"
                                                >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
                                            </textarea>

                                            <b>1.2.2015-</b><br>
                                            <textarea type="text" readonly rows="5"
                                                class="form-control-sm form-control-plaintext" id="dvFreitext"
                                                >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
                                            </textarea>
                                        </div>
                                        
                                        <div class="col-sm-1">
                                            <button type="button" class="btn btn-sm btn-outline-secondary">
                                                <i class="fa fa-pen"></i>
                                            </button>
                                        </div>
                                    </div>
                                

                                </form>

                            </div>   <!-- card body -->
                        </div>  <!-- card -->
                    </div>  <!-- col -->

                    <div class="col">

                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Gehalt</h5>
                            </div>
                            <div class="card-body" style="text-align:center">

                                <div style="width:100%;height:100%;overflow:auto">
                                    <figure>
                                        <highcharts class="chart" :options="chartOptions"></highcharts>
                                    </figure>
                                </div>

                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Zeitraum</th>
                                            <th scope="col">Typ</th>
                                            <th scope="col">Betrag</th>
                                            <th scope="cols"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">1.12.2015-</th>
                                            <td>Grundgehalt</td>
                                            <td>€ 4711,00</td>
                                            <td><button type="button" class="btn btn-sm btn-outline-secondary">
                                                    <i class="fa fa-pen"></i>
                                                </button>
                                            </td>
                                        </tr>                                        
                                        
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <br>
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Dokumente</h5>
                            </div>
                            <div class="card-body" style="text-align:center">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Zeitraum</th>
                                            <th scope="col">Bezeichnung</th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">1.12.2015-</th>
                                            <td>Vertrag</td>
                                            <td><button type="button" class="btn btn-sm btn-outline-secondary">
                                                    <i class="fa fa-pen"></i>
                                                </button>
                                            </td>
                                        </tr>                                        
                                        
                                    </tbody>
                                </table>
                            </div>
                        </div>
                       

                        <br/>
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Notizen</h5>
                            </div>
                            <div class="card-body" style="text-align:center">
                                    ...
                            </div>
                        </div>     
                    </div>  <!-- col -->

                    
                </div>  <!-- row -->

                <div class="col-lg-12">     
                

                    <br>
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover table-striped tablesorter">
                            <thead>
                            <tr>
                                <th>Von <i class="fa fa-sort"></i></th>
                                <th>Bis <i class="fa fa-sort"></i></th>
                                <th>Art <i class="fa fa-sort"></i></th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1.12.2015</td>
                                    <td></td>
                                    <td>Gehalt/Stunden</td>
                                    <td>4711,00/38,5h</td>
                                </tr>
                                <tr>
                                    <td>1.12.2015</td>
                                    <td></td>
                                    <td>Funktion</td>
                                    <td>Disziplinär/Virtual Technologies & Sensor Systems</td>
                                </tr>
                                <tr>
                                    <td>1.12.2015</td>
                                    <td></td>
                                    <td>Funktion</td>
                                    <td>Fachlich/Virtual Technologies & Sensor Systems</td>
                                </tr>
                                <tr>
                                    <td>1.12.2015</td>
                                    <td></td>
                                    <td>Standardkostenstelle</td>
                                    <td>Disziplinär/Virtual Technologies & Sensor Systems</td>
                                </tr>
                                <tr>
                                    <td>1.12.2015</td>
                                    <td></td>
                                    <td>LektorIn</td>
                                    <td></td>
                                </tr>
                               

                            </tbody>
                        </table>
                    </div >  

                    <!-- div class="accordion" id="accordionExample">
                        <div v-for="(item, index) in vertragList" class="accordion-item" :key="item.vertragsbestandteil_id">
                            <h2 class="accordion-header" :id="'heading'+index">
                            <button class="accordion-button" :class="{ 'collapsed': index !== 0 }" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index" aria-expanded="true" :aria-controls="'collapse' + index">
                                {{ formatDate(item.von) }} - {{ formatDate(item.bis) }} | {{ item.stundenausmass }}h
                            </button>
                            </h2>
                            <div :id="'collapse' + index" class="accordion-collapse collapse" :aria-labelledby="'heading' + index" data-bs-parent="#accordionExample" :class="{ 'show': index === 0 }">
                            <div class="accordion-body">
                                
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

                               
                            </div>
                            </div>
                        </div>
                        
                    </div -->

                    
                </div> <!-- --> 

            </div>
        </div>

    </div>

    <DVDialog ref="dienstverhaeltnisDialogRef" id="dvDialog"></DVDialog>



    `
}