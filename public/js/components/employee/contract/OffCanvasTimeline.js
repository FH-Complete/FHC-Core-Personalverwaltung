import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const OffCanvasTimeline = {
     components: {
        "p-timeline": primevue.timeline,
     },
     props: {
        uid: String,
        curdv: Object,
     },
     setup( props ) {

        const courseData = Vue.ref();
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Timeline");
        const currentUID = Vue.toRefs(props).uid
        const events =Vue.ref([])
        let offCanvasEle = Vue.ref(null);
        let thisOffCanvasObj;
        const numberFormat = new Intl.NumberFormat();

        const formatDate = (ds) => {
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const currentSemester = Vue.computed(() => {
            const d = new Date();
            let y= d.getFullYear();
            let semesterString = "SS";

            if (d.getMonth < 8 && d.getMonth > 1) return semesterString + y;
            else if (d.getMonth < 2) {
                y--;
            }

            semesterString = "WS";
            return semesterString + y;

        })


        const fetchCurrentDV = async () => {
            if (currentUID.value == null) {
                return;
            }
			try {
			  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

			  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getCourseHours?uid=${currentUID.value}&semester=${currentSemester.value}`;
              isFetching.value = true;
			  const res = await fetch(url)
			  let response = await res.json();
              isFetching.value = false;
			  console.log(response.retval);
              if (response.retval.length>0) {
                courseData.value = response.retval[0];
              } else {
                courseData.value = null;
              }

			} catch (error) {
			  console.log(error);
              isFetching.value = false;
			}
		}

        Vue.onMounted(() => {
            thisOffCanvasObj = new bootstrap.Offcanvas(offCanvasEle.value);
        })

        function show() {
            Vue.$fhcapi.Vertragsbestandteil.getAllVBs(this.curdv.dienstverhaeltnis_id)
                    .then((response) => {
                        console.log(response);
                        events.value = generateTimeline(response.data.data);
                    });

            thisOffCanvasObj.show();
        }
        function hide() {
            thisOffCanvasObj.hide();
        }
        function toggle() {
            thisOffCanvasObj.toggle();
        }
        Vue.defineExpose({ show, hide, toggle});

        function getFreitextLabel(freitexttyp) {
            const freitexttypMap = {
                allin             : 'All-In',
                ersatzarbeitskraft: 'Ersatzarbeitskraft',
                zusatzvereinbarung: 'Zusatzvereinbarung',
                befristung        : 'Befristung',
                sonstiges         : 'Sonstiges'
            }
            return freitexttypMap[freitexttyp] !== undefined ? freitexttypMap[freitexttyp] : freitexttyp;
        }

        // TODO labels aus DB holen
        function getBestandteilLabel(vbs) {
            let label = '';
            switch (vbs.vertragsbestandteiltyp_kurzbz) {
                case 'stunden':
                    label = 'Zeit';
                    break;
                case 'zeitaufzeichnung':
                    label = 'Zeitaufzeichnung';
                    break;
                case 'urlaubsanspruch':
                    label = 'urlaubsanspruch';
                    break;
                case 'kuendigungsfrist':
                    label = 'Kündigungsfrist';
                    break;
                case 'karenz':
                    label = 'Karenz';
                    break;
                case 'freitext':
                    label = getFreitextLabel(vbs.freitexttyp_kurzbz);
                    break;
                case 'funktion':
                    if (vbs.benutzerfunktiondata.funktion_kurzbz.match(/.*zuordnung/)) {
                        label = 'Zuordnung';
                    } else {
                        label = 'Tätigkeit';
                    }
                    
                    break;

                default:
                    label = vbs.vertragsbestandteiltyp_kurzbz;
                    break;
            }
            return label;
        }

        function getGehaltsbestandteilLabel(gbsTyp) {
            const gbstypMap = {
                basisgehalt : 'Basisgehalt',
                grundgehalt : 'Grundgehalt',
                zulage      : 'Zulage',
                praemie     : 'Prämie',
                GRUNDGEHALT : 'Grundgehalt',
                PRAEMIE     : 'Prämie',
                UEBERSTUNDEN: 'Überstundenauszahlung',
                SONSTIGES   : 'Sonstiges'
            }
            return gbstypMap[gbsTyp] !== undefined ? gbstypMap[gbsTyp] : gbsTyp;
        }

        function generateTimeline(data) {
            let timeline = {};

            data.forEach(vbs => {

                if (!timeline[vbs.von]) {
                    timeline[vbs.von] = { date: vbs.von, bestandteile: []}
                }
                timeline[vbs.von].bestandteile.push({ typ: 'vbs', start: true, status: getBestandteilLabel(vbs), vbs})

                if (vbs.bis != null) {
                    if (!timeline[vbs.bis]) {
                        timeline[vbs.bis] = { date: vbs.bis, bestandteile: []}
                    }
                    timeline[vbs.bis].bestandteile.push({ typ: 'vbs', start: false, status: getBestandteilLabel(vbs), vbs})
                }

                vbs.gehaltsbestandteile.forEach( gbs => {
                    if (!timeline[gbs.von]) {
                        timeline[gbs.von] = { date: gbs.von, bestandteile: []}
                    }
                    timeline[gbs.von].bestandteile.push({ typ: 'gbs', start: true,status: getGehaltsbestandteilLabel(gbs.gehaltstyp_kurzbz), gbs})

                    if (gbs.bis != null) {
                        if (!timeline[gbs.bis]) {
                            timeline[gbs.bis] = { date: gbs.bis, bestandteile: []}
                        }
                        timeline[gbs.bis].bestandteile.push({ typ: 'gbs', start: false, status: getGehaltsbestandteilLabel(gbs.gehaltstyp_kurzbz), gbs})
                    }
                })
            });

            return Object.values(timeline).sort((a, b) => {
                const date1 = new Date(a.date);
                const date2 = new Date(b.date);

                return date2 - date1;
            })


        }

        const formatNumber = (num) => {
            return numberFormat.format(parseFloat(num));
        }

        // dummy events
        /*const events = [
            {status: 'Funktionsänderung', date: '1/2/2023', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg'},
            {status: 'Valorisierung (2,5%), Gehalt: € 3121,13', date: '1/9/2022', icon: 'pi pi-cog', color: '#673AB7'},
            {status: 'Valorisierung (1,5%), Gehalt: € 3150', date: '1/9/2021', icon: 'pi pi-shopping-cart', color: '#FF9800'},
            {status: 'Eintritt, Gehalt: € 3045', date: '16/10/2020', icon: 'pi pi-check', color: '#607D8B'}
        ]*/

        return {
            courseData, isFetching, formatDate, formatNumber, currentSemester, title, currentUID, events, offCanvasEle, show, hide, toggle,
        }
     },
     template: `
     <div class="offcanvas offcanvas-end vertragshistorie"
        ref="offCanvasEle"
        tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
        <div class="offcanvas-header">
            <h5 id="offcanvasRightLabel">Vertragshistorie</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
                <p-timeline :value="events">
                    <template #content="slotProps">
                        <div style="font-weight:bold">{{formatDate(slotProps.item.date)}}</div>

                        <template v-for="bestandteil in slotProps.item.bestandteile">
                            <div class="card mb-1">
                                <div class="row g-0">
                                    <div class="col-md-4" style="background-color:#eee">
                                        <div class="card-body rounded-start">
                                        {{bestandteil.status}}<br/>
                                        <span v-if="!bestandteil.start">(beendet)</span>
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card-body ">
                                            <div v-if="bestandteil.typ == 'vbs'">
                                                <template v-if="bestandteil.vbs.vertragsbestandteiltyp_kurzbz=='stunden'">
                                                    {{ formatNumber(bestandteil.vbs.wochenstunden) }}h
                                                </template>
                                                <template v-if="bestandteil.vbs.vertragsbestandteiltyp_kurzbz=='funktion'">
                                                    {{ bestandteil.vbs.benutzerfunktiondata.funktion_bezeichnung}}<br/>
                                                    {{ bestandteil.vbs.benutzerfunktiondata.oe_bezeichnung }}<br/>
                                                    <template v-if="bestandteil.vbs.benutzerfunktiondata.funktion_kurzbz=='kstzuordnung'">
                                                        {{ bestandteil.vbs.benutzerfunktiondata.oe_kurzbz_sap }}
                                                    </template>
                                                </template>
                                                <template v-if="bestandteil.vbs.vertragsbestandteiltyp_kurzbz=='zeitaufzeichnung'">
                                                    <i class="fa" :class="bestandteil.vbs.zeitaufzeichnung ? 'fa-check':'fa-times' "></i> Zeitaufzeichnung<br/>
                                                    <i class="fa" :class="bestandteil.vbs.azgrelevant ? 'fa-check':'fa-times' "></i> AZG-Relevant<br/>
                                                    <i class="fa" :class="bestandteil.vbs.homeoffice ? 'fa-check':'fa-times' "></i> Home-Office
                                                </template>
                                                <template v-if="bestandteil.vbs.vertragsbestandteiltyp_kurzbz=='freitext'">
                                                    {{ bestandteil.vbs.titel }}
                                                </template>
                                                <template v-if="bestandteil.vbs.vertragsbestandteiltyp_kurzbz=='urlaubsanspruch'">
                                                    {{ bestandteil.vbs.tage }}
                                                </template>
                                                <template v-if="bestandteil.vbs.vertragsbestandteiltyp_kurzbz=='kuendigungsfrist'">
                                                    AG: {{ bestandteil.vbs.arbeitgeber_frist }}<br/>
                                                    AN: {{ bestandteil.vbs.arbeitnehmer_frist }}
                                                </template>
                                                
                                            </div>
                                            <div v-if="bestandteil.typ == 'gbs'">
                                                € {{ formatNumber(bestandteil.gbs?.grundbetrag) }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <br/>
                    </template>
                </p-timeline>


        </div>
     </div>

     `


}