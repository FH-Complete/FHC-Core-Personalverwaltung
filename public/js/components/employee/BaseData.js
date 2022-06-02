const BaseData = {
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

        const sprache = Vue.inject('sprache');

        const GESCHLECHT = {
            w: 'weiblich', 
            m: 'männlich', 
            x: 'divers', 
            u: 'unbekannt'};

        const generateEndpointURL = (person_id) => {
            let full =
                (location.port == "3000" ? "https://" : location.protocol) +
                "//" +
                location.hostname +
                ":" +
                (location.port == "3000" ? 8080 : location.port); // hack for dev mode
            return `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/personBaseData?person_id=${person_id}`;
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
                uids: "",
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
                sprache: "",
                anmerkung: "",
                homepage: "",
            } 
        }


        let fakeEmployee = {
            uids: "jonconnor",
            person_id: 243,
            kurzbz: "jonconnor",
            aktiv: true,
            alias: "",
            anrede: "Hofrat",
            titelpre: "Dr",
            titelpost: "",
            nachname: "Conner",
            vorname: "Jon",
            vornamen: "",
            geschlecht: "m",
            sprache: "",
            anmerkung: "",
            homepage: "",
        };

        const currentValue = Vue.ref(createShape());
        const preservedValue = Vue.ref(createShape());

        Vue.watch(personID, (currentVal, oldVal) => {
            console.log('BaseData watch',currentVal);
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
            console.log('BaseData mounted', props.personID);
            currentValue.value = createShape();
            url.value = generateEndpointURL(props.personID); 
            fetchData();
            
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

            } else {

                // submit
                isFetching.value = true
                let full =
                    (location.port == "3000" ? "https://" : location.protocol) +
                    "//" +
                    location.hostname +
                    ":" +
                    (location.port == "3000" ? 8080 : location.port); // hack for dev mode

                const endpoint =
                    `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/updatePersonBaseData`;

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
                preservedValue.value = currentValue.value;
                toggleMode();
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

            save,
            toggleMode,  
            validNachname,    
            validGeburtsdatum,  
            validSVNR,    
        }
        
    },
    template: `
    <div class="row">

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
          <Toast ref="toastRef">
            <template #body><h4>Stammdaten gespeichert.</h4></template>
          </Toast>
        </div>

      <div class="d-flex bd-highlight">
        <div class="flex-grow-1 bd-highlight"><h4>Stammdaten</h4></div>        
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

        <form class="row g-3  col-md-12" ref="baseDataFrm">
            <div class="col-md-3">
                <label for="uid" class="form-label">UID <i>(person_id={{personID}})</i></label>
                <input type="text"  readonly class="form-control-sm form-control-plaintext" id="uid" v-model="currentValue.uids">
            </div>
            <div class="col-md-3">
                    <label for="ersatzkennzeichen" class="form-label">Ersatzkennzeichen</label>
                    <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="ersatzkennzeichen" v-model="currentValue.ersatzkennzeichen">
            </div>
            <div class="col-md-3">
                <label for="status" class="form-label">Status</label>
                <div v-if="!readonly" class="form-check">
                    <label for="aktiv" class="form-check-label">Aktiv</label>
                    <input class="form-check-input" type="checkbox" id="aktiv" v-model="currentValue.aktiv">
                </div>
                <div v-if="readonly" class="form-label">
                    
                    <input v-if="currentValue.aktiv" type="text" readonly class="form-control-sm form-control-plaintext" id="statusField" value="aktiv">
                    <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="statusField" value="">
                    
                </div>
            </div>
            <div class="col-md-3"></div>
            <!-- Anrede -->
            <div class="col-md-2">
                <label for="anrede" class="form-label">Anrede</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="anrede" v-model="currentValue.anrede">
            </div>
            <div class="col-md-2">
                <label for="titelPre" class="form-label">TitelPre</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="titelPre" v-model="currentValue.titelpre">
            </div>
            <div class="col-md-2">
                <label for="titelPost" class="form-label">TitelPost</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="titelPost" v-model="currentValue.titelpost">
            </div>
            <div class="col-md-6"></div>
            <!--Name -->
            <div class="col-md-3">
                <label for="nachname" class="required form-label">Nachname</label>
                <input type="text" required  @blur="frmState.nachnameBlured = true"  :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validNachname(currentValue.nachname) && frmState.nachnameBlured}" id="nachname" v-model="currentValue.nachname">
                <div class="invalid-feedback" v-if="frmState.nachnameBlured && validNachname(currentValue.nachname)">
                  Bitte geben Sie den Nachnamen an.
                </div>
            </div>
            <div class="col-md-3">
                <label for="vorname" class="form-label">Vorname</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="vorname" v-model="currentValue.vorname">
            </div>
            <div class="col-md-3">
                <label for="vornamen" class="form-label">Vornamen</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="vornamen" v-model="currentValue.vornamen">
            </div>
            <div class="col-md-3"></div>
            
            <!-- Geschlecht -->
            <div class="col-md-3">
                <label for="geschlecht" class="form-label">Geschlecht</label><br>
                <select v-if="!readonly" id="geschlecht" v-model="currentValue.geschlecht" class="form-select form-select-sm" aria-label=".form-select-sm " >
                    <option value="w">weiblich</option>
                    <option value="m">männlich</option>
                    <option value="x">divers</option>
                    <option value="u">unbekannt</option>
                </select>
                <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="geschlecht" :value="GESCHLECHT[currentValue.geschlecht]">
            </div>

            <div class="col-md-3">
                <label for="geburtsdatum" class="required form-label">Geburtsdatum</label>
                <input type="date" :readonly="readonly" @blur="frmState.geburtsdatumBlured = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validGeburtsdatum(currentValue.gebdatum) && frmState.geburtsdatumBlured}" id="geburtsdatum" v-model="currentValue.gebdatum">
            </div>

            <div class="col-md-3">
                <label for="svnr" class="form-label">SVNR</label>
                <input type="text" :readonly="readonly" @blur="frmState.svnrBlured = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validSVNR(currentValue.svnr) && frmState.svnrBlured}" id="svnr" v-model="currentValue.svnr">
            </div>

            <div class="col-md-3">
                <label for="sprache" class="form-label">Sprache</label><br>
                <select v-if="!readonly" id="sprache" :readonly="readonly"  v-model="currentValue.sprache" class="form-select form-select-sm" aria-label=".form-select-sm " >
                    <option value="">-- keine Auswahl --</option>
                    <option v-for="(item, index) in sprache" :value="item.sprache">
                        {{ item.sprache }}
                    </option>         
                </select>
                <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="sprache" v-model="currentValue.sprache">
            </div>
            
            
            <div class="col-md-8"></div>
            <!-- -->
            <div class="col-6">
                <label for="inputAddress" class="form-label">Anmerkung</label>
                <textarea type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="anmerkungen" v-model="currentValue.anmerkung">
                </textarea>
            </div>
            

        </form>

         
        
    </div>

    <ModalDialog title="Warnung" ref="dialogRef">
      <template #body>
        Stammdaten schließen? Geänderte Daten gehen verloren!
      </template>
    </ModalDialog>

    `
}
