import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';

export const EmployeeData= {
    components: {
        ModalDialog,
        Toast,
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        writePermission: { type: Boolean, required: false },
    },
    setup(props) {

        const readonly = Vue.ref(true);

        const { personID } = Vue.toRefs(props);

        const url = Vue.ref("");

        const isFetching = Vue.ref(false);

        const dialogRef = Vue.ref();

        const ausbildung = Vue.inject('ausbildung');
        const standorte = Vue.inject('standorte');
        const orte = Vue.inject('orte');

        const generateEndpointURL = (person_id) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/personEmployeeData?person_id=${person_id}`;
        };

        const fetchData = async () => {
            if (personID.value==null) {                
                return;
            }
            isFetching.value = true
            try {
              console.log('url',url.value);
              const res = await fetch(url.value);
              let response = await res.json()              
              currentValue.value = response.retval[0];
              isFetching.value = false              
            } catch (error) {
              console.log(error)
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
                stundensatz: "0.00",
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
            url.value = generateEndpointURL(currentVal);   
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
            url.value = generateEndpointURL(props.personID); 
            fetchData();
            console.log("EmployeeData mounted");
        })

        const getAusbildungbez = (code) => {
            if (!code) return '';
            let result = ausbildung?.filter((item) => item.ausbildungcode == code);
            if (result.length > 0)
                return result[0].ausbildungbez;
            return '';
        }

        const getStandortbez = (standort_id) => {
            if (!standort_id) return '';
            let result = standorte?.filter((item) => item.standort_id == standort_id);
            if (result.length > 0)
                return result[0].bezeichnung;
            return '';
        }

    

        // -------------
        // form handling
        // -------------

        const employeeDataFrm = Vue.ref();

        const frmState = Vue.reactive({ nachnameBlured: false, geburtsdatumBlured: false, wasValidated: false });

        const validNachname = (n) => {
            return !!n && n.trim() != "";
        }

        const validGeburtsdatum = (n) => {
            return !!n && n.trim() != "";
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
                isFetching.value = true
                let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

                const endpoint =
                    `${full}/extensions/FHC-Core-Personalverwaltung/api/updatePersonEmployeeData`;

                const res = await fetch(endpoint,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(currentValue.value),
                });    

                if (!res.ok) {
                    isFetching.value = false;
                    const message = `An error has occured: ${res.status}`;
                    throw new Error(message);
                }
                let response = await res.json();
            
                isFetching.value = false;

                showToast();
                currentValue.value = response.retval[0];
                preservedValue.value = currentValue.value;
                toggleMode();
            }

            frmState.wasValidated  = true;  
        }

        const submitFormHandler = (event) => {
        
            if (!employeeDataFrm.value.checkValidity()) {
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
            employeeDataFrm,
            showToast, 
            ausbildung,
            standorte,
            orte,

            save,
            toggleMode,  
            validNachname,    
            getAusbildungbez,
            getStandortbez,
            readonlyBlocker,
        }

    },
    template: `
    <div class="row">

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="toastRef">
                <template #body><h4>Mitarbeiterdaten gespeichert.</h4></template>
            </Toast>
        </div>

        <div class="d-flex bd-highlight">
            <div class="flex-grow-1 bd-highlight"><h4>Mitarbeiterdaten</h4></div>        
            <div class="p-2 bd-highlight">
            <div class="d-grid gap-2 d-md-flex justify-content-end ">
                <button v-if="readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()">
                    <i class="fa fa-pen"></i>
                </button>
                <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()"><i class="fa fa-minus"></i></button>
                <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="save()"><i class="fa fa-floppy-disk"></i></button>
            </div>

            </div>
        </div>

    
    </div>
    <div class="col-md-12 d-flex justify-content-between flex-wrap flex-md-nowrap align-items-start pt-3 pb-2 mb-3">

        <form class="row g-3" ref="employeeDataFrm">
            <div class="col-md-2">
                <label for="personalnummer" class="form-label">Personalnummer</label>
                <input type="text" readonly class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="personalnummer" v-model="currentValue.personalnummer">
            </div>            
            <div class="col-md-2">
                <label for="kurzbezeichnung" class="form-label">Kurzbezeichnung</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="kurzbezeichnung" v-model="currentValue.kurzbz">
            </div>
            <div class="col-md-4">
                <label for="alias" class="form-label">Alias</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="alias" v-model="currentValue.alias">
            </div>
            <div class="col-md-4"></div>
            <!--  -->
            <div class="col-md-2">
                <label for="stundensatz" class="form-label">Stundensatz</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="stundensatz" v-model="currentValue.stundensatz">
            </div>
            <div class="col-md-2">
                <label for="telefonklappe" class="form-label">Telefonklappe</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="telefonklappe" v-model="currentValue.telefonklappe">
            </div>
            <div class="col-md-4">
                <label for="ausbildung" class="form-label">Ausbildung</label>
                <select v-if="!readonly" id="ausbildung" :readonly="readonly"  v-model="currentValue.ausbildungcode" class="form-select form-select-sm" aria-label=".form-select-sm " >
                    <option value="">-- keine Auswahl --</option>
                    <option v-for="(item, index) in ausbildung" :value="item.ausbildungcode">
                        {{ item.ausbildungbez }}
                    </option>         
                </select>
                <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="ausbildung" :value="getAusbildungbez(currentValue.ausbildungcode) ">
            </div>
            <div class="col-md-4"></div>
            <!--Location -->
            <div class="col-md-4">
                <label for="office" class="form-label">Büro</label>
                <select v-if="!readonly" id="office" :readonly="readonly"  v-model="currentValue.ort_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " >
                    <option value="">-- keine Auswahl --</option>
                    <option v-for="(item, index) in orte" :value="item.ort_kurzbz">
                        {{ item.ort_kurzbz }}
                    </option>         
                </select>
                <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="office" :value="currentValue.ort_kurzbz">
            </div>
            <div class="col-md-4">
                <label for="standort" class="form-label">Standort</label>
                <select v-if="!readonly" id="standort" :readonly="readonly"  v-model="currentValue.standort_id" class="form-select form-select-sm" aria-label=".form-select-sm " >
                    <option value="0">-- keine Auswahl --</option>
                    <option v-for="(item, index) in standorte" :value="item.standort_id">
                        {{ item.bezeichnung }}
                    </option>         
                </select>
                <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="standort" :value="getStandortbez(currentValue.standort_id) ">
            </div>
            <div class="col-md-4">
            </div>
            <!-- -->
            <div class="col-4">
                <label for="anmerkung" class="form-label">Anmerkung</label>
                <textarea type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" v-model="currentValue.anmerkung">
                </textarea>
            </div>
            <div class="col-4">
                <label for="status" class="form-label">Status</label>
                <div class="form-check">
                    <label for="aktiv" class="form-check-label">Aktiv</label>
                    <input class="form-check-input" :readonly="readonly" @click="readonlyBlocker" type="checkbox" id="aktiv" v-model="currentValue.aktiv">
                </div>
                <div class="form-check">
                    <label for="lektor" class="form-check-label">LektorIn</label>
                    <input class="form-check-input" :readonly="readonly" @click="readonlyBlocker" type="checkbox" id="lektor" v-model="currentValue.lektor">
                </div>
                <div class="form-check">
                    <label for="fixangestellt" class="form-check-label">Fixangestellt</label>
                    <input class="form-check-input"  :readonly="readonly" @click="readonlyBlocker" type="checkbox" id="fixangestellt" v-model="currentValue.fixangestellt">
                </div>
                <div class="form-check">
                    <label for="bismelden" class="form-check-label" >Bismelden</label>
                    <input class="form-check-input"  :readonly="readonly"  @click="readonlyBlocker" type="checkbox" id="bismelden" v-model="currentValue.bismelden">
                </div>
            </div>
            <div class="col-4"></div>
            <!-- changes -->
            <div class="col-8">
                <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
            </div>
        </form>
        
    </div>


    <ModalDialog title="Warnung" ref="dialogRef">
      <template #body>
        Mitarbeiterdaten schließen? Geänderte Daten gehen verloren!
      </template>
    </ModalDialog
    `
}