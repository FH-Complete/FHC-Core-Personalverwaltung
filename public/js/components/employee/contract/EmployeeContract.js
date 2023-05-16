import vbform_wrapper from './vbform/vbform_wrapper.js';


export const EmployeeContract = {
    components: {	
        'vbform_wrapper': vbform_wrapper,
       
	},
    props: {        
        writePermission: { type: Boolean, required: false },  // TODO needs change
    },
    setup( ) {

        const { watch, ref, reactive } = Vue;
        const route = VueRouter.useRoute();
        const dvList = ref([]);
        const vertragList = ref([]);
        const gbtList = ref([]);
        const isFetching = ref(false);
        const currentDVID = ref(null);
        const currentDV = ref(null);
        const currentVertragID = ref(null);
        const dvSelectedIndex = ref(1);        
        const currentVBS = reactive({
            funktion: {
                zuordnung: [], 
                taetigkeit: []
            },
            zeitaufzeichnung: [],
            kuendigungsfrist: [],
            stunden: [],
            allIn: [],
            befristung: [],
            urlaubsanspruch: [],
            zusatzvereinbarung: [],
        });
        //const dienstverhaeltnisDialogRef = ref();
        const VbformWrapperRef = ref();
        const vbformmode = ref('neuanlage');
        const vbformDVid = ref(null);
        const numberFormat = new Intl.NumberFormat();
        
        const currentDate = ref();
  
        const generateDVEndpointURL = (uid) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/dvByPerson?uid=${uid}`;
        };

        const generateVertragEndpointURL = (dv_id) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/vertragByDV?dv_id=${dv_id}`;
        };

        const generateGBTEndpointURL = (dv_id) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/gbtByDV?dv_id=${dv_id}`;
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
              //if (vertragList.value.length>0) {
                //currentVertragID.value = vertragList.value[0].vertragsbestandteil_id;
                getCurrentVertragsbestandteil();
              //}
            } catch (error) {
              console.log(error)
              isFetching.value = false
            }
        }

        // Gehaltsbestandteile
        const fetchGBT = async (dv_id) => {
            let urlGBT = generateGBTEndpointURL(dv_id);
            isFetching.value = true
            try {
              const res = await fetch(urlGBT);
              let response = await res.json();
              isFetching.value = false;
              gbtList.value = response;
              
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
                fetchGBT(newVal);
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
/*
        const createDVDialog = async () => {
            const result = await dienstverhaeltnisDialogRef.value.showModal(route.params.uid);

            if (result) {
                console.log(result);
            } else {
                console.log("Dialog cancelled");
            }
        }
*/
        const createDVDialog = () => {
            vbformmode.value = 'neuanlage';
            vbformDVid.value = null;
            VbformWrapperRef.value.showModal();
        }

        const updateDVDialog = () => {
            vbformmode.value = 'aenderung';
            vbformDVid.value = currentDVID.value;
            VbformWrapperRef.value.showModal();
        }

        const handleDvSaved = async () => {
            fetchData(route.params.uid);            
        }

        const formatNumber = (num) => {
            return numberFormat.format(parseFloat(num));
        }

        const getCurrentVertragsbestandteil = () => {
            let zuordnung = [];
            let taetigkeit = [];
            let zeitaufzeichnung = [];
            let kuendigungsfrist = [];
            let stunden = [];
            let allIn = [];
            let befristung = [];
            let urlaubsanspruch = [];
            let zusatzvereinbarung = [];
            vertragList.value.forEach(vbs => {
                if (vbs.vertragsbestandteiltyp_kurzbz == 'funktion') {
                    if (vbs.benutzerfunktiondata.funktion_kurzbz.match(/.*zuordnung/)) {
                        zuordnung.push(vbs.benutzerfunktiondata);
                    } else {
                        taetigkeit.push(vbs.benutzerfunktiondata);
                    }
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'freitext') {
                    if (vbs.freitexttyp_kurzbz == 'allin') {
                        allIn.push(vbs);
                    } else if (vbs.freitexttyp_kurzbz == 'befristung') {
                        befristung.push(vbs);
                    } else  {
                        zusatzvereinbarung.push(vbs);                        
                    }
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'kuendigungsfrist') {
                    kuendigungsfrist.push(vbs);
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'stunden') {
                    stunden.push(vbs);  
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'urlaubsanspruch') {
                    urlaubsanspruch.push(vbs);                   
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'zeitaufzeichnung') {
                    zeitaufzeichnung.push(vbs);
                }
            });
            currentVBS.funktion.zuordnung = zuordnung;
            currentVBS.funktion.taetigkeit = taetigkeit;
            currentVBS.zeitaufzeichnung = zeitaufzeichnung;
            currentVBS.stunden = stunden;
            currentVBS.kuendigungsfrist = kuendigungsfrist;
            currentVBS.allIn = allIn;
            currentVBS.befristung = befristung;
            currentVBS.zusatzvereinbarung = zusatzvereinbarung;
            currentVBS.urlaubsanspruch = urlaubsanspruch;
           

        }

        return { isFetching, dvList, vertragList, gbtList, currentDV, currentDVID, dvSelectedHandler, 
            //dienstverhaeltnisDialogRef,
            VbformWrapperRef, route, vbformmode, vbformDVid, formatNumber,
            currentVBS,
            createDVDialog, updateDVDialog, handleDvSaved, formatDate, dvSelectedIndex, currentDate, chartOptions }
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
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="updateDVDialog()"><i class="fa fa-pen"></i></button>
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="save()"><i class="fa fa-minus"></i></button>
                    </div>
                </div>

            </div>
            
            
            <div class="col-lg-12">

                <div class="row pt-md-4">

                    <div class="col">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Allgemein</h5>
                            </div>
                            <div class="card-body" style="text-align:left">

                                <form  ref="baseDataFrm" class="row g-3" v-if="currentDV != null">


                                    <!-- Allgemein -->
    
                                    <div class="col-md-4">
                                        <label for="organisation" class="col-sm-6 form-label">Organisation</label>
                                        <input type="text" readonly class="form-control-sm" class="form-control-plaintext" :value="currentDV.oe_bezeichnung" >
                                    </div>

                                    <div class="col-md-4">
                                        <label for="dvArt" class="col-sm-6 form-label">Vertragsart</label>
                                        <div class="col-sm-12">
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvArt" :value="currentDV.vertragsart_kurzbz">
                                        </div>
                                    </div>

                                    <div class="col-md-4"></div>
                                    
                                    <!-- von bis -->
                                    <div class="col-md-4">
                                        <label for="zeitraum_von" class="form-label" >Von</label>
                                        <input type="text" readonly class="form-control-sm" class="form-control-plaintext" :value="formatDate(currentDV.von)" >
                                    </div>

                                    <div class="col-md-4">
                                        <label for="zeitraum_bis" class="form-label" >Bis</label>
                                        <input type="text" readonly class="form-control-sm" class="form-control-plaintext" :value="formatDate(currentDV.bis)" >
                                    </div>

                                    <div class="col-md-4">
                                    <!--
                                        <label  class="form-label" >Befristet</label>
                                        <div class="col-sm-8">
                                            <input class="form-check-input mt-2" type="checkbox" id="befristetCheck" disabled >                                            
                                        </div>
                                    -->
                                    </div>

                                    <!-- Befristung -->
                                    <div class="col-md-12"  v-if="currentVBS.befristung.length > 0"><h5 style="margin: 0.9rem 0 0 0;">Befristung</h5></div>

                                    <template v-for="(item, index) in currentVBS.befristung"  >
                                        
                                        <div class="col-md-4">
                                            <label for="befristet_von" class="form-label" >Von</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext" :value="formatDate(item.von)" >
                                        </div>

                                        <div class="col-md-4">
                                            <label for="befristet_bis" class="form-label" >Bis</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext" :value="formatDate(item.bis)" >
                                        </div>

                                        <div class="col-md-4">
                                            <label for="befristetCheck" class="form-label" >Befristet</label>
                                            <div class="col-sm-8">
                                                <input class="form-check-input mt-2" type="checkbox" id="befristetCheck" checked disabled>
                                            </div>
                                        </div>
                                    </template>

                                    <!--div class="col-md-3"></div-->

                                    <!-- Kündigungsfrist -->
                                    <div class="col-md-12" v-if="currentVBS.kuendigungsfrist.length >0"><h5 style="margin: 0.9rem 0 0 0;" >Kündigungsfrist</h5></div>

                                    <template v-for="(item, index) in currentVBS.kuendigungsfrist"  >

                                        <div class="col-md-4">
                                            <label for="dvKuendigungsfristAG" class="form-label">Kündigungsfrist AG</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvKuendigungsfristAG" :value="item.arbeitgeber_frist">
                                        </div>
                                        

                                        <div class="col-md-4">
                                            <label for="dvKuendigungsfristAN" class="form-label">Kündigungsfrist AN</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvKuendigungsfristAN" :value="item.arbeitnehmer_frist">
                                        </div>

                                        <div class="col-md-4"></div>

                                    </template>


                                    <!-- Arbeitszeit -->
                                    <div class="col-md-12"><h5 style="margin: 0.9rem 0 0 0;">Arbeitszeit</h5></div>

                                    <template v-for="(item, index) in currentVBS.stunden"  >
                                        <div class="col-md-4">

                                            <label for="dvStunden" class="form-label">Wochenstunden</label>
                                            <div class="col-sm-12">
                                                <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvStunden"  :value="formatNumber(item.wochenstunden)">
                                            </div>
                                            <div class="col-sm-1">

                                            </div>
                                        </div>

                                        <div class="col-md-4">
                                            <label for="dvTeilzeittyp" class="form-label">Teilzeittyp</label>
                                            <div class="col-sm-12">
                                                <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvTeilzeittyp">
                                            </div>                                        
                                        </div>

                                        <div class="col-md-4">
                                            <template v-for="(item, index) in currentVBS.allIn"  >
                                                <label  class="form-label" >AllIn</label>
                                                <div class="col-sm-8">
                                                    <input class="form-check-input mt-2" type="checkbox" id="allInCheck" checked disabled>
                                                </div>
                                            </template>
                                        </div>

                                    </template>

                                    
                                    <!--div class="col-md-3"></div-->

                                    

                                    <!-- Zeitaufzeichnung -->
                                    <div class="col-md-4">

                                        <template v-for="(item, index) in currentVBS.zeitaufzeichnung"  >
                                            <label for="zapflichtigCheck" class="form-label" >Zeitaufzeichnung</label>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="zapflichtigCheck" :checked="item.zeitaufzeichnung" disabled> 
                                                <label class="form-check-label" >Zeitaufzeichnungspflichtig</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="azgCheck" :checked="item.azgrelevant" disabled> 
                                                <label class="form-check-label" >AZG relevant</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="homeofficeCheck" :checked="item.homeoffice" disabled>
                                                <label class="form-check-label" >Homeoffice</label>
                                            </div>
                                        </template>
                                    </div>
                                    <div class="col-md-3">
                                        <template v-for="(item, index) in currentVBS.urlaubsanspruch"  >
                                            <label for="dvUrlaubsanspruch" class="form-label">Urlaubsanspruch</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvUrlaubsanspruch" :value="item.urlaubsanspruch">
                                        </template>
                                    </div>

                                    <div class="col-md-5"></div>

                                    <!-- div class="row mb-1">
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
                                    </div -->

                                    <!-- div class="row mb-1">
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
                                    </div-->
                                

                                </form>

                            </div>   <!-- card body -->
                        </div>  <!-- card -->
                        <br/>

                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Bruttomonatsgehalt</h5>
                            </div>
                            <div class="card-body" style="text-align:left">

                                <form  class="row g-3" v-if="currentDV != null">
    
                                    <template v-for="(item, index) in gbtList"  >

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Grund (TBD)</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext"  >
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Gehaltstyp</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext"  :value="item.gehaltstyp_bezeichnung">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Betrag</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext"  :value="formatNumber(item.grund_betrag_decrypted)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Betrag val.</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext"  :value="formatNumber(item.betrag_val_decrypted)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Valorisierung</label>
                                            <div class="col-sm-8">
                                                <input class="form-check-input" type="checkbox" :checked="item.valorisierung" disabled>
                                            </div>
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Anmerkung</label>
                                            
                                        </div>

                                    </template>

                                </form>

                            </div>
                        </div>
                        <br/>

                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Sonstige Vereinbarung</h5>
                            </div>
                            <div class="card-body" style="text-align:left">
                                <form  class="row g-3" v-if="currentDV != null">
        
                                    <template v-for="(item, index) in currentVBS.zusatzvereinbarung"  >

                                        <div class="col-md-3">
                                            <label class="form-label" >Freitexttyp</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext" :value="item.titel" >
                                        </div>

                                        <div class="col-md-3">
                                            <label  class="form-label" >Von</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext"  :value="formatDate(item.von)">
                                        </div>

                                        <div class="col-md-3">
                                            <label class="form-label" >Bis</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext"  :value="formatDate(item.bis)">
                                        </div>

                                        <div class="col-md-3">
                                            
                                        </div>

                                        <div class="col-md-9">
                                            <label class="form-label" >Text</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext"  :value="item.anmerkung">
                                        </div>

                                    </template>

                                    <div class="col-md-3">
                                        
                                    </div>

                                </form>

                            </div>
                        </div>
                        <br/>

                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Karenz</h5>
                            </div>
                            <div class="card-body" style="text-align:center">
                            </div>
                        </div>
                        <br/>

                    </div>  <!-- col -->

                    <div class="col">


                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Zuordnung</h5>
                            </div>
                            <div class="card-body" style="text-align:left">

                                <form  class="row g-3" v-if="currentDV != null">
 
                                    <template v-for="(item, index) in currentVBS.funktion.zuordnung"  >

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0" >Zuordnung</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext" :value="item.funktion_bezeichnung" >
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0">Abteilung</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext"  :value="item.oe_bezeichnung">
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0">SAP Kostenstelle</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext" v-if="item.funktion_kurzbz == 'kstzuordnung'" :value="item.oe_kurzbz_sap">
                                        </div>

                                    </template>

                                    <!-- taetigkeit -->
                                    <div class="col-md-12"><h5 style="margin: 0.9rem 0 0 0;">Tätigkeit</h5></div>
                                    <template v-for="(item, index) in currentVBS.funktion.taetigkeit"  >

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0" >Zuordnung</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext" :value="item.funktion_bezeichnung" >
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0">Abteilung</label>
                                            <input type="text" readonly class="form-control-sm" class="form-control-plaintext"  :value="item.oe_bezeichnung">
                                        </div>

                                        <div class="col-md-4">                                            
                                        </div>


                                    </template>
                                

                                </form>





                            </div>
                        </div>
                        <br/>

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

                                <!--table class="table">
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
                                </table-->
                            </div>
                        </div>

                        <br>
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Dokumente</h5>
                            </div>
                            <div class="card-body" style="text-align:center">
                                <!--table class="table">
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
                                </table-->
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

                <!--div class="col-lg-12">     
                

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

                    
                </div--> <!-- --> 
                <br/>

                

            </div>
        </div>

    </div>

    <!--DVDialog ref="dienstverhaeltnisDialogRef" id="dvDialog"></DVDialog-->
    <vbform_wrapper 
        id="vbFormWrapper" 
        ref="VbformWrapperRef" 
        :title="'Dienstverhältnis'" 
        :mode="vbformmode" 
        :dvid="vbformDVid"
        :mitarbeiter_uid="route.params.uid"
        @dvsaved="handleDvSaved">
    </vbform_wrapper>



    `
}