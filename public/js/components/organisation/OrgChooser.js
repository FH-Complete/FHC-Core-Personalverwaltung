const OrgChooser = {
    props: {
      placeholder: String,
    },
    emits: ["orgSelected"],
    setup(_, { emit }) {   

      var protocol_host =
          location.protocol + "//" +
          location.hostname + ":" +
          location.port;
        
      const url =
        `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getOrgHeads`;

      const orgList = Vue.ref([]);
      const isFetching = Vue.ref(false);
      const selected = Vue.ref();

      const fetchHead = async () => {
        isFetching.value = true
        try {
          const res = await fetch(url)
          let response = await res.json()
          orgList.value = response.retval;
          if (orgList.value.length > 0)  {
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
    <select  id="orgHeadChooser"  v-model="selected" @change="orgSelected" class="form-select form-select-sm" aria-label=".form-select-sm " >
        <option v-for="(item, index) in orgList" :value="item.oe_kurzbz"  :key="item.oe_kurzbz">
            {{ item.bezeichnung }}
        </option>         
    </select>
    `
}    