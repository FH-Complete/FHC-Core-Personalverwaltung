import vbform_wrapper from './vbform/vbform_wrapper.js';
import enddvmodal from './vbform/enddvmodal.js';
import { DropDownButton } from '../../DropDownButton.js';
import { ModalDialog } from '../../ModalDialog.js';

export const EmployeeContract = {
    components: {
        'vbform_wrapper': vbform_wrapper,
        'enddvmodal': enddvmodal,
        'DropDownButton': DropDownButton,
        "p-skeleton": primevue.skeleton,
        "datepicker": VueDatePicker,
        ModalDialog,
    },
    props: {
        writePermission: { type: Boolean, required: false },  // TODO needs change
    },
    setup() {

        const { watch, ref, reactive, computed } = Vue;
        const route = VueRouter.useRoute();
        const dvList = ref([]);
        const vertragList = ref([]);
        const gbtList = ref([]);
        const gbtChartData = ref([]);
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
        const vbformDV = ref(null);
        
        const enddvmodalRef = ref();
        const endDV = ref(null);
        
        const numberFormat = new Intl.NumberFormat();
        const now = ref(new Date());

        const currentDate = ref(now.value);
        const confirmDeleteDVRef = ref();

        const convert2UnixTS = (ds) => {
            let d = new Date(ds);
            return Math.round(d.getTime() / 1000)
        }

        const generateDVEndpointURL = (uid) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/dvByPerson?uid=${uid}`;
        };

        const generateDVDeleteEndpointURL = (dv_id) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/deleteDV?dv_id=${dv_id}`;
        };

        const generateVertragEndpointURL = (dv_id, date) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/vertragByDV?dv_id=${dv_id}&d=${convert2UnixTS(date)}`;
        };

        const generateGBTEndpointURL = (dv_id, date) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/gbtByDV?dv_id=${dv_id}&d=${convert2UnixTS(date)}`;
        };

        const generateGBTChartEndpointURL = (dv_id, date) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/gbtChartDataByDV?dv_id=${dv_id}`;
        };

        // dummy data for chart
        // var dates = ["2013-06-14", "2019-2-1", "2019-06-30", "2019-07-1", "2021-04-13"],
        // salaries =  [4711,            4800,         4750,        5000,         5000];
        const dates = ref([]);
        const salaries = ref([]);

        const chartOptions = reactive({

            chart: {
                type: 'line'
            },
            title: {
                text: 'Gehalt'
            },
            series: [{
                name: 'Gesamtgehalt',
                data: [],
                color: '#6fcd98',
                step: 'left' // or 'center' or 'right'
                },
            ],
            xAxis: {
                type: 'datetime',
                labels: {
                  // Format the date
                  formatter: function() {
                    return Highcharts.dateFormat('%d.%m.%Y', this.value);
                  },
                  rotation: 45
                },
                tickPositioner: function() {
                  return dates.value.map(function(date) {
                    return Date.parse(date);
                  });
                }
            },
                yAxis: {
                //min: 0,
                title: {
                    text: '€'
                }
            },
            

        })


        const fetchData = async (uid) => {
            if (uid == null) {
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
                if (dvList.value.length > 0) {
                    currentDVID.value = dvList.value[0].dienstverhaeltnis_id;
                    currentDV.value = dvList.value[0];
                } else {
                    currentDVID.value = null;
                    currentDV.value = null;
                }
            } catch (error) {
                console.log(error)
                isFetching.value = false
            }
        }

        const fetchVertrag = async (dv_id, date) => {
            let urlVertrag = generateVertragEndpointURL(dv_id, date);
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
        const fetchGBT = async (dv_id, date) => {
            let urlGBT = generateGBTEndpointURL(dv_id, date);
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

        // fetch chart data
        const fetchGBTChartData = async (dv_id, date) => {
            let urlGBT = generateGBTChartEndpointURL(dv_id);
            isFetching.value = true
            try {
                const res = await fetch(urlGBT);
                let response = await res.json();
                isFetching.value = false;
                gbtChartData.value = response;
                let tempData = [];
                // chartOptions.series[0].data.length = 0;
                response.forEach(element => {
                   tempData.push([element.von, parseFloat(element.summe)]);
                });
                chartOptions.series[0].data = tempData;

            } catch (error) {
                console.log(error)
                isFetching.value = false
            }
        }

        const deleteDV = async (dv_id) => {
            let url = generateDVDeleteEndpointURL(dv_id);
            isFetching.value = true
            try {
                const res = await fetch(url);
                let response = await res.json();
                isFetching.value = false;
                console.log(response);
            } catch (error) {
                console.log(error)
                isFetching.value = false
            }
        }

        const activeDV = computed(() => {            
            return dvList.value.filter((dv) => {
                let von = new Date(dv.von);
                let bis = dv.bis != null ? new Date(dv.bis) : null;
                return von <= currentDate.value && (bis == null || bis >= currentDate.value);
            })
        })

        const isCurrentDVActive = computed(() => {
            if (currentDV.value == null) return false;
            let von = new Date(currentDV.value.von);
            let bis = currentDV.value.bis != null ? new Date(currentDV.value.bis) : null;
            return von <= currentDate.value && (bis == null || bis >= currentDate.value);
        })

        const isCurrentDate = computed(() => {
            return currentDate.value == now.value
        })
        
        fetchData(route.params.uid);
        watch(
            () => route.params.uid,
            (newVal) => {
                fetchData(newVal);
            }
        )
        watch(
            currentDVID,
            (newVal) => {
                fetchVertrag(newVal, currentDate.value);
                fetchGBT(newVal, currentDate.value);
                fetchGBTChartData(newVal);
            }
        )

        watch(
            currentDate,
            (newDate) => {
                console.log('watch newDate=', newDate)
                fetchGBT(currentDVID.value, newDate)
            }
        )

        const dvSelectedHandler = (e) => {
            console.log("DV selected: ", e.target);
            dvSelectedIndex.value = e.target.selectedIndex + 1;
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

        const formatDateISO = (ds) => {
            if (ds == null) return '';
            var d = new Date(ds);
            return d?.toISOString().substring(0,10);
        }

        const filterVertragsbestandteil = (vertragsbestandteile, kurzbz) => {
            let ws = vertragsbestandteile.filter(value => value.vertragsbestandteiltyp_kurzbz == kurzbz);
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
            vbformDV.value = null;
            VbformWrapperRef.value.showModal();
        }

        const updateDVDialog = () => {
            vbformmode.value = 'aenderung';
            vbformDV.value = currentDV.value;
            VbformWrapperRef.value.showModal();
        }

        const korrekturDVDialog = () => {
            vbformmode.value = 'korrektur';
            vbformDV.value = currentDV.value;
            VbformWrapperRef.value.showModal();            
        }
        
        const endDVDialog = () => {
            endDV.value = {
                    dienstverhaeltnisid: currentDV.value.dienstverhaeltnis_id,
                    unternehmen: currentDV.value.oe_kurzbz,
                    vertragsart_kurzbz: currentDV.value.vertragsart_kurzbz,
                    gueltigkeit: {
                        guioptions: {
                           sharedstatemode: 'ignore',
                           disabled: [
                               'gueltig_ab'
                           ] 
                        },
                        data: {
                            gueltig_ab: currentDV.value.von,
                            gueltig_bis: currentDV.value.bis,
                        }
                    }
                };
            enddvmodalRef.value.showModal();            
        }
        
        const handleDvSaved = async () => {
            fetchData(route.params.uid);
        }

        const handleDvEnded = async () => {
            fetchData(route.params.uid);
        }
        
        const formatNumber = (num) => {
            return numberFormat.format(parseFloat(num));
        }

        const setDateHandler = (d) => {
            console.log('date set: ', d);
            currentDate.value = new Date(d.target.value);
        }

        const setDate2BisDatum = () => {
            currentDate.value = new Date(currentDV.value.bis);
        }

        const setDate2VonDatum = () => {
            currentDate.value = new Date(currentDV.value.von);
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
                    } else {
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

        const dropdownLink1 = () => {
            console.log('dropdown link clicked');
        }

        const dvDeleteHandler = () => {
            console.log('dvDeleteHandler link clicked', currentDVID);
            deleteDV(currentDVID.value).then(() => fetchData(route.params.uid));            
        }

        const capitalize = (s) => {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }

        const formatGBTGrund = (item) => {
            if (!item) return ''
            if (item.vertragsbestandteiltyp_kurzbz=='funktion') {
                return item.fkt_beschreibung + '/' + (item.fb_bezeichnung!=null?item.fb_bezeichnung:'') + (item.org_bezeichnung!=null?item.org_bezeichnung:'')
            } else if (item.vertragsbestandteiltyp_kurzbz=='freitext') {
                return capitalize(item.freitexttyp_kurzbz) + '/' + item.freitext_titel
            }
            return capitalize(item.vertragsbestandteiltyp_kurzbz)
        }

        const truncate = (input) => input?.length > 8 ? `${input.substring(0, 8)}...` : input;

        return {
            isFetching, dvList, vertragList, gbtList, currentDV, currentDVID, dvSelectedHandler, confirmDeleteDVRef, 
            VbformWrapperRef, route, vbformmode, vbformDV, formatNumber, activeDV, isCurrentDVActive, isCurrentDate, 
            currentVBS, dropdownLink1, setDateHandler, dvDeleteHandler, formatGBTGrund, truncate, setDate2BisDatum, setDate2VonDatum,
            createDVDialog, updateDVDialog, korrekturDVDialog, handleDvSaved, formatDate, formatDateISO, dvSelectedIndex, 
            currentDate, chartOptions, enddvmodalRef, endDVDialog, endDV, handleDvEnded
        }
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

                <div class="col-md-12">
                    <div class="d-flex justify-content-end mb-2">
                        <div class="me-2"><span style="font-size:0.5em;font-style:italic" v-if="dvList?.length>0">({{ dvSelectedIndex }} von {{ dvList.length }})  id={{currentDVID}}</span></div>
                        <div v-if="!isCurrentDate"><span class="badge badge-sm bg-warning me-1">Anzeigedatum ist nicht aktueller Tag</span></div> 
                        <div><span class="badge badge-sm me-1" :class="{'bg-success': activeDV.length > 0, 'bg-danger': activeDV.length == 0}" v-if="!isFetching">{{ activeDV.length }} aktiv zu gewähltem Datum</span></div> 
                        <div><span class="badge badge-sm bg-secondary">{{ dvList?.length }} <span v-if="dvList">gesamt</span></span></div> 
                    </div>
                    <div class="d-flex">
                        <div class="me-auto">
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary me-2" @click="createDVDialog()"><i class="fa fa-plus"></i> Dienstverhältnis</button>   
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary me-2" @click="updateDVDialog()">DV bearbeiten</button>
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary me-2">Bestätigung drucken</button>
                            <!-- Drop Down Button -->
                            <DropDownButton  :links="[{action:dropdownLink1,text:'Karenz'},{action:korrekturDVDialog,text:'Korrektur'},{action:endDVDialog,text:'DV beenden'},{action:dvDeleteHandler,text:'DV löschen (DEV only)'}]">
                                weitere Aktionen
                            </DropDownButton>
                        </div>

                        <div class="d-flex align-items-end flex-column">  
                            <div class="d-grid d-sm-flex gap-2 mb-2 flex-nowrap">        
                                <select  v-if="!isFetching && dvList?.length>0" class="form-select form-select-sm" v-model="currentDVID" @change="dvSelectedHandler" aria-label="DV auswählen">
                                    <option v-for="(item, index) in dvList" :value="item.dienstverhaeltnis_id"  :key="item.dienstverhaeltnis_id">
                                        {{item.oe_bezeichnung}}, {{ formatDate(item.von) }} - {{ formatDate(item.bis) }}
                                    </option> 
                                </select> 
                                <div v-else-if="isFetching" style="width:150px"><p-skeleton style="width:100%;height:100%"></p-skeleton></div>      

                                <input type="date" style="max-width:130px;min-width:130px" class="form-control form-control-sm" 
                                    id="currentDateSelect" :value="formatDateISO(currentDate)" @change="setDateHandler" >
                            </div>
                        </div>
                    </div>
                    
                </div>      
                
                <div class="row justify-content-center pt-md-2" v-if="!isCurrentDVActive && dvList?.length">
                        <div class="alert alert-warning mt-3" role="alert">
                            Dienstverhältnis ist zum ausgewählten Datum inaktiv.
                            <span v-if="currentDV.bis != null">
                                Anzeigedatum auf letztgültiges Datum des Dienstverhältnisses setzen: &nbsp;
                                <button type="button" class="btn btn-sm btn-outline-secondary" @click="setDate2BisDatum">
                                    <i class="fa fa-pen"></i> Datum setzen
                                </button>
                                
                            </span>
                            <span v-else-if="currentDV.von != null">
                                Anzeigedatum auf Von-Datum des Dienstverhältnisses setzen: &nbsp;
                                <button type="button" class="btn btn-sm btn-outline-secondary" @click="setDate2VonDatum">
                                    <i class="fa fa-pen"></i> Datum setzen
                                </button>
                                
                            </span>
                        </div>
                </div>
                <div class="row pt-md-2" v-if="isCurrentDVActive && dvList?.length">

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
                                        <input type="text" readonly class="form-control-sm form-control-plaintext" :value="currentDV.oe_bezeichnung" >
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
                                        <input type="text" readonly class="form-control-sm form-control-plaintext" :value="formatDate(currentDV.von)" >
                                    </div>

                                    <div class="col-md-4">
                                        <label for="zeitraum_bis" class="form-label" >Bis</label>
                                        <input type="text" readonly class="form-control-sm form-control-plaintext" :value="formatDate(currentDV.bis)" >
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
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="formatDate(item.von)" >
                                        </div>

                                        <div class="col-md-4">
                                            <label for="befristet_bis" class="form-label" >Bis</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="formatDate(item.bis)" >
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
                                    <div class="col-md-12 h6"><h6 style="margin: 0.9rem 0 0 0;">Arbeitszeit</h6></div>

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

                                        <div class="col-md-3">
                                            <label class="form-label" v-if="index==0" >Grund</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatGBTGrund(item)">                                            
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Gehaltstyp</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="item?.gehaltstyp_bezeichnung">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Betrag</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatNumber(item.grund_betrag_decrypted)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Betrag val.</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatNumber(item.betrag_val_decrypted)">
                                        </div>

                                        <div class="col-md-1">
                                            <label class="form-label" v-if="index==0" >Val.</label>
                                            <div class="col-sm-8">
                                                <input class="form-check-input" type="checkbox" :checked="item.valorisierung" disabled>
                                            </div>
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Anmerkung</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="truncate(item.anmerkung)">
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
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="item.freitexttyp_kurzbz" >
                                        </div>

                                        <div class="col-md-5">
                                            <label class="form-label" >Titel</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="item.titel" >
                                        </div>

                                        <div class="col-md-2">
                                            <label  class="form-label" >Von</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatDate(item.von)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" >Bis</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatDate(item.bis)">
                                        </div>

                                        

                                        <div class="col-md-9">
                                            <label class="form-label" >Text</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="item.anmerkung">
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
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="item.funktion_bezeichnung" >
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0">Abteilung</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="item.oe_bezeichnung">
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0">SAP Kostenstelle</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" v-if="item.funktion_kurzbz == 'kstzuordnung'" :value="item.oe_kurzbz_sap">
                                        </div>

                                    </template>

                                    <!-- taetigkeit -->
                                    <div class="col-md-12 h6"><h6 style="margin: 0.9rem 0 0 0;">Tätigkeit</h6></div>
                                    <template v-for="(item, index) in currentVBS.funktion.taetigkeit"  >

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0" >Zuordnung</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="item.funktion_bezeichnung" >
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0">Abteilung</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="item.oe_bezeichnung">
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
                
            </div>
        </div>

    </div>

    <!--DVDialog ref="dienstverhaeltnisDialogRef" id="dvDialog"></DVDialog-->
    <vbform_wrapper 
        id="vbFormWrapper" 
        ref="VbformWrapperRef" 
        :title="'Dienstverhältnis'" 
        :mode="vbformmode" 
        :curdv="vbformDV"
        :mitarbeiter_uid="route.params.uid"
        @dvsaved="handleDvSaved">
    </vbform_wrapper>

    <ModalDialog title="Warnung" ref="confirmDeleteDVRef">
        <template #body>
            Dienstverhältnis wirklich löschen?
        </template>
    </ModalDialog>

    <enddvmodal 
        ref="enddvmodalRef" 
        :curdv="endDV"
        @dvended="handleDvEnded">
    </enddvmodal>
    `
}
