import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { EmployeeStatus } from './EmployeeStatus.js';
import ApiEmployee from '../../api/factory/employee.js';
import ApiIssue from '../../api/factory/issue.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';

export const EmployeeHeader = {
	name: 'EmployeeHeader',
    components: {
		Modal,
        ModalDialog,
        "p-skeleton": primevue.skeleton,
        EmployeeStatus,
	},
    props: {
        personID: Number,
        personUID: String,
        restricted: Boolean,
    },
    expose: ['refresh'],
    emits: ['personSelected'],
    setup(props, { emit }) {

        /* const route = VueRouter.useRoute();
        const router = VueRouter.useRouter(); */
        const { watch, ref, onMounted, inject } = Vue;
        const currentPersonID = Vue.computed(() => { return props.personID });
        const currentPersonUID = Vue.computed(() => { return props.personUID });

        const employee = ref();
        const fileInput = ref();
        const previewImage = ref();
        const statusRef = ref();
        const { t } = usePhrasen();

        const isFetching = ref(false);
        const isFetchingName = ref(false);
        const isFetchingIssues = ref(false);
        const $api = inject('$api')     
        const $fhcAlert = Vue.inject('$fhcAlert')   

       //const currentDate = ref(null);

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
                const res = await $api.call(ApiEmployee.personHeaderData(personID, uid));
                employee.value = res.data[0];
                isFetchingName.value = false;
                // fetch abteilung (needs uid from previous fetch!)
                const resAbteilung = await $api.call(ApiEmployee.personAbteilung(employee.value.uid));
               // response = await resAbteilung.json();
                employee.value = { ...employee.value, ...{ abteilung: resAbteilung.data } };
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
                const res = await $api.call(ApiIssue.countPersonOpenIssues(personID));
                openissuescount.value = res.data.openissues;
            } catch (error) {
                console.log(error);
            } finally {
                isFetchingIssues.value = false;
            }
        };

        const checkPerson = async() => {
            isFetchingIssues.value = true;
            try {
                const res = await $api.call(ApiIssue.checkPerson(props.personID));
                openissuescount.value = res.data.openissues;
            } catch (error) {
                console.log(error);
            } finally {
                isFetchingIssues.value = false;
            }
        };

        Vue.watch([currentPersonID, currentPersonUID], ([id,uid]) => {
            if (currentPersonID.value!=null) {
                fetchHeaderData(id, uid);
                fetchOpenIssuesCount(id);
            } else {
                previewImage.value = null;
                fileInput.value.value = null;
            }
        });

        onMounted(() => {
            //currentDate.value = route.query.d || new Date();
            if (props.personID, props.personUID) {
                fetchHeaderData(props.personID, props.personUID);
                fetchOpenIssuesCount(props.personID);
            }

            if (modalRef.value)
            {
                modalRef.value.$el.addEventListener("hidden.bs.modal", () => {
                    resetPreview();
                });
            }
        })

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
                const res = await $api.call(ApiEmployee.uploadPersonEmployeeFoto(props.personID,previewImage.value));
                if (res?.meta?.status != 'success') 
                {
                    $fhcAlert.alertError(t('person', res.data))
                }
                else
                {                    
                    $fhcAlert.alertSuccess(t('person', 'Foto gespeichert.'))
                }
                fetchHeaderData(props.personID, props.personUID);
            } catch (error) {
                $fhcAlert.handleSystemError(error)  
            } finally {
                isFetching.value = false;
            }
        }


        const postDeleteFile = async () => {
            try  {
                isFetching.value = true
                const res = await $api.call(ApiEmployee.deletePersonEmployeeFoto(props.personID));
                fetchHeaderData(props.personID, props.personUID);
                $fhcAlert.alertSuccess(t('person','Foto gelöscht'))
            } catch (error) {
                $fhcAlert.handleSystemError(error)  
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

        const showDeleteModal = async () => {

            if (await $fhcAlert.confirm({
                    message:`Foto wirklich löschen?`,
                    acceptLabel: 'Löschen',
				    acceptClass: 'p-button-danger'
                }) === false) {
                return;
            }     

            postDeleteFile();
          }

        const okHandler = () => {
            // console.log("previewImage: ", previewImage.value);
            postFile();
            hideModal();
        }

        const resetPreview = () => {
            previewImage.value = null;
            fileInput.value.value = null;
        }

        const redirect = (person_id, uid) => {
            emit('personSelected', { person_id, uid });
            // window.location.href = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/summary?person_id=${person_id}`;
          }

        const refresh = () => {
            fetchHeaderData(props.personID, props.personUID);
            checkPerson(props.personID);
            statusRef.value.refresh();
        }

        const getStatusTags = ()=> {
            const statusArr = []

            if(employee?.value?.unruly) {
                statusArr.push({text: 'Unruly', css: 'bg-unruly rounded-0'})
            }

            return statusArr
        }

        return {
            showModal,
            hideModal,
            resetPreview,
            modalRef,
            showDeleteModal,
            pickFile,
            okHandler,
            statusRef,
            redirect,
            FHC_JS_CONFIG,
            getStatusTags,
            employee,
            fileInput,
            previewImage,
            isFetching,
            isFetchingName,
            isFetchingIssues,
            currentPersonID,
            currentPersonUID,
            // currentDate,
            formatDate,
            //setDateHandler,
            checkPerson,
            refresh,
            openissuescount,
        }
    },
    template: `

        <div class="d-flex justify-content-between ms-sm-auto col-lg-12 p-md-2" >
            <div class="d-flex align-items-top flex-fill" >

                <div class="fotocontainer" v-if="!isFetchingName">
                    <img v-if="employee?.foto" class="rounded" style="max-width:101px" :src="'data:image/jpeg;charset=utf-8;base64,' + employee?.foto" />
                    <div v-if="employee?.foto && !restricted" class="fotobutton" >
                        <div class="d-grid gap-2 d-md-flex ">
                                <button type="button" class="btn btn-outline-dark btn-sm" @click="showDeleteModal">
                                    <i class="fa fa-xmark"></i>
                                </button>
                                <button type="button" class="btn btn-outline-dark btn-sm" @click="showModal">
                                    <i class="fa fa-pen"></i>
                                </button>
                        </div>
                    </div>
                </div>

                <div v-if="employee?.foto==undefined  || isFetchingName" style="position:relative">
                    <svg  class="bd-placeholder-img rounded" width="100" height="131" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A generic square placeholder image with a white border around it, making it resemble a photograph taken with an old instant camera: 200x200" preserveAspectRatio="xMidYMid slice" focusable="false"><title>A generic square placeholder image with a white border around it, making it resemble a photograph taken with an old instant camera</title><rect width="100%" height="100%" fill="#868e96"></rect><text x="50%" y="50%" fill="#dee2e6" dy=".3em"></text></svg>
                    <div class="fotobutton-visible" v-if="!restricted && !isFetchingName">
                        <div class="d-grid gap-2 d-md-flex ">
                            <button type="button" class="btn btn-outline-dark btn-sm" @click="showModal" >
                                <i class="fa fa-pen"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="ms-3 flex-fill d-flex flex-column" >
                    <div class="align-items-top">
                        <h2 class="h4" v-if="!isFetchingName">{{ employee?.titelpre }} {{ employee?.vorname }} {{ employee?.nachname }}<span v-if="employee?.titelpost != null && employee?.titelpost != ''">, {{ employee?.titelpost }}</span></h2>
                        <h2 class="h4" v-else><p-skeleton style="width:30%"></p-skeleton></h2>

                        <div v-if="employee?.abteilung && !isFetching" class="mb-1">
                            <template v-for="(item, index) in employee?.abteilung">
                                <strong class="text-muted">{{ item?.organisationseinheittyp_kurzbz }}</strong> {{ item?.bezeichnung }} |
                                <strong class="text-muted">Vorgesetzte*r </strong>
                                <a href="#" @click.prevent="redirect(item?.supervisor?.person_id, item?.supervisor?.uid)" v-if="!restricted">{{ item?.supervisor?.titelpre }} {{ item?.supervisor?.vorname }} {{ item?.supervisor?.nachname }}</a>
                                <span v-else>{{ item?.supervisor?.titelpre }} {{ item?.supervisor?.vorname }} {{ item?.supervisor?.nachname }}</span>
                                <br v-if="index < employee?.abteilung?.length - 1" />
                            </template>
                            </div>
                        <div v-else class="mb-1"><p-skeleton v-if="isFetching" style="width:45%"></p-skeleton></div>
                        <div v-if="!isFetchingName" class="mb-1">
                            <strong class="text-muted">Email</strong>&nbsp;
                            <span v-if="!employee?.alias">
                                <a :href="'mailto:'+employee?.uid+'@'+FHC_JS_CONFIG.domain">{{  employee?.uid }}@{{ FHC_JS_CONFIG.domain }}</a>
                            </span>
                            <span v-if="employee?.alias">
                                <a :href="'mailto:'+employee?.alias+'@'+FHC_JS_CONFIG.domain">{{  employee?.alias }}@{{ FHC_JS_CONFIG.domain }}</a>
                            </span>
                            <span v-if="employee?.telefonklappe" class="mb-2"> | <strong class="text-muted">DW</strong> {{  employee?.telefonklappe }}</span>
                        </div>
                        <div v-else class="mb-1"><p-skeleton  style="width:35%"></p-skeleton></div>
                    </div>
                    <EmployeeStatus v-if="!restricted" ref="statusRef" :tags="getStatusTags()"></EmployeeStatus>
                </div>

            </div>

            <div class="d-flex flex-column">
                <div class="d-flex py-1">
                    <div class="px-2" v-if="!restricted">
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

        `
}
