import {CoreRESTClient} from '../../../../../js/RESTClient.js';

export const OrgChooser = {
    props: {
      placeholder: String,
    },
    emits: ["orgSelected"],
    setup(_, { emit }) {   

      const orgList = Vue.ref([]);
      const isFetching = Vue.ref(false);
      const selected = Vue.ref();

      const fetchHead = async () => {
        isFetching.value = true
        try {
          const res = await CoreRESTClient.get(
            'extensions/FHC-Core-Personalverwaltung/api/getOrgHeads');
          orgList.value = CoreRESTClient.getData(res.data);
          if (orgList.value.length > 0)  {
            orgList.value.reverse();
            selected.value = orgList.value[0].oe_kurzbz;
            emit("orgSelected", selected.value);
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

      const orgSelected = (e) => {
        emit("orgSelected", e.target.value);
      }

      return   {
        orgList, selected,

        orgSelected
      }


    },
    template: `
    <select  id="orgHeadChooser"  v-model="selected" @change="orgSelected"  aria-label=".form-select-sm " >
        <option v-for="(item, index) in orgList" :value="item.oe_kurzbz"  :key="item.oe_kurzbz">
            {{ item.bezeichnung }}
        </option>         
    </select>
    `
}    
