const BaseData = {
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

        const toggleMode = () => {
            if (!readonly.value) {
                currentValue.value = preservedValue.value;
            } else {
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

        return {
            
            currentValue,
            readonly,

            toggleMode,            
        }
        
    },
    template: `
    <div class="row">
      <div class="d-flex bd-highlight">
        <div class="flex-grow-1 bd-highlight"></div>        
        <div class="p-2 bd-highlight">
          <div class="d-grid gap-2 d-md-flex justify-content-end ">
            <button v-if="readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()">
                <i class="fa fa-pen"></i>
            </button>
            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()"><i class="fa fa-minus"></i></button>
            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" ><i class="fa fa-floppy-disk"></i></button>
        </div>

        </div>
      </div>
      
    </div>
    <div class="col-md-12 d-flex justify-content-between flex-wrap flex-md-nowrap align-items-start pt-3 pb-2 mb-3">

        <form class="row g-3  col-md-12">
            <div class="col-md-4">
                <label for="uid" class="form-label">UID <i>(person_id={{personID}})</i></label>
                <input type="text"  readonly class="form-control-sm form-control-plaintext" id="uid" v-model="currentValue.uids">
            </div>
            <div class="col-md-4"></div>
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Status</label>
                <div v-if="!readonly" class="form-check">
                    <label for="aktiv" class="form-check-label">Aktiv</label>
                    <input class="form-check-input" type="checkbox" id="aktiv" v-model="currentValue.aktiv">
                </div>
                <div v-if="readonly" class="form-label">
                    
                    <input v-if="currentValue.aktiv" type="text" readonly class="form-control-sm form-control-plaintext" id="statusField" value="aktiv">
                    <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="statusField" value="">
                    
                </div>
            </div>
            <!-- Anrede -->
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Anrede</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="anrede" v-model="currentValue.anrede">
            </div>
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">TitelPre</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="titelPre" v-model="currentValue.titelpre">
            </div>
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">TitelPost</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="titelPost" v-model="currentValue.titelpost">
            </div>
            <!--Name -->
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Nachname</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="nachname" v-model="currentValue.nachname">
            </div>
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Vorname</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="vorname" v-model="currentValue.vorname">
            </div>
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Vornamen</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="vornamen" v-model="currentValue.vornamen">
            </div>
            <!-- -->
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Sprache</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="sprache" v-model="currentValue.sprache">
            </div>
            <div class="col-md-8"></div>
            <!-- -->
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Geschlecht</label><br>
                <!-- radio -->
                <div class="form-check form-check-inline">
                <input :disabled="readonly" class="form-check-input" type="radio" name="geschlechtRadioOptions" id="geschlechtRadio1" value="w" v-model="currentValue.geschlecht">
                <label class="form-check-label" for="geschlechtRadio1">w</label>
                </div>
                <div class="form-check form-check-inline">
                <input :disabled="readonly" class="form-check-input" type="radio" name="geschlechtRadioOptions" id="geschlechtRadio2" value="m" v-model="currentValue.geschlecht">
                <label class="form-check-label" for="geschlechtRadio2">m</label>
                </div>
                <div class="form-check form-check-inline">
                <input :disabled="readonly" class="form-check-input" type="radio" name="geschlechtRadioOptions" id="geschlechtRadio3" value="x" v-model="currentValue.geschlecht">
                <label class="form-check-label" for="geschlechtRadio3">x</label>
                </div>
                <div class="form-check form-check-inline">
                <input :disabled="readonly"  class="form-check-input" type="radio" name="geschlechtRadioOptions" id="geschlechtRadio4" value="u" v-model="currentValue.geschlecht">
                <label class="form-check-label" for="geschlechtRadio4">u</label>
                </div>
            </div>
            <div class="col-md-8"></div>
            <!-- -->
            <div class="col-6">
                <label for="inputAddress" class="form-label">Anmerkung</label>
                <textarea type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="anmerkungen" v-model="currentValue.anmerkung">
                </textarea>
            </div>
            <div class="col-6">
                <label for="inputAddress" class="form-label">Homepage</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="homepage" placeholder="https://" v-model="currentValue.homepage">
            </div>

        </form>

         
        
    </div>

    `
}
