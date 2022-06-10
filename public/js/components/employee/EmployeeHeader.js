const EmployeeHeader = {
    components: {
        Toast,
		Modal,
        ModalDialog,
	},	
    props: {
        personID: { type: Number, default: 0 }
    },
    setup(props) {

        const { personID } = Vue.toRefs(props);

        const employee = Vue.ref();

        const url = Vue.ref("");

        const fileInput = Vue.ref();
        const previewImage = Vue.ref();

        const isFetching = Vue.ref(false);

        const generateEndpointURL = (person_id) => {
            let full =
                (location.port == "3000" ? "https://" : location.protocol) +
                "//" +
                location.hostname +
                ":" +
                (location.port == "3000" ? 8080 : location.port); // hack for dev mode
            return `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/personHeaderData?person_id=${person_id}`;
        };

        //const credentials = btoa(import.meta.env.VITE_FH_CREDENTIALS);

        const fetchData = async () => {
            isFetching.value = true;
            try {
                console.log("url", url.value);
                const res = await fetch(url.value);
                let response = await res.json();
                employee.value = response.retval[0];
                isFetching.value = false;
            } catch (error) {
                console.log(error);
                isFetching.value = false;
            }
        };

        Vue.watch(personID, (currentValue, oldValue) => {
            console.log('EmployeeHeaderData watch',currentValue);
            url.value = generateEndpointURL(currentValue);
            fetchData();
            previewImage.value = null;
            fileInput.value.value = null;
        });

        Vue.onMounted(() => {
            console.log("BaseData mounted", props.personID);
            url.value = generateEndpointURL(props.personID);
            fetchData();
        })

        // Toast 
        const toastRef = Vue.ref();
        const toastDeleteRef = Vue.ref();
        
        const showToast = () => {
            toastRef.value.show();
        }

        const showDeleteToast = () => {
            toastDeleteRef.value.show();
        }

        const pickFile = () => {
            let input = fileInput.value
            let file = input.files
            if (file && file[0]) {
                let reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.value = e.target.result
                }
                reader.readAsDataURL(file[0])
            }
        }

        const postFile = async () => {
            isFetching.value = true
                let full =
                    (location.port == "3000" ? "https://" : location.protocol) +
                    "//" +
                    location.hostname +
                    ":" +
                    (location.port == "3000" ? 8080 : location.port); // hack for dev mode

                const endpoint =
                    `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/uploadPersonEmployeeFoto`;

                

                const res = await fetch(endpoint,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({person_id: props.personID,imagedata: previewImage.value}),
                });    

                if (!res.ok) {
                    isFetching.value = false;
                    const message = `An error has occured: ${res.status}`;
                    throw new Error(message);
                }
                let response = await res.json();

                fetchData();
                showToast();
            
                isFetching.value = false;
        }


        const postDeleteFile = async () => {
            isFetching.value = true
                let full =
                    (location.port == "3000" ? "https://" : location.protocol) +
                    "//" +
                    location.hostname +
                    ":" +
                    (location.port == "3000" ? 8080 : location.port); // hack for dev mode

                const endpoint =
                    `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/deletePersonEmployeeFoto`;

                const res = await fetch(endpoint,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({person_id: props.personID}),
                });    

                if (!res.ok) {
                    isFetching.value = false;
                    const message = `An error has occured: ${res.status}`;
                    throw new Error(message);
                }
                let response = await res.json();

                fetchData();
                showDeleteToast();
            
                isFetching.value = false;
        }

        // Modal 
        let modalRef = Vue.ref();

        const showModal = () => {
            modalRef.value.show();
        }

        const hideModal = () => {
            modalRef.value.hide();
        }

        // confirm
        let confirmDeleteRef = Vue.ref();

        const showDeleteModal = async () => {            
            const ok = await confirmDeleteRef.value.show();
            
            if (ok) {
              postDeleteFile();            
            }
          }

        const okHandler = () => {
            console.log("previewImage: ", previewImage.value);
            postFile();
            hideModal();
        }
        

        return {
            showModal,
            hideModal,
            modalRef,
            showDeleteModal,
            confirmDeleteRef,
            pickFile,
            okHandler,
            toastRef,toastDeleteRef,

            employee,
            fileInput,
            previewImage,
        }
    },
    template: `
        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="toastRef">
                <template #body><h4>Foto gespeichert.</h4></template>
            </Toast>

            <Toast ref="toastDeleteRef">
                <template #body><h4>Foto gelöscht.</h4></template>
            </Toast>
        </div>

        <div class="d-flex justify-content-between align-items-center col-md-9 ms-sm-auto col-lg-12 p-md-2" >
        <div class="d-flex align-items-center" >
        
            <div class="fotocontainer">
            <img v-if="employee?.foto" class="img-thumbnail " style="max-width:101px" :src="'data:image/jpeg;charset=utf-8;base64,' + employee?.foto" />
            <div v-if="employee?.foto" class="fotobutton">
                <div class="d-grid gap-2 d-md-flex ">
                        <button type="button" class="btn btn-outline-dark btn-sm" @click="showDeleteModal">
                            <i class="fa fa-minus"></i>
                        </button>
                        <button type="button" class="btn btn-outline-dark btn-sm" @click="showModal">
                            <i class="fa fa-pen"></i>
                        </button>
                </div>
            </div>
            </div>

            <div v-if="employee?.foto==undefined" style="position:relative">
                <svg  class="bd-placeholder-img img-thumbnail" width="100" height="131" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A generic square placeholder image with a white border around it, making it resemble a photograph taken with an old instant camera: 200x200" preserveAspectRatio="xMidYMid slice" focusable="false"><title>A generic square placeholder image with a white border around it, making it resemble a photograph taken with an old instant camera</title><rect width="100%" height="100%" fill="#868e96"></rect><text x="50%" y="50%" fill="#dee2e6" dy=".3em"></text></svg>          
                <div class="fotobutton-visible">
                    <div class="d-grid gap-2 d-md-flex ">                      
                        <button type="button" class="btn btn-outline-dark btn-sm" @click="showModal" >
                            <i class="fa fa-pen"></i>
                        </button>
                    </div>
                </div>
            </div>                             
            
            <div class="ms-3">
                <h2 class="h2">{{ employee?.nachname }}, {{ employee?.vorname }} {{ employee?.titelpre }}</h2>
                <h6 class="mb-2 text-muted">Funktion, Abteilung</h6>  
            </div>
        </div>
        <div>
            <h2>PNr.</h2>
            <h6 class="mb-2 text-muted" style="text-align:right">{{ employee?.personalnummer }}</h6>  
        </div>
        </div>

        <!-- FotoModal -->
        <Modal title="Foto" ref="modalRef">
            <template #body>
                <div class="mb-3">
                    <label for="formFile" class="form-label">Foto upload</label>
                    <input class="form-control" type="file" id="formFile" ref="fileInput" @input="pickFile" accept="image/*">
                </div>
                <div class="mb-3">
                    <div class="imagePreviewWrapper" >
                        <img class="preview" :src="previewImage" />                        
                    </div>
                </div>

            </template>
            <template #footer>
                <button class="btn btn-secondary"  @click="hideModal()">Abbrechen</button>
                <button class="btn btn-primary"  @click="okHandler()">OK</button>
            </template>
        </Modal>
        
        <!-- Confirm Delete -->
        <ModalDialog title="Warnung" ref="confirmDeleteRef">
            <template #body>
                Foto wirklich löschen?
            </template>
        </ModalDialog>
        
        `
}

