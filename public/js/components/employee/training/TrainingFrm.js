import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';

export const TrainingFrm = {
	name: 'TrainingFrm',
    components: {
        "datepicker": VueDatePicker
    },
    props: {
        modelValue: { type: Object },
        kategorien: { type: Array, required: true },        
    },
    expose: [ 'submit', 'reset'],
    emits: ['update:modelValue','submit'],
    setup( props, { emit } ) {

        const { watch, ref, computed, onMounted, reactive } = Vue;

        /* const createShape = () => {
            return { 
                "weiterbildung_id" : null, 
                "mitarbeiter_uid": props.uid,
                "intern": true,
                "hauptkategorie_id":null, 
                "statistikkategorie_id":null, 
                "stunden":0, 
                "intern": true,
                "von":null, 
                "bis":null, 
                "hr_freigegeben":null, 
                "beantragt":null,
                "ablaufdatum":null,
            } 
        } */

        /* const currentValue = ref(createShape());
        const preservedValue = ref(createShape());    */


        const { t } = usePhrasen();
        const isFetching = ref(false);

        

        onMounted(async () => {
               
        })

        // -------------
        // form handling
        // -------------

        const trainingDialogFrm = ref();

        const update = (field, value) => {
            // create new object, props are read-only
            emit('update:modelValue', { ...props.modelValue, [field]: value })
        }

        // deprecated
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

        const errors = reactive({ von: '', bis: '', stunden: '', bezeichnung: '', 
            ablaufdatum: '', beantragt: '', kategorie: '', hr_freigegeben: '' })

        const validate = () => {
            errors.bezeichnung = props.modelValue.bezeichnung ? '' : 'Bezeichnung ist erforderlich';
            errors.kategorie = props.modelValue.kategorien ? '' : 'Kategorie ist erforderlich';
            return !errors.bezeichnung && !errors.kategorie;
        }        

       /*  const hasChanged = Vue.computed(() => {
            return Object.keys(currentValue.value).some(field => currentValue.value[field] !== preservedValue.value[field])
        }); */

        /* const okHandler = async () => {
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
        } */

        const submit = () => {
            if (validate()) {
                emit('submit', props.modelValue)
            }
        }

        const reset = () => {

        }

        return { trainingDialogFrm,  t, update,
            validInput, validDatum, validBezeichnung, frmState, errors, submit }



    },
    template: `
        <form class="row g-3" ref="trainingDialogFrm" id="trainingDialogFrm" @submit.prevent="submit">
                        
                <div class="col-md-6">
                    <label for="kategorien" class="form-label required">Kategorie</label>
                    <select  id="kategorien" class="form-select form-select-sm" aria-label=".form-select-sm " 
                        :value="modelValue.kategorien" 
                        @input="update('hauptkategorie_id', $event.target.value)"
                        :class="{'is-invalid': errors.kategorien}">
                        <option v-for="(item, index) in kategorien" :value="item.weiterbildungskategorie_kurzbz" >
                            {{ item.bezeichnung }}
                        </option>
                    </select>

                </div>    

                
                <div class="col-md-12">
                    <label for="bezeichnung" class="form-label required">Bezeichnung</label>
                    <input type="text" class="form-control form-control-sm"  id="bezeichnung" :value="modelValue.bezeichnung" @input="update('bezeichnung', $event.target.value)">
                </div>

                <div class="col-md-3">
                    <label for="von" class="form-label">Von</label>
                    <datepicker id="von" 
                        :teleport="true" 
                        :input-class-name="errors.von ? 'dp-invalid-input' : ''"  
                        :model-value="modelValue.von"
                        @update:modelValue="update('von', $event)"
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
                        :model-value="modelValue.bis"
                        @update:modelValue="update('bis', $event)"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>

                <div class="col-md-3">
                    <label for="ablaufdatum" class="form-label">Ablaufdatum</label>
                    <datepicker id="ablaufdatum" 
                        :teleport="true" 
                       :model-value="modelValue.ablaufdatum"
                        @update:modelValue="update('ablaufdatum', $event)"
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
                    <label for="stunden" class="form-label">Stunden</label>
                    <input type="number" 
                        class="form-control form-control-sm" :class="{ 'is-invalid': errors.stunden }"  
                        id="stunden"  min="0" step="0.1"
                        :value="modelValue.stunden" 
                        @input="update('stunden', $event.target.valueAsNumber)"
                        />
                </div>

                <div class="col-md-3">
                    <label for="intern" class="form-label">Intern</label>
                    <div>
                        <input class="form-check-input" type="checkbox" id="intern" :value="modelValue.intern">
                    </div>    
                </div> 

                <div class="col-md-3">
                    <label for="beantragt" class="form-label">Beantragt</label>
                    <datepicker id="beantragt" 
                        :teleport="true" 
                        :input-class-name="errors.beantragt ? 'dp-invalid-input' : ''"  
                        :model-value="modelValue.beantragt"
                        @update:modelValue="update('beantragt', $event)"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>

                <div class="col-md-3">
                    <label for="hr_freigegeben" class="form-label">HR-Freigabe</label>
                    <datepicker id="hr_freigegeben" 
                        :teleport="true" 
                        :input-class-name="errors.hr_freigegeben ? 'dp-invalid-input' : ''"  
                        :model-value="modelValue.hr_freigegeben"
                        @update:modelValue="update('hr_freigegeben', $event)"
                        v-bind:enable-time-picker="false"
                        text-input 
                        locale="de"
                        format="dd.MM.yyyy"
                        auto-apply 
                        model-type="yyyy-MM-dd"></datepicker>
                </div>
                                                
                <div class="col-8" v-if="modelValue.frist_id != 0">
                    <div class="modificationdate">{{ modelValue.insertamum }}/{{ modelValue.insertvon }}, {{ modelValue.updateamum }}/{{ modelValue.updatevon }}</div>
                </div>
        </form> 
    
    `
}

