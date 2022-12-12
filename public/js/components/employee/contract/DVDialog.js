import {OrgChooser} from "../../organisation/OrgChooser.js";

export const DVDialog = {
    components: {
        OrgChooser,
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        personUID: { type: String, required: true },
        writePermission: { type: Boolean, required: false },
        currentValue: { type: Object, required: true },
    },
    setup( props ) {

        // Modal 
        const modalRef = Vue.ref();

        const orgSelectedHandler = (oeKurzbz) => {
            console.log('org selected:', oeKurzbz);
			this.currentOrg = oeKurzbz;
        }

        const showModal = (dvData) => {
            
            currentValue.value = createShape(personUID);
            // reset form state
            frmState.ibanBlured=false;
            frmState.bankBlured=false;
            // call bootstrap show function
            modalRef.value.show();
            return new Promise((resolve, reject) => {
                this.resolve = resolve
            })
        }

        const hideModal = () => {
            modalRef.value.hide();
        }
        

        const createShape = (person_id) => {
            return {
                von: new Date(),
                bis: new Date(),
                vertragsartKurzbz: '',
                oeKurzbz: '',
            } 
        }

        const okHandler = () => {
            if (!validate()) {

                console.log("form invalid");

            } else {
                postData()
                    .then((r) => {
                        if (r.error == 0) {
                            bankdataList.value[r.retval[0].bankverbindung_id] = r.retval[0];
                            console.log('bankdata successfully saved');
                            showToast();
                        }                       
                    }
                    )
                    .catch((error) => {
                        console.log(error.message);
                    });
                
                hideModal();
            }
        }

        // -------------
        // form handling
        // -------------

        const dienstvehaeltnisFrm = Vue.ref();

        const frmState = Vue.reactive({ orgBlured: false, wasValidated: false });

        const validate = () => {
            frmState.orgBlured = true;
            /*if (validIban(currentValue.value.iban)) {
                return true;
            }*/
            return false;
        }

        return { hideModal, okHandler, 
                 dienstvehaeltnisFrm, orgSelectedHandler, frmState };
    },
    template: `
        <Modal title="Dienstverhältnis" ref="modalRef">
            <template #body>
                <form class="row g-3" ref="dienstvehaeltnisFrm">
                                
                    <div class="col-md-8">
                        <label for="receiver" class="form-label">Organisation</label>
                        <org-chooser  @org-selected="orgSelectedHandler" ></org-chooser>
                    </div>
                    <div class="col-md-4"></div>
                    <!--  -->
                    <div class="col-md-4">
                        <label for="iban" class="required form-label" >Art</label>
                        <input type="text" required  @blur="frmState.orgBlured = true" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validIban(currentValue.iban) && frmState.ibanBlured}" id="iban" v-model="currentValue.iban" id="iban" maxlength="34" v-model="currentValue.iban" >
                    </div>
                    <div class="col-md-4">
                        <label for="bic" class="form-label">Zeitraum</label>
                        <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="bic" maxlength="11" v-model="currentValue.bic">
                    </div>
                    <div class="col-md-4">
                    </div>
                    
                    <!-- changes -->
                    <div class="col-8">
                        <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
                    </div>
                    
                </form>
            </template>
            <template #footer>
                <button type="button" class="btn btn-secondary" @click="hideModal()">
                    Abbrechen
                </button>
                <button type="button" class="btn btn-primary" @click="okHandler()" >
                    OK
                </button>
            </template>

        </Modal>`


}


