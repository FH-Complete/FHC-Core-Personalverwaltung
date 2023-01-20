import {OrgChooser} from "../../organisation/OrgChooser.js";
import {VertragArtChooser} from "./VertragArtChooser.js";
import { Modal } from '../../Modal.js';

export const DVDialog = {
    components: {
        OrgChooser,
        VertragArtChooser,
        Modal,
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        personUID: { type: String, required: true },
        writePermission: { type: Boolean, required: false },
        //currentValue: { type: Object, required: true },
    },
    setup( props ) {

        // Modal 
        const modalRef = Vue.ref();
        const currentValue = Vue.ref();
        const isFetching = Vue.ref(false);
        let _resolve;
        let _reject;

        const unternehmenSelectedHandler = (unternehmenID) => {
            console.log('org selected:', unternehmenID);
			currentValue.value.unternehmenID = unternehmenID;
        }

        const vertragsartSelectedHandler = (vertragsart) => {
            currentValue.value.vertragsartKurzbz = vertragsart;
        }

        const showModal = (personUID) => {
            
            currentValue.value = createShape(personUID);
            // reset form state
            frmState.vonBlured=false;
            frmState.bisBlured=false;
            frmState.stundenBlured = false;
            frmState.gehaltBlured = false;
            frmState.kuendigungsfristBlured = false;
            frmState.urlaubsanspruchBlured = false;
            // call bootstrap show function
            modalRef.value.show();
            return new Promise((resolve, reject) => {
                _resolve = resolve;
                _reject = reject;
            })
        }

        const hideModal = () => {
            modalRef.value.hide();
        }
        

        const getFirstOfMonth = () => {
            let date = new Date();
            let firstDay = date.getFullYear() + '-' 
                + String(date.getMonth()+ 1).padStart(2, '0') + '-01' ;
            return firstDay;
        }

        const createShape = (person_id) => {
            return {
                mitarbeiterUID: person_id,
                von: getFirstOfMonth(),
                bis: null,
                befristet: false,
                vertragsartKurzbz: '',
                unternehmenID: null,
                stunden: null,
                gehalt: null,
                kuendigungsfrist: null,
                urlaubsanspruch: null,
            } 
        }

        const okHandler = () => {
            if (!frmState.bisBlured && currentValue.value.befristet) {
                frmState.bisBlured = true;;
            }
            if (!dienstvehaeltnisFrm.value.checkValidity()) {

                console.log("form invalid");        

            } else {

                console.log("form valid");
                
                postData()
                    .then((r) => {
                        if (r.error == 0) {
                            console.log('dienstverhaeltnis successfully saved');
                            showToast();
                        }                       
                    }
                    )
                    .catch((error) => {
                        console.log(error.message);
                    });
                
                hideModal();
                _resolve(true);
            }
        }

        // -------------
        // form handling
        // -------------

        const dienstvehaeltnisFrm = Vue.ref();

        const frmState = Vue.reactive({ vonBlured: false, bisBlured: false, vertragsartKurzbzBlured: false, befristetBlured: false,
            stundenBlured: false, gehaltBlured: false, kuendigungsfristBlured: false, urlaubsanspruchBlured: false, wasValidated: false });

        const validVon = (n) => {
            return !!n && n != "";
        }

        const validBis = (n) => {
            return  !currentValue.value.befristet || (currentValue.value.befristet && !!n && n != "");
        }

        const validVertragsartKurzbz = (n) => {
            return !!n && n.trim() != "";
        }

        const validate = () => {
            frmState.bisBlured = true;
            if (validIban(currentValue.value.iban)) {
                return true;
            }
            return false;
        }

        const cancelHandler = () =>  {
            hideModal();
            _resolve(false);
        }

        const postData = async () => {
            isFetching.value = true
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            const endpoint =
                `${full}/extensions/FHC-Core-Personalverwaltung/api/createDV`;

            const res = await fetch(endpoint,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentValue.value),
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
        
        Vue.defineExpose({ showModal });

        return { modalRef, showModal, hideModal, okHandler,cancelHandler, currentValue, validVon, validBis,
                 dienstvehaeltnisFrm, unternehmenSelectedHandler, vertragsartSelectedHandler, frmState };
    },
    template: `
        <Modal title="Dienstverhältnis" ref="modalRef">
            <template #body>
                <form class="row g-3" ref="dienstvehaeltnisFrm" v-if="currentValue">
                                
                    <div class="col-md-4">
                        <label for="receiver" class="required form-label">Organisation</label>
                        <org-chooser  @org-selected="unternehmenSelectedHandler" class="form-control form-select-sm"></org-chooser>
                    </div>
                    <div class="col-md-4">
                        <label for="vertragart" class="required form-label">Vertragsart</label>
                        <vertrag-art-chooser  @art-selected="vertragsartSelectedHandler" class="form-control form-select-sm"></vertrag-art-chooser>
                    </div>
                    
                    <div class="col-md-4">
                        <label for="befristetCheck" class="form-label">Befristet</label><br>
                        <input class="form-control-sm" type="checkbox" id="befristetCheck" v-model="currentValue.befristet" >
                    </div>
                    

                    <div class="col-md-4">
                        <label for="von" class="required form-label" >Von</label>
                        <input type="date" required  @blur="frmState.vonBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validVon(currentValue.von) && frmState.vonBlured}" id="von" v-model="currentValue.von" >
                    </div>                    
                    <div class="col-md-4">
                        <label for="bis" class="form-label" :class="{required: currentValue.befristet}" >Bis</label>
                        <input type="date" :required="currentValue.befristet"  @blur="frmState.bisBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validBis(currentValue.bis) && frmState.bisBlured}" id="bis" v-model="currentValue.bis" >
                    </div>
                    <div class="col-md-4"></div>

                    <div class="col-md-4">
                        <label for="stunden" class="form-label" >Stunden</label>
                        <input type="number" @blur="frmState.stundenBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="stunden" v-model="currentValue.stunden">
                    </div>  
                    <div class="col-md-4">
                        <label for="gehalt" class="form-label" >Gehalt</label>
                        <input type="number" @blur="frmState.gehaltBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="gehalt" v-model="currentValue.gehalt" >
                    </div>
                    <div class="col-md-4"></div>

                    <div class="col-md-4">
                        <label for="kuendigungsfrist" class="form-label" >Kündigungsfrist</label>
                        <input type="number" @blur="frmState.kuendigungsfristBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="kuendigungsfrist" v-model="currentValue.kuendigungsfrist" >
                    </div>  
                    <div class="col-md-4">
                        <label for="urlaubsanspruch" class="form-label" >Urlaubsanspruch</label>
                        <input type="number" @blur="frmState.urlaubsanspruchBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly}" id="urlaubsanspruch" v-model="currentValue.urlaubsanspruch" min="0">
                    </div>
                    <div class="col-md-4"></div>
                    <div class="col-md-12">

                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Zeitraum</th>
                                    <th scope="col">Typ</th>
                                    <th scope="col">Zuordnung</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">1.12.2015-</th>
                                    <td>Disziplinär</td>
                                    <td></td>
                                    <td>
                                        <button type="button" class="btn btn-sm btn-outline-secondary">
                                            <i class="fa fa-pen"></i>
                                        </button><button type="button" class="btn btn-sm btn-outline-secondary">
                                            <i class="fa fa-minus"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">1.12.2015-</th>
                                    <td>Fachlich</td>
                                    <td></td>
                                    <td>
                                        <button type="button" class="btn btn-sm btn-outline-secondary">
                                            <i class="fa fa-pen"></i>
                                        </button><button type="button" class="btn btn-sm btn-outline-secondary">
                                            <i class="fa fa-minus"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">1.12.2015-</th>
                                    <td>Std.Kst.</td>
                                    <td></td>
                                    <td>
                                        <button type="button" class="btn btn-sm btn-outline-secondary">
                                            <i class="fa fa-pen"></i>
                                        </button><button type="button" class="btn btn-sm btn-outline-secondary">
                                            <i class="fa fa-minus"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">1.12.2015-</th>
                                    <td>OE-Zuordnung</td>
                                    <td></td>
                                    <td>
                                        <button type="button" class="btn btn-sm btn-outline-secondary">
                                            <i class="fa fa-pen"></i>
                                        </button><button type="button" class="btn btn-sm btn-outline-secondary">
                                            <i class="fa fa-minus"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">1.12.2015-</th>
                                    <td>LektorIn</td>
                                    <td></td>
                                    <td>
                                        <button type="button" class="btn btn-sm btn-outline-secondary">
                                            <i class="fa fa-pen"></i>
                                        </button><button type="button" class="btn btn-sm btn-outline-secondary">
                                            <i class="fa fa-minus"></i>
                                        </button>
                                    </td>
                                </tr>
                                
                            </tbody>
                        </table>



                    </div>

                    
                    <!-- changes -->
                    <div class="col-8">
                        <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
                    </div>
                    
                </form>
            </template>
            <template #footer>
                <button type="button" class="btn btn-secondary" @click="cancelHandler()">
                    Abbrechen
                </button>
                <button type="button" class="btn btn-primary" @click="okHandler()" >
                    OK
                </button>
            </template>

        </Modal>`


}


