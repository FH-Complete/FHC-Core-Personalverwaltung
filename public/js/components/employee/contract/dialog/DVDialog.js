import {OrgChooser} from "../../../organisation/OrgChooser.js";
import {VertragArtChooser} from "./VertragArtChooser.js";
import { Modal } from '../../../Modal.js';
import {JobEditor} from './JobEditor.js';
import {FreitextEditor} from './FreitextEditor.js';
import VTab from './vtab/VTab.js'
import VTabs from './vtab/VTabs.js';

export const DVDialog = {
    components: {
        OrgChooser,
        VertragArtChooser,
        Modal,
        JobEditor,
        FreitextEditor,
        VTab,
        VTabs,
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        personUID: { type: String, required: true },
        writePermission: { type: Boolean, required: false },
        //currentValue: { type: Object, required: true },
    },
    expose: ['showModal'],
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

        const openTab = () =>  {}       

        return { modalRef, showModal, hideModal, okHandler,cancelHandler, currentValue, validVon, validBis, 
                 dienstvehaeltnisFrm, unternehmenSelectedHandler, vertragsartSelectedHandler, frmState,openTab };
    },
    template: `
        <Modal :title="'Dienstverhältnis ' + (editMode?'bearbeiten':'anlegen')" ref="modalRef">
            <template #body>


                <VTabs>
                    <VTab title="Dienstverhältnis">

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
                            </div>
                            

                            <div class="col-md-4">
                                <label for="von" class="required form-label" >Eintrittsdatum</label>
                                <input type="date" required  @blur="frmState.vonBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validVon(currentValue.von) && frmState.vonBlured}" id="von" v-model="currentValue.von" >
                            </div>           
                            <div class="col-md-4">
                                <label for="befristetCheck" class="form-label">Vordienstzeiten</label><br>
                                <input class="form-control-sm form-control" type="text" id="vordienstzeiten" />
                            </div>
                            <div class="col-md-4">
                                <label for="bis" class="form-label" >Austrittsdatum</label>
                                <input type="date" @blur="frmState.bisBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validBis(currentValue.bis) && frmState.bisBlured}" id="bis" v-model="currentValue.bis" >
                            </div>
                            

                            <div class="col-md-4">
                                <label for="befristetCheck" class="form-label">Befristetes Dienstverhältnis</label><br>
                                <input class="form-control-sm" type="checkbox" id="befristetCheck" v-model="currentValue.befristet" >
                            </div>
                            <div class="col-md-4">
                                <label for="bis" class="form-label" :class="{required: currentValue.befristet}" >Bis-Datum</label>
                                <input type="date" :required="currentValue.befristet"  @blur="frmState.bisBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validBis(currentValue.bis) && frmState.bisBlured}" id="bis" v-model="currentValue.bis" >
                            </div>
                            <div class="col-md-4"></div>

                            <div class="col-md-12">
                                <label for="exampleFormControlTextarea1" class="form-label">Anmerkungen</label>
                                <textarea class="form-control" id="anmerkungen" rows="5"></textarea>
                            </div>
                            

                                                           

                            
                            <!-- changes -->
                            <div class="col-8">
                                <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
                            </div>
                            
                        </form>
                    </VTab>
                    <VTab title="Zeit">Hello From Tab 2</VTab>
                    <VTab title="Funktion">
                        <job-editor></job-editor>
                    </VTab>
                    <VTab title="Freitext">
                        <freitext-editor></freitext-editor>
                    </VTab>
                </VTabs>
                
                


               
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


