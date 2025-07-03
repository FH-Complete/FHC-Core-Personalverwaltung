import { Modal } from '../../Modal.js';
import { ModalDialog } from '../../ModalDialog.js';
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import ApiPerson from '../../../api/factory/person.js';
import ApiCommon from '../../../api/factory/common.js';


export const AddressData = {
	name: 'AddressData',
    components: {
        Modal,
        ModalDialog,
    },
    props: {
        personID: { type: Number, required: true },
        writePermission: { type: Boolean, required: false },
    },  
    setup(props) {

        const { personID } = Vue.toRefs(props);
        const $api = Vue.inject('$api');
        const $fhcAlert = Vue.inject('$fhcAlert');

        const { t } = usePhrasen();

        const urlAddressData = Vue.ref("");

        const addressList = Vue.ref([]);

        const isFetching = Vue.ref(false);

        const isEditActive = Vue.ref(false);

        const currentAddress = Vue.ref();

        const nations = Vue.inject('nations');
        const adressentyp = Vue.inject('adressentyp');

        const gemeinden = Vue.ref([]);

        const ortschaften = Vue.ref([]);

        const readonly = Vue.ref(false);

        Vue.watch(personID, (currentValue, oldValue) => {
            console.log('AddressData watch',currentValue);            
            fetchData();
        });

        const fetchData = async () => {
            if (personID.value==null) {
                addressList.value = [];
                return;
            }
            isFetching.value = true
            // submit
            try {
                const response = await $api.call(ApiPerson.personAddressData(personID.value)); 
                addressList.value = response.data;
            } catch (error) {
                console.log(error)              
            } finally {
                isFetching.value = false
            }
            
        }


        Vue.watchEffect(async () => {
            if (currentAddress?.value?.nation == 'A' && currentAddress.value.plz != '') {
                try  {
                    isFetching.value = true
                    const response = await $api.call(ApiCommon.getGemeinden(currentAddress.value.plz));     
                    gemeinden.value = response.data;
                } catch (error) {
                    console.log(error)                    
                } finally {
                    isFetching.value = false
                }
            }            
        })

        Vue.watchEffect(async () => {
            if (currentAddress?.value?.nation == 'A' && currentAddress.value.plz != '') {
                try  {
                    isFetching.value = true
                    const response = await $api.call(ApiCommon.getOrtschaften(currentAddress.value.plz));     
                    ortschaften.value = response.data;
                } catch (error) {
                    console.log(error)                    
                } finally {
                    isFetching.value = false
                }
            }            
        })

        Vue.onMounted(() => {            
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

            if (await $fhcAlert.confirm({
                    message:`${currentAddress.value?.plz} ${currentAddress.value?.ort}, ${currentAddress.value?.strasse} wirklich löschen?`,
                    acceptLabel: 'Löschen',
				    acceptClass: 'p-button-danger'
                }) === false) {
                return;
            }     
            
            if (!currentAddress.value.heimatadresse) {   

                try {
                    const res = await $api.call(ApiPerson.deletePersonAddressData(id));   
                    if (res?.meta?.status == 'success') {
                        delete addressList.value[id];
                        showDeletedToast();
                    }
                } catch (error) {
                    console.log(error)              
                } finally {
                      isFetching.value = false
                }                  
                
            } else {
                $fhcAlert.alertInfo(t('person','heimatadresse') + ' ' + t('person','kannNichtGeloeschtWerden'));
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
                typ: "h",
                heimatadresse: false,
                zustelladresse: true,
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
            frmState.typBlured=false;
            // call bootstrap show function
            modalRef.value.show();
        }

        const hideModal = () => {
            modalRef.value.hide();
        }

       

        const okHandler = async () => {
            if (!validate()) {

                console.log("form invalid");

            } else {

                // submit
                try {
                    const r = await $api.call(ApiPerson.upsertPersonAddressData(currentAddress.value))
                    if (r?.meta?.status == 'success') {
                        addressList.value[r.data[0].adresse_id] = r.data[0];
                        console.log('address successfully saved');
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

        const addressDataFrm = Vue.ref();

        const frmState = Vue.reactive({ plzBlured: false, ortBlured: false, typBlured:false, wasValidated: false });

        const validPLZ = (n) => {
            return !!n && n.trim() != "";
        }

        const validOrt = (n) => {
            return !!n && n.trim() != "";
        }

        const validTyp = (n) => {
            return !!n && n.trim() != "";
        }

        const validate = () => {
            frmState.plzBlured = true;
            frmState.ortBlured = true;
            frmState.typBlured = true;
            if (validOrt(currentAddress.value.ort) && validPLZ(currentAddress.value.plz) && validTyp(currentAddress.value.typ)) {
                return true;
            }
            return false;
        }
        
        const showToast = () => {
            $fhcAlert.alertSuccess(t('person','adresseGespeichert'));
        }

        const showDeletedToast = () => {
            $fhcAlert.alertSuccess(t('person','adresseGeloescht'));
        }

        return {
            addressList, addressListArray, isEditActive, showAddModal, 
            showDeleteModal, showEditModal, currentAddress, 
            modalRef,hideModal, okHandler, nations,
            gemeinden, ortschaften, adressentyp, t,
            // form handling
            validOrt, validPLZ, validTyp, frmState, addressDataFrm, readonly
        }
        
    },
    template: ` 
        <div class="row">

            <div class="d-flex bd-highlight">
                <div class="py-2 bd-highlight">                   
                    <button type="button" class="btn btn-primary btn-sm"  @click="showAddModal()" style="margin-right:1.85rem;">
                        <i class="fa fa-plus"></i> {{ t('person','adresse') }}
                    </button>
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-hover table-sm">
                <thead>                
                <tr>
                    <th scope="col">{{ t('global','typ') }}</th>
                    <th scope="col">{{ t('person','strasse') }}</th>
                    <th scope="col">{{ t('person','plz') }}</th>
                    <th scope="col">{{ t('person','ort') }}</th>
                    <th scope="col">{{ t('person','gemeinde') }}</th>
                    <th scope="col">{{ t('person','nation') }}</th>
                    <th scope="col">{{ t('person','heimatadresse') }}</th>
                    <th scope="col">{{ t('person','zustelladresse') }}</th>
                    <th scope="col">{{ t('person','abweichenderEmpfaenger') }}</th>
                    <th scope="col">{{ t('ui','aktion') }}</th>
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
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click="showEditModal(address.adresse_id)">
                                <i class="fa fa-pen"></i>
                            </button>
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click="showDeleteModal(address.adresse_id)">
                                <i class="fa fa-xmark"></i>
                            </button>
                        </div>
                    </td>
                </tr>

                </tbody>
            </table>            
        </div>

        <!-- Detail Modal -->
        <Modal :title="t('person','adresse')" ref="modalRef">
            <template #body>
                <form class="row g-3" v-if="currentAddress != null"  ref="addressDataFrm" >
                               
                    <div class="col-md-6">
                        <label for="strasse" class="form-label">{{ t('person','strasse') }}</label>
                        <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="strasse" v-model="currentAddress.strasse" maxlength="256">
                    </div>
                    <div class="col-md-6">
                        <label for="nation" class="form-label">Nation</label>
                        <select  id="nation" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="currentAddress.nation" >
                            <option v-for="(item, index) in nations" :value="item.nation_code" :class="{ 'grayout': item.sperre}"  :disabled="item.sperre">
                                {{ item.nation_text }}
                            </option>
                        </select>
                        
                    </div>
                    <div class="col-md-2">
                        <label for="plz" class="required form-label" >{{ t('person','plz') }}</label>
                        <input type="text" required :readonly="readonly" @blur="frmState.plzBlured = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validPLZ(currentAddress.plz) && frmState.plzBlured}" id="plz" maxlength="16" v-model="currentAddress.plz" >
                    </div>
                    <div class="col-md-4">
                        <label for="ort" class="required form-label">{{ t('person','ort') }}</label>
                        <input v-if="currentAddress.nation!='A'" type="text" required :readonly="readonly" @blur="frmState.ortBlured = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validOrt(currentAddress.ort) && frmState.ortBlured}" id="ort" maxlength="256" v-model="currentAddress.ort" >
                        <select  v-if="currentAddress.nation=='A'" id="nation" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="currentAddress.ort" >
                            <option v-for="(item, index) in ortschaften" :value="item.ortschaftsname">
                                {{ item.ortschaftsname }}
                            </option>
                        </select>
                    </div>
                    <!-- Gemeinde -->
                    <div class="col-md-6">
                        <label for="gemeinde" class="form-label">{{ t('person','gemeinde') }}</label>
                        <input v-if="currentAddress.nation!='A'" type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="gemeinde" maxlength="256" v-model="currentAddress.gemeinde">
                        <select  v-if="currentAddress.nation=='A'" id="gemeinde" class="form-select form-select-sm" aria-label=".form-select-sm "  v-model="currentAddress.gemeinde" >
                            <option v-for="(item, index) in gemeinden" :value="item.name">
                                {{ item.name }}
                            </option>
                        </select>
                    </div>

                    <!-- c/o -->
                    <div class="col-md-6">
                        <label for="co_name" class="form-label">{{ t('person','abweichenderEmpfaenger') }}</label>
                        <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="co_name" maxlength="256" v-model="currentAddress.co_name">
                    </div>

                    <!-- Adresstyp (Hauptwohnsitz, Nebenwohnsitz, etc.) -->
                    <div class="col-md-3">
                        <label for="typ" class="required form-label">{{ t('global','typ') }}</label>
                        <select  id="typ" class="form-select form-select-sm" aria-label=".form-select-sm " @blur="frmState.typBlured = true" v-model="currentAddress.typ" :class="{'is-invalid': !validTyp(currentAddress.typ) && frmState.typBlured}">
                            <option v-for="(item, index) in adressentyp" :value="item.adressentyp_kurzbz">
                                {{ item.bezeichnung }}
                            </option>
                        </select>
                    </div>
                    
                    <div class="col-md-1">                                             
                        <label for="heimatadresse" class="form-label">{{ t('person','heimatadresse') }}</label>
                        <div>
                            <input class="form-check-input" type="checkbox" id="heimatadresse" v-model="currentAddress.heimatadresse">
                        </div>
                    </div>
                    <div class="col-md-1">
                        <label for="zustelladresse" class="form-label">{{ t('person','zustelladresse') }}</label>
                        <div>
                            <input class="form-check-input" type="checkbox" id="zustelladresse" v-model="currentAddress.zustelladresse">
                        </div>                        
                    </div>
                    
                    
                    <div class="col-8" v-if="currentAddress.adresse_id != 0">
                        <div class="modificationdate">{{ currentAddress.insertamum }}/{{ currentAddress.insertvon }}, {{ currentAddress.updateamum }}/{{ currentAddress.updatevon }}</div>
                    </div>
                </form>        

            </template>
            <template #footer>
                <button type="button" class="btn btn-primary" @click="okHandler()" >
                    {{ t('ui','speichern') }}
                </button>
            </template>
        </Modal>

        
        `
}