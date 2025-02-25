
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
            currentValue.value.nachname = props.defaultval.surname.charAt(0).toUpperCase() + props.defaultval.surname.slice(1)
            currentValue.value.gebdatum = props.defaultval.birthdate
          })

        // -------------
        // form handling
        // -------------

        const createEmployeeFrm = Vue.ref();
        const unrulyPersonList = Vue.ref([]);

        const isFetching = Vue.ref(false);

        const frmState = Vue.reactive({ nachnameBlured: false, vornameBlured: false, emailBlured: false, geburtsdatumBlured: false, geschlechtBlured: false, svnrBlured: false, wasValidated: false });

        const filterPerson = async () => {

            if (currentValue.value.nachname.length < 2 && currentValue.value.vorname.length < 2) {
                return;
            }

            try {
                isFetching.value = true;
                const res = await fhcApi.factory.CheckPerson.filterPerson(
                    { ...currentValue.value, unruly: true},
                    FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router
                );
                isFetching.value = false;

                if(!res.data.retval) return;
                // fhc api controller in backend but no plugin in pv21
                // if(!res.retval) return;
                unrulyPersonList.value = res.data.retval;

            } catch (error) {
                console.log(error);
                isFetching.value = false;
            }
        };

        Vue.watch(() => currentValue.value.nachname, () => {
            filterPerson(currentValue)
        }, {deep: true})
        Vue.watch(() => currentValue.value.vorname, () => {
            filterPerson(currentValue)
        })
        Vue.watch(() => currentValue.value.gebdatum, () => {
            filterPerson(currentValue)
        })

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
                    const response = await fhcApi.factory.Employee.createEmployee({ action: "quick", payload: {...currentValue.value}});
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
                const res = await fhcApi.factory.Employee.createEmployee({ action: "take", payload: { person_id, uid, vorname, nachname}});             
                isFetching.value = false;                
                personSelectedHandler(person_id, res.retval.uid);

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
            filterPerson,
            validNachname,    
            validVorname,
            validGeburtsdatum,
            validEmail,
            validGeschlecht,
            validSVNR,            
            frmState,
            defaultvalRef,
            unrulyPersonList,
            reset,
            save,
         }

    },
    template: `
    <form class="row g-3" ref="createEmployeeFrm" xmlns="http://www.w3.org/1999/html">
        <div class="col-md-8">
            <h6>Stammdaten Mindestanforderung</h6>
            <div class="row">
                <div class="col-md-5">
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
                <div class="col-md-3">
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
               
                <div class="col-md-3">
                    <label for="firstnames" class="form-label">Vornamen</label>
                    <input id="firstnames" 
                        v-model="currentValue.vornamen" 
                        type="text" 
                        class="form-control form-control-sm" 
                        aria-label="vornamen">
                </div>
            </div>
            
            <div class="row">
                <!-- Geschlecht -->
                <div class="col-md-5">
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
                <div class="col-md-3">
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
                <div class="col-md-3">
                    <label for="svnr" class="form-label">SVNR</label>
                    <input id="svnr" 
                        v-model="currentValue.svnr" 
                        @blur="frmState.svnrBlured = true"
                        type="text" 
                        class="form-control form-control-sm"
                        :class="{ 'is-invalid': !validSVNR(currentValue.svnr) && frmState.svnrBlured}" 
                        aria-label="svnr">
                </div>
            </div>        
                
            <div class="row">
                <!-- Staatsbürgerschaft, etc. -->
                <div class="col-md-6">
                    <label for="staatsbuergerschaft" class="required form-label">Staatsbürgerschaft</label>                
                    <select id="staatsbuergerschaft" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="currentValue.staatsbuergerschaft" >
                        <option v-for="(item, index) in nations" :value="item.nation_code">
                            {{ item.nation_text }}
                        </option>
                    </select>
                </div>
                <!-- Email -->
                <div class="col-md-5">
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
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-11">
                    <label for="inputAddress" class="form-label">Anmerkung</label>
                    <textarea type="text" class="form-control form-control-sm"  id="anmerkungen" v-model="currentValue.anmerkung"/>
                </div>
            </div>
            
        </div>
        <div class="col-md-4">
        <template v-if="unrulyPersonList.length">
            <h6><span class="badge" :class="'bg-unruly rounded-0'" >Unruly</span> Personen mit ähnlichen Daten:</h6>
            <p v-for="unruly in unrulyPersonList">
                {{unruly.vorname}} {{unruly.nachname}} PID: {{unruly.person_id}}
            </p>
        </template>
        </div>
    </form>
    `    
}