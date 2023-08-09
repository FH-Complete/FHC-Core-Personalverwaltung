import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const IssuesCard = {
     components: {
        
     },
     props: {
       
     },
     setup( props ) {

        const { watch, ref, toRefs, onMounted } = Vue;         
        const route = VueRouter.useRoute();
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Issues");
        const currentPersonID = ref(null);
        const currentDate = Vue.ref(null);        
        const issues = ref([]);

        const formatDate = (ds) => {
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }
        
        const fetchIssues = async () => {
            if (currentPersonID.value == null) {
                return;
            }
			try {
              isFetching.value = true;
              const response = await Vue.$fhcapi.Issue.byPerson(currentPersonID.value);
              isFetching.value = false;              
			  console.log(response.data.retval);	  
              if (response.data.retval.length>0) {
                issues.value = response.data.retval;
              } else {
                issues.value = null;
              }
			} catch (error) {
			  console.log(error);
			} finally {
                isFetching.value = false;
            }	
		}

        onMounted(() => {
            currentDate.value = props.date || new Date();
            currentPersonID.value = parseInt(route.params.id);
            fetchIssues();
        })

        watch(
			() => route.params,
			params => {
				currentPersonID.value = params.id;
               // currentPersonUID.value = params.uid;
               fetchIssues();
			}
		)

        // dummy events
        /* const issues = [
            {status: 'new', date: '1/2/2023', inhalt: 'lorem ipsum'},
            {status: 'new', date: '1/5/2023', inhalt: 'lorem ipsum'},
        ] */
      
        return {
            currentDate, isFetching, formatDate, title, currentPersonID, issues,
        }
     },
     template: `
     <div class="card">
        <div class="card-header">
            <h5 class="mb-0">{{ title }}</h5>
                {{ formatDate(currentDate) }}
        </div>
        <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>     
            <div v-if="!isFetching && issues!=null">
                <table class="table table-bordered">
                    <tbody>
                        <tr><th>Datum</th><th>Inhalt</th><th>Status</th></tr>                        
                        <tr v-for="(item, index) in issues" :key="item.issue_id">
                            <td>{{ formatDate(item.date) }}</td>
                            <td>{{ item.inhalt }}</td><td>{{ item.status }}</td>
                        </tr>
                    </tbody>
                </table>
            
        </div>
     </div>
     
     `
   

}