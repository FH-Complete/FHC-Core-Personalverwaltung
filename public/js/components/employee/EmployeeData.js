import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';


export const EmployeeData= {
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
    emits: ['updateHeader'],
    setup(props, { emit }) {

        const readonly = Vue.ref(true);
        const { t } = usePhrasen();

        const { personID } = Vue.toRefs(props);

        const url = Vue.ref("");

        const isFetching = Vue.ref(false);

        const dialogRef = Vue.ref();

        const ausbildung = Vue.inject('ausbildung');
        const standorte = Vue.inject('standorte');
        const orte = Vue.inject('orte');
        const validKurzbz = Vue.ref(true);

        const fetchData = async () => {
            if (personID.value==null) {                
                return;
            }
            isFetching.value = true;
            try {
              const res = await Vue.$fhcapi.Person.personEmployeeData(personID.value);                    
              currentValue.value = res.data.retval[0];
            } catch (error) {
              console.log(error)              
            } finally {
                isFetching.value = false
            }   
          }

          const createShape = () => {
            return {
                mitarbeiter_uid: "",
                personalnummer: 0,
                telefonklappe: "",
                kurzbz: "",
                lektor: false,
                fixangestellt: false,
                stundensatz: "0.00",   // deprecated
                ausbildungcode: null,
                ort_kurzbz: "",
                ext_id: 0,
                anmerkung: null,
                bismelden: true,
                standort_id: null,
                kleriker: false,
                aktiv: false,
                insertamum: "",
                insertvon: "",
                updatevon: "",
                updateamum: ""
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
            currentValue.value = createShape();
            if (props.personID) {
                fetchData();
            }
            console.log("EmployeeData mounted", props.personID);
        })

        const getAusbildungbez = (code) => {
            if (!code) return '';
            let result = ausbildung.value?.filter((item) => item.ausbildungcode == code);
            if (result?.length > 0)
                return result[0].ausbildungbez;
            return '';
        }

        const getStandortbez = (standort_id) => {
            if (!standort_id) return '';
            let result = standorte.value?.filter((item) => item.standort_id == standort_id);
            if (result?.length > 0)
                return result[0].bezeichnung;
            return '';
        }

    

        // -------------
        // form handling
        // -------------

        const employeeDataFrm = Vue.ref();

        const frmState = Vue.reactive({ nachnameBlured: false, kurzbzBlured: false, wasValidated: false });

        const validNachname = (n) => {
            return !!n && n.trim() != "";
        }

        const validateKurzbz = () => {

                if (!!currentValue.value.kurzbz && currentValue.value.kurzbz.trim() != "") {

                    console.log('validateKurzbz: ', currentValue.value.mitarbeiter_uid, currentValue.value.kurzbz)
                    isFetching.value = true;

                    try {
                        Vue.$fhcapi.Person.personEmployeeKurzbzExists(currentValue.value.mitarbeiter_uid, currentValue.value.kurzbz).then((res) => {
                            if (res.data.error == 1) {
                                console.error("error checking kurzbz", res.data.msg)
                            } else {                                
                                validKurzbz.value = !res.data.retval
                            }
                        })
                        
                    } catch (error) {
                        console.log(error)              
                    } finally {
                        isFetching.value = false
                    }   
                }
                
        }
        

        const readonlyBlocker = (e) => {
            if (readonly.value) e.preventDefault();
        }

        const save = async () => {
            console.log('haschanged: ', hasChanged);
            console.log('frmState: ', frmState);

            if (!employeeDataFrm.value.checkValidity()) {

                console.log("form invalid");

            } else if (!hasChanged.value) {

                    console.log("no changes detected. nothing to save.");                

            } else {

                // submit
                try {
                    const response = await Vue.$fhcapi.Person.updatePersonEmployeeData(currentValue.value);                    
                    showToast();
                    currentValue.value = response.data.retval[0];
                    preservedValue.value = currentValue.value;
                    emit('updateHeader')
                    toggleMode();  
                } catch (error) {
                    console.log(error)              
                } finally {
                    isFetching.value = false
                }
                
            }

            frmState.wasValidated  = true;  
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
            employeeDataFrm,
            showToast, 
            ausbildung,
            standorte,
            orte,
            validKurzbz,

            save,
            toggleMode,  
            validNachname, 
            validateKurzbz,   
            getAusbildungbez,
            getStandortbez,
            readonlyBlocker,
            t,
        }

    },
    template: `
    <div class="row">
        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="toastRef">
                <template #body><h4>{{ t('person','mitarbeiterdatenGespeichert') }}</h4></template>
            </Toast>
        </div>
    </div>

   <div class="row pt-md-4">      
             <div class="col">
                 <div class="card">
                    <div class="card-header">
                        <div class="h5"><h5>{{ t('person','mitarbeiterdaten') }}</h5></div>        
                    </div>
                    <div class="card-body">
                        <div class="d-grid gap-2 d-md-flex justify-content-end ">
                                <button v-if="readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()">
                                    <i class="fa fa-pen"></i>
                                </button>
                                <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="save()"><i class="fa fa-floppy-disk"></i></button>
                                <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()"><i class="fa fa-xmark"></i></button>
                        </div>
                        <form class="row g-3" ref="employeeDataFrm">
                            <div class="col-md-2">
                                <label for="personalnummer" class="form-label">{{ t('global','personalnummer') }}</label>
                                <input type="text" readonly class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="personalnummer" v-model="currentValue.personalnummer">
                            </div>            
                            <div class="col-md-2">
                                <label for="kurzbezeichnung" class="form-label">{{ t('gruppenmanagement','kurzbezeichnung') }}</label>
                                <input type="text" :readonly="readonly" @blur="frmState.kurzbzBlured = true" @input="validateKurzbz()" class="form-control-sm" maxlength="8" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validKurzbz && frmState.kurzbzBlured }" id="kurzbezeichnung" v-model="currentValue.kurzbz">
                                <div class="invalid-feedback" v-if="!validKurzbz">
                                    Kurzbezeichnung existiert bereits. 
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label for="alias" class="form-label">{{ t('person','alias') }}</label>
                                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="alias" v-model="currentValue.alias">
                            </div>
                            <div class="col-md-4"></div>
                            <!--  -->
                            <div class="col-md-2">
                                <label for="office" class="form-label">{{ t('person','buero') }}</label>
                                <select v-if="!readonly" id="office" :readonly="readonly"  v-model="currentValue.ort_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " >
                                    <option value="">-- {{ t('fehlermonitoring', 'keineAuswahl') }} --</option>
                                    <option v-for="(item, index) in orte" :value="item.ort_kurzbz">
                                        {{ item.ort_kurzbz }}
                                    </option>         
                                </select>
                            <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="office" :value="currentValue.ort_kurzbz">
                            </div>
                            <div class="col-md-2">
                                <label for="telefonklappe" class="form-label">{{ t('person','telefonklappe') }}</label>
                                <input type="text" :readonly="readonly" class="form-control-sm" maxlength="8" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="telefonklappe" v-model="currentValue.telefonklappe">
                            </div>
                            <div class="col-md-4">
                                <label for="ausbildung" class="form-label">{{ t('person','ausbildung') }}</label>
                                <select v-if="!readonly" id="ausbildung" :readonly="readonly"  v-model="currentValue.ausbildungcode" class="form-select form-select-sm" aria-label=".form-select-sm " >
                                    <option value="">-- {{ t('fehlermonitoring', 'keineAuswahl') }} --</option>
                                    <option v-for="(item, index) in ausbildung" :value="item.ausbildungcode">
                                        {{ item.ausbildungbez }}
                                    </option>         
                                </select>
                                <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="ausbildung" :value="getAusbildungbez(currentValue.ausbildungcode) ">
                            </div>
                            <div class="col-md-4"></div>
                            <!--Location -->       
                            
                            <div class="col-md-4">
                                <div class="row gy-3">    
                                    <div class="col-12">                 
                                        <label for="standort" class="form-label">{{ t('person','standort') }}</label>
                                        <select v-if="!readonly" id="standort" :readonly="readonly"  v-model="currentValue.standort_id" class="form-select form-select-sm" aria-label=".form-select-sm " >
                                            <option value="0">-- {{ t('fehlermonitoring', 'keineAuswahl') }} --</option>
                                            <option v-for="(item, index) in standorte" :value="item.standort_id">
                                                {{ item.bezeichnung }}
                                            </option>         
                                        </select>
                                        <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="standort" :value="getStandortbez(currentValue.standort_id) ">
                                    </div>
                                    <div class="col-12">
                                        <label for="anmerkung" class="form-label">{{ t('global', 'anmerkung') }}</label>
                                        <textarea type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" v-model="currentValue.anmerkung">
                                        </textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-8">

                                <label for="status" class="form-label">{{ t('global','status') }}</label>
                                <div class="form-check">
                                    <label for="aktiv" class="form-check-label">{{ t('global','aktiv') }}</label>
                                    <input class="form-check-input" :readonly="readonly" @click="readonlyBlocker" type="checkbox" id="aktiv" v-model="currentValue.aktiv">
                                </div>
                                <div class="form-check">
                                    <label for="lektor" class="form-check-label">{{ t('lehre','lektor') }}</label>
                                    <input class="form-check-input" :readonly="readonly" @click="readonlyBlocker" type="checkbox" id="lektor" v-model="currentValue.lektor">
                                </div>
                                <div class="form-check">
                                    <label for="fixangestellt" class="form-check-label">{{ t('person','fixangestellt') }}</label>
                                    <input class="form-check-input"  :readonly="readonly" @click="readonlyBlocker" type="checkbox" id="fixangestellt" v-model="currentValue.fixangestellt">
                                </div>
                                <div class="form-check">
                                    <label for="bismelden" class="form-check-label" >{{ t('person','bismelden') }}</label>
                                    <input class="form-check-input"  :readonly="readonly"  @click="readonlyBlocker" type="checkbox" id="bismelden" v-model="currentValue.bismelden">
                                </div>

                            </div>
                            <!-- -->
                            
                            <div class="col-4">
                                
                            </div>
                            <div class="col-4"></div>
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
        {{ t('t','mitarbeiterdatenGeandert') }}
      </template>
    </ModalDialog>
    `
}