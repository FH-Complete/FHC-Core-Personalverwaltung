import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const OffTimeCard = {
     components: {
        
     },
     props: {
        uid: String,
     },
     setup( props ) {

        const { watch, ref, toRefs, onMounted, inject } = Vue;         
        const route = VueRouter.useRoute();
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Abwesenheiten");
        const currentPersonID = ref(null);
        const currentDate = Vue.ref(null);        
        const offTimeList = ref([]);
        const currentUID = toRefs(props).uid;  
        
        const formatDate = (ds) => {
            if (ds == undefined) return '';
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }
        
        const fetchOffTimeList = async () => {
            if (currentUID.value == null) {
                return;
            }
			try {
              isFetching.value = true;
              const response = await Vue.$fhcapi.Zeit.personAbwesenheiten(currentUID.value);
              isFetching.value = false;              
			  console.log('abwesenheiten', response.data.retval);	  
              if (response.data.retval.length>0) {
                offTimeList.value = response.data.retval;
              } else {
                offTimeList.value = null;
              }
			} catch (error) {
			  console.log(error);
			} finally {
                isFetching.value = false;
            }	
		}

        onMounted(() => {
            fetchOffTimeList();
        })        

        watch(
			currentUID,
			() => {
				fetchOffTimeList();
			}
		)


        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;
      
        return {
            currentDate, isFetching, formatDate, title, currentPersonID, offTimeList, fullPath, route, 
            
        }
     },
     template: `
     <div class="card">
        <div class="card-header d-flex justify-content-between align-items-baseline">
            <h5 class="mb-0">{{ title }}</h5>
                <span class="text-muted">{{ formatDate(currentDate) }}</span>
        </div>
        <div class="card-body" style="text-align:left">
            <div v-if="isFetching" class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>     
            <div v-if="!isFetching && offTimeList!=null">
                <table class="table table-bordered">
                    <tbody>
                        <tr><th>Typ</th><th>Zeitraum</th></tr>                        
                        <tr v-for="(item, index) in offTimeList" :key="item.zeitsperre_id">
                            <td>{{ item.zeitsperretyp }}</td>
                            <td>{{ formatDate(item.vondatum) }} - {{ formatDate(item.bisdatum) }}</td>                            
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
     </div>
     
     `
   

}