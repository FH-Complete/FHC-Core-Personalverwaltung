import ApiVertragsbestandteil from '../../api/factory/vertragsbestandteil.js';
import ApiEmployee from '../../api/factory/employee.js';

export const EmployeeStatus = {
	name: 'EmployeeStatus',
    props: {
      tags: {
          default: [],
          type: Array
      }
    },
    expose: ['refresh'],
    setup( props ) {

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
        const karenztypen = inject('karenztypen');
        const teilzeittypen = inject('teilzeittypen');
        const $api = inject('$api')   
        
        const formatVertragsart = (item) => {
          let va = vertragsarten.value.find(kt => kt.value == item);
          return va != undefined ? va.label : item;
        }

        const formatKarenztyp = (item) => {
          let karenztyp = karenztypen.value.find(kt => kt.value == item);
          return karenztyp != undefined ? karenztyp.label : item;
        }

        const formatTeilzeittyp = (item) => {
          let teilzeittyp = teilzeittypen.value.find(kt => kt.value == item);
          return teilzeittyp != undefined ? teilzeittyp.label : item;
        }

        let statusList = Vue.ref([]);    

        const statusTags = Vue.ref(props.tags)

        const generateStatusList = () => {
          let anzDV = 0;
          let dvIDs = [];
          statusList.value = [];
          dvList.value.forEach((dv) => {
             let von = new Date(dv.von);
             let bis = dv.bis != null ? new Date(dv.bis) : null;
             if (currentDate.value >= von && (bis == null || bis >= currentDate.value)) {
                 anzDV++;
                 let vaExists = statusList.value.find((item) => item.text == formatVertragsart(dv.vertragsart_kurzbz))
                 if (!vaExists) {
                     statusList.value.push({text: formatVertragsart(dv.vertragsart_kurzbz), description: '', css: 'bg-dv rounded-0'})
                 }
                 dvIDs.push(dv.dienstverhaeltnis_id)
             }
          })
          if (anzDV > 1) {
            statusList.value.unshift({text: 'parallele DVs', description:'', css: 'bg-dv rounded-0'});
          } else if (anzDV == 0) {
            statusList.value.unshift({text: 'derzeit kein aktives DV', description:'', css: 'bg-dv rounded-0'});
          }
          console.log("dvIDs", dvIDs)
          Promise.all(dvIDs.map((dvID) => $api.call(ApiVertragsbestandteil.getCurrentVBs(dvID)))).then(
            (allData) => {
              allData.map((item) => {
                item.data.map((vbs => {
                  switch (vbs.vertragsbestandteiltyp_kurzbz) {
                    case 'freitext':
                      if (vbs.freitexttyp_kurzbz == 'befristung') {
                        statusList.value.push({text: 'Befristung', description: '', css: 'bg-dv rounded-0'})
                      } else if (vbs.freitexttyp_kurzbz == 'allin') {
                        statusList.value.push({text: 'All-In', description: '', css: 'bg-allin rounded-0'})
                      } else if (vbs.freitexttyp_kurzbz == 'ersatzarbeitskraft') {
                        statusList.value.push({text: 'Ersatzarbeitskraft', description: '', css: 'bg-dv rounded-0'})
                      }
                      break;
                    case 'karenz':
                        statusList.value.push({text: formatKarenztyp(vbs.karenztyp_kurzbz), description: '', css: 'bg-karenz rounded-0'})
                      break;
                    case 'stunden':
                      if (vbs.teilzeittyp_kurzbz != undefined) {
                        statusList.value.push({text: formatTeilzeittyp(vbs.teilzeittyp_kurzbz), description: '', css: 'bg-teilzeit rounded-0'})
                      }
                      break;
                    default:
                      break;
                  }                  
                }))
              })
            }
          );
          
        }  

        const fetchData = async (uid) => {
          if (uid == null) {
              dvList.value = [];
              vertragList.value = [];
              return;
          }
          isFetching.value = true
          try {
              const res = await $api.call(ApiEmployee.dvByPerson(uid));
              dvList.value = res.data;          
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

        watch(
            () => props.tags,
            (newVal) => {
                statusTags.value = newVal
            },
            { deep: true }
        )

        const refresh = () => {
          fetchData(currentPersonUID.value);
        }

        return {statusList, statusTags, refresh};
    },
    template: `
    <div class="d-flex align-items-start ms-sm-auto col-lg-12  gap-2 mt-auto" >
        <template v-for="item in statusTags">
            <span class="badge" :class="(item?.css != undefined) ? item.css : 'bg-secondary rounded-0'" >{{ item.text }}</span>
        </template>
        <template v-for="item in statusList">
            <span class="badge" :class="(item?.css != undefined) ? item.css : 'bg-secondary rounded-0'" >{{ item.text }}</span>
        </template>
    </div>   
   `
}