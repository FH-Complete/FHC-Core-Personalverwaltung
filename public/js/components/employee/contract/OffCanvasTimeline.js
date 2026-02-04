import ApiVertragsbestandteil from '../../../api/factory/vertragsbestandteil.js';


export const OffCanvasTimeline = {
	name: 'OffCanvasTimeline',
     components: {
        "p-timeline": primevue.timeline,
        "p-multiselect": primevue.multiselect,
     },
     props: {
        uid: String,
        curdv: Object,
        alldv: Array,
     },
     //expose: ['show', 'hide', 'toggle'],
     emits: [ 'dateSelected' ],
     setup( props, { expose, emit } ) {

        const colorPalette = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"];
        const $api = Vue.inject('$api');
        const courseData = Vue.ref();
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Timeline");
        const showAllDVChecked = Vue.ref(false);
        const currentUID = Vue.toRefs(props).uid
        const vbsData = Vue.ref();
        const events =Vue.ref([]);
        const isHidden = Vue.ref(true);
        let offCanvasEle = Vue.ref(null);
        let thisOffCanvasObj;
        const numberFormat = new Intl.NumberFormat();
        const selectedVBSTypen = Vue.ref([]);
        const selectedGBSTypen = Vue.ref([]);
        const vertragsarten = Vue.inject('vertragsarten');
        const vertragsbestandteiltypen = Vue.inject('vertragsbestandteiltypen');
        const gehaltstypen = Vue.inject('gehaltstypen');        

        const formatDate = (ds) => {
            if (!ds) return ""
            var d = new Date(ds)
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

        const dateSelected = (date) => {
            emit('dateSelected', date);
            hide();
        }

        const hiddenCanvasHandler = () => {
            isHidden.value = true;
        }


        const shownCanvasHandler = () => {
            isHidden.value = false;
        }

        Vue.onMounted(() => {
            thisOffCanvasObj = new bootstrap.Offcanvas(offCanvasEle.value);
            offCanvasEle.value.addEventListener('hidden.bs.offcanvas', hiddenCanvasHandler);
            offCanvasEle.value.addEventListener('shown.bs.offcanvas', shownCanvasHandler);
        })

        Vue.onBeforeUnmount(() => {
            offCanvasEle.value.removeEventListener('hidden.bs.offcanvas', hiddenCanvasHandler);
            offCanvasEle.value.removeEventListener('shown.bs.offcanvas', shownCanvasHandler);
        })


        async function show() {

            vbsData.value = []
                        
            for (const dv of props.alldv){
                const response = await $api.call(ApiVertragsbestandteil.getAllVBs(dv.dienstverhaeltnis_id))
                vbsData.value.push(response.data)
            }            

            events.value = generateTimeline(vbsData.value)
            thisOffCanvasObj.show()
        }

        function hide() {
            thisOffCanvasObj.hide();
        }
        function toggle() {
            thisOffCanvasObj.toggle();
        }

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
                    label = 'Urlaubsanspruch';
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

        Vue.watch([selectedVBSTypen, selectedGBSTypen, showAllDVChecked], ([id,uid]) => {
            events.value = generateTimeline(vbsData.value);                     
        });

        function generateTimeline(data) {
            let timeline = {};
            
            data.forEach( (item, index) => mergeTimelineData(item, timeline, index))

            return Object.values(timeline).sort((a, b) => {
                const date1 = new Date(a.date);
                const date2 = new Date(b.date);

                return date2 - date1;
            })


        }

        function mergeTimelineData(data, timeline, index) {
            let filterActive = selectedVBSTypen.value.length > 0 || selectedGBSTypen.value.length > 0  || !showAllDVChecked
            let isVBSFiltered = (vbs) => selectedVBSTypen.value.find(vbsType => vbsType.value == vbs.vertragsbestandteiltyp_kurzbz)
            let isGBSFiltered = (gbs) => selectedGBSTypen.value.find(gbsType => gbsType.value == gbs.gehaltstyp_kurzbz)

            data.forEach(vbs => {

                if (!filterActive || (filterActive && isVBSFiltered(vbs))) {

                    if (showAllDVChecked.value || (!showAllDVChecked.value && vbs.dienstverhaeltnis_id == props.curdv.dienstverhaeltnis_id)) {

                        if (!timeline[vbs.von]) {
                            timeline[vbs.von] = { date: vbs.von, bestandteile: []}
                        }
                        
                        timeline[vbs.von].bestandteile.push({ 
                            dienstverhaeltnis_id: vbs.dienstverhaeltnis_id, 
                            index: index,
                            typ: 'vbs', 
                            start: true, 
                            status: getBestandteilLabel(vbs), 
                            vbs, kurzbz: vbs.vertragsbestandteiltyp_kurzbz
                        })


                        if (vbs.bis != null) {
                            if (!timeline[vbs.bis]) {
                                timeline[vbs.bis] = { date: vbs.bis, bestandteile: []}
                            }
                            timeline[vbs.bis].bestandteile.push({ 
                                dienstverhaeltnis_id: vbs.dienstverhaeltnis_id, 
                                index: index,
                                typ: 'vbs', 
                                start: false, 
                                status: getBestandteilLabel(vbs), 
                                vbs, kurzbz: vbs.vertragsbestandteiltyp_kurzbz
                            })
                        }
                    }
                }
                
                vbs.gehaltsbestandteile.forEach( gbs => {

                    if (!filterActive || (filterActive && isGBSFiltered(gbs))) {

                        if (showAllDVChecked.value || (!showAllDVChecked.value && vbs.dienstverhaeltnis_id == props.curdv.dienstverhaeltnis_id)) {

                            if (!timeline[gbs.von]) {
                                timeline[gbs.von] = { date: gbs.von, bestandteile: []}
                            }
                            timeline[gbs.von].bestandteile.push({ 
                                dienstverhaeltnis_id: gbs.dienstverhaeltnis_id, 
                                index: index,
                                typ: 'gbs', 
                                start: true,
                                status: getGehaltsbestandteilLabel(gbs.gehaltstyp_kurzbz), 
                                gbs, 
                                kurzbz: gbs.gehaltstyp_kurzbz
                            })
                        
                            if (gbs.bis != null) {
                                if (!timeline[gbs.bis]) {
                                    timeline[gbs.bis] = { date: gbs.bis, bestandteile: []}
                                }
                                timeline[gbs.bis].bestandteile.push({ 
                                    dienstverhaeltnis_id: gbs.dienstverhaeltnis_id, 
                                    index: index,
                                    typ: 'gbs', 
                                    start: false, 
                                    status: getGehaltsbestandteilLabel(gbs.gehaltstyp_kurzbz), 
                                    gbs, 
                                    kurzbz: gbs.gehaltstyp_kurzbz
                                })
                            }

                        }
                    }
                })
                
            })
        }

        const formatVertragsart = (item) => {
            let va = vertragsarten.value.find(kt => kt.value == item);
            return va != undefined ? va.label : item;
        }

        const formatNumber = (num) => {
            return numberFormat.format(parseFloat(num));
        }

        // expose functions
        expose({show, hide, toggle});

        return {
            courseData, isFetching, formatDate, formatNumber, dateSelected, currentSemester, 
            title, currentUID, events, offCanvasEle, show, hide, toggle, isHidden, 
            selectedVBSTypen, vertragsbestandteiltypen, selectedGBSTypen, gehaltstypen,              
            showAllDVChecked, colorPalette, formatVertragsart,
        }
     },
     template: `
     <div class="offcanvas offcanvas-end vertragshistorie"
        ref="offCanvasEle"
        tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">

        <button type="button" id="btnContractHistory" class="offcanvas-btn btn btn-sm btn-secondary" @click="isHidden ? show() : hide()">Vertragshistorie</button>

        <div class="offcanvas-header">
            <h5 id="offcanvasRightLabel">Vertragshistorie</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">

                <ul class="list-group mb-1">
                    <li class="list-group-item py-1" v-for="(dv, index) in alldv"  :style="{ 'border-left': '5px solid ' + colorPalette[index] }" >
                        {{ formatVertragsart(dv.vertragsart_kurzbz) }}/{{dv.oe_bezeichnung}}, {{ formatDate(dv.von) }} - {{ formatDate(dv.bis) }}
                        <span v-if="dv.dienstverhaeltnis_id==curdv.dienstverhaeltnis_id"> (ausgewähltes DV)</span>
                    </li>
                </ul>

                <div class="form-check form-switch mb-2">
                            <input class="form-check-input" type="checkbox" role="switch" id="showAllDVChecked" v-model="showAllDVChecked">
                            <label class="form-check-label" for="showAllDVChecked">alle DV anzeigen</label>
                </div>
                
                <div class="card flex justify-content-center mb-5" style="border:0">
                    <p-multiselect v-model="selectedVBSTypen" 
                        :options="vertragsbestandteiltypen" optionLabel="label"                         
                        display="chip" placeholder="Filter Vertragsbestandteile" 
                        appendTo="self" 
                        class="mb-1">
                        <template #optiongroup="slotProps">
                            <div class="flex align-items-center">                            
                                <div>{{ slotProps.option.label }}</div>
                            </div>
                        </template>
                    </p-multiselect>   
                    <p-multiselect v-model="selectedGBSTypen" 
                        :options="gehaltstypen" optionLabel="label"                         
                        display="chip" placeholder="Filter Gehaltsbestandteile" 
                        appendTo="self" 
                        class="mb-1">
                        <template #optiongroup="slotProps">
                            <div class="flex align-items-center">                            
                                <div>{{ slotProps.option.label }}</div>
                            </div>
                        </template>
                    </p-multiselect>   

                    
                

                </div>             

                <p-timeline :value="events">
                    <template #content="slotProps">
                        <div style="font-weight:bold; cursor: pointer" @click="dateSelected(slotProps.item.date)">{{formatDate(slotProps.item.date)}}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" class="calendar-icon"><path d="M29.333 8c0-2.208-1.792-4-4-4h-18.667c-2.208 0-4 1.792-4 4v18.667c0 2.208 1.792 4 4 4h18.667c2.208 0 4-1.792 4-4v-18.667zM26.667 8v18.667c0 0.736-0.597 1.333-1.333 1.333 0 0-18.667 0-18.667 0-0.736 0-1.333-0.597-1.333-1.333 0 0 0-18.667 0-18.667 0-0.736 0.597-1.333 1.333-1.333 0 0 18.667 0 18.667 0 0.736 0 1.333 0.597 1.333 1.333z"></path><path d="M20 2.667v5.333c0 0.736 0.597 1.333 1.333 1.333s1.333-0.597 1.333-1.333v-5.333c0-0.736-0.597-1.333-1.333-1.333s-1.333 0.597-1.333 1.333z"></path><path d="M9.333 2.667v5.333c0 0.736 0.597 1.333 1.333 1.333s1.333-0.597 1.333-1.333v-5.333c0-0.736-0.597-1.333-1.333-1.333s-1.333 0.597-1.333 1.333z"></path><path d="M4 14.667h24c0.736 0 1.333-0.597 1.333-1.333s-0.597-1.333-1.333-1.333h-24c-0.736 0-1.333 0.597-1.333 1.333s0.597 1.333 1.333 1.333z"></path></svg>                        
                        </div>

                        <template v-for="bestandteil in slotProps.item.bestandteile">
                            <div class="card mb-1" :style="{ 'border-left': '5px solid ' + colorPalette[bestandteil.index] }" >
                                <div class="row g-0">
                                    <div class="col-md-4" style="background-color:#eee">
                                        <div class="card-body rounded-start pt-1 pb-1">
                                        {{bestandteil.status}}<br/>
                                        <span v-if="!bestandteil.start">(beendet)</span>
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card-body pt-1 pb-1">
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
                                                    {{ bestandteil.vbs.tage }} Tage
                                                </template>
                                                <template v-if="bestandteil.vbs.vertragsbestandteiltyp_kurzbz=='kuendigungsfrist'">
                                                    AG: {{ bestandteil.vbs.arbeitgeber_frist }} Wochen<br/>
                                                    AN: {{ bestandteil.vbs.arbeitnehmer_frist }} Wochen
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