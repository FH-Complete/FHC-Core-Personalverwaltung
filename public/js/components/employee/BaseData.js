import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';

export const BaseData = {
    components: {
        ModalDialog,
        Toast,
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        personUID: { type: String, required: true },
        writePermission: { type: Boolean, required: false },
    },
    setup(props) {

        const { t } = usePhrasen();
        const readonly = Vue.ref(true);

        const { personID } = Vue.toRefs(props);

        const url = Vue.ref("");

        const isFetching = Vue.ref(false);

        const dialogRef = Vue.ref();

        const sprache = Vue.inject('sprache');
        const nations = Vue.inject('nations');

        const GESCHLECHT = {
            w: 'weiblich', 
            m: 'männlich', 
            x: 'divers', 
            u: 'unbekannt'};

        const printNation = (code) => {
            if (!code) return '';
            let result = nations.value?.filter((item) => item.nation_code == code);
            if (result?.length > 0)
                return result[0].nation_text;
            return '';
        }

        
        const fetchData = async () => {
            if (personID.value==null) {                
                return;
            }
            isFetching.value = true
            try {
              const res = await Vue.$fhcapi.Person.personBaseData(personID.value);                    
              currentValue.value = res.data.retval[0];
            } catch (error) {
              console.log(error)              
            } finally {
                isFetching.value = false
            }          
        }

        const createShape = () => {
            return {
                uid: "",
                person_id: 0,
                kurzbz: "",
                aktiv: false,
                telefonklappe: "",
                alias: "",
                anrede: "",
                titelpre: "",
                titelpost: "",
                nachname: "",
                vorname: "",
                vornamen: "",
                geschlecht: "",
                staatsbuergerschaft: "A",
                geburtsnation: "A",
                sprache: "",
                anmerkung: "",
                homepage: "",
            } 
        }


        const currentValue = Vue.ref(createShape());
        const preservedValue = Vue.ref(createShape());        

        Vue.watch(personID, (currentVal, oldVal) => {  
            fetchData();         
        });

        const toggleMode = async () => {
            if (!readonly.value) {
                // cancel changes?
                if (hasChanged.value) {
                  const ok = await dialogRef.value.show();
                  if (ok) {
                    console.log("ok=", ok);
                    currentValue.value = preservedValue.value;
                  } else {
                    return
                  }
                }
              } else {
                // switch to edit mode and preserve data
                preservedValue.value = {...currentValue.value};
              }
              readonly.value = !readonly.value;
        }

        Vue.onMounted(() => {
            console.log('BaseData mounted', props.personID);
            currentValue.value = createShape();
            if (props.personID) {
                fetchData();
            }
            
        })

        // -------------
        // form handling
        // -------------

        const baseDataFrm = Vue.ref();

        const frmState = Vue.reactive({ nachnameBlured: false, geburtsdatumBlured: false, svnrBlured: false, wasValidated: false });

        const validNachname = (n) => {
            return !!n && n.trim() != "";
        }

        const validGeburtsdatum = (n) => {
            return !!n && n.trim() != "";
        }

        const validSVNR = (svnr) => {
            const weight = [3, 7, 9, 5, 8, 4, 2, 1, 6 ];
            if (svnr == undefined || svnr == '') return true;

            if (svnr.length != 10) return false;
//            var date_regex = /^(((0[1-9]|[12]|[13]\d|3[01])(0[13578]|1[02])(\d{2}))|((0[1-9]|[12]|[13]\d|30)(0[13456789]|1[012])(\d{2}))|((0[1-9]|1\d|2[0-8])02(\d{2}))|(2902((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/gm;
            // extract date
            var datum = svnr.substring(4);
            console.log('datum = ',datum);                   

            var nummer = svnr.substring(0,3);
            console.log('nummer:',nummer);

            var pruefzahl = svnr.substring(3,4);
            console.log('pruefzahl:', pruefzahl);
            
            let isValid = true; //date_regex.test(datum);

            if(isValid){   
                // calc checksum
                let sum = 0;
                let svnr_raw = nummer + datum;

                for (var i = 0; i < 9; i++) {
                    let prod = parseInt(svnr_raw.charAt(i)) * weight[i];
                    sum += prod;
                }

                let rest = sum % 11;
                console.log('rest:', rest);

                if (rest == pruefzahl) return true;
            } else {
                console.log('svnr datum invalid');
            }
            return false;
        }

        const save = async () => {
            console.log('haschanged: ', hasChanged);
            console.log('frmState: ', frmState);

            if (!baseDataFrm.value.checkValidity()) {

                console.log("form invalid");

            } else if (!hasChanged.value) {

                console.log("no changes detected. nothing to save.");

            } else {

                // submit
                try {
                    const response = await Vue.$fhcapi.Person.updatePersonBaseData(currentValue.value);                    
                    showToast();
                    currentValue.value = response.data.retval[0];
                    preservedValue.value = currentValue.value;
                    toggleMode();  
                } catch (error) {
                    console.log(error)              
                } finally {
                    isFetching.value = false
                }
               
            }

            frmState.wasValidated  = true;  
        }

        const submitFormHandler = (event) => {
        
            if (!baseDataFrm.value.checkValidity()) {
                console.log("form invalid!!!");
                event.preventDefault();
                event.stopPropagation();
            }

            console.log("form valid");
            //form.classList.add('was-validated');
        }

        const hasChanged = Vue.computed(() => {
            return Object.keys(currentValue.value).some(field => currentValue.value[field] !== preservedValue.value[field])
        });

        // Toast 
        const toastRef = Vue.ref();
        
        const showToast = () => {
            toastRef.value.show();
        }

        return {
            
            currentValue,
            readonly,
            frmState,
            dialogRef,
            toastRef,
            baseDataFrm,
            showToast, 
            sprache,
            GESCHLECHT,
            nations,

            save,
            toggleMode,  
            validNachname,    
            validGeburtsdatum,  
            validSVNR,    
            printNation,
            t,
        }
        
    },
    template: `
    <div class="row">
        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
          <Toast ref="toastRef">
            <template #body><h4>{{ t('person', 'stammdatenGespeichert') }}</h4></template>
          </Toast>
        </div>
    </div>
    
    <div class="row pt-md-4">      
         <div class="col">
             <div class="card">
                <div class="card-header">
                    <div class="h5 mb-0"><h5>{{ t('global', 'stammdaten') }}</h5></div>        
                </div>
                <div class="card-body">
                <div class="d-grid gap-2 d-md-flex justify-content-end ">
                    <button v-if="readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()">
                        <i class="fa fa-pen"></i>
                    </button>
                    <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="save()"><i class="fa fa-floppy-disk"></i></button>
                    <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()"><i class="fa fa-xmark"></i></button>
               </div>
               <form class="row g-3  col-lg-12" ref="baseDataFrm">
                
                <!-- Anrede -->
                <div class="col-lg-2 col-md-4">
                    <label for="anrede" class="form-label">{{ t('person','anrede') }}</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="anrede" v-model="currentValue.anrede">
                </div>
                <div class="col-lg-2 col-md-4">
                    <label for="titelPre" class="form-label">{{ t('person', 'titelpre') }}</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="titelPre" v-model="currentValue.titelpre">
                </div>
                <div class="col-lg-2 col-md-4">
                    <label for="titelPost" class="form-label">{{ t('person', 'titelpost' )}}</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="titelPost" v-model="currentValue.titelpost">
                </div>
                <div class="col-lg-6"></div>
                <!--Name -->
                <div class="col-lg-3 col-md-4">
                    <label for="nachname" class="required form-label">{{ t('person','nachname') }}</label>
                    <input type="text" required  @blur="frmState.nachnameBlured = true"  :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validNachname(currentValue.nachname) && frmState.nachnameBlured}" id="nachname" v-model="currentValue.nachname">
                    <div class="invalid-feedback" v-if="frmState.nachnameBlured && validNachname(currentValue.nachname)">
                      Bitte geben Sie den Nachnamen an.
                    </div>
                </div>
                <div class="col-lg-3 col-md-4">
                    <label for="vorname" class="form-label">{{ t('person','vorname') }}</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="vorname" v-model="currentValue.vorname">
                </div>
                <div class="col-lg-2 col-md-4">
                    <label for="vornamen" class="form-label">{{ t('person','vornamen') }}</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="vornamen" v-model="currentValue.vornamen">
                </div>
                <div class="col-lg-4"></div>
    
                <!-- Staatsbürgerschaft, etc. -->
                <div class="col-lg-2 col-md-3">
                    <label for="staatsbuergerschaft" class="form-label">{{ t('person','staatsbuergerschaft') }}</label>                
                    <select v-if="!readonly" id="staatsbuergerschaft" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="currentValue.staatsbuergerschaft" >
                        <option v-for="(item, index) in nations" :value="item.nation_code">
                            {{ item.nation_text }}
                        </option>
                    </select>
                    <input v-else type="text"  :readonly="readonly" class="form-control-sm form-control-plaintext" id="staatsbuergerschaft" :value="printNation(currentValue.staatsbuergerschaft)">
                </div>
                <div class="col-lg-2 col-md-3">
                        <label for="geburtsnation" class="form-label">{{ t('person','geburtsnation') }}</label>
                        <select v-if="!readonly" id="geburtsnation" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="currentValue.geburtsnation" >
                            <option v-for="(item, index) in nations" :value="item.nation_code">
                                {{ item.nation_text }}
                            </option>
                        </select>
                        <input v-else type="text" readonly class="form-control-sm form-control-plaintext"  id="geburtsnation" :value="printNation(currentValue.geburtsnation)" >
                </div>
                <div class="col-lg-2 col-md-3">
                    <label for="sprache" class="form-label">{{ t('person','sprache') }}</label><br>
                    <select v-if="!readonly" id="sprache" :readonly="readonly"  v-model="currentValue.sprache" class="form-select form-select-sm" aria-label=".form-select-sm " >
                        <option value="">-- {{ t('fehlermonitoring', 'keineAuswahl') }} --</option>
                        <option v-for="(item, index) in sprache" :value="item.sprache">
                            {{ item.sprache }}
                        </option>         
                    </select>
                    <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="sprache" v-model="currentValue.sprache">
    
                </div>
                <div class="col-lg-6 col-md-3"></div>
                
                <!-- Geschlecht -->
                <div class="col-lg-2 col-md-3">
                    <label for="geschlecht" class="form-label">{{ t('person', 'geschlecht') }}</label><br>
                    <select v-if="!readonly" id="geschlecht" v-model="currentValue.geschlecht" class="form-select form-select-sm" aria-label=".form-select-sm " >
                        <option value="w">weiblich</option>
                        <option value="m">männlich</option>
                        <option val4e="x">divers</option>
                        <option value="u">unbekannt</option>
                    </select>
                    <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="geschlecht" :value="GESCHLECHT[currentValue.geschlecht]">
                </div>
    
                <div class="col-lg-2 col-md-3">
                    <label for="geburtsdatum" class="required form-label">{{ t('person', 'geburtsdatum') }}</label>
                    <input type="date" :readonly="readonly" @blur="frmState.geburtsdatumBlured = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validGeburtsdatum(currentValue.gebdatum) && frmState.geburtsdatumBlured}" id="geburtsdatum" v-model="currentValue.gebdatum">
                </div>
    
                <div class="col-lg-2 col-md-3">
                    <label for="svnr" class="form-label">{{ t('person', 'svnr') }}</label>
                    <input type="text" :readonly="readonly" @blur="frmState.svnrBlured = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validSVNR(currentValue.svnr) && frmState.svnrBlured}" id="svnr" v-model="currentValue.svnr">
                </div>
    
                <div class="col-lg-2 col-md-3">
                        <label for="ersatzkennzeichen" class="form-label">{{ t('person', 'ersatzkennzeichen') }}</label>
                        <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="ersatzkennzeichen" v-model="currentValue.ersatzkennzeichen">
                </div>
    
                <div class="col-lg-4">
                    
                </div>
                
                
                
                <!-- -->
                <div class="col-lg-6">
                    <label for="inputAddress" class="form-label">{{ t('global', 'anmerkung') }}</label>
                    <textarea type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="anmerkungen" v-model="currentValue.anmerkung">
                    </textarea>
                </div>
    
                
                
                <!-- changes -->
                <div class="col-8">
                    <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
                </div>
                
    
            </form>
            </div>
             </div>
        </div>   
    </div>

    <ModalDialog :title="t('global', 'warnung')" ref="dialogRef">
      <template #body>
        {{ t('person','stammdatenNochNichtGespeichert') }}
      </template>
    </ModalDialog>

    `
}
