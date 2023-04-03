import {CoreRESTClient} from '../../../../../../../js/RESTClient.js';

export const VertragArtChooser = {
    props: {
      placeholder: String,
      customClass: String,
    },
    emits: ["artSelected"],
    setup(_, { emit }) {   

      const vertragsartList = Vue.ref([]);
      const isFetching = Vue.ref(false);
      const selected = Vue.ref();

      const fetchHead = async () => {
        isFetching.value = true
        try {
          const res = await CoreRESTClient.get(
            'extensions/FHC-Core-Personalverwaltung/api/getVertragsartAll');
          vertragsartList.value = CoreRESTClient.getData(res.data);
          if (vertragsartList.value.length > 0)  {
            vertragsartList.value.reverse();
            selected.value = vertragsartList.value[0].vertragsart_kurzbz;
            emit("artSelected", selected.value);
          }
          isFetching.value = false          
        } catch (error) {
          console.log(error)
          isFetching.value = false
        }
      }

      Vue.onMounted(() => {
        fetchHead();
      })

      const artSelected = (e) => {
        emit("artSelected", e.target.value);
      }

      return   {
        vertragsartList, selected,

        artSelected
      }


    },
    template: `
    <select  id="vertragsartChooser"  v-model="selected" @change="artSelected" class="" aria-label=".form-select-sm " >
        <option v-for="(item, index) in vertragsartList" :value="item.vertragsart_kurzbz"  :key="item.vertragsart_kurzbz">
            {{ item.bezeichnung }}
        </option>         
    </select>
    `
}    
