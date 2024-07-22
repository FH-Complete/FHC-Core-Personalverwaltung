
import Betriebsmittel from "../../../../../js/components/Betriebsmittel/Betriebsmittel.js";

export const BetriebsmittelWrapper = {
    components: {
        Betriebsmittel,
    },
    props: {
        modelValue: { type: Object, default: () => ({}), required: false},
    },
    setup(props, { emit }) {

        console.log('BetriebsmittelWrapper ')

        const theModel = Vue.computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        });

        Vue.onMounted(() => {
            console.log('BetriebsmittelWrapper mounted', theModel);
          
            
        })

        return { theModel };
    },
    template: `    
    <div class="row pt-md-4">      
         <div class="col">
             <div class="card">
                <div class="card-header">
                    <div class="h5 mb-0"><h5>{{ $p.t('ui', 'betriebsmittel') }}</h5></div>        
                </div>
                <div class="card-body">
                    <Betriebsmittel :person_id="theModel.personID" :uid="theModel.personUID" />
                </div>
             </div>
         </div>
    </div>

    `
}

export default BetriebsmittelWrapper;