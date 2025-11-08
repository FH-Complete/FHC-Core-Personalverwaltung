import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import {OrgChooser} from "../../../components/organisation/OrgChooser.js";
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import { dateFilter } from '../../../../../../js/tabulator/filters/Dates.js';
import ApiFunktion from '../../../api/factory/funktion.js';
import ApiPerson from '../../../api/factory/person.js';
import { EditDialog } from './EditDialog.js';

export const EmployeeTraining = {
	name: 'EmployeeTraining',
    components: {
        Modal,
        ModalDialog,
        OrgChooser,
        EditDialog,
        "datepicker": VueDatePicker,
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
        const { watch, ref, onMounted } = Vue; 
        const currentPersonID = ref(null);
        const currentUID = ref(null);
        const currentValue = ref();
        const editDialogRef = ref();   
        const isFetching = ref(false);
        const interneChecked = Vue.ref(true);
        const trainingList = Vue.ref({
            1: { "training_id" : 1, 
                "kategorie":"Kategorie 1/Sub-Kategorie 1", 
                "stunden":"8", 
                "datum_von":"2025-11-05", 
                "datum_bis":"2025-11-06", 
                "expires":"2028-11-30", 
                "bezeichnung":"KI-Schulung",
                "beantragt":true,
                "intern_extern":true,
                "hrfreigabe":true
            }
        });
        
        const table = Vue.ref(null); // reference to your table element
        const tabulator = Vue.ref(null); // variable to hold your table
        const tableData = Vue.reactive([]); // data for table to display

        onMounted(() => {
            currentPersonID.value = parseInt(route.params.id);
            currentUID.value = route.params.uid;

            const dateFormatter = (cell) => {
                return cell.getValue()?.replace(/(.*)-(.*)-(.*)/, '$3.$2.$1');
            }

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

            const btnFormatter = (cell) => {

                const nodeDiv = document.createElement("div");  
                const classAttrDiv = document.createAttribute("class");
                classAttrDiv.value = "d-grid gap-2 d-md-flex justify-content-end align-middle";
                nodeDiv.setAttributeNode(classAttrDiv);
                // delete button
                const nodeBtnDel = createDomButton("fa fa-xmark",() => { showDeleteModal(cell.getValue()) })
                // edit button
                const nodeBtnEdit = createDomButton("fa fa-pen",() => { showEditModal(cell.getValue()) })

               // if( cell.getRow().getData().dienstverhaeltnis_unternehmen === null ) {
                    nodeDiv.appendChild(nodeBtnEdit);
                    nodeDiv.appendChild(nodeBtnDel);
                //}
                
                return nodeDiv;
            }

            const columnsDef = [
                { title: t('ui','kategorie'), field: "kategorie", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
                { title: 'Bezeichnung', field: "bezeichnung", hozAlign: "left", headerFilter:"list", headerFilterParams: {valuesLookup:true, autocomplete:true, sort:"asc"} },
                { title: 'Stunden', field: "stunden", hozAlign: "right", 
                    width: 140, headerFilter:true },
                { title: 'Von', field: "datum_von", hozAlign: "center", 
                    formatter: dateFormatter, width: 140, sorter:"string", headerFilter: dateFilter, headerFilterFunc:'dates' },                
                { title: 'Bis', field: "datum_bis", hozAlign: "center", 
                    formatter: dateFormatter, width: 140, sorter:"string", headerFilter: dateFilter, headerFilterFunc:'dates' },
                { title: 'Ablaufdatum', field: "expires", hozAlign: "center", 
                    formatter: dateFormatter, width: 140, sorter:"string", headerFilter: dateFilter, headerFilterFunc:'dates' },  
                { title: 'Beantragt', field: "beantragt", hozAlign: "center",
                    formatter:"tickCross", formatterParams: {
						tickElement: '<i class="fas fa-check text-success"></i>',
						crossElement: '<i class="fas fa-times text-danger"></i>'
					},
                    headerFilter:"tickCross", headerFilterParams: {
						"tristate":true,elementAttributes:{"value":"true"}
					}, headerFilterEmptyCheck:function(value){return value === null}
                 },             
                { title: 'Intern', field: "intern_extern", hozAlign: "center",
                    formatter:"tickCross", formatterParams: {
						tickElement: '<i class="fas fa-check text-success"></i>',
						crossElement: '<i class="fas fa-times text-danger"></i>'
					},
                    headerFilter:"tickCross", headerFilterParams: {
						"tristate":true,elementAttributes:{"value":"true"}
					}, headerFilterEmptyCheck:function(value){return value === null}
                 },
                { title: 'HR-Freigabe', field: "hrfreigabe", hozAlign: "center", 
                    formatter:"tickCross", formatterParams: {
						tickElement: '<i class="fas fa-check text-success"></i>',
						crossElement: '<i class="fas fa-times text-danger"></i>'
					},
                    headerFilter:"tickCross", headerFilterParams: {
						"tristate":true,elementAttributes:{"value":"true"}
					}, headerFilterEmptyCheck:function(value){return value === null}
                },
              ];

            if( props.readonlyMode === false) {
                columnsDef.push({ title: "", field: "training_id", formatter: btnFormatter, hozAlign: "right", width: 100, headerSort: false, frozen: true });
            }

            let tabulatorOptions = {
				height: "100%",
				layout: "fitColumns",
				movableColumns: true,
				reactiveData: true,
                columns: columnsDef,
                //data: tableData.value,
                data: trainingListArray.value,
			};

            tabulator.value = new Tabulator(
				table.value,
				tabulatorOptions
			);

            
        })

        watch(
			() => route.params.id,
			newId => {
				currentPersonID.value = parseInt(newId);
			}
		)

        watch(
			() => route.params.uid,
			newId => {
				currentUID.value = newId;
			}
		)

        const trainingListArray = Vue.computed(() => {
            let temp = (trainingList.value ? Object.values(trainingList.value) : []);
            let filtered = temp.filter((e) => interneChecked.value );
            return filtered;
        });

        Vue.watch(trainingListArray, (newVal, oldVal) => {
                tabulator.value?.setData(trainingListArray.value);
        }, {deep: true})

        // Modal 
        const modalRef = Vue.ref();

        const showAddModal = () => {
            currentValue.value = createShape();
            // reset form state
            frmState.orgetBlurred=false;
            frmState.funktionBlurred=false;            
            frmState.beginnBlurred=false;
            // call bootstrap show function
            modalRef.value.show();
        }

        const showEditModal = async (id) => {
            currentValue.value = { ...trainingList.value[id] };
            // fetch company
            isFetching.value = true;
            try {
                /* const res = await $api.call(ApiFunktion.getCompanyByOrget(currentValue.value.oe_kurzbz));
                if (res.meta.status == "success") {
                    unternehmen.value = res.data[0].oe_kurzbz;
                } else {
                    console.log('company not found for orget!');
                } */

            } catch (error) {
                $fhcAlert.handleSystemError(error)           
            } finally {
                    isFetching.value = false
            editDialogRef.value.showModal();
            }
        }
        
        const showDeleteModal = async (id) => {
            currentValue.value = { ...jobfunctionList.value[id] };
            
            if (await $fhcAlert.confirm({
                    message: t('person','funktion') + ' ' + getJobFunction(currentValue.value?.funktion_kurzbz) + '  (' + formatDate(currentValue.value?.datum_von) + '-' + (currentValue.value.datum_bis != null ? formatDate(currentValue.value.datum_bis) : '?') + ') ' + t('person', 'wirklichLoeschen'),
                    acceptLabel: 'Löschen',
                    acceptClass: 'p-button-danger'
                }) === false) {
                return;
            }    

            try {
                const res = await $api.call(ApiPerson.deletePersonJobFunction(id));                
                if (res.meta.status == "success") {
                    delete jobfunctionList.value[id];
                    showDeletedToast();
                    theModel.value.updateHeader();
                }
            } catch (error) {
                $fhcAlert.handleSystemError(error)             
            } finally {
                    isFetching.value = false
            }   
                
        }

        return {currentPersonID, currentUID, isFetching, t, table, editDialogRef,
            readonly, showAddModal, showEditModal, showDeleteModal, interneChecked}
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
                                <div class="h5"><h5>{{ t('person','weiterbildung') }} {{ t('ui','bezeichnung') }}</h5></div>        
                            </div>

                            <div class="card-body">
                                <div class="d-grid d-md-flex justify-content-between pt-2 pb-3" v-if="readonlyMode === false">
                                    <button type="button" class="btn btn-sm btn-primary me-3" @click="showAddModal()">
                                        <i class="fa fa-plus"></i> {{ t('person','weiterbildung') }}
                                    </button>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" role="switch" id="interneChecked" v-model="interneChecked">
                                        <label class="form-check-label" for="interneChecked">Nur interne anzeigen</label>
                                    </div>
                                </div>

                                <!-- TABULATOR -->
                                <div ref="table" class="fhc-tabulator"></div>
                            
                            </div>
                        </div>
                    </div>
                    <!-- end content -->
                    
                </div>            
            </div>                      
        </div>
    </div>

    <edit-dialog  ref="editDialogRef"></edit-dialog>

    `
}