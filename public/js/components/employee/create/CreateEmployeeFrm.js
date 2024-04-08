import { ref, reactive, watch, inject, toRef, getCurrentInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import { validSVNR } from "../../../helpers/validation/svnr.js";

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

export const CreateEmployeeFrm = {
    components: {
        "datepicker": VueDatePicker
    },
    props: {
        defaultval: { type: Object, required: false },
    },
    expose: [ 'save', 'reset'],
    setup( props ) {

        const router = useRouter();
    	const route = useRoute();     
        
        const defaultvalRef = toRef(props, 'defaultval')

        const sprache = inject('sprache');
        const nations = inject('nations');

        const GESCHLECHT = {
            w: 'weiblich', 
            m: 'männlich', 
            x: 'divers', 
            u: 'unbekannt'};

        const createShape = () => {
            return {
            vorname: "",
            vornamen: "",
            nachname: "",
            gebdatum: "",
            email: "",
            svnr: "",
            geschlecht: "",
            staatsbuergerschaft: "A",
            anmerkung: "",
            }
        }

        const currentValue = ref(createShape());
        const preservedValue = ref(createShape());

        const printNation = (code) => {
            if (!code) return '';
            let result = nations.value?.filter((item) => item.nation_code == code);
            if (result?.length > 0)
                return result[0].nation_text;
            return '';
        }

        watch(props, () => {
            currentValue.value.nachname = props.defaultval.surname.charAt(0).toUpperCase() + props.defaultval.surname.slice(1)
            currentValue.value.gebdatum = props.defaultval.birthdate
          })


        // -------------
        // form handling
        // -------------

        const createEmployeeFrm = ref();

        const isFetching = ref(false);

        const frmState = reactive({ nachnameBlured: false, vornameBlured: false, emailBlured: false, geburtsdatumBlured: false, geschlechtBlured: false, svnrBlured: false, wasValidated: false });


        const validNachname = (n) => {
            return !!n && n.trim() != "";
        }

        const validVorname = (n) => {
            return !!n && n.trim() != "";
        }

        const validGeschlecht = (n) => {
            return !!n && n.trim() != "";
        }

        const validEmail = (n) => {
            return !!n && n.trim() != "";
        }

        const validGeburtsdatum = (n) => {
            return !!n && n.trim() != "";
        }

        const validate = () => {
            // trigger constraint validation
            Object.keys(frmState).forEach((item) => { frmState[item] = true })
            if (!validNachname(currentValue.value.nachname)) {
                return false;
            }
            if (!validVorname(currentValue.value.vorname)) {
                return false;
            }
            if (!validEmail(currentValue.value.email)) {
                return false;
            }
            if (!validGeburtsdatum(currentValue.value.gebdatum)) {
                return false;
            }
            if (!validGeschlecht(currentValue.value.geschlecht)) {
                return false;
            }
            if (!validSVNR(currentValue.value.svnr)) {
                return false;
            }
            return true;
        }

        const save = async () => {
            console.log('frmState: ', frmState);
            if (!frmState.geburtsdatumBlured) {
                frmState.geburtsdatumBlured = true;
            }

            if (!createEmployeeFrm.value.checkValidity() || !validate()) {

                console.log("form invalid");
                throw new Error("form invalid");

            } else {

                // submit
                isFetching.value = true
                try {
                    const response = await getCurrentInstance().$fhcapi.Employee.createEmployee({ action: "quick", payload: {...currentValue.value}});
                    redirect2Employee(response.data.retval.person_id, response.data.retval.uid);
                } catch (error) {
                    console.log(error);                    
                } finally {
                    isFetching.value = false;           
                }
                
            }

            frmState.wasValidated  = true;  
        }

        const take = async (person_id, uid, vorname, nachname) => {
                                
            try {
                isFetching.value = true
                const res = await getCurrentInstance().$fhcapi.Employee.createEmployee({ action: "take", payload: { person_id, uid, vorname, nachname}});             
                isFetching.value = false;                
                personSelectedHandler(person_id, res.data.retval.uid);

            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
            
        }


        const reset = () => {
            currentValue.value = createShape();
            // reset constraint validation
            Object.keys(frmState).forEach((item) => { frmState[item] = false })
        }

        const redirect2Employee = (id, uid) => {
			console.log('redirect: ', id, uid);			
			let url = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/${id}/${uid}/summary`;
			router.push(url);            
		}


        return { 
            createEmployeeFrm, 
            currentValue, 
            nations, 
            sprache, 
            isFetching, 
            validNachname,    
            validVorname,
            validGeburtsdatum,
            validEmail,
            validGeschlecht,
            validSVNR,            
            frmState,
            defaultvalRef,
            reset,
            save,
         }

    },
    template: `
    <form class="row g-3" ref="createEmployeeFrm" >
        <h6>Stammdaten Mindestanforderung</h6>
        <div class="col-md-3">
            <label for="surname" class="required form-label">Nachname</label>
            <input id="surname" 
                @blur="frmState.nachnameBlured = true"
                v-model="currentValue.nachname"
                type="text" 
                class="form-control form-control-sm" 
                :class="{ 'is-invalid': !validNachname(currentValue.nachname) && frmState.nachnameBlured}"
                placeholder="Nachname" aria-label="nachname">
            <div class="invalid-feedback" v-if="frmState.nachnameBlured && !validNachname(currentValue.nachname)">
                Pflichtfeld
            </div>
        </div>  
        <div class="col-md-2">
            <label for="firstname" class="required form-label">Vorname</label>
            <input id="firstname" 
                v-model="currentValue.vorname" 
                @blur="frmState.vornameBlured = true"
                :class="{ 'is-invalid': !validNachname(currentValue.vorname) && frmState.vornameBlured}"
                type="text" 
                class="form-control form-control-sm" 
                aria-label="vorname">
            <div class="invalid-feedback" v-if="frmState.vornameBlured && !validVorname(currentValue.vorname)">
                Pflichtfeld
            </div>
        </div>
       
        <div class="col-md-2">
            <label for="firstnames" class="form-label">Vornamen</label>
            <input id="firstnames" 
                v-model="currentValue.vornamen" 
                type="text" 
                class="form-control form-control-sm" 
                aria-label="vornamen">
        </div>
              
        <div class="col-md-5"></div>
        
        <!-- Geschlecht -->
        <div class="col-md-3">
            <label for="geschlecht" class="required form-label">Geschlecht</label><br>
            <select id="geschlecht" v-model="currentValue.geschlecht" 
                class="form-select form-select-sm" 
                :class="{ 'is-invalid': !validGeschlecht(currentValue.geschlecht) && frmState.geschlechtBlured}"
                @blur="frmState.geschlechtBlured = true"
                aria-label=".form-select-sm " >
                <option value="w">weiblich</option>
                <option value="m">männlich</option>
                <option value="x">divers</option>
                <option value="u">unbekannt</option>
            </select>
            <div class="invalid-feedback" v-if="frmState.geschlechtBlured && !validGeschlecht(currentValue.geschlecht)">
            Pflichtfeld
            </div>
        </div>
        <div class="col-md-2">
            <label for="birthdate" class="required form-label">Geburtsdatum</label>
            <datepicker id="birthdate"
                :teleport="true"
                :class="{ 'is-invalid': !validGeburtsdatum(currentValue.gebdatum) && frmState.geburtsdatumBlured}"
                @blur="frmState.geburtsdatumBlured = true"             
                v-model="currentValue.gebdatum"
                v-bind:enable-time-picker="false"
                text-input 
                locale="de"
                format="dd.MM.yyyy"
                auto-apply 
                model-type="yyyy-MM-dd"></datepicker>
                <div class="invalid-feedback" v-if="frmState.geburtsdatumBlured && !validGeburtsdatum(currentValue.gebdatum)">
                Pflichtfeld
                </div>
        </div>
        <div class="col-md-2">
            <label for="svnr" class="form-label">SVNR</label>
            <input id="svnr" 
                v-model="currentValue.svnr" 
                @blur="frmState.svnrBlured = true"
                type="text" 
                class="form-control form-control-sm"
                :class="{ 'is-invalid': !validSVNR(currentValue.svnr) && frmState.svnrBlured}" 
                aria-label="svnr">
        </div>
        <div class="col-md-5"></div>
        <!-- Staatsbürgerschaft, etc. -->
        <div class="col-md-3">
            <label for="staatsbuergerschaft" class="required form-label">Staatsbürgerschaft</label>                
            <select id="staatsbuergerschaft" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="currentValue.staatsbuergerschaft" >
                <option v-for="(item, index) in nations" :value="item.nation_code">
                    {{ item.nation_text }}
                </option>
            </select>
        </div>
        <!-- Email -->
        <div class="col-md-4">
            <label for="email" class="required form-label">Email</label>
            <input id="email" 
                v-model="currentValue.email" 
                @blur="frmState.emailBlured = true"
                type="text" 
                class="form-control form-control-sm" 
                :class="{ 'is-invalid': !validEmail(currentValue.email) && frmState.emailBlured}"
                aria-label="email">
            <div class="invalid-feedback" v-if="frmState.emailBlured && !validEmail(currentValue.email)">
                Pflichtfeld
                </div>
        </div><div class="col-md-5"></div>
        <div class="col-md-7">
            <label for="inputAddress" class="form-label">Anmerkung</label>
            <textarea type="text" class="form-control form-control-sm"  id="anmerkungen" v-model="currentValue.anmerkung">
            </textarea>
        </div>
        <div class="col-md-5"></div>
        
    </form>
    `    
}