import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';
import ApiPerson from '../../api/factory/person.js';

export const MaterialExpensesData = {
	name: 'MaterialExpensesData',
    components: {
        Modal,
        ModalDialog,
        Toast,
        "datepicker": VueDatePicker
    },
    props: {
        modelValue: { type: Object, default: () => ({}), required: false},
        config: { type: Object, default: () => ({}), required: false},        
        writePermission: { type: Boolean, required: false },
    },
    setup( props ) {

        const $api = Vue.inject('$api');
        const readonly = Vue.ref(false);

        const { t } = usePhrasen();
        const numberFormat = new Intl.NumberFormat('de-AT',{
            minimumFractionDigits: 2
          });

        const theModel = Vue.computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        });

       // const { personID: currentPersonID , personUID: currentPersonUID  } = Vue.toRefs(props);

        const uid = Vue.ref("");

        const dialogRef = Vue.ref();

        const url = Vue.ref("");

        const isFetching = Vue.ref(false);

        const materialdataList = Vue.ref([]);

        const types = Vue.inject('sachaufwandtyp');

        const full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

        const fetchData = async () => {
            if (theModel.value.personID==null && props.personID==null) {    
                materialdataList.value = [];            
                return;
            }
            isFetching.value = true
 
            // submit
            try {
                const response = await $api.call(ApiPerson.personMaterialExpenses(theModel.value.personID, theModel.value.personUID));
                materialdataList.value = response.retval;
            } catch (error) {
                console.log(error)              
            } finally {
                isFetching.value = false
            }
                       
        }

        const createShape = () => {
            return {
                sachaufwand_id: 0,
                mitarbeiter_uid: theModel.value.personUID,
                sachaufwandtyp_kurzbz: "",
                beginn: "",
                ende: "",  
                anmerkung: "",     
                betrag: "",
            } 
        }

        const currentValue = Vue.ref(createShape());
        const preservedValue = Vue.ref(createShape());

        Vue.watch([theModel], ([id,uid]) => {
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
            currentValue.value = createShape();
            fetchData();
        })

        const materialdataListArray = Vue.computed(() => (materialdataList.value ? Object.values(materialdataList.value) : []));

        // Modal 
        const modalRef = Vue.ref();
        const confirmDeleteRef = Vue.ref();

        const showAddModal = () => {
            currentValue.value = createShape();
            // reset form state
            frmState.beginnBlurred=false;
            frmState.betragBlurred=false;
            // call bootstrap show function
            modalRef.value.show();
        }

        const hideModal = () => {
            modalRef.value.hide();
        }
        
        const showEditModal = (id) => {
            currentValue.value = { ...materialdataList.value[id] };
            delete currentValue.value.bezeichnung;
			if(currentValue.value.betrag !== null) {
				currentValue.value.betrag = (String(currentValue.value.betrag)).replace('.', ',');
			}
            modalRef.value.show();
        }

        const showDeleteModal = async (id) => {
            currentValue.value = { ...materialdataList.value[id] };
			if(currentValue.value.betrag !== null) {
				currentValue.value.betrag = (String(currentValue.value.betrag)).replace('.', ',');
			}
            const ok = await confirmDeleteRef.value.show();
            
            if (ok) {   

                try {
                    const res = await $api.call(ApiPerson.deletePersonMaterialExpenses(id));
                    if (res.error == 0) {
                        delete materialdataList.value[id];
                        showDeletedToast();
                    }
                } catch (error) {
                    console.log(error)              
                } finally {
                      isFetching.value = false
                }   
                
            }
        }


        const okHandler = async () => {
            if (!validate()) {

                console.log("form invalid");

            } else {

                // submit
                try {
					if(currentValue.value.betrag !== null) {
						currentValue.value.betrag = (String(currentValue.value.betrag)).replace(',', '.');
					}
                    const r = await $api.call(ApiPerson.upsertPersonMaterialExpenses(currentValue.value));
                    if (r.error == 0) {
                        materialdataList.value[r.retval[0].sachaufwand_id] = r.retval[0];
                        console.log('materialdata successfully saved');
                        showToast();
                    }  
                } catch (error) {
                    console.log(error)              
                } finally {
                    isFetching.value = false
                }
                
                hideModal();
            }
        }

        // -------------
        // form handling
        // -------------

        const materialDataFrm = Vue.ref();

        const frmState = Vue.reactive({ beginnBlurred: false, wasValidated: false });

        const validBeginn = (n) => {
            return !!n && n.trim() != "";
        }

		const validBetrag = (betrag) => {
			if( betrag === null || betrag === '' ) {
				return true;
			}

			if( betrag.match(/^[0-9]{1,7}(,[0-9]{0,2})?$/) ) {
				return true;
			}

            return false;
        }

        const validate = () => {
			let retval = true;

            frmState.beginnBlurred = true;
            if (!validBeginn(currentValue.value.beginn)) {
                retval = false;
            }

            frmState.betragBlurred = true;
            if (!validBetrag(currentValue.value.betrag)) {
                retval = false;
            }

            return retval;
        }

        const hasChanged = Vue.computed(() => {
            return Object.keys(currentValue.value).some(field => currentValue.value[field] !== preservedValue.value[field])
        });

        const formatDate = (d) => {
            if (d != null && d != '') {
		        return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
            } else {
                return ''
            }
        }

        const formatNumber = (num) => {
            let n = parseFloat(num);
            if (isNaN(n)) {
                return '';
            }
            return numberFormat.format(parseFloat(num),);
        }

        const getType = (kurzbz) => {
            let t = types.value.filter((item) => item.sachaufwandtyp_kurzbz == kurzbz);
            return t.length > 0 ? t[0].bezeichnung : ''
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
            materialdataList, materialdataListArray,
            currentValue,
            readonly,
            frmState,
            dialogRef,
            toastRef, deleteToastRef,
            materialDataFrm,
            modalRef,
            types, 
            
            toggleMode,  validBeginn, validBetrag, formatDate,
            showToast, showDeletedToast,
            showAddModal, hideModal, okHandler,
            showDeleteModal, showEditModal, confirmDeleteRef, t,
            getType, formatNumber
         }
    },
    template: `
    <div class="row">

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
          <Toast ref="toastRef">
            <template #body><h4>{{ t('person','sachaufwandGespeichert') }}</h4></template>
          </Toast>
        </div>

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
            <Toast ref="deleteToastRef">
                <template #body><h4>{{ t('person', 'sachaufwandGeloescht') }}</h4></template>
            </Toast>
        </div>
    </div>
    <div class="row pt-md-4">      
         <div class="col">
             <div class="card">
                <div class="card-header">
                    <div class="h5"><h5>{{ t('person','sachaufwand') }}</h5></div>        
                </div>

                <div class="card-body">
                    <div class="d-grid d-md-flex justify-content-start py-2">
                        <button type="button" class="btn btn-sm btn-primary" @click="showAddModal()">
                        <i class="fa fa-plus"></i> {{ t('person','sachaufwand') }}
                        </button>            
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover table-sm">
                            <thead>                
                            <tr>
                                <th scope="col">{{ t('global','typ') }}</th>
                                <th scope="col">{{ t('ui','from') }}</th>
                                <th scope="col">{{ t('global','bis') }}</th>
                                <th scope="col">{{ t('ui','betrag') }}</th>
                                <th scope="col">{{ t('global','anmerkung') }}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="materialdata in materialdataListArray" :key="materialdata.sachaufwand_id">
                                <td class="align-middle">{{ getType(materialdata.sachaufwandtyp_kurzbz) }}</td>
                                <td class="align-middle">{{ formatDate(materialdata.beginn) }}</td>
                                <td class="align-middle">{{ formatDate(materialdata.ende) }}</td>
                                <td class="align-middle">{{ formatNumber(materialdata.betrag) }}</td>
                                <td class="align-middle">{{ materialdata.anmerkung }}</td>
                                <td class="align-middle" width="5%">
                                    <div class="d-grid gap-2 d-md-flex align-middle">
                                        <button type="button" class="btn btn-outline-secondary btn-sm" @click="showEditModal(materialdata.sachaufwand_id)">
                                            <i class="fa fa-pen"></i>
                                        </button>
                                        <button type="button" class="btn btn-outline-secondary btn-sm" @click="showDeleteModal(materialdata.sachaufwand_id)">
                                            <i class="fa fa-xmark"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                
                            </tbody>
                        </table>            
                    </div>
                </div>
             </div>
         </div>
    </div>
            

    <!-- detail modal -->
    <Modal :title="t('person','sachaufwand')" ref="modalRef">
        <template #body>
            <form class="row g-3" ref="materialDataFrm">
                            
                <div class="col-md-4">
                    <label for="sachaufwandtyp_kurzbz" class="form-label">{{ t('global','typ') }}</label><br>
                    <select v-if="!readonly" id="sachaufwandtyp_kurzbz" v-model="currentValue.sachaufwandtyp_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " >
                        <option v-for="(item, index) in types" :value="item.sachaufwandtyp_kurzbz">
                            {{ item.bezeichnung }}
                        </option>                       
                    </select>
                    <input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="sachaufwandtyp_kurzbz" :value="currentValue.sachaufwandtyp_kurzbz">
                </div>
                <!--  -->
                <div class="col-md-3">
                    <label for="beginn" class="required form-label">{{ t('ui','from') }}</label>
                    <datepicker id="beginn" 
                        :teleport="true" 
                        @blur="frmState.beginnBlurred = true" 
                        :input-class-name="(!validBeginn(currentValue.beginn) && frmState.beginnBlurred) ? 'dp-invalid-input' : ''"  
                        v-model="currentValue.beginn"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>
                <div class="col-md-3">
                    <label for="ende" class="form-label">{{ t('global','bis') }}</label>
                    <datepicker id="ende" 
                        :teleport="true" 
                        v-model="currentValue.ende"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>
                <div class="col-md-2">
                </div>
                <!-- -->
                <div class="col-md-3">
                    <label for="betrag" class="form-label">{{ t('ui','betrag') }}</label>
					<input type="text" :readonly="readonly" @blur="frmState.betragBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'dp-invalid-input': (!validBetrag(currentValue.betrag) && frmState.betragBlurred)}" id="betrag" v-model="currentValue.betrag">
                </div>
                <div class="col-md-7">
                    <label for="uid" class="form-label">{{ t('global','anmerkung') }}</label>
                    <input type="text"  :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="bank" v-model="currentValue.anmerkung">
                </div>
                <div class="col-md-2">
                </div>
                
                <!-- changes -->
                <div class="col-8">
                    <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
                </div>
                
            </form>
        </template>
        <template #footer>
            <button type="button" class="btn btn-primary" @click="okHandler()" >
                {{ t('ui','speichern') }}
            </button>
        </template>

    </Modal>

    <ModalDialog :title="t('global','warnung')" ref="dialogRef">
      <template #body>
        {{ t('person','sachaufwandNochNichtGespeichert') }}
      </template>
    </ModalDialog>

    <ModalDialog :title="t('global','warnung')" ref="confirmDeleteRef">
        <template #body>
            {{ t('person','sachaufwand') }} '{{ getType(currentValue?.sachaufwandtyp_kurzbz) }} ({{ currentValue?.beginn }}-{{ currentValue?.ende }})' {{ t('person', 'wirklichLoeschen') }}?
        </template>
    </ModalDialog>
    `
}

export default MaterialExpensesData;