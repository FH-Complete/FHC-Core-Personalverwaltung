import { Modal } from '../Modal.js';
import { Toast } from '../Toast.js';
import { ModalDialog } from '../ModalDialog.js';
import { EmployeeStatus } from './EmployeeStatus.js';

export const EmployeeHeader = {
    components: {
        Toast,
		Modal,
        ModalDialog,
        "p-skeleton": primevue.skeleton,
        EmployeeStatus,
	},	
    props: {
        personID: Number,
        personUID: String,
    },
    emits: ['personSelected'],
    setup(props, { emit }) {

        const route = VueRouter.useRoute();
        const router = VueRouter.useRouter();
        const { watch, ref, onMounted } = Vue; 
        const currentPersonID = ref(props.personID);
        const currentPersonUID  = ref(props.personUID);

        const employee = ref();
        const fileInput = ref();
        const previewImage = ref();

        const isFetching = ref(false);        
        const isFetchingName = ref(false);
        const isFetchingIssues = ref(false);
        
        const currentDate = ref(null);        

        const openissuescount = ref();

        const formatDate = (ds) => {
            if (ds == null) return '';
            var d = new Date(ds);
            return d?.toISOString().substring(0,10);
        }

        const fetchHeaderData = async (personID, uid) => {
            isFetching.value = true;
            isFetchingName.value = true;
            try {
                // fetch header data
                const res = await Vue.$fhcapi.Employee.personHeaderData(personID, uid);
                employee.value = res.data.retval[0];
                isFetchingName.value = false;
                // fetch abteilung (needs uid from previous fetch!)
                const resAbteilung = await Vue.$fhcapi.Employee.personAbteilung(employee.value.uid);
               // response = await resAbteilung.json();
                employee.value = { ...employee.value, ...{ abteilung: resAbteilung.data.retval } };
            } catch (error) {
                console.log(error);
            } finally {
                isFetching.value = false;
                isFetchingName.value = false;
            }
        };

        const fetchOpenIssuesCount = async(personID) => {
            isFetchingIssues.value = true;
            try {
                const res = await Vue.$fhcapi.Issue.countPersonOpenIssues(personID);
                openissuescount.value = res.data.data.openissues;
            } catch (error) {
                console.log(error);
            } finally {
                isFetchingIssues.value = false;
            }
        };

        const checkPerson = async() => {
            isFetchingIssues.value = true;
            try {            
                const res = await Vue.$fhcapi.Issue.checkPerson(props.personID);
                openissuescount.value = res.data.data.openissues;
            } catch (error) {
                console.log(error);
            } finally {
                isFetchingIssues.value = false;
            }
        };

        watch(
            () => route.params.uid,
            (newVal) => {   
                currentPersonID.value = route.params.id;
                currentPersonUID.value = newVal;           
                if (currentPersonID.value!=null) {
                    fetchHeaderData(route.params.id, newVal);
                    fetchOpenIssuesCount(route.params.id);
                } else {
                    previewImage.value = null;
                    fileInput.value.value = null;
                }
            }
        )

        watch(
            currentDate,
            (newVal) => {
                console.log('header date changed: ', newVal);
            }
        )

        onMounted(() => {
            currentDate.value = route.query.d || new Date();
            fetchHeaderData(props.personID, props.personUID);
            fetchOpenIssuesCount(props.personID);
        })

        // Toast 
        const toastRef = ref();
        const toastDeleteRef = ref();
        
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
            try  {
                isFetching.value = true
                const res = await Vue.$fhcapi.Employee.uploadPersonEmployeeFoto(props.personID,previewImage.value);                
                fetchHeaderData(props.personID, props.personUID);
                showToast();
            } catch (error) {
                console.log(error);                
            } finally {
                isFetching.value = false;
            }
        }


        const postDeleteFile = async () => {
            try  {
                isFetching.value = true
                const res = await Vue.$fhcapi.Employee.deletePersonEmployeeFoto(props.personID);                
                fetchHeaderData(props.personID, props.personUID);
                showDeleteToast();
            } catch (error) {
                console.log(error);                
            } finally {
                isFetching.value = false;
            }            
        }

        // Modal 
        let modalRef = ref();

        const showModal = () => {
            modalRef.value.show();
        }

        const hideModal = () => {
            modalRef.value.hide();
        }

        // confirm
        let confirmDeleteRef = ref();

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

        const redirect = (person_id, uid) => {
            console.log('person_id', person_id);
            let date = route.query.d;
            emit('personSelected', { person_id, uid, date });
            // window.location.href = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/summary?person_id=${person_id}`;
          }

        const setDateHandler = (e) => {
            console.log('setDateHandler', e.target.value);
            let url = route.path + '?d=' + e.target.value;
            currentDate.value = e.target.value;
            router.push(url);
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
            FHC_JS_CONFIG,

            employee,
            fileInput,
            previewImage,
            isFetching,
            isFetchingName,
            isFetchingIssues,
            currentPersonID,
            currentPersonUID,
            currentDate,
            formatDate,
            setDateHandler,
            checkPerson,
            openissuescount
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

        <div class="d-flex justify-content-between ms-sm-auto col-lg-12 p-md-2" >
            <div class="d-flex align-items-center flex-fill" >
            
                <div class="fotocontainer" v-if="!isFetchingName">
                    <img v-if="employee?.foto" class="rounded" style="max-width:101px" :src="'data:image/jpeg;charset=utf-8;base64,' + employee?.foto" />
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
                    <svg  class="bd-placeholder-img rounded" width="100" height="131" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A generic square placeholder image with a white border around it, making it resemble a photograph taken with an old instant camera: 200x200" preserveAspectRatio="xMidYMid slice" focusable="false"><title>A generic square placeholder image with a white border around it, making it resemble a photograph taken with an old instant camera</title><rect width="100%" height="100%" fill="#868e96"></rect><text x="50%" y="50%" fill="#dee2e6" dy=".3em"></text></svg>          
                    <div class="fotobutton-visible" v-if="!isFetchingName">
                        <div class="d-grid gap-2 d-md-flex ">                      
                            <button type="button" class="btn btn-outline-dark btn-sm" @click="showModal" >
                                <i class="fa fa-pen"></i>
                            </button>
                        </div>
                    </div>
                </div>                             
                
                <div class="ms-3 flex-fill" >
                    <div class="align-items-top">
                        <h2 class="h4" v-if="!isFetchingName">{{ employee?.titelpre }} {{ employee?.vorname }} {{ employee?.nachname }}</h2>
                        <h2 class="h4" v-else><p-skeleton style="width:30%"></p-skeleton></h2>      
    
                        <div v-if="employee?.abteilung && !isFetching" class="mb-1 text-muted">
                            <template v-for="(item, index) in employee?.abteilung">
                                <strong>{{ item?.organisationseinheittyp_kurzbz }}</strong> {{ item?.bezeichnung }},
                                <strong>Vorgesetzte(r) </strong> <a href="#" @click.prevent="redirect(item?.supervisor?.person_id, item?.supervisor?.uid)">{{ item?.supervisor?.titelpre }} {{ item?.supervisor?.vorname }} {{ item?.supervisor?.nachname }}</a>
                                <br v-if="index < employee?.abteilung?.length - 1" />
                            </template>    
                            </div>  
                        <div v-else class="mb-1"><p-skeleton v-if="isFetching" style="width:45%"></p-skeleton></div>                
                        <div v-if="!isFetchingName" class="mb-1 text-muted">
                            <strong>Email</strong>&nbsp; 
                            <span v-if="!employee?.alias">,  
                                <a :href="'mailto:'+employee?.uid+'@'+FHC_JS_CONFIG.domain">{{  employee?.uid }}@{{ FHC_JS_CONFIG.domain }}</a>
                            </span>
                            <span v-if="employee?.alias">
                                <a :href="'mailto:'+employee?.alias+'@'+FHC_JS_CONFIG.domain">{{  employee?.alias }}@{{ FHC_JS_CONFIG.domain }}</a> 
                            </span>
                            <span v-if="employee?.telefonklappe" class="mb-2 text-muted">, <strong>DW</strong> {{  employee?.telefonklappe }}</span>  
                        </div>  
                        <div v-else class="mb-1"><p-skeleton  style="width:35%"></p-skeleton></div>            
                    </div>
                    <EmployeeStatus></EmployeeStatus>
                   
                </div>
             
            </div>
            
            <div class="d-flex flex-column">
                <div class="d-flex py-1">
                    <div class="px-2">
                        <h4 class="mb-1">Issues<a class="refresh-issues" title="erneut prüfen" href="javascript:void(0);" @click="checkPerson"><i class="fas fa-sync"></i></a></h4>
                        <h6 v-if="!isFetchingIssues" class="text-muted">{{ openissuescount }}</h6> 
                        <h6 v-else class="mb-2"><p-skeleton v-if="isFetchingIssues" style="width:45%"></p-skeleton></h6> 
                    </div>
                    <div class="px-2">
                        <h4 class="mb-1">PNr</h4>
                        <h6 v-if="!isFetchingName" class="text-muted">{{ employee?.personalnummer }}</h6>
                        <h6 v-else class="mb-2"><p-skeleton v-if="isFetching" style="width:45%"></p-skeleton></h6> 
                    </div>
                    <div class="px-2" style="border-left: 1px solid #EEE">
                        <h4 class="mb-1">UID</h4>
                        <h6 v-if="!isFetchingName" class="text-muted">{{ employee?.uid }}</h6>  
                        <h6 v-else class="mb-2"><p-skeleton v-if="isFetching" style="width:45%"></p-skeleton></h6> 
                    </div>
                </div>                
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

