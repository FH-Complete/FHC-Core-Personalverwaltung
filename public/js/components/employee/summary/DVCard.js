import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const DvCard = {
     props: {
        uid: String,
        date: Date,
     },
     setup( props ) {
        
        const { watch, ref, toRefs, onMounted } = Vue; 
        const dvData = ref();
        const currentDate = ref(null);
        const isFetching = ref(false);
        const title = ref("Dienstverhältnis");
        const currentUID = toRefs(props).uid;       

        const formatDate = (ds) => {
            if (ds == null) return '';
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const convert2UnixTS = (ds) => {
            let d = new Date(ds);
            return Math.round(d.getTime() / 1000)
        }
        
        const fetchCurrentDV = async () => {
            if (currentUID.value == null) {
                return;
            }
			try {
              let ts = convert2UnixTS(currentDate.value);  // unix timestamp
              isFetching.value = true;
              const response = await Vue.$fhcapi.Employee.getCurrentDV(currentUID.value, ts);
              isFetching.value = false;              
			  console.log(response.data.retval);	  
              if (response.data.retval.length>0) {
                dvData.value = response.data.retval;
              } else {
                dvData.value = null;
              }
			} catch (error) {
			  console.log(error);
			} finally {
                isFetching.value = false;
            }	
		}

        onMounted(() => {
            currentDate.value = props.date || new Date();
            fetchCurrentDV();
        })

        watch(
			currentUID,
			() => {
				fetchCurrentDV();
			}
		)

        watch(
			() => props.date,
			newDate => {
				if (newDate != null) {
                    currentDate.value = newDate;
                    fetchCurrentDV();
                }
			}
		)
      
        return {
            dvData, isFetching, formatDate, title, currentUID, currentDate
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
            <div v-if="!isFetching && dvData!=null">
                <div v-for="(item, index) in dvData" :key="item.dienstverhaeltnis_id">
                    <table class="dvcard table table-bordered">
                    <tbody>
                        <tr><th scope="row">Zeitraum: </th><td>{{ formatDate(item.von) }} - {{ formatDate(item.bis) }}</td></tr>
                        <tr><th scope="row">Art</th><td>{{ item.vertragsart_kurzbz }}</td></tr>
                        <tr v-for="(salaryItem, salaryIndex) in item.gehaltsbestandteile" :key="salaryItem.gehaltsbestandteil_id">
                            <th scope="row">{{ salaryItem?.gehaltstyp_bezeichnung }}:</th><td>€ {{ new Intl.NumberFormat().format(parseFloat(salaryItem.grund_betrag_decrypted)) }}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>
            </div>
            
            
        </div>
     </div>
     
     `
   

}