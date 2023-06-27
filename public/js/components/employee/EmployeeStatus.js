export const EmployeeStatus = {
    setup() {

        const { watch, ref, reactive, computed, onMounted, inject } = Vue;
        const route = VueRouter.useRoute();
        const router = VueRouter.useRouter()
        const currentPersonID = ref();
        const currentPersonUID  = ref();
        const dvList = ref([]);
        const vertragList = ref([]);
        const currentDate = ref(new Date());
        const isFetching = ref(false);   
        const vertragsarten = inject('vertragsarten');
        
        const formatVertragsart = (item) => {
          let va = vertragsarten.value.find(kt => kt.value == item);
          return va != undefined ? va.label : item;
        }

        /*let statusList = Vue.ref([{text:'Fix',description:'fixangestellt'}, 
            {text:'Befristet',description:'befristet bis 30.6.2023'}, 
            {text:'Karenz',description:'Elternkarenz bis 30.11.2023'}]);*/

        let statusList = Vue.ref([]);

        const generateDVEndpointURL = (uid) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/dvByPerson?uid=${uid}`;
        };
        
        const generateVertragEndpointURL = (dv_id, date) => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/vertragByDV?dv_id=${dv_id}&d=${convert2UnixTS(date)}`;
        };

        const convert2UnixTS = (ds) => {
          let d = new Date(ds);
          return Math.round(d.getTime() / 1000)
        }

        const generateStatusList = () => {
          let anzDV = 0;
          let dvIDs = [];
          dvList.value.forEach((dv) => {
             let von = new Date(dv.von);
             let bis = dv.bis != null ? new Date(dv.bis) : null;
             if (currentDate.value >= von && (bis == null || bis >= currentDate.value)) {
              anzDV++;
              statusList.value.push({text: formatVertragsart(dv.vertragsart_kurzbz), description: ''})
              dvIDs.push(dv.dienstverhaeltnis_id)
             }
          })
          if (anzDV > 1) {
            statusList.value.unshift({text: 'parallele DV', description:''});
          }
          console.log("dvIDs", dvIDs)
          
        }

        const fetchVBS = async(dv_id) => {
          let urlVertrag = generateVertragEndpointURL(dv_id);
          isFetching.value = true
          try {
            const res = await fetch(urlVertrag);
            const response = await res.json();            
            isFetching.value = false;
            return response.retval;              
          } catch (error) {
            console.log(error)
            isFetching.value = false
          }

        }

        const fetchData = async (uid) => {
          if (uid == null) {
              dvList.value = [];
              vertragList.value = [];
              return;
          }
          let urlDV = generateDVEndpointURL(uid);
          isFetching.value = true
          try {
              let res = await fetch(urlDV);
              let response = await res.json();
              dvList.value = response.retval;          
              isFetching.value = false;
              generateStatusList();           
          } catch (error) {
              console.log(error)
              isFetching.value = false
          }
        }

        onMounted(async () => {
          await router.isReady() 
          console.log('route.path', route.path)
          currentPersonID.value = route.params.id
          currentPersonUID.value = route.params.uid         
          currentDate.value = new Date()    
          fetchData(currentPersonUID.value)
        })
      
        watch(
          () => route.params.uid,
          (newVal) => {   
              currentPersonID.value = route.params.id;
              currentPersonUID.value = newVal;           
              currentDate.value = new Date();     
              fetchData(currentPersonUID.value);
          }
        )

        return {statusList};
    },
    template: `
    <div class="d-flex align-items-start ms-sm-auto col-lg-12  gap-2" >
      <template v-for="item in statusList">
        <!-- <span class="badge badge-lg bg-success me-2">BSP AKTIV</span><span class="badge bg-secondary me-2"> BSP FIX ANGESTELLT</span><span class="badge bg-secondary me-2">BSP STATUS</span> -->
        <span class="badge bg-secondary me-2">{{ item.text }}</span>
      </template>
    </div>   
   `
}
