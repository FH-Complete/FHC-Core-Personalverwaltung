const BankData = {
    components: {
        ModalDialog,
        Toast,
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        writePermission: { type: Boolean, required: false },
    },
    setup( props ) {

        const readonly = Vue.ref(true);

        const { personID } = Vue.toRefs(props);

        const dialogRef = Vue.ref();

        const url = Vue.ref("");

        const isFetching = Vue.ref(false);

        const generateEndpointURL = (person_id) => {
            let full =
                (location.port == "3000" ? "https://" : location.protocol) +
                "//" +
                location.hostname +
                ":" +
                (location.port == "3000" ? 8080 : location.port); // hack for dev mode
            return `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/personBankData?person_id=${person_id}`;
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
                anschrift: "",
                person_id: 0,
                name: "",
                iban: "",
                bic: "",  
                blz: "",
                kontonr: "",              
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
            console.log('BankData mounted', props.personID);
            currentValue.value = createShape();
            url.value = generateEndpointURL(props.personID); 
            fetchData();
            
        })



        // -------------
        // form handling
        // -------------

        const bankDataFrm = Vue.ref();

        const frmState = Vue.reactive({ ibanBlured: false, bankBlured: false, wasValidated: false });

        const validIban = (n) => {
            return !!n && n.trim() != "";
        }

        const validBank = (n) => {
            return !!n && n.trim() != "";
        }

        // save
        const save = async () => {
            console.log('haschanged: ', hasChanged);
            console.log('frmState: ', frmState);

            if (!bankDataFrm.value.checkValidity()) {

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
                    `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/updatePersonBankData`;

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
            bankDataFrm,
            showToast, // test

            save,
            toggleMode,  
            validIban,  
            validBank,
         }
    },
    template: `
    <div class="row">

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
          <Toast ref="toastRef">
            <template #body><h4>Bankdaten gespeichert.</h4></template>
          </Toast>
        </div>

      <div class="d-flex bd-highlight">
        <div class="flex-grow-1 bd-highlight"><h4>Bankdaten</h4></div>        
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

        <form class="row g-3" ref="bankDataFrm">
                        
            <div class="col-md-8">
                <label for="receiver" class="form-label">Empfänger</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="receiver" v-model="currentValue.anschrift">
            </div>
            <div class="col-md-4"></div>
            <!--  -->
            <div class="col-md-4">
                <label for="iban" class="required form-label" >IBAN</label>
                <input type="text" required  @blur="frmState.ibanBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validIban(currentValue.iban) && frmState.ibanBlured}" id="iban" v-model="currentValue.iban" id="iban" maxlength="34" v-model="currentValue.iban" >
            </div>
            <div class="col-md-4">
                <label for="bic" class="form-label">BIC</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="bic" maxlength="11" v-model="currentValue.bic">
            </div>
            <div class="col-md-4">
            </div>
            <!-- -->
            <div class="col-md-8">
                <label for="uid" class="required form-label">Bank</label>
                <input type="text" required @blur="frmState.bankBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validBank(currentValue.name) && frmState.bankBlured}" id="bank" v-model="currentValue.name">
            </div>
            <div class="col-md-4">
            </div>
            <!-- -->
            <div class="col-md-4">
                <label for="blz" class="form-label">BLZ</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="blz" v-model="currentValue.blz">
            </div>
            <div class="col-md-4">
                <label for="kontonr" class="form-label">Kontonr</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="kontonr" v-model="currentValue.kontonr">
            </div>

            
        </form>

    </div>

    <ModalDialog title="Warnung" ref="dialogRef">
      <template #body>
        Bankdaten schließen? Geänderte Daten gehen verloren!
      </template>
    </ModalDialog>
    `
}