import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import {OrgChooser} from "../../../components/organisation/OrgChooser.js";
import { usePhrasen } from '../../../../../../js/mixins/Phrasen.js';
import { dateFilter } from '../../../../../../js/tabulator/filters/Dates.js';
import ApiFunktion from '../../../api/factory/funktion.js';
import ApiPerson from '../../../api/factory/person.js';
import ApiWeiterbildung from  '../../../api/factory/weiterbildung.js';
import { EditDialog } from './EditDialog.js';
import { CoreFilterCmpt } from "../../../../../../js/components/filter/Filter.js";

export const EmployeeTraining = {
	name: 'EmployeeTraining',
    components: {
        Modal,
        ModalDialog,
        OrgChooser,
        EditDialog,
        "datepicker": VueDatePicker,
        CoreFilterCmpt,
    },
    props: {
        modelValue: { type: Object, default: () => ({}), required: false},
        config: { type: Object, default: () => ({}), required: false},
        readonlyMode: { type: Boolean, required: false, default: false },
        personID: { type: Number, required: false },
        personUID: { type: String, required: false },
        writePermission: { type: Boolean, required: false },
    },
    emits: ['updateHeader'],
   setup( props, { emit } ) {

        const $api = Vue.inject('$api');
        const $fhcAlert = Vue.inject('$fhcAlert');

        const readonly = Vue.ref(false);

        const { t } = usePhrasen();

        const route = VueRouter.useRoute();
        const { watchEffect, ref, watch, computed } = Vue; 
        const kategorieTypen = ref([]);
        const kategorienList = ref([]);
        const currentPersonID = ref(null);
        const currentUID = ref(null);
        const currentValue = ref();
        const editDialogRef = ref();   
        const isFetching = ref(false);
        const interneChecked = ref(true);
        const trainingList = ref([]);                
        const employeeTrainingRef = ref(null); 

        const createShape = () => {
            return { 
                "weiterbildung_id" : 0, 
                "mitarbeiter_uid": currentUID.value,
                "bezeichnung": "",
                "intern": true,
                "kategorien":Vue.reactive([]), 
                "stunden":0, 
                "von":null, 
                "bis":null, 
                "hr_freigegeben":null, 
                "beantragt":null,
                "ablaufdatum":null,
                "dokumente": []
            } 
        }

        const trainingListArray = Vue.computed(() => {
            let temp = (trainingList.value ? Object.values(trainingList.value) : []);
            let filtered = temp.filter((e) => interneChecked.value );
            return filtered;
        });

        // helper
        const createDomButton = (classValue, clickHandler) => {
            const nodeBtn = document.createElement("button");
            const classAttrBtn = document.createAttribute("class");
            classAttrBtn.value = "btn btn-outline-secondary btn-sm";
            nodeBtn.setAttributeNode(classAttrBtn);
            nodeBtn.addEventListener("click", clickHandler);
            const nodeI = document.createElement("i");
            const classAttrI = document.createAttribute("class");
            classAttrI.value = classValue;
            nodeI.setAttributeNode(classAttrI);
            nodeBtn.appendChild(nodeI);
            return nodeBtn;
        }

        const kategorieFormatter = (cell) => {    
                
            const kategorien = cell.getValue() || [];
            const kategorienExpanded = [];

            kategorien?.forEach(weiterbildungskategorie_kurzbz => {
                const k = kategorienList.value.find(kat => kat.weiterbildungskategorie_kurzbz == weiterbildungskategorie_kurzbz);
                kategorienExpanded.push(`<span class="badge" style="background-color:#777">${k.bezeichnung}</span>`);
            });
            return kategorienExpanded.join(' ');
        }

        const dateFormatter = (cell) => {
            return cell.getValue()?.replace(/(.*)-(.*)-(.*)/, '$3.$2.$1');
        }

        const  iconForFile = (doc) => {
            const ext = doc?.name.split(".").pop().toLowerCase();

            switch (ext) {
                case "pdf": return '<i class="fas fa-file-pdf" class="item.icon"></i>';
                case "png":
                case "jpg":
                case "jpeg": return '<i class="fas fa-file-image" class="item.icon"></i>';
                default: return '<i class="fas fa-file" class="item.icon"></i>';
            }
        }

        const dokFormatter = (cell) => {
            const files = cell.getValue() || [];
            return files.map(doc => {
                return `<a href="${FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router}/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Weiterbildung/downloadDoc/${doc.dms_id}" target="_blank">
                            ${iconForFile(doc)} ${doc.name}
                        </a>`;
            }).join("<br>");
        }

        const btnFormatter = (cell) => {

            const nodeDiv = document.createElement("div");  
            const classAttrDiv = document.createAttribute("class");
            classAttrDiv.value = "d-grid gap-2 d-md-flex justify-content-end align-middle";
            nodeDiv.setAttributeNode(classAttrDiv);
            // delete button
            const nodeBtnDel = createDomButton("fa fa-xmark",() => { showDeleteModal(cell.getRow().getData()) })
            // edit button
            const nodeBtnEdit = createDomButton("fa fa-pen",() => { showEditModal(cell.getRow().getData()) })

            nodeDiv.appendChild(nodeBtnEdit);
            nodeDiv.appendChild(nodeBtnDel);
        
            return nodeDiv;
        }        

        const fetchKategorien = async () => {
            const res = await $api.call(ApiWeiterbildung.getWeiterbildungkategorien());                 
            kategorienList.value = res.data                   
        }

        const fetchKategorieTypen = async () => {
            const res = await $api.call(ApiWeiterbildung.getKategorieTypen());                 
            kategorieTypen.value = res.data                
        }

        

        const kategorieFilterListe = computed(() =>
             Object.fromEntries([
                ['', 'Alle'],
                ...kategorienList.value.map(k => [
                    k.weiterbildungskategorie_kurzbz,
                    k.bezeichnung
                ])
            ])
        );

       watch(kategorieFilterListe, (filterListe) => {
            employeeTrainingRef.value?.tabulator?.updateColumnDefinition("kategorien", {
                headerFilterParams: {
                    values: filterListe,
                    autocomplete: false,  // drop down does not work when autocomplete is true
                    clearable: true,            
                },
            });
        }, { deep: true }); 

        const columnsDef = [
            { title: 'Kategorie', field: "kategorien", formatter: kategorieFormatter, width: 180, headerFilter: "list", headerSort:false,
                headerFilterParams: { values: {} , autocomplete: false, clearable: true }, 
                headerFilterFunc: 
                        function(headerValue, rowValue){
                            if(!headerValue) return true;  
                            return rowValue.includes(headerValue);
                        }
            },
            { title: 'Bezeichnung', field: "bezeichnung", hozAlign: "left", width: 140, headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
            { title: 'Stunden', field: "stunden", hozAlign: "right", headerFilter:true },
            { title: 'Von', field: "von", hozAlign: "center", 
                formatter: dateFormatter, width: 140, sorter:"string", headerFilter: dateFilter, headerFilterFunc:'dates' },                
            { title: 'Bis', field: "bis", hozAlign: "center", 
                formatter: dateFormatter, width: 140, sorter:"string", headerFilter: dateFilter, headerFilterFunc:'dates' },
            { title: 'Ablaufdatum', field: "ablaufdatum", hozAlign: "center", 
                formatter: dateFormatter, width: 140, sorter:"string", headerFilter: dateFilter, headerFilterFunc:'dates' },
            { title: 'Beantragt', field: "beantragt", hozAlign: "center", 
                formatter: dateFormatter, width: 140, sorter:"string", headerFilter: dateFilter, headerFilterFunc:'dates' }, 
            { title: 'HR-Freigabe', field: "hr_freigegeben", hozAlign: "center", 
                formatter: dateFormatter, width: 140, sorter:"string", headerFilter: dateFilter, headerFilterFunc:'dates' },                             
            { title: 'Intern', field: "intern", hozAlign: "center", width: 100,
                formatter:"tickCross", formatterParams: {
                    tickElement: '<i class="fas fa-check text-success"></i>',
                    crossElement: '<i class="fas fa-times text-danger"></i>'
                },
                headerFilter:"tickCross", headerFilterParams: {
                    "tristate":true,elementAttributes:{"value":"true"}
                }, headerFilterEmptyCheck:function(value){return value === null}
            },        
            { title: 'Dokumente', field: "dokumente", hozAlign: "left", formatter: dokFormatter,
                width: 140, headerFilter:false },       
        ];

        if( props.readonlyMode === false) {
            columnsDef.push({ title: "", field: "training_id", formatter: btnFormatter, hozAlign: "right", width: 100, headerSort: false, frozen: true });
        }

        const tabulatorOptions = Vue.reactive({
            persistenceID: 'pv21_emp_training_2026042203',
            height: "100%",
            layout: "fitColumns",
            movableColumns: true,
            reactiveData: true,
            placeholder: "No data available",
            columns: columnsDef,
            data: trainingListArray.value,
        });   

        

        const refreshList = () => {
            $api.call(ApiWeiterbildung.getAllByUID(currentUID.value)).then((r) => {
                trainingList.value = r.data
            });   
        }

        watchEffect(() => {
            currentPersonID.value = Number(route.params.id);
            currentUID.value = route.params.uid;
        });

        const showDeletedToast = () => {
            $fhcAlert.alertSuccess('Weiterbildung gelöscht');
        }

        watch(trainingListArray, (newVal, oldVal) => {
                employeeTrainingRef.value?.tabulator?.setData(trainingListArray.value);
        }, {deep: true})

        Promise.all([
            fetchKategorien(), fetchKategorieTypen()
        ]).then(() => {
            $api.call(ApiWeiterbildung.getAllByUID(currentUID.value)).then((r) => {
                    trainingList.value = r.data
            });                               
        })

        const runWeiterbildungExpireJob = async (uid) => {
            try {
                const res = await $api.call(ApiWeiterbildung.runWeiterbildungExpireJob(uid));                
                if (res.meta.status == "success") {
                //    trainingList.value = trainingList.value.filter(val => val.weiterbildung_id != id);
                    if (res.data.count > 0) {
                        $fhcAlert.alertSuccess(res.data.count + ' Benachrichtigung(en) verschickt.');
                    } else {
                        $fhcAlert.alertSuccess('Keine Benachrichtigung verschickt.');
                    }
                    
                } else {
                    $fhcAlert.alertError('Keine Benachrichtigung verschickt.');
                }
            } catch (error) {
                $fhcAlert.handleSystemError(error)             
            } finally {
                isFetching.value = false
            }   
        }

        const showAddModal = () => {            
            editDialogRef.value.showModal(createShape());
        }

        const showEditModal = async (currentRow) => {
            currentValue.value = { ...currentRow };            
            editDialogRef.value.showModal(currentValue.value);
        }
        
        const showDeleteModal = async (currentRow) => {
            currentValue.value = { ...currentRow };
            
            if (await $fhcAlert.confirm({
                    message:  currentValue.value.bezeichnung + t('person', 'wirklichLoeschen'),
                    acceptLabel: 'Löschen',
                    acceptClass: 'p-button-danger'
                }) === false) {
                return;
            }    

            try {
                const id = currentValue.value.weiterbildung_id;
                const res = await $api.call(ApiWeiterbildung.deleteTraining(id));                
                if (res.meta.status == "success") {
                    trainingList.value = trainingList.value.filter(val => val.weiterbildung_id != id);
                    showDeletedToast();
                }
            } catch (error) {
                $fhcAlert.handleSystemError(error)             
            } finally {
                isFetching.value = false
            }   
                
        }

        return {currentPersonID, currentUID, isFetching, t, employeeTrainingRef, editDialogRef, refreshList, runWeiterbildungExpireJob, kategorieFilterListe,
            readonly, showAddModal, showEditModal, showDeleteModal, interneChecked, kategorienList, kategorieTypen, tabulatorOptions}
    },
    template: `
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid px-1">
            <div class="row">                
                <div class="row pt-md-4">

                    <!-- content -->
                    <div class="col">
                        <div class="card">
                            <div class="card-header">
                                <div class="h5"><h5>{{ t('person','weiterbildung') }}</h5></div>        
                            </div>

                            <div class="card-body">
                                <!-- div class="d-grid d-md-flex justify-content-between pt-2 pb-3" v-if="readonlyMode === false">
                                    <button type="button" class="btn btn-sm btn-primary me-3" @click="showAddModal()">
                                        <i class="fa fa-plus"></i> {{ t('person','weiterbildung') }}
                                    </button>
                                    <button type="button" class="btn btn-sm btn-primary me-3" @click="runWeiterbildungExpireJob(currentUID)">
                                        <i class="fa fa-envelope"></i> Benachrichtigung
                                    </button>
                                    
                                </div -->

                                <core-filter-cmpt 
                                    ref="employeeTrainingRef"
                                    table-only
                                    :side-menu="false"
                                    :tabulator-options="tabulatorOptions"
                                    
                                    >
                                    <template #actions>				
                                        <div class="d-flex gap-2 align-items-baseline">					
                                
                                            <div class="d-grid d-sm-flex gap-1 mb-2 flex-nowrap" v-if="readonlyMode === false">       
                                                <button type="button" class="btn btn-sm btn-primary me-3" @click="showAddModal()">
                                                    <i class="fa fa-plus"></i> {{ t('person','weiterbildung') }}
                                                </button>
                                                <button type="button" class="btn btn-sm btn-primary me-3" @click="runWeiterbildungExpireJob(currentUID)">
                                                    <i class="fa fa-envelope"></i> Benachrichtigung
                                                </button>
                                            
                                            </div>

                                        </div>
                                    </template>
                                </core-filter-cmpt>
                            
                            </div>
                        </div>
                    </div>
                    <!-- end content -->
                    
                </div>            
            </div>                      
        </div>
    </div>

    <edit-dialog  ref="editDialogRef"  :kategorien="kategorienList"  @changed="refreshList()"></edit-dialog>

    `
}