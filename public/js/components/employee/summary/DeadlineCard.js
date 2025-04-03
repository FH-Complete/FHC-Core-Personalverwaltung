import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const DeadlineCard = {
	name: 'DeadlineCard',
     components: {
        
     },
     props: {
        uid: String,
     },
     setup( props ) {

        const { watch, ref, toRefs, onMounted, inject } = Vue;         
        const route = VueRouter.useRoute();
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Termine & Fristen");
        const currentPersonID = ref(null);
        const currentDate = Vue.ref(null);        
        const deadlineList = ref([]);
        const currentUID = toRefs(props).uid;  
        const fhcApi = inject('$fhcApi')  
        
        const formatDate = (ds) => {
            if (ds == undefined) return '';
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }
        
        const fetchDeadlineList = async () => {
            if (currentUID.value == null) {
                return;
            }
			try {
              isFetching.value = true;
              const response = await fhcApi.factory.Deadline.allByPerson(currentUID.value);
              isFetching.value = false;              
			  console.log('fristen', response.data);	  
              if (response.data.length>0) {
                deadlineList.value = response.data;
              } else {
                deadlineList.value = null;
              }
			} catch (error) {
			  console.log(error);
			} finally {
                isFetching.value = false;
            }	
		}

        onMounted(() => {
            fetchDeadlineList();
        })        

        watch(
			currentUID,
			() => {
				fetchDeadlineList();
			}
		)


        return {
            currentDate, isFetching, formatDate, title, currentPersonID, deadlineList, route, 
            
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
            <div v-if="!isFetching && deadlineList!=null">
                <table class="table table-bordered">
                    <tbody>
                        <tr><th>Ereignis</th><th>Deadline</th><th>To Do</th><th>Status</th></tr>                        
                        <tr v-for="(item, index) in deadlineList" :key="item.frist_id">
                            <td>{{ item.ereignis_bezeichnung }}</td>
                            <td>{{ formatDate(item.datum) }}</td>                            
                            <td></td>
                            <td>{{ item.status_bezeichnung }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
     </div>
     
     `
   

}