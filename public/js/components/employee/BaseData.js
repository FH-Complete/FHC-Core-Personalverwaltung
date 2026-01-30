import { ModalDialog } from '../ModalDialog.js';
import { usePhrasen } from '../../../../../js/mixins/Phrasen.js';
import ApiPerson from '../../api/factory/person.js';

export const BaseData = {
	name: 'BaseData',
    components: {
        ModalDialog,
        "datepicker": VueDatePicker
    },
    props: {
        modelValue: { type: Object, default: () => ({}), required: false},
        config: { type: Object, default: () => ({}), required: false},
        personID: { type: Number, required: false },
        personUID: { type: String, required: false },
        writePermission: { type: Boolean, required: false },
    },
    emits: ['updateHeader'],
    setup(props, { emit }) {

        const $api = Vue.inject('$api')
        const $fhcAlert = Vue.inject('$fhcAlert');
        const { t } = usePhrasen();
        const readonly = Vue.ref(true);

        const { personID } = Vue.toRefs(props);

        const theModel = Vue.computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        });

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

        const printLanguage =  (code) => {
            const userLanguageMap = ['German','English','Espanol','Magyar']
            
            if (!code) return ''
            let languageIndex = userLanguageMap.findIndex((item) => item == FHC_JS_DATA_STORAGE_OBJECT.user_language)
            let result = sprache.value?.filter((item) => item.sprache == code)
            if (result?.length > 0) {
                return result[0].bezeichnung[languageIndex]
            }
            return '?'
        }

        
        const fetchData = async () => {
            if (theModel.value.personID==null && props.personID==null) {                
                return;
            }
            isFetching.value = true
            try {
              const res = await $api.call(ApiPerson.personBaseData(theModel.value.personID || personID.value));
              currentValue.value = res.data[0];
            } catch (error) {
              $fhcAlert.handleSystemError(error)                   
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

        Vue.watch(theModel, (currentVal, oldVal) => {
            console.log('BaseData: theModel changed: ', currentVal);
        })

        const toggleMode = async () => {
            if (!readonly.value) {
                // cancel changes?
                if (hasChanged.value) {
                  if (await $fhcAlert.confirm({
                        message: t('person','stammdatenNochNichtGespeichert'),
                        acceptLabel: 'OK',
				        acceptClass: 'p-button-danger'
                    }) === false) {
                    return;
                  }     
                  currentValue.value = preservedValue.value;     
                }
              } else {
                // switch to edit mode and preserve data
                preservedValue.value = {...currentValue.value};
              }
              readonly.value = !readonly.value;
        }

        Vue.onMounted(() => {
            console.log('BaseData mounted', props.personID, theModel);
            currentValue.value = createShape();
            if (theModel.value?.personID || props.personID) {
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

            var nummer = svnr.substring(0,3);

            var pruefzahl = svnr.substring(3,4);
            
            let isValid = true;

            if(isValid){   
                // calc checksum
                let sum = 0;
                let svnr_raw = nummer + datum;

                for (var i = 0; i < 9; i++) {
                    let prod = parseInt(svnr_raw.charAt(i)) * weight[i];
                    sum += prod;
                }

                let rest = sum % 11;

                if (rest == pruefzahl) return true;
            } else {
                console.log('svnr datum invalid');
            }
            return false;
        }

        const save = async () => {

            if (!baseDataFrm.value.checkValidity()) {

                console.log("form invalid");

            } else if (!hasChanged.value) {

                console.log("no changes detected. nothing to save.");

            } else {

                // submit
                try {
                    const res = await $api.call(ApiPerson.updatePersonBaseData(currentValue.value));                  
                    showToast();
                    currentValue.value = res.data[0];
                    preservedValue.value = currentValue.value;
                    theModel.value.updateHeader();
                    toggleMode();  
                } catch (error) {
                    $fhcAlert.handleSystemError(error)             
                } finally {
                    isFetching.value = false
                }
               
            }

            frmState.wasValidated  = true;  
        }

        const hasChanged = Vue.computed(() => {
            return Object.keys(currentValue.value).some(field => currentValue.value[field] !== preservedValue.value[field])
        });
        
        const showToast = () => {
            $fhcAlert.alertSuccess(t('person','stammdatenGespeichert'))
        }

        const readonlyBlocker = (e) => {
            if (readonly.value) e.preventDefault();
        }

        return {
            
            currentValue,
            readonly,
            frmState,
            dialogRef,
            baseDataFrm,
            sprache,
            GESCHLECHT,
            nations,  
            theModel,
            t,
            readonlyBlocker,
            save,
            toggleMode,  
            validNachname,    
            validGeburtsdatum,  
            validSVNR,    
            printNation,
            printLanguage,
        }
        
    },
    template: `
    <div class="row pt-md-4">      
         <div class="col">
             <div class="card">
                <div class="card-header">
                    <div class="h5 mb-0"><h5>{{ t('global', 'stammdaten') }}</h5></div>        
                </div>
                <div class="card-body">
                <div class="d-grid gap-2 d-md-flex justify-content-end " v-if="!theModel.restricted">
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
                <div class="col-lg-4"></div>
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
                            {{ item.bezeichnung[0] }}
                        </option>         
                    </select>
                    <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="sprache" :value="printLanguage(currentValue.sprache)">
    
                </div>
                <div class="col-lg-6 col-md-3"></div>
                
                <!-- Geschlecht -->
                <div class="col-lg-2 col-md-3">
                    <label for="geschlecht" class="form-label">{{ t('person', 'geschlecht') }}</label><br>
                    <select v-if="!readonly" id="geschlecht" v-model="currentValue.geschlecht" class="form-select form-select-sm" aria-label=".form-select-sm " >
                        <option value="w">weiblich</option>
                        <option value="m">männlich</option>
                        <option value="x">divers</option>
                        <option value="u">unbekannt</option>
                    </select>
                    <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="geschlecht" :value="GESCHLECHT[currentValue.geschlecht]">
                </div>
    
                <div class="col-lg-2 col-md-3">
                    <label for="geburtsdatum" class="required form-label">{{ t('person', 'geburtsdatum') }}</label>
                    <template v-if="readonly">
                        <input type="date" readonly class="form-control-sm form-control-plaintext" v-model="currentValue.gebdatum" id="geburtsdatum" >
                    </template>
                    <template v-else>
                        <datepicker id="geburtsdatum"
                            @blur="frmState.geburtsdatumBlured = true" 
                            :input-class-name="(!validGeburtsdatum(currentValue.gebdatum) && frmState.geburtsdatumBlured) ? 'dp-invalid-input' : ''" 
                            v-model="currentValue.gebdatum"
                            v-bind:enable-time-picker="false"
                            text-input 
                            locale="de"
                            format="dd.MM.yyyy"
                            auto-apply 
                            model-type="yyyy-MM-dd"></datepicker>
                    </template>
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

    `
}


export default BaseData;
