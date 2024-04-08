import { ref, toRefs, watch, onMounted } from 'vue';
import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const CovidCard = {
     props: {
        personID: Number,
        date: Date,
     },
     setup( props ) {
        
        const covidData = ref();
        const currentDate = ref(new Date());
        const isFetching = ref(false);
        const title = ref("COVID Status");
        const currentPersonID = toRefs(props).personID        

        const formatDate = (ds) => {
            if (ds == null) return '';
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const getCurrentDate = () => {
            var d = new Date();
            return d.getFullYear()  + "-" + (d.getMonth()+1) + "-" + d.getDate()
        }

        const convert2UnixTS = (ds) => {
            let d = new Date(ds);
            return Math.round(d.getTime() / 1000)
        }

        const capitalize = (s) => {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        
        const fetchCovidState = async () => {
            if (currentPersonID.value == null) {
                return;
            }
			try {
			  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;  
              
              let ts = convert2UnixTS(currentDate.value);  // unix timestamp
			  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getCovidState?person_id=${currentPersonID.value}&d=${ts}`;
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

        onMounted(() => {
            currentDate.value = props.date || getCurrentDate();
            fetchCovidState();
        })

        watch(
			[currentPersonID,() => props.date],
			newVal => {
				if (newVal[1] != null) {
                    currentDate.value = newVal[1];
                }
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
                {{ formatDate(currentDate) }}
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