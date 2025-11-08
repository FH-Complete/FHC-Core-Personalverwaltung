import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';

export const TrainingFrm = {
	name: 'TrainingFrm',
    components: {
        "datepicker": VueDatePicker
    },
    props: {
        defaultval: { type: Object, required: false },
    },
    expose: [ 'save', 'reset'],
    setup( props ) {

        const { watch, ref, computed, onMounted } = Vue;

        const createShape = () => {
            return { "training_id" : 1, 
                "main_category_id":"", 
                "sub_category_id":"", 
                "hours":0, 
                "datum_von":"", 
                "datum_bis":"", 
                "expires":"", 
                "designation":"",
                "request":false,
                "approved":false,
                "internal_external":false,
  
            } 
        }

        const currentValue = ref(createShape());
        const preservedValue = ref(createShape());   

         const mainCatList = ref([])     
        const subCatList = ref([])     
        const { t } = usePhrasen();
        const isFetching = ref(false);

        const fetchMainCatList = async () => {
            try {
                isFetching.value = true;
                // const res = await $api.call(ApiSalaryRange.getSalaryRangeList());  
                // salaryRangeList.value = res.meta.status == 'success' ? res.data : [] 
                mainCatList.value = [{kurzbz:'KAT01',bezeichnung:'Kategorie 1'}];
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
        }

        const fetchSubCatList = async () => {
            try {
                isFetching.value = true;
                // const res = await $api.call(ApiSalaryRange.getSalaryRangeList());  
                // salaryRangeList.value = res.meta.status == 'success' ? res.data : [] 
                subCatList.value = [{kurzbz:'SUBKAT01',bezeichnung:'Sub-Kategorie 1'}];
                isFetching.value = false;                        
            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
        }

        onMounted(async () => {
            fetchMainCatList()
            fetchSubCatList()
            //fetchFristEreignisse()            
        })

        // -------------
        // form handling
        // -------------

        const trainingDialogFrm = Vue.ref();

        const frmState = Vue.reactive({ mainCategoryBlurred: false, subCategoryBlurred: false, vonBlurred: false, bisBlurred: false, 
            betragVonBlurred: false, betragBisBlurred: false, wasValidated: false });

        const validInput = (input) => {
            if (input === undefined || input === '')
                return false;
            return true;
        }

        const validBezeichnung = (n) => {
            return !!n && n.trim() != "";
        }

        const validDatum = (n) => {
            return !!n && n.trim() != "";
        }

        const checkDates = (beginn, ende) => {

			if (beginn !== '' && ende !== '' && ende !== null && beginn !== null)
			{
				beginn = new Date(beginn);
				ende = new Date(ende);

				if (ende >= beginn)
				{
					frmState.bisBlurred = false;
					return true;
				}
				else
				{
					frmState.bisBlurred = true;
					return false;
				}
			}
			else
			{
				frmState.bisBlurred = false;
				return true;
			}

		}

        const checkSalaries = (von, bis) => {
            if (von !== '' && bis !== '' && bis !== null && von !== null)
			{
				if (bis >= von)
				{
					frmState.bisBlurred = false;
					return true;
				}
				else
				{
					frmState.bisBlurred = true;
					return false;
				}
			}
			else
			{
				frmState.bisBlurred = false;
				return true;
			}
        }

        const validate = () => {
            frmState.vonBlurred = true;
            frmState.bisBlurred = true;
            frmState.stundenBlurred = true;
            frmState.expiresBlurred = true;
            frmState.applicationBlurred = true;
            frmState.approvedBlurred = true;
            frmState.mainCategoryBlurred = true;
            if (validBezeichnung(currentValue.value?.main_cat) && 
                validDatum(currentValue.value?.von) &&
                validInput(currentValue.value?.betrag_von) &&
                validInput(currentValue.value?.betrag_bis) &&
                checkSalaries(currentValue.value.betrag_von, currentValue.value.betrag_bis) &&
                checkDates(currentValue.value.von, currentValue.value.bis)) {
                return true;
            }
            return false;
        }        

        const hasChanged = Vue.computed(() => {
            return Object.keys(currentValue.value).some(field => currentValue.value[field] !== preservedValue.value[field])
        });

        const okHandler = async () => {
            if (!validate()) {

                console.log("form invalid");

            } else {

                // submit
                try {
                    _resolve({type: 'OK', payload: currentValue.value })
                } catch (error) {
                    console.log(error)              
                } finally {
                    isFetching.value = false
                    hideModal()
                }
                
                
            }
        }

        return { mainCatList, subCatList, trainingDialogFrm, currentValue, t, 
            validInput, validDatum, validBezeichnung, frmState, okHandler, hasChanged }



    },
    template: `
        <form class="row g-3" v-if="currentValue != null"  ref="trainingDialogFrm" id="trainingDialogFrm">
                        
                <div class="col-md-6">
                    <label for="mainCategory_kurzbz" class="form-label required">Hauptkategorie</label>
                    <select  id="mainCategory_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " 
                        @blur="frmState.mainCategoryBlurred = true"   v-model="currentValue.mainCategory_kurzbz" 
                        :class="{'is-invalid': !validBezeichnung(currentValue.mainCategory_kurzbz) && frmState.mainCategoryBlurred}">
                        <option v-for="(item, index) in mainCatList" :value="item.mainCategory_kurzbz" >
                            {{ item.bezeichnung }}
                        </option>
                    </select>

                </div>    

                <div class="col-md-6">
                    <label for="subcategory_kurzbz" class="form-label required">Subkategorie</label>
                    <select  id="subcategory_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " 
                        @blur="frmState.subCategoryBlurred = true"   v-model="currentValue.subcategory_kurzbz" 
                        :class="{'is-invalid': !validBezeichnung(currentValue.subcategory_kurzbz) && frmState.subCategoryBlurred}">
                        <option v-for="(item, index) in subCatList" :value="item.subcategory_kurzbz" >
                            {{ item.bezeichnung }}
                        </option>
                    </select>

                </div>

                <div class="col-md-3">
                    <label for="von" class="form-label">Von</label>
                    <datepicker id="von" 
                        :teleport="true" 
                        @blur="frmState.vonBlurred = true" 
                        :input-class-name="(!validDatum(currentValue.von) && frmState.vonBlurred) ? 'dp-invalid-input' : ''"  
                        v-model="currentValue.von"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div> 
                
                <div class="col-md-3">
                    <label for="bis" class="form-label">Bis</label>
                    <datepicker id="bis" 
                        :teleport="true" 
                        @blur="frmState.bisBlurred = true"                         
                        v-model="currentValue.bis"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>

                <div class="col-md-3">
                    <label for="expires" class="form-label">Ablaufdatum</label>
                    <datepicker id="expires" 
                        :teleport="true" 
                        @blur="frmState.bisBlurred = true"                         
                        v-model="currentValue.bis"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>

                <div class="col-md-3">
                    
                </div>

                <div class="col-md-3">
                    <label for="betrag_von" class="form-label">Stunden</label>
                    <input type="number" 
                        class="form-control form-control-sm" :class="{ 'is-invalid': !validInput(currentValue.betrag_von) && frmState.betragVonBlurred}"  
                        id="betrag_von" maxlength="256" min="0" step="0.01"
                        @blur="frmState.betragVonBlurred = true" 
                        v-model="currentValue.betrag_von">
                </div>

                <div class="col-md-3">
                    <label for="intern" class="form-label">Intern</label>
                    <div>
                        <input class="form-check-input" type="checkbox" id="intern" v-model="currentValue.intern">
                    </div>    
                </div>

                <div class="col-md-3">
                    <label for="betrag_bis" class="form-label">Beantragt</label>
                    <datepicker id="von" 
                        :teleport="true" 
                        @blur="frmState.vonBlurred = true" 
                        :input-class-name="(!validDatum(currentValue.von) && frmState.vonBlurred) ? 'dp-invalid-input' : ''"  
                        v-model="currentValue.von"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>

                <div class="col-md-3">
                    <label for="betrag_von" class="form-label">HR-Freigabe</label>
                    <datepicker id="von" 
                        :teleport="true" 
                        @blur="frmState.vonBlurred = true" 
                        :input-class-name="(!validDatum(currentValue.von) && frmState.vonBlurred) ? 'dp-invalid-input' : ''"  
                        v-model="currentValue.von"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>
                                                
                <div class="col-8" v-if="currentValue.frist_id != 0">
                    <div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
                </div>
        </form> 
    
    `
}

