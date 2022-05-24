const AddressData = {
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        writePermission: { type: Boolean, required: false },
    },  
    setup(props) {

        const { personID } = Vue.toRefs(props);

        const urlAddressData = Vue.ref("");

        const addressList = Vue.ref([]);

        const isFetching = Vue.ref(false);

        const isEditActive = Vue.ref(false);

        Vue.watch(personID, (currentValue, oldValue) => {
            console.log('AddressData watch',currentValue);
            urlAddressData.value = generateAddressDataEndpointURL(currentValue);
            fetchData();
        });

        const generateAddressDataEndpointURL = (person_id) => {
        let full =
            (location.port == "3000" ? "https://" : location.protocol) +
            "//" +
            location.hostname +
            ":" +
            (location.port == "3000" ? 8080 : location.port); // hack for dev mode
         return `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/personAddressData?person_id=${person_id}`;
        };

        const setEdit = () => {
            isEditActive.value = true;
        }

        const fetchData = async () => {
            if (personID.value==null) {
                addressList.value = [];
                return;
            }
            isFetching.value = true
            try {
              const res = await fetch(urlAddressData.value)
              let response = await res.json()
              isFetching.value = false
              console.log(response.retval);
              addressList.value = response.retval;
            } catch (error) {
              console.log(error)
              isFetching.value = false
            }
          }

          Vue.onMounted(() => {
            console.log('AddressData mounted', props.personID);            
            urlAddressData.value = generateAddressDataEndpointURL(props.personID); 
            fetchData();
            
        })

          return {
            addressList, setEdit, isEditActive
          }
        
    },
    template: `
        <div v-if="isEditActive">
            HELLO WORLD!
        </div>
        <div v-else class="table-responsive">
            <table class="table table-striped table-sm">
                <thead>
                <tr>
                    <th scope="col">Typ</th>
                    <th scope="col">Straße</th>
                    <th scope="col">PLZ</th>
                    <th scope="col">Ort</th>
                    <th scope="col">Gemeinde</th>
                    <th scope="col">Nation</th>
                    <th scope="col">Heimatadresse</th>
                    <th scope="col">Zustelladresse</th>
                    <th scope="col">Abweich.Empf.(c/o)</th>
                    <th scope="col">Aktion</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="address in addressList" :key="address.adresse_id">
                    <td>{{ address.typ }}</td>
                    <td>{{ address.strasse }}</td>
                    <td>{{ address.plz }}</td>
                    <td>{{ address.ort }}</td>
                    <td>{{ address.gemeinde }}</td>
                    <td>{{ address.nation }}</td>
                    <td>{{ address.heimatadresse == true ? "X" : "" }}</td>
                    <td>{{ address.zustelladresse == true ? "X" : "" }}</td>
                    <td>{{ address.co_name }}</td>
                    <td>
                    <div class="d-grid gap-2 d-md-flex ">
                        <button type="button" class="btn btn-outline-dark btn-sm">
                            <i class="fa fa-minus"></i>
                        </button>
                        <button type="button" class="btn btn-outline-dark btn-sm" @click="setEdit()">
                            <i class="fa fa-pen"></i>
                        </button>
                    </div>
                    </td>
                </tr>

                </tbody>
            </table>            
        </div>
        
        `
}