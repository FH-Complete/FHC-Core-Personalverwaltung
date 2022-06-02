const AddressData = {
    components: {
        Modal,
        ModalDialog,
        Toast,
    },
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

        const currentAddress = Vue.ref();

        const confirmDeleteRef = Vue.ref();

        const nations = Vue.inject('nations');

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


        const addressListArray = Vue.computed(() => Object.values(addressList.value));

        // Modal 
        let modalRef = Vue.ref();
        
        const showEditModal = (id) => {
            currentAddress.value = { ...addressList.value[id] };
            modalRef.value.show();
        }

        const showDeleteModal = async (id) => {
            currentAddress.value = { ...addressList.value[id] };
            const ok = await confirmDeleteRef.value.show();
            
            if (ok) {   

                postDelete(id)
                    .then((r) => {
                        if (r.error == 0) {
                            delete addressList.value[id];
                            showDeletedToast();
                        }
                    });
                
            }
        }


        const createAddressShape = (person_id) => {
            return {
                adresse_id: 0,
                person_id: person_id,
                name: "",
                strasse: "",
                plz: "",
                ort: "",
                gemeinde: "",
                nation: "A",
                typ: "",
                heimatadresse: false,
                zustelladresse: false,
                firma_id: null,
                updateamum: "",
                updatevon: "",
                insertamum: "",
                insertvon: "",
                ext_id: null,
                rechnungsadresse: "",
                anmerkung: "",
                co_name: "",
            }
        }

        const showAddModal = () => {
            currentAddress.value = createAddressShape(personID);
            // reset form state
            frmState.plzBlured=false;
            frmState.ortBlured=false;
            // call bootstrap show function
            modalRef.value.show();
        }

        const hideModal = () => {
            modalRef.value.hide();
        }

        const postData = async () => {
            isFetching.value = true
            let full =
                (location.port == "3000" ? "https://" : location.protocol) +
                "//" +
                location.hostname +
                ":" +
                (location.port == "3000" ? 8080 : location.port); // hack for dev mode
            const endpoint =
                `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/upsertPersonAddressData`;

            const res = await fetch(endpoint,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentAddress.value),
            });    

            if (!res.ok) {
                isFetching.value = false;
                const message = `An error has occured: ${res.status}`;
                throw new Error(message);
            }
            let response = await res.json();
        
            isFetching.value = false;
            return response;

        };
            

        const postDelete = async (id) => {
            isFetching.value = true
            let full =
                (location.port == "3000" ? "https://" : location.protocol) +
                "//" +
                location.hostname +
                ":" +
                (location.port == "3000" ? 8080 : location.port); // hack for dev mode
            const endpoint =
                `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/deletePersonAddressData`;

            const res = await fetch(endpoint,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({adresse_id: id}),
            });    

            if (!res.ok) {
                isFetching.value = false;
                const message = `An error has occured: ${res.status}`;
                throw new Error(message);
            }
            let response = await res.json();
        
            isFetching.value = false;
            return response;

        };

        const okHandler = () => {
            if (!validate()) {

                console.log("form invalid");

            } else {
                postData()
                    .then((r) => {
                        if (r.error == 0) {
                            addressList.value[r.retval[0].adresse_id] = r.retval[0];
                            console.log('address successfully saved');
                            showToast();
                        }
                        /*
                        if (currentAddress.value) {
                            addressList.value[currentAddress.value.adresse_id] = currentAddress.value;
                            console.log('address successfully saved');
                            showToast();
                        }*/
                    }
                    )
                    .catch((error) => {
                        console.log(error.message);
                    });
                
                hideModal();
            }
        }

        // -------------
        // form handling
        // -------------

        const addressDataFrm = Vue.ref();

        const frmState = Vue.reactive({ plzBlured: false, ortBlured: false, wasValidated: false });

        const validPLZ = (n) => {
            return !!n && n.trim() != "";
        }

        const validOrt = (n) => {
            return !!n && n.trim() != "";
        }

        const validate = () => {
            frmState.plzBlured = true;
            frmState.ortBlured = true;
            if (validOrt(currentAddress.value.ort) && validPLZ(currentAddress.value.plz)) {
                return true;
            }
            return false;
        }

        // Toast 
        const toastRef = Vue.ref();
        const deleteToastRef = Vue.ref();
        
        const showToast = () => {
            toastRef.value.show();
        }

        const showDeletedToast = () => {
            deleteToastRef.value.show();
        }

        return {
            addressList, addressListArray, isEditActive, showAddModal, 
            showDeleteModal, showEditModal, confirmDeleteRef, currentAddress, 
            modalRef,hideModal, okHandler, toastRef, deleteToastRef, nations,
            // form handling
            validOrt, validPLZ, frmState, addressDataFrm, 
        }
        
    },
    template: ` 
        <div class="row">

            <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
                <Toast ref="toastRef">
                    <template #body><h4>Adresse gespeichert.</h4></template>
                </Toast>
            </div>

            <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
                <Toast ref="deleteToastRef">
                    <template #body><h4>Adresse gelöscht.</h4></template>
                </Toast>
            </div>

            <div class="d-flex bd-highlight">
                <div class="flex-grow-1 bd-highlight"></div>        
                <div class="p-2 bd-highlight">                   
                    <button type="button" class="btn btn-outline-dark btn-sm"  @click="showAddModal()" style="margin-right:1.85rem;">
                        <i class="fa fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="table-responsive">
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
                <tr v-for="address in addressListArray" :key="address.adresse_id">
                    <td class="align-middle">{{ address.typ }}</td>
                    <td class="align-middle">{{ address.strasse }}</td>
                    <td class="align-middle">{{ address.plz }}</td>
                    <td class="align-middle">{{ address.ort }}</td>
                    <td class="align-middle">{{ address.gemeinde }}</td>
                    <td class="align-middle">{{ address.nation }}</td>
                    <td class="align-middle">{{ address.heimatadresse == true ? "X" : "" }}</td>
                    <td class="align-middle">{{ address.zustelladresse == true ? "X" : "" }}</td>
                    <td class="align-middle">{{ address.co_name }}</td>
                    <td class="align-middle" width="5%">
                        <div class="d-grid gap-2 d-md-flex align-middle">
                            <button type="button" class="btn btn-outline-dark btn-sm" @click="showDeleteModal(address.adresse_id)">
                                <i class="fa fa-minus"></i>
                            </button>
                            <button type="button" class="btn btn-outline-dark btn-sm" @click="showEditModal(address.adresse_id)">
                                <i class="fa fa-pen"></i>
                            </button>
                        </div>
                    </td>
                </tr>

                </tbody>
            </table>            
        </div>

        <!-- Detail Modal -->
        <Modal title="Adresse" ref="modalRef">
            <template #body>
                <form class="row g-3" v-if="currentAddress != null"  ref="addressDataFrm" >
                                
                    <div class="col-md-6">
                        <label for="strasse" class="form-label">Strasse</label>
                        <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="strasse" v-model="currentAddress.strasse" >
                    </div>
                    <div class="col-md-2">
                        <label for="plz" class="required form-label" >PLZ</label>
                        <input type="text" required :readonly="readonly" @blur="frmState.plzBlured = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validPLZ(currentAddress.plz) && frmState.plzBlured}" id="plz" maxlength="16" v-model="currentAddress.plz" >
                    </div>
                    <div class="col-md-4">
                        <label for="ort" class="required form-label">Ort</label>
                        <input type="text" required :readonly="readonly" @blur="frmState.ortBlured = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validOrt(currentAddress.ort) && frmState.ortBlured}" id="ort" maxlength="256" v-model="currentAddress.ort" >
                    </div>
                    <!-- Gemeinde -->
                    <div class="col-md-4">
                        <label for="gemeinde" class="form-label">Gemeinde</label>
                        <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="gemeinde" maxlength="11" v-model="currentAddress.gemeinde">
                    </div>
                    <div class="col-md-4">
                        <label for="nation" class="form-label">Nation</label>
                        <select  id="nation" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="currentAddress.nation" >
                            <option v-for="(item, index) in nations" :value="item.nation_code">
                                {{ item.nation_text }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-2">                                             
                        <label for="heimatadresse" class="form-label">Heimatadresse</label>
                        <div>
                            <input class="form-check-input" type="checkbox" id="heimatadresse" v-model="currentAddress.heimatadresse">
                        </div>
                    </div>
                    <div class="col-md-2">
                        <label for="zustelladresse" class="form-label">Zustelladresse</label>
                        <div>
                            <input class="form-check-input" type="checkbox" id="zustelladresse" v-model="currentAddress.zustelladresse">
                        </div>                        
                    </div>
                    <!-- c/o -->
                    <div class="col-md-6">
                        <label for="co_name" class="form-label">Abweich.Empfänger. (c/o)</label>
                        <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="co_name" maxlength="11" v-model="currentAddress.co_name">
                    </div>
                    

                </form>        

            </template>
            <template #footer>
                <button type="button" class="btn btn-secondary" @click="hideModal()">
                    Abbrechen
                </button>
                <button type="button" class="btn btn-primary" @click="okHandler()" >
                    OK
                </button>
            </template>
        </Modal>

        <ModalDialog title="Warnung" ref="confirmDeleteRef">
            <template #body>
                Adresse '{{ currentAddress?.plz }} {{ currentAddress?.ort }}, {{ currentAddress?.strasse }}' wirklich löschen?
            </template>
        </ModalDialog>
        
        `
}