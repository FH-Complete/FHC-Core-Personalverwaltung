import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const CovidCard = {
     props: {
        personID: Number,
     },
     setup( props ) {
        
        const covidData = Vue.ref();
        //const currentDate = Vue.ref(new Date());
        const isFetching = Vue.ref(false);
        const title = Vue.ref("COVID Status");
        const currentPersonID = Vue.toRefs(props).personID        

        const formatDate = (ds) => {
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const currentDate = formatDate(new Date());

        const capitalize = (s) => {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        
        const fetchCovidState = async () => {
            if (currentPersonID.value == null) {
                return;
            }
			try {
			  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;  
              
			  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getCovidState?person_id=${currentPersonID.value}`;
              isFetching.value = true;
			  const res = await fetch(url)
			  let response = await res.json();
              isFetching.value = false;              
			  console.log(response.retval);	  
              if (response.retval.length>0) {
                covidData.value = response.retval[0];
              } else {
                covidData.value = null;
              }
			  			  
			} catch (error) {
			  console.log(error);
              isFetching.value = false;           
			}		
		}

        Vue.onMounted(() => {
            fetchCovidState();
        })

        Vue.watch(
			currentPersonID,
			() => {
				fetchCovidState();
			}
		)
      
        return {
            covidData, isFetching, formatDate, currentDate, title, currentPersonID
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
            <span v-if="!isFetching && covidData != null && covidData.covid_date!=null">{{ formatDate(covidData.covid_date) }}</span>
            <div v-if="covidData!=null && covidData.covidvalid==1">
                <i class="fa fa-check-circle fa-3x" aria-hidden="true" style="color: green; margin: .2em;"></i>
            </div>
            <div v-if="covidData!=null && covidData.covidvalid==0">
                <i class="fa fa-times-circle fa-3x" aria-hidden="true" style="color: red; margin: .2em;"></i>
            </div>
            <div v-if="covidData!=null && covidData.covidvalid==-1">
                <i class="fa fa-question-circle fa-3x" aria-hidden="true" style="color: grey; margin: .2em;"></i>
            </div>
        </div>
     </div>
     
     `
   

}