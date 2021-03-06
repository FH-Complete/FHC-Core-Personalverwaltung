import { Modal } from '../Modal.js';
import { Toast } from '../Toast.js';
import { ModalDialog } from '../ModalDialog.js';

export const EmployeeHeader = {
    components: {
        Toast,
		Modal,
        ModalDialog,
        "p-skeleton": primevue.skeleton,
	},	
    props: {
        personID: { type: Number, default: 0 }
    },
    setup(props, { emit }) {

        const { personID } = Vue.toRefs(props);

        const employee = Vue.ref();

        const headerUrl = Vue.ref("");

        const fileInput = Vue.ref();
        const previewImage = Vue.ref();

        const isFetching = Vue.ref(false);        
        const isFetchingName = Vue.ref(false);        

        const generateEndpointURL = (person_id) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/personHeaderData?person_id=${person_id}`;
        };

        const fetchHeaderData = async () => {
            isFetching.value = true;
            isFetchingName.value = true;
            try {
                // fetch header data
                const res = await fetch(headerUrl.value);
                let response = await res.json();
                employee.value = response.retval[0];
                isFetchingName.value = false;
                // fetch abteilung (needs uid from previous fetch!)
                let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router; 
                const abteilungUrl = `${full}/extensions/FHC-Core-Personalverwaltung/api/personAbteilung?uid=${employee.value.uid}`
                const resAbteilung = await fetch(abteilungUrl);
                response = await resAbteilung.json();
                employee.value = { ...employee.value, ...{ abteilung: response.retval[0] } };
                isFetching.value = false;
            } catch (error) {
                console.log(error);
                isFetching.value = false;
                isFetchingName.value = false;
            }
        };

        Vue.watch(personID, (currentValue, oldValue) => {
            console.log('EmployeeHeaderData watch',currentValue);
            headerUrl.value = generateEndpointURL(currentValue);
            fetchHeaderData();
            previewImage.value = null;
            fileInput.value.value = null;
        });

        Vue.onMounted(() => {
            console.log("BaseData mounted", props.personID);
            headerUrl.value = generateEndpointURL(props.personID);
            fetchHeaderData();
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
                let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

                const endpoint =
                    `${full}/extensions/FHC-Core-Personalverwaltung/api/uploadPersonEmployeeFoto`;
                
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

                fetchHeaderData();
                showToast();
            
                isFetching.value = false;
        }


        const postDeleteFile = async () => {
            isFetching.value = true
                let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

                const endpoint =
                    `${full}/extensions/FHC-Core-Personalverwaltung/api/deletePersonEmployeeFoto`;

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

                fetchHeaderData();
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

        const redirect = (person_id) => {
            console.log('person_id', person_id);
            emit('personSelected', person_id);
            // window.location.href = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/summary?person_id=${person_id}`;
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
            redirect,

            employee,
            fileInput,
            previewImage,
            isFetching,
            isFetchingName,
        }
    },
    template: `
        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="toastRef">
                <template #body><h4>Foto gespeichert.</h4></template>
            </Toast>

            <Toast ref="toastDeleteRef">
                <template #body><h4>Foto gel??scht.</h4></template>
            </Toast>
        </div>

        <div class="d-flex justify-content-between align-items-center col-md-9 ms-sm-auto col-lg-12 p-md-2" >
        <div class="d-flex align-items-center flex-fill" >
        
            <div class="fotocontainer" v-if="!isFetchingName">
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

            <div v-if="employee?.foto==undefined  || isFetchingName" style="position:relative">
                <svg  class="bd-placeholder-img img-thumbnail" width="100" height="131" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A generic square placeholder image with a white border around it, making it resemble a photograph taken with an old instant camera: 200x200" preserveAspectRatio="xMidYMid slice" focusable="false"><title>A generic square placeholder image with a white border around it, making it resemble a photograph taken with an old instant camera</title><rect width="100%" height="100%" fill="#868e96"></rect><text x="50%" y="50%" fill="#dee2e6" dy=".3em"></text></svg>          
                <div class="fotobutton-visible" v-if="!isFetchingName">
                    <div class="d-grid gap-2 d-md-flex ">                      
                        <button type="button" class="btn btn-outline-dark btn-sm" @click="showModal" >
                            <i class="fa fa-pen"></i>
                        </button>
                    </div>
                </div>
            </div>                             
            
            <div class="ms-3 flex-fill" >

                <h2 class="h2" v-if="!isFetchingName">{{ employee?.nachname }}, {{ employee?.vorname }} {{ employee?.titelpre }}</h2>
                <h2 class="h2" v-else><p-skeleton style="width:30%"></p-skeleton></h2>      

                <h6 v-if="employee?.abteilung && !isFetching" class="mb-2 text-muted">
                    <b>{{ employee?.abteilung?.organisationseinheittyp_kurzbz }}</b> {{ employee?.abteilung?.bezeichnung }},
                    <b>Vorgesetze(r) </b> <a href="#" @click="redirect(employee?.abteilung?.supervisor?.person_id)">{{ employee?.abteilung?.supervisor?.nachname }}, {{ employee?.abteilung?.supervisor?.vorname }} {{ employee?.abteilung?.supervisor?.titelpre }}</a>
                </h6>  
                <h6 v-else class="mb-2"><p-skeleton v-if="isFetching" style="width:45%"></p-skeleton></h6>                
                
                <h6 v-if="!isFetchingName" class="mb-2 text-muted">
                    <b>Email</b>&nbsp; 
                    <a :href="'mailto:'+employee?.uid+'@technikum-wien.at'">{{  employee?.uid }}@technikum-wien.at</a>
                    <span v-if="employee?.alias">,  
                        <a :href="'mailto:'+employee?.alias+'@technikum-wien.at'">{{  employee?.alias }}@technikum-wien.at</a> 
                    </span>
                    <span v-if="employee?.telefonklappe" class="mb-2 text-muted">, <b>DW</b> {{  employee?.telefonklappe }}</span>  
                </h6>  
                <h6 v-else class="mb-2"><p-skeleton  style="width:35%"></p-skeleton></h6> 

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
                Foto wirklich l??schen?
            </template>
        </ModalDialog>
        
        `
}

