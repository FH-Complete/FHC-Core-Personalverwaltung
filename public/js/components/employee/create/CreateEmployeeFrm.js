
import { validSVNR } from "../../../helpers/validation/svnr.js";

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

export const CreateEmployeeFrm = {
    components: {
 
    },
    props: {
        defaultval: { type: Object, required: false },
    },
    setup( props ) {

        const router = VueRouter.useRouter();
    	const route = VueRouter.useRoute();     
        
        const defaultvalRef = Vue.toRef(props, 'defaultval')

        const sprache = Vue.inject('sprache');
        const nations = Vue.inject('nations');

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

        const currentValue = Vue.ref(createShape());
        const preservedValue = Vue.ref(createShape());

        const printNation = (code) => {
            if (!code) return '';
            let result = nations.value?.filter((item) => item.nation_code == code);
            if (result?.length > 0)
                return result[0].nation_text;
            return '';
        }

        Vue.watch(props, () => {
            currentValue.value.nachname = props.defaultval.surname
            currentValue.value.gebdatum = props.defaultval.birthdate
          })


        // -------------
        // form handling
        // -------------

        const createEmployeeFrm = Vue.ref();

        const isFetching = Vue.ref(false);

        const frmState = Vue.reactive({ nachnameBlured: false, vornameBlured: false, emailBlured: false, geburtsdatumBlured: false, geschlechtBlured: false, svnrBlured: false, wasValidated: false });


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
                let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

                const endpoint =
                    `${full}/extensions/FHC-Core-Personalverwaltung/api/createEmployee`;

                const res = await fetch(endpoint,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ action: "quick", payload: {...currentValue.value}}),
                });    

                if (!res.ok) {
                    isFetching.value = false;
                    const message = `An error has occured: ${res.status}`;
                    throw new Error(message);
                }
                let response = await res.json();
            
                isFetching.value = false;                
                redirect2Employee(response.retval.person_id, response.retval.uid);
                //currentValue.value = response.retval[0];
                //preservedValue.value = currentValue.value;
                
            }

            frmState.wasValidated  = true;  
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

        Vue.defineExpose({ save, reset, })

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
                Bitte geben Sie den Nachnamen an.
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
                placeholder="Vorname" aria-label="vorname">
            <div class="invalid-feedback" v-if="frmState.vornameBlured && !validVorname(currentValue.vorname)">
                Bitte geben Sie den Vornamen an.
            </div>
        </div>
       
        <div class="col-md-2">
            <label for="firstnames" class="form-label">Vornamen</label>
            <input id="firstnames" 
                v-model="currentValue.vornamen" 
                type="text" 
                class="form-control form-control-sm" 
                placeholder="Vornamen" aria-label="vornamen">
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
            Bitte geben Sie das Geschlecht an.
            </div>
        </div>
        <div class="col-md-2">
            <label for="birthdate" class="required form-label">Geburtsdatum</label>
            <input id="birthdate"
                type="date"  
                class="form-control form-control-sm"  
                :class="{ 'is-invalid': !validGeburtsdatum(currentValue.gebdatum) && frmState.geburtsdatumBlured}"
                @blur="frmState.geburtsdatumBlured = true"
                v-model="currentValue.gebdatum" >
                <div class="invalid-feedback" v-if="frmState.geburtsdatumBlured && !validGeburtsdatum(currentValue.gebdatum)">
                Bitte geben Sie das Geburtsdatum an.
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
                placeholder="SVNR" aria-label="svnr">
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
                placeholder="Email" aria-label="email">
            <div class="invalid-feedback" v-if="frmState.emailBlured && !validEmail(currentValue.email)">
                Bitte geben Sie eine Email-Adresse an.
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