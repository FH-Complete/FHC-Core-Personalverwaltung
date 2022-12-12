import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const DvCard = {
     props: {
        uid: String,
     },
     setup( props ) {
        
        const dvData = Vue.ref();
        //const currentDate = Vue.ref(new Date());
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Dienstverhältnis");
        const currentUID = Vue.toRefs(props).uid        

        const formatDate = (ds) => {
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const currentDate = formatDate(new Date());

        const capitalize = (s) => {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        
        const fetchCurrentDV = async () => {
            if (currentUID.value == null) {
                return;
            }
			try {
			  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;  
              
			  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getCurrentDV?uid=${currentUID.value}`;
              isFetching.value = true;
			  const res = await fetch(url)
			  let response = await res.json();
              isFetching.value = false;              
			  console.log(response.retval);	  
              if (response.retval.length>0) {
                dvData.value = response.retval;
              } else {
                dvData.value = null;
              }
			  			  
			} catch (error) {
			  console.log(error);
              isFetching.value = false;           
			}		
		}

        Vue.onMounted(() => {
            fetchCurrentDV();
        })

        Vue.watch(
			currentUID,
			() => {
				fetchCurrentDV();
			}
		)
      
        return {
            dvData, isFetching, formatDate, currentDate, title, currentUID
        }
     },
     template: `
     <div class="card">
        <div class="card-header">
            <h5 class="mb-0">{{ title }}</h5>
                {{ currentDate }}
            </div>
            <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                 <span class="visually-hidden">Loading...</span>
            </div>     
            <div v-if="!isFetching && dvData!=null">
                <div v-for="(item, index) in dvData" :key="item.dienstverhaeltnis_id">
                    <table class="table table-bordered">
                    <tbody>
                        <tr><th scope="row">Zeitraum: </th><td>{{ formatDate(item.von) }} - {{ formatDate(item.bis) }}</td></tr>
                        <tr><th scope="row">Lektor:</th><td>{{ item.lektor }}</td></tr>
                        <tr><th scope="row">Art</th><td>{{ item.vertragsart_kurzbz }}</td></tr>
                        <tr v-for="(salaryItem, salaryIndex) in item.gehaltsbestandteile" :key="salaryItem.gehaltsbestandteil_id">
                            <th scope="row">{{ salaryItem.gehaltstyp_bezeichnung }}:</th><td>€ {{ new Intl.NumberFormat().format(parseFloat(salaryItem.betrag_valorisiert)) }}</td>
                        </tr>
                        <tr><th scope="row">Funktion:</th><td></td></tr>
                    </tbody>
                    </table>
                </div>
            </div>
            
            
        </div>
     </div>
     
     `
   

}